-- =============================================================================
-- Migration: 20261103000007_integrity_triggers.sql
-- Description: Concurrency Controls, Hall & Teacher Conflict Prevention, and Capacity Enforcement
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. دالة وزَناد منع تعارض مواعيد القاعات والمعلمين مع أقفال المعاملات الاستشارية (Transactional Advisory Locks)
CREATE OR REPLACE FUNCTION public.check_circle_schedule_conflicts()
RETURNS TRIGGER AS $$
DECLARE
    v_hall_id UUID;
    v_teacher_id UUID;
    v_conflict_circle_name TEXT;
    v_circle_name TEXT;
BEGIN
    -- جلب القاعة والمعلم التابعين للحلقة
    SELECT hall_id, teacher_id, name 
    INTO v_hall_id, v_teacher_id, v_circle_name
    FROM public.circles
    WHERE id = NEW.circle_id;

    -- 1. استخدام أقفال استشارية على مستوى المعاملة (Advisory Locks) لمنع التزامن الفانتومي (Phantom Overlaps)
    IF v_hall_id IS NOT NULL THEN
        PERFORM pg_advisory_xact_lock(hashtext('hall_' || v_hall_id::text || '_' || NEW.day_of_week));
    END IF;
    PERFORM pg_advisory_xact_lock(hashtext('teacher_' || v_teacher_id::text || '_' || NEW.day_of_week));

    -- 2. التحقق من تعارض مواعيد القاعة (إذا كانت الحلقة مسندة لقاعة ثابتة)
    IF v_hall_id IS NOT NULL THEN
        SELECT c.name INTO v_conflict_circle_name
        FROM public.circle_schedules cs
        JOIN public.circles c ON c.id = cs.circle_id
        WHERE c.hall_id = v_hall_id
          AND cs.day_of_week = NEW.day_of_week
          AND cs.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND (NEW.start_time, NEW.end_time) OVERLAPS (cs.start_time, cs.end_time)
          AND c.status = 'active'
        LIMIT 1;

        IF v_conflict_circle_name IS NOT NULL THEN
            RAISE EXCEPTION 'تعارض في حجز القاعة: القاعة محجوزة مسبقاً في نفس اليوم والوقت لحلقة "%".', v_conflict_circle_name
            USING ERRCODE = 'P0004';
        END IF;
    END IF;

    -- 3. التحقق من تعارض مواعيد المعلم (لا يمكن للمعلم التدريس في حلقتين في نفس الوقت)
    SELECT c.name INTO v_conflict_circle_name
    FROM public.circle_schedules cs
    JOIN public.circles c ON c.id = cs.circle_id
    WHERE c.teacher_id = v_teacher_id
      AND cs.day_of_week = NEW.day_of_week
      AND cs.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (NEW.start_time, NEW.end_time) OVERLAPS (cs.start_time, cs.end_time)
      AND c.status = 'active'
    LIMIT 1;

    IF v_conflict_circle_name IS NOT NULL THEN
        RAISE EXCEPTION 'تعارض في جدول المعلم: المعلم مرتبط بحلقة أخرى "%" في نفس اليوم والوقت.', v_conflict_circle_name
        USING ERRCODE = 'P0005';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_circle_schedule_conflicts
BEFORE INSERT OR UPDATE ON public.circle_schedules
FOR EACH ROW EXECUTE FUNCTION public.check_circle_schedule_conflicts();

-- 2. دالة وزَناد حماية السعة القصوى للحلقة والقاعة (Capacity Enforcement with Row Locks)
CREATE OR REPLACE FUNCTION public.check_circle_capacity_overflow()
RETURNS TRIGGER AS $$
DECLARE
    v_circle_capacity INTEGER;
    v_hall_capacity INTEGER;
    v_hall_id UUID;
    v_active_students INTEGER;
BEGIN
    -- التحقق مطلوب فقط عند إضافة طالب جديد أو تعديل حالة الطالب إلى مقيد
    IF NEW.status = 'enrolled' AND (NEW.end_date IS NULL OR NEW.end_date >= CURRENT_DATE) THEN
        -- قفل سجل الحلقة للتأكد من انعدام السباق التزامني
        SELECT capacity, hall_id INTO v_circle_capacity, v_hall_id
        FROM public.circles
        WHERE id = NEW.circle_id
        FOR UPDATE;

        -- حساب عدد الطلاب المقيدين حالياً
        SELECT count(*) INTO v_active_students
        FROM public.circle_students
        WHERE circle_id = NEW.circle_id
          AND status = 'enrolled'
          AND (end_date IS NULL OR end_date >= CURRENT_DATE)
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

        -- فحص سعة الحلقة
        IF (v_active_students + 1) > v_circle_capacity THEN
            RAISE EXCEPTION 'تجاوز سعة الحلقة مرفوض: الحلقة مكتملة (% طلاب مقيدين من أصل % مقعداً متاحاً).',
                v_active_students, v_circle_capacity
                USING ERRCODE = 'P0006';
        END IF;

        -- فحص سعة القاعة إن وجدت
        IF v_hall_id IS NOT NULL THEN
            SELECT capacity INTO v_hall_capacity
            FROM public.halls
            WHERE id = v_hall_id
            FOR UPDATE;

            IF (v_active_students + 1) > v_hall_capacity THEN
                RAISE EXCEPTION 'تجاوز سعة القاعة مرفوض: القاعة تتسع لـ % مقعداً فقط.', v_hall_capacity
                USING ERRCODE = 'P0007';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_circle_capacity
BEFORE INSERT OR UPDATE ON public.circle_students
FOR EACH ROW EXECUTE FUNCTION public.check_circle_capacity_overflow();

-- 3. دالة وزَناد حماية الحسابات المرتبطة بعمليات مالية من الحذف الفيزيائي (Soft Delete Enforcement)
CREATE OR REPLACE FUNCTION public.protect_financial_profiles()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.payments WHERE received_by = OLD.id OR reversed_by = OLD.id) THEN
        RAISE EXCEPTION 'لا يمكن حذف الحساب نهائياً: المستخدم مسجل كمستلم أو مراجع لسندات مالية رسمية. استخدم خيار التعطيل (is_active = false) بدلاً من الحذف للحفاظ على السجل المالي.'
        USING ERRCODE = 'P0008';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_financial_profiles
BEFORE DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_financial_profiles();

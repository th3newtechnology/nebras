-- =============================================================================
-- Migration: 20261105000012_student_management_rpcs.sql
-- Description: Student Management RPCs: Sequential Registration Number Generation,
--              Atomic Circle Transfer with Historical Preservation, and
--              Idempotent Application-to-Student Conversion.
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================
--
-- ROLLBACK PLAN:
-- DROP FUNCTION IF EXISTS public.convert_registration_application(UUID, UUID, DATE, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS public.transfer_student_circle(UUID, UUID, TEXT);
-- DROP FUNCTION IF EXISTS public.generate_student_registration_number();
-- DROP SEQUENCE IF EXISTS public.seq_student_registration_number;
-- =============================================================================

-- 1. تسلسل رقم القيد السنوي للطلاب
CREATE SEQUENCE IF NOT EXISTS public.seq_student_registration_number START WITH 1;

-- 2. دالة توليد رقم القيد الطلابي الآمن (NEB-YYYY-XXXX)
CREATE OR REPLACE FUNCTION public.generate_student_registration_number()
RETURNS TEXT AS $$
DECLARE
    v_year TEXT;
    v_seq_num BIGINT;
    v_reg_no TEXT;
    v_exists BOOLEAN;
BEGIN
    v_year := to_char(CURRENT_DATE, 'YYYY');
    
    LOOP
        v_seq_num := nextval('public.seq_student_registration_number');
        v_reg_no := 'NEB-' || v_year || '-' || lpad(v_seq_num::text, 4, '0');
        
        -- التحقق من عدم وجود تضارب مسبق
        SELECT EXISTS (
            SELECT 1 FROM public.students WHERE registration_number = v_reg_no
        ) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_reg_no;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. دالة نقل الطالب بين الحلقات كوحدة ذرية (Atomic Circle Transfer)
CREATE OR REPLACE FUNCTION public.transfer_student_circle(
    p_student_id UUID,
    p_new_circle_id UUID,
    p_transfer_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_current_circle_id UUID;
    v_new_circle_status TEXT;
    v_student_gender TEXT;
    v_circle_target_gender TEXT;
    v_result JSONB;
BEGIN
    -- أ. التحقق من صلاحيات المدير
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مصرح: عملية نقل الطلاب تتطلب صلاحيات مدير النظام.'
            USING ERRCODE = '42501';
    END IF;

    -- ب. التحقق من وجود الطالب وحالته وجنسه
    SELECT gender INTO v_student_gender
    FROM public.students
    WHERE id = p_student_id;

    IF v_student_gender IS NULL THEN
        RAISE EXCEPTION 'الطالب المحدد غير موجود في سجلات المدرسة.'
            USING ERRCODE = 'P0002';
    END IF;

    -- ج. فحص الحلقة الجديدة والتوافق
    SELECT status, target_gender INTO v_new_circle_status, v_circle_target_gender
    FROM public.circles
    WHERE id = p_new_circle_id;

    IF v_new_circle_status IS NULL THEN
        RAISE EXCEPTION 'الحلقة الجديدة المحددة غير موجودة.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_new_circle_status <> 'active' THEN
        RAISE EXCEPTION 'لا يمكن نقل الطالب إلى حلقة غير نشطة.'
            USING ERRCODE = 'P0003';
    END IF;

    IF v_circle_target_gender <> 'mixed' AND v_circle_target_gender <> v_student_gender THEN
        RAISE EXCEPTION 'الحلقة المحددة مخصصة لفئة (%s) ولا تتوافق مع جنس الطالب (%s).'
            , v_circle_target_gender, v_student_gender
            USING ERRCODE = 'P0004';
    END IF;

    -- د. تحديد القيد النشط الحالي للطالب إن وجد
    SELECT circle_id INTO v_current_circle_id
    FROM public.circle_students
    WHERE student_id = p_student_id
      AND status = 'enrolled'
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    LIMIT 1
    FOR UPDATE;

    IF v_current_circle_id = p_new_circle_id THEN
        RAISE EXCEPTION 'الطالب مقيد بالفعل في هذه الحلقة.'
            USING ERRCODE = 'P0005';
    END IF;

    -- هـ. إنهاء القيد السابق وتوثيق سبب الانتقال
    IF v_current_circle_id IS NOT NULL THEN
        UPDATE public.circle_students
        SET status = 'transferred',
            end_date = CURRENT_DATE,
            transfer_reason = COALESCE(p_transfer_reason, 'انتقال إداري إلى حلقة أخرى'),
            updated_at = now()
        WHERE student_id = p_student_id
          AND circle_id = v_current_circle_id
          AND status = 'enrolled';
    END IF;

    -- و. إدراج القيد الجديد (زناد trigger_check_circle_capacity سيفحص السعة تلقائياً)
    INSERT INTO public.circle_students (
        circle_id,
        student_id,
        enrollment_date,
        status,
        transfer_reason,
        previous_circle_id
    ) VALUES (
        p_new_circle_id,
        p_student_id,
        CURRENT_DATE,
        'enrolled',
        p_transfer_reason,
        v_current_circle_id
    );

    v_result := jsonb_build_object(
        'success', true,
        'student_id', p_student_id,
        'previous_circle_id', v_current_circle_id,
        'new_circle_id', p_new_circle_id,
        'transfer_date', CURRENT_DATE
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. دالة تحويل طلب التسجيل إلى طالب مقيد رسمياً مع منع التكرار (Idempotent Conversion)
CREATE OR REPLACE FUNCTION public.convert_registration_application(
    p_application_id UUID,
    p_circle_id UUID DEFAULT NULL,
    p_birth_date DATE DEFAULT NULL,
    p_gender TEXT DEFAULT 'male',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_app RECORD;
    v_guardian_id UUID;
    v_student_id UUID;
    v_reg_no TEXT;
    v_calc_birth_date DATE;
    v_result JSONB;
BEGIN
    -- أ. التحقق من صلاحيات المدير
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'غير مصرح: تحويل واعتماد طلبات القبول يتطلب صلاحيات مدير النظام.'
            USING ERRCODE = '42501';
    END IF;

    -- ب. قفل الطلب وفحص حالته لمنع التحويل المتكرر
    SELECT * INTO v_app
    FROM public.registration_applications
    WHERE id = p_application_id
    FOR UPDATE;

    IF v_app.id IS NULL THEN
        RAISE EXCEPTION 'طلب الالتحاق غير موجود.'
            USING ERRCODE = 'P0002';
    END IF;

    IF v_app.status = 'APPROVED' THEN
        RAISE EXCEPTION 'تم اعتماد هذا الطلب مسبقاً ولا يمكن تحويله مجدداً.'
            USING ERRCODE = 'P0006';
    END IF;

    -- ج. تحديد تاريخ الميلاد
    IF p_birth_date IS NOT NULL THEN
        v_calc_birth_date := p_birth_date;
    ELSIF v_app.student_age IS NOT NULL THEN
        v_calc_birth_date := (CURRENT_DATE - (v_app.student_age::text || ' years')::interval)::date;
    ELSE
        v_calc_birth_date := CURRENT_DATE - interval '10 years';
    END IF;

    -- د. فحص وجود ولي الأمر برقم الهاتف لتفادي التكرار
    SELECT id INTO v_guardian_id
    FROM public.guardians
    WHERE phone = v_app.guardian_phone
    LIMIT 1;

    IF v_guardian_id IS NULL THEN
        INSERT INTO public.guardians (
            full_name,
            relationship,
            phone,
            address
        ) VALUES (
            v_app.guardian_name,
            'ولي أمر',
            v_app.guardian_phone,
            'مسجل عبر الموقع العام'
        ) RETURNING id INTO v_guardian_id;
    END IF;

    -- هـ. توليد رقم القيد وإنشاء سجل الطالب
    v_reg_no := public.generate_student_registration_number();

    INSERT INTO public.students (
        registration_number,
        full_name,
        birth_date,
        gender,
        address,
        hifz_level,
        status,
        notes
    ) VALUES (
        v_reg_no,
        v_app.student_name,
        v_calc_birth_date,
        p_gender,
        'مسجل عبر الموقع العام',
        CASE 
            WHEN v_app.desired_track = 'BEGINNER' THEN 'مبتدئ'
            WHEN v_app.desired_track = 'TAJWEED' THEN 'متوسط'
            WHEN v_app.desired_track = 'MEMORIZATION' THEN 'متقدم'
            WHEN v_app.desired_track = 'IJAZAH' THEN 'إتمام الحفظ'
            ELSE 'مبتدئ'
        END,
        'active',
        COALESCE(p_notes, v_app.notes)
    ) RETURNING id INTO v_student_id;

    -- و. ربط الطالب بولي الأمر
    INSERT INTO public.guardian_students (
        guardian_id,
        student_id,
        relationship_type,
        is_primary_contact,
        can_pickup
    ) VALUES (
        v_guardian_id,
        v_student_id,
        'ولي أمر',
        true,
        true
    ) ON CONFLICT (guardian_id, student_id) DO NOTHING;

    -- ز. انتساب الطالب للحلقة إن حُددت
    IF p_circle_id IS NOT NULL THEN
        INSERT INTO public.circle_students (
            circle_id,
            student_id,
            enrollment_date,
            status
        ) VALUES (
            p_circle_id,
            v_student_id,
            CURRENT_DATE,
            'enrolled'
        );
    END IF;

    -- ح. تحديث حالة الطلب إلى APPROVED وتوثيق المراجع والوقت
    UPDATE public.registration_applications
    SET status = 'APPROVED',
        reviewer_id = public.current_user_id(),
        reviewer_notes = COALESCE(p_notes, 'تم قبول الطلب وتحويله رسمياً إلى ملف طالب مقيد'),
        reviewed_at = now(),
        updated_at = now()
    WHERE id = p_application_id;

    v_result := jsonb_build_object(
        'success', true,
        'student_id', v_student_id,
        'registration_number', v_reg_no,
        'guardian_id', v_guardian_id,
        'application_id', p_application_id
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

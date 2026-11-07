-- =============================================================================
-- Migration: 20261103000009_auth_and_rls_policies.sql
-- Description: Complete Row Level Security (RLS) Policies, RBAC Functions, and Auth Trigger
-- Author: Senior PostgreSQL / Supabase Security Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. دوال الصلاحيات والأمان المساعدة (RBAC Security Helper Functions)
-- دوال معرّفة بـ SECURITY DEFINER لمنع تصعيد الامتيازات والوصول السريع لبيانات الجلسة
-- -----------------------------------------------------------------------------

-- دالة استرجاع معرف المستخدم الحالي بأمان
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة فحص ما إذا كان المستخدم يملك دوراً محدداً
CREATE OR REPLACE FUNCTION public.has_role(checked_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_has BOOLEAN;
BEGIN
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.profiles p ON p.id = ur.user_id
        WHERE ur.user_id = auth.uid()
          AND ur.role = checked_role
          AND p.is_active = true
    ) INTO v_has;

    RETURN COALESCE(v_has, FALSE);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة فحص صلاحية الإدارة (ADMIN)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role('ADMIN');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة فحص صلاحية المعلم (TEACHER)
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role('TEACHER');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة فحص صلاحية ولي الأمر (GUARDIAN)
CREATE OR REPLACE FUNCTION public.is_guardian()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role('GUARDIAN');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة فحص صلاحية الطالب (STUDENT)
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.has_role('STUDENT');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة جلب معرف المعلم الحالي في جدول teachers
CREATE OR REPLACE FUNCTION public.get_current_teacher_id()
RETURNS UUID AS $$
DECLARE
    v_teacher_id UUID;
BEGIN
    SELECT id INTO v_teacher_id
    FROM public.teachers
    WHERE user_id = auth.uid()
    LIMIT 1;

    RETURN v_teacher_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة جلب معرف الولي الحالي في جدول guardians
CREATE OR REPLACE FUNCTION public.get_current_guardian_id()
RETURNS UUID AS $$
DECLARE
    v_guardian_id UUID;
BEGIN
    SELECT id INTO v_guardian_id
    FROM public.guardians
    WHERE user_id = auth.uid()
    LIMIT 1;

    RETURN v_guardian_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- دالة جلب معرف الطالب الحالي في جدول students
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID AS $$
DECLARE
    v_student_id UUID;
BEGIN
    SELECT id INTO v_student_id
    FROM public.students
    WHERE user_id = auth.uid()
    LIMIT 1;

    RETURN v_student_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth;

-- -----------------------------------------------------------------------------
-- 2. الزناد التلقائي لإنشاء الملف الشخصي وتعيين الدور عند تسجيل حساب جديد
-- Trigger on auth.users -> public.profiles & public.user_roles
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_raw_role TEXT;
    v_assigned_role TEXT := 'STUDENT';
BEGIN
    v_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'مستخدم جديد'
    );

    v_raw_role := UPPER(COALESCE(
        NEW.raw_user_meta_data->>'role',
        NEW.raw_app_meta_data->>'role',
        'STUDENT'
    ));

    -- قصر الدور المسند ذاتياً على الأدوار المقبولة، وإسقاط محاولات تزوير ADMIN إلى STUDENT إلا بموافقة إدارية
    IF v_raw_role IN ('TEACHER', 'GUARDIAN', 'STUDENT') THEN
        v_assigned_role := v_raw_role;
    ELSE
        v_assigned_role := 'STUDENT';
    END IF;

    -- إدراج في profiles
    INSERT INTO public.profiles (id, full_name, email, is_active)
    VALUES (NEW.id, v_full_name, NEW.email, true)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- إدراج الدور الافتراضي في user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, v_assigned_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- إنشاء الزناد على auth.users (إن وجد المخطط auth)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS trigger_on_auth_user_created ON auth.users;
        CREATE TRIGGER trigger_on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. تفعيل RLS على جميع الجداول الـ 22 بلا استثناء
-- -----------------------------------------------------------------------------
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. سياسات الأمان لمستوى الصفوف (RLS Policies)
-- -----------------------------------------------------------------------------

-- ==========================================
-- 4.1 إعدادات المدرسة (school_settings)
-- ==========================================
DROP POLICY IF EXISTS "school_settings_select_policy" ON public.school_settings;
CREATE POLICY "school_settings_select_policy"
ON public.school_settings FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "school_settings_admin_modify_policy" ON public.school_settings;
CREATE POLICY "school_settings_admin_modify_policy"
ON public.school_settings FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.2 الملفات الشخصية (profiles)
-- ==========================================
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (
    -- الإدارة ترى كافة الحسابات
    public.is_admin()
    -- صاحب الحساب يرى حسابه
    OR id = auth.uid()
    -- المعلم يرى ملفات الطلاب والأولياء المرتبطين بحلقاته
    OR (
        public.is_teacher() AND id IN (
            SELECT s.user_id FROM public.students s
            JOIN public.circle_students cs ON cs.student_id = s.id
            JOIN public.circles c ON c.id = cs.circle_id
            WHERE c.teacher_id = public.get_current_teacher_id()
            UNION
            SELECT g.user_id FROM public.guardians g
            JOIN public.guardian_students gs ON gs.guardian_id = g.id
            JOIN public.circle_students cs ON cs.student_id = gs.student_id
            JOIN public.circles c ON c.id = cs.circle_id
            WHERE c.teacher_id = public.get_current_teacher_id()
        )
    )
    -- الولي يرى ملفات أبنائه ومعلميهم
    OR (
        public.is_guardian() AND id IN (
            SELECT s.user_id FROM public.students s
            JOIN public.guardian_students gs ON gs.student_id = s.id
            WHERE gs.guardian_id = public.get_current_guardian_id()
            UNION
            SELECT t.user_id FROM public.teachers t
            JOIN public.circles c ON c.teacher_id = t.id
            JOIN public.circle_students cs ON cs.circle_id = c.id
            JOIN public.guardian_students gs ON gs.student_id = cs.student_id
            WHERE gs.guardian_id = public.get_current_guardian_id()
        )
    )
    -- الطالب يرى ملف معلمه
    OR (
        public.is_student() AND id IN (
            SELECT t.user_id FROM public.teachers t
            JOIN public.circles c ON c.teacher_id = t.id
            JOIN public.circle_students cs ON cs.circle_id = c.id
            WHERE cs.student_id = public.get_current_student_id()
        )
    )
);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR id = auth.uid()
)
WITH CHECK (
    -- الإدارة فقط من يمكنها تعديل حالة التنشيط is_active أو التعطيل
    (public.is_admin())
    OR
    (
        id = auth.uid() 
        AND is_active = (SELECT p.is_active FROM public.profiles p WHERE p.id = auth.uid())
    )
);

DROP POLICY IF EXISTS "profiles_admin_all_policy" ON public.profiles;
CREATE POLICY "profiles_admin_all_policy"
ON public.profiles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.3 جدول الأدوار (user_roles)
-- ==========================================
DROP POLICY IF EXISTS "user_roles_select_policy" ON public.user_roles;
CREATE POLICY "user_roles_select_policy"
ON public.user_roles FOR SELECT
TO authenticated
USING (
    public.is_admin() OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "user_roles_admin_manage_policy" ON public.user_roles;
CREATE POLICY "user_roles_admin_manage_policy"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.4 السنوات الدراسية (academic_years)
-- ==========================================
DROP POLICY IF EXISTS "academic_years_select_policy" ON public.academic_years;
CREATE POLICY "academic_years_select_policy"
ON public.academic_years FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "academic_years_admin_manage_policy" ON public.academic_years;
CREATE POLICY "academic_years_admin_manage_policy"
ON public.academic_years FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.5 القاعات (halls)
-- ==========================================
DROP POLICY IF EXISTS "halls_select_policy" ON public.halls;
CREATE POLICY "halls_select_policy"
ON public.halls FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "halls_admin_manage_policy" ON public.halls;
CREATE POLICY "halls_admin_manage_policy"
ON public.halls FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.6 المعلمون (teachers)
-- ==========================================
DROP POLICY IF EXISTS "teachers_select_policy" ON public.teachers;
CREATE POLICY "teachers_select_policy"
ON public.teachers FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR status = 'active'
);

DROP POLICY IF EXISTS "teachers_admin_manage_policy" ON public.teachers;
CREATE POLICY "teachers_admin_manage_policy"
ON public.teachers FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.7 أولياء الأمور (guardians)
-- ==========================================
DROP POLICY IF EXISTS "guardians_select_policy" ON public.guardians;
CREATE POLICY "guardians_select_policy"
ON public.guardians FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (
        public.is_teacher() AND id IN (
            SELECT gs.guardian_id FROM public.guardian_students gs
            JOIN public.circle_students cs ON cs.student_id = gs.student_id
            JOIN public.circles c ON c.id = cs.circle_id
            WHERE c.teacher_id = public.get_current_teacher_id()
        )
    )
);

DROP POLICY IF EXISTS "guardians_update_policy" ON public.guardians;
CREATE POLICY "guardians_update_policy"
ON public.guardians FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR user_id = auth.uid()
)
WITH CHECK (
    public.is_admin() OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "guardians_admin_manage_policy" ON public.guardians;
CREATE POLICY "guardians_admin_manage_policy"
ON public.guardians FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.8 الطلاب (students)
-- ==========================================
DROP POLICY IF EXISTS "students_select_policy" ON public.students;
CREATE POLICY "students_select_policy"
ON public.students FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (
        public.is_teacher() AND id IN (
            SELECT cs.student_id FROM public.circle_students cs
            JOIN public.circles c ON c.id = cs.circle_id
            WHERE c.teacher_id = public.get_current_teacher_id()
        )
    )
    OR (
        public.is_guardian() AND id IN (
            SELECT gs.student_id FROM public.guardian_students gs
            WHERE gs.guardian_id = public.get_current_guardian_id()
        )
    )
);

DROP POLICY IF EXISTS "students_admin_manage_policy" ON public.students;
CREATE POLICY "students_admin_manage_policy"
ON public.students FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.9 علاقة الأولياء بالطلاب (guardian_students)
-- ==========================================
DROP POLICY IF EXISTS "guardian_students_select_policy" ON public.guardian_students;
CREATE POLICY "guardian_students_select_policy"
ON public.guardian_students FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR guardian_id = public.get_current_guardian_id()
    OR (
        public.is_teacher() AND student_id IN (
            SELECT cs.student_id FROM public.circle_students cs
            JOIN public.circles c ON c.id = cs.circle_id
            WHERE c.teacher_id = public.get_current_teacher_id()
        )
    )
);

DROP POLICY IF EXISTS "guardian_students_admin_manage_policy" ON public.guardian_students;
CREATE POLICY "guardian_students_admin_manage_policy"
ON public.guardian_students FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.10 الحلقات القرآنية (circles)
-- ==========================================
DROP POLICY IF EXISTS "circles_select_policy" ON public.circles;
CREATE POLICY "circles_select_policy"
ON public.circles FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR teacher_id = public.get_current_teacher_id()
    OR id IN (
        SELECT cs.circle_id FROM public.circle_students cs
        WHERE cs.student_id = public.get_current_student_id()
    )
    OR id IN (
        SELECT cs.circle_id FROM public.circle_students cs
        JOIN public.guardian_students gs ON gs.student_id = cs.student_id
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
    OR status = 'active'
);

DROP POLICY IF EXISTS "circles_admin_manage_policy" ON public.circles;
CREATE POLICY "circles_admin_manage_policy"
ON public.circles FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.11 مواعيد الحلقات (circle_schedules)
-- ==========================================
DROP POLICY IF EXISTS "circle_schedules_select_policy" ON public.circle_schedules;
CREATE POLICY "circle_schedules_select_policy"
ON public.circle_schedules FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR circle_id IN (
        SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
    )
    OR circle_id IN (
        SELECT cs.circle_id FROM public.circle_students cs
        WHERE cs.student_id = public.get_current_student_id()
    )
    OR circle_id IN (
        SELECT cs.circle_id FROM public.circle_students cs
        JOIN public.guardian_students gs ON gs.student_id = cs.student_id
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "circle_schedules_admin_manage_policy" ON public.circle_schedules;
CREATE POLICY "circle_schedules_admin_manage_policy"
ON public.circle_schedules FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.12 قيد الطلاب في الحلقات (circle_students)
-- ==========================================
DROP POLICY IF EXISTS "circle_students_select_policy" ON public.circle_students;
CREATE POLICY "circle_students_select_policy"
ON public.circle_students FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR circle_id IN (
        SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
    )
    OR student_id = public.get_current_student_id()
    OR student_id IN (
        SELECT gs.student_id FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "circle_students_admin_manage_policy" ON public.circle_students;
CREATE POLICY "circle_students_admin_manage_policy"
ON public.circle_students FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.13 الحضور والغياب (attendance)
-- ==========================================
DROP POLICY IF EXISTS "attendance_select_policy" ON public.attendance;
CREATE POLICY "attendance_select_policy"
ON public.attendance FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR circle_id IN (
        SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
    )
    OR student_id = public.get_current_student_id()
    OR student_id IN (
        SELECT gs.student_id FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "attendance_insert_policy" ON public.attendance;
CREATE POLICY "attendance_insert_policy"
ON public.attendance FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher()
        AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
);

DROP POLICY IF EXISTS "attendance_update_policy" ON public.attendance;
CREATE POLICY "attendance_update_policy"
ON public.attendance FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR (
        public.is_teacher()
        AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
)
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher()
        AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
);

DROP POLICY IF EXISTS "attendance_admin_delete_policy" ON public.attendance;
CREATE POLICY "attendance_admin_delete_policy"
ON public.attendance FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==========================================
-- 4.14 سجل الحفظ والمراجعة (memorization_records)
-- ==========================================
DROP POLICY IF EXISTS "memorization_select_policy" ON public.memorization_records;
CREATE POLICY "memorization_select_policy"
ON public.memorization_records FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR teacher_id = public.get_current_teacher_id()
    OR student_id = public.get_current_student_id()
    OR student_id IN (
        SELECT gs.student_id FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "memorization_insert_policy" ON public.memorization_records;
CREATE POLICY "memorization_insert_policy"
ON public.memorization_records FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher()
        AND teacher_id = public.get_current_teacher_id()
    )
);

DROP POLICY IF EXISTS "memorization_update_policy" ON public.memorization_records;
CREATE POLICY "memorization_update_policy"
ON public.memorization_records FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR (
        public.is_teacher()
        AND teacher_id = public.get_current_teacher_id()
    )
)
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher()
        AND teacher_id = public.get_current_teacher_id()
    )
);

DROP POLICY IF EXISTS "memorization_admin_delete_policy" ON public.memorization_records;
CREATE POLICY "memorization_admin_delete_policy"
ON public.memorization_records FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==========================================
-- 4.15 التقييمات الشهرية والفصلية (evaluations)
-- ==========================================
DROP POLICY IF EXISTS "evaluations_select_policy" ON public.evaluations;
CREATE POLICY "evaluations_select_policy"
ON public.evaluations FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR teacher_id = public.get_current_teacher_id()
    OR student_id = public.get_current_student_id()
    OR student_id IN (
        SELECT gs.student_id FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "evaluations_insert_policy" ON public.evaluations;
CREATE POLICY "evaluations_insert_policy"
ON public.evaluations FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher()
        AND teacher_id = public.get_current_teacher_id()
        AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
);

DROP POLICY IF EXISTS "evaluations_update_policy" ON public.evaluations;
CREATE POLICY "evaluations_update_policy"
ON public.evaluations FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR (
        public.is_teacher()
        AND teacher_id = public.get_current_teacher_id()
    )
)
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher()
        AND teacher_id = public.get_current_teacher_id()
    )
);

DROP POLICY IF EXISTS "evaluations_admin_delete_policy" ON public.evaluations;
CREATE POLICY "evaluations_admin_delete_policy"
ON public.evaluations FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==========================================
-- 4.16 الرسوم والمستحقات (fees)
-- ==========================================
DROP POLICY IF EXISTS "fees_select_policy" ON public.fees;
CREATE POLICY "fees_select_policy"
ON public.fees FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR student_id = public.get_current_student_id()
    OR student_id IN (
        SELECT gs.student_id FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "fees_admin_manage_policy" ON public.fees;
CREATE POLICY "fees_admin_manage_policy"
ON public.fees FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.17 المدفوعات والوصولات (payments)
-- ==========================================
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy"
ON public.payments FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR student_id = public.get_current_student_id()
    OR student_id IN (
        SELECT gs.student_id FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

DROP POLICY IF EXISTS "payments_admin_manage_policy" ON public.payments;
CREATE POLICY "payments_admin_manage_policy"
ON public.payments FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.18 الفعاليات والأنشطة (events)
-- ==========================================
DROP POLICY IF EXISTS "events_select_policy" ON public.events;
CREATE POLICY "events_select_policy"
ON public.events FOR SELECT
TO public
USING (
    is_published = true
    AND (target_audience = 'all' OR auth.role() = 'authenticated')
);

DROP POLICY IF EXISTS "events_admin_manage_policy" ON public.events;
CREATE POLICY "events_admin_manage_policy"
ON public.events FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.19 الإعلانات المدرسية (announcements)
-- ==========================================
DROP POLICY IF EXISTS "announcements_select_policy" ON public.announcements;
CREATE POLICY "announcements_select_policy"
ON public.announcements FOR SELECT
TO authenticated
USING (
    target_role = 'all'
    OR public.has_role(target_role)
    OR public.is_admin()
);

DROP POLICY IF EXISTS "announcements_admin_manage_policy" ON public.announcements;
CREATE POLICY "announcements_admin_manage_policy"
ON public.announcements FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.20 الرسائل والتواصل (messages)
-- ==========================================
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
CREATE POLICY "messages_select_policy"
ON public.messages FOR SELECT
TO authenticated
USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR public.is_admin()
);

DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
);

DROP POLICY IF EXISTS "messages_update_read_policy" ON public.messages;
CREATE POLICY "messages_update_read_policy"
ON public.messages FOR UPDATE
TO authenticated
USING (
    recipient_id = auth.uid() OR public.is_admin()
)
WITH CHECK (
    recipient_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "messages_admin_delete_policy" ON public.messages;
CREATE POLICY "messages_admin_delete_policy"
ON public.messages FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==========================================
-- 4.21 الإشعارات والتنبيهات (notifications)
-- ==========================================
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid()
)
WITH CHECK (
    user_id = auth.uid()
);

DROP POLICY IF EXISTS "notifications_admin_manage_policy" ON public.notifications;
CREATE POLICY "notifications_admin_manage_policy"
ON public.notifications FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==========================================
-- 4.22 سجل التدقيق والرقابة (audit_logs)
-- محمي بالزناد ضد التعديل أو الحذف، وقراءته حصرية للإدارة
-- ==========================================
DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_select_policy"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
    public.is_admin()
);

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_policy"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (
    -- يسمح بتسجيل التدقيق للمستخدم المصرح أو دالة النظام
    user_id = auth.uid() OR public.is_admin()
);
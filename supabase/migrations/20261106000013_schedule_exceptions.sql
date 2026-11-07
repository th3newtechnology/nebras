-- =============================================================================
-- Migration: 20261106000013_schedule_exceptions.sql
-- Description: Table for Schedule Exceptions, Cancellations, Room Changes, 
--              and Substitute Teachers with Impeccable Audit Trail & RLS
-- Phase: 8.4.2 - الجدول الأسبوعي وإدارة الحصص والاستثناءات
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. إنشاء جدول استثناءات وتعديلات الحصص (schedule_exceptions)
CREATE TABLE IF NOT EXISTS public.schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.circle_schedules(id) ON DELETE CASCADE,
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    exception_type TEXT NOT NULL CHECK (exception_type IN ('cancelled', 'rescheduled', 'substitute_teacher', 'room_change')),
    substitute_teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    new_hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    new_start_time TIME CHECK (new_start_time IS NULL OR (new_start_time >= '05:00:00' AND new_start_time <= '23:00:00')),
    new_end_time TIME CHECK (new_end_time IS NULL OR (new_end_time >= '05:00:00' AND new_end_time <= '23:00:00' AND new_end_time > new_start_time)),
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    author_name TEXT NOT NULL DEFAULT 'الإدارة',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_schedule_date_exception UNIQUE (schedule_id, exception_date)
);

-- 2. الفهارس لتحسين سرعة الاستعلامات والربط
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_schedule ON public.schedule_exceptions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_circle ON public.schedule_exceptions(circle_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_date ON public.schedule_exceptions(exception_date);
CREATE INDEX IF NOT EXISTS idx_schedule_exceptions_type ON public.schedule_exceptions(exception_type);

-- 3. تفعيل أمان الصفوف (Row Level Security - RLS)
ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;

-- 4. سياسات RLS:
-- أ. سياسة القراءة (SELECT): متاحة للإدارة، والمعلمين لحلقاتهم، والطلاب لحلقاتهم، والأولياء لأبنائهم
DROP POLICY IF EXISTS "schedule_exceptions_select_policy" ON public.schedule_exceptions;
CREATE POLICY "schedule_exceptions_select_policy"
ON public.schedule_exceptions FOR SELECT
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

-- ب. سياسة الإدراج (INSERT): متاحة للإدارة، ولمعلم الحلقة المسندة
DROP POLICY IF EXISTS "schedule_exceptions_insert_policy" ON public.schedule_exceptions;
CREATE POLICY "schedule_exceptions_insert_policy"
ON public.schedule_exceptions FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher() AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
);

-- ج. سياسة التعديل (UPDATE): متاحة للإدارة ولمعلم الحلقة
DROP POLICY IF EXISTS "schedule_exceptions_update_policy" ON public.schedule_exceptions;
CREATE POLICY "schedule_exceptions_update_policy"
ON public.schedule_exceptions FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR (
        public.is_teacher() AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
)
WITH CHECK (
    public.is_admin()
    OR (
        public.is_teacher() AND circle_id IN (
            SELECT id FROM public.circles WHERE teacher_id = public.get_current_teacher_id()
        )
    )
);

-- د. سياسة الحذف (DELETE): متاحة للإدارة فقط لضمان سلامة السجل الرقابي
DROP POLICY IF EXISTS "schedule_exceptions_delete_policy" ON public.schedule_exceptions;
CREATE POLICY "schedule_exceptions_delete_policy"
ON public.schedule_exceptions FOR DELETE
TO authenticated
USING (public.is_admin());

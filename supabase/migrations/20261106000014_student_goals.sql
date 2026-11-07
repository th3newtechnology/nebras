-- =============================================================================
-- Migration: 20261106000014_student_goals.sql
-- Description: Student Quranic & Pedagogical Goals (Weekly/Monthly targets)
-- Phase: 8.4.3 - سجل المتابعة الفردي وأهداف الطالب
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. إنشاء جدول أهداف الطالب التربوية والقرآنية (student_goals)
CREATE TABLE IF NOT EXISTS public.student_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    circle_id UUID REFERENCES public.circles(id) ON DELETE SET NULL,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('weekly_hifz', 'weekly_revision', 'juz_completion', 'tajweed_mastery')),
    title TEXT NOT NULL,
    description TEXT,
    target_surah INTEGER CHECK (target_surah IS NULL OR (target_surah BETWEEN 1 AND 114)),
    target_surah_name TEXT,
    target_ayah_from INTEGER,
    target_ayah_to INTEGER,
    target_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'overdue', 'cancelled')),
    completed_at TIMESTAMPTZ,
    teacher_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. الفهارس لتحسين سرعة الاستعلامات والربط
CREATE INDEX IF NOT EXISTS idx_student_goals_student ON public.student_goals(student_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_teacher ON public.student_goals(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_circle ON public.student_goals(circle_id);
CREATE INDEX IF NOT EXISTS idx_student_goals_target_date ON public.student_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_student_goals_status ON public.student_goals(status);

-- 3. تفعيل زناد تحديث تاريخ updated_at
CREATE TRIGGER trigger_student_goals_updated_at
BEFORE UPDATE ON public.student_goals
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. تفعيل أمان الصفوف (Row Level Security - RLS)
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;

-- 5. سياسات RLS:
-- أ. سياسة القراءة (SELECT): متاحة للإدارة، والمعلم المسؤول، والطالب، والولي المرتبط
DROP POLICY IF EXISTS "student_goals_select_policy" ON public.student_goals;
CREATE POLICY "student_goals_select_policy"
ON public.student_goals FOR SELECT
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

-- ب. سياسة الإدراج (INSERT): متاحة للإدارة ولمعلم الطالب
DROP POLICY IF EXISTS "student_goals_insert_policy" ON public.student_goals;
CREATE POLICY "student_goals_insert_policy"
ON public.student_goals FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
    OR teacher_id = public.get_current_teacher_id()
);

-- ج. سياسة التعديل (UPDATE): متاحة للإدارة والمعلم المسؤول
DROP POLICY IF EXISTS "student_goals_update_policy" ON public.student_goals;
CREATE POLICY "student_goals_update_policy"
ON public.student_goals FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR teacher_id = public.get_current_teacher_id()
)
WITH CHECK (
    public.is_admin()
    OR teacher_id = public.get_current_teacher_id()
);

-- د. سياسة الحذف (DELETE): متاحة للإدارة فقط لضمان النزاهة الرقابية
DROP POLICY IF EXISTS "student_goals_delete_policy" ON public.student_goals;
CREATE POLICY "student_goals_delete_policy"
ON public.student_goals FOR DELETE
TO authenticated
USING (public.is_admin());

-- =============================================================================
-- Migration: 20261103000004_pedagogical_records.sql
-- Description: Attendance, Daily Memorization Log, and Periodic Evaluations
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. جدول الحضور والغياب (attendance)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.circle_schedules(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    delay_minutes INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_attendance_circle_student_date UNIQUE (circle_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_circle_date ON public.attendance(circle_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance(status);

-- 2. جدول سجل الحفظ والمراجعة اليومي (memorization_records)
CREATE TABLE IF NOT EXISTS public.memorization_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    circle_id UUID REFERENCES public.circles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    record_type TEXT NOT NULL CHECK (record_type IN ('new_memorization', 'minor_review', 'major_review')),
    juz INTEGER NOT NULL CHECK (juz BETWEEN 1 AND 30),
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    surah_name TEXT NOT NULL,
    ayah_from INTEGER NOT NULL CHECK (ayah_from > 0),
    ayah_to INTEGER NOT NULL CHECK (ayah_to >= ayah_from),
    grade TEXT NOT NULL CHECK (grade IN ('ممتاز', 'جيد جداً', 'جيد', 'يحتاج مراجعة')),
    mistakes_count INTEGER NOT NULL DEFAULT 0 CHECK (mistakes_count >= 0),
    tajweed_mistakes_count INTEGER NOT NULL DEFAULT 0 CHECK (tajweed_mistakes_count >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memorization_student_date ON public.memorization_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_memorization_teacher ON public.memorization_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_memorization_record_type ON public.memorization_records(record_type);
CREATE INDEX IF NOT EXISTS idx_memorization_juz ON public.memorization_records(juz);

-- 3. جدول التقييمات والاختبارات الدورية (evaluations)
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    circle_id UUID REFERENCES public.circles(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('memorization', 'revision', 'tajweed', 'behavior')),
    score NUMERIC(5,2) NOT NULL,
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (max_score > 0),
    appreciation TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_evaluation_score CHECK (score >= 0 AND score <= max_score)
);

CREATE INDEX IF NOT EXISTS idx_evaluations_student_date ON public.evaluations(student_id, date);
CREATE INDEX IF NOT EXISTS idx_evaluations_type ON public.evaluations(evaluation_type);
CREATE INDEX IF NOT EXISTS idx_evaluations_teacher ON public.evaluations(teacher_id);

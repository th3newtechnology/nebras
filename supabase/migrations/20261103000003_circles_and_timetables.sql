-- =============================================================================
-- Migration: 20261103000003_circles_and_timetables.sql
-- Description: Circles, Schedules, and Student Enrollments / Transitions
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. جدول الحلقات القرآنية (circles)
CREATE TABLE IF NOT EXISTS public.circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('مبتدئ', 'متوسط', 'متقدم', 'إتمام الحفظ', 'مراجعة')),
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    hall_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
    target_gender TEXT NOT NULL DEFAULT 'male' CHECK (target_gender IN ('male', 'female', 'mixed')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circles_academic_year ON public.circles(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_circles_teacher ON public.circles(teacher_id);
CREATE INDEX IF NOT EXISTS idx_circles_hall ON public.circles(hall_id);
CREATE INDEX IF NOT EXISTS idx_circles_status ON public.circles(status);
CREATE INDEX IF NOT EXISTS idx_circles_level ON public.circles(level);

CREATE TRIGGER trigger_circles_updated_at
BEFORE UPDATE ON public.circles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. جدول المواعيد والحصص الأسبوعية للحلقة (circle_schedules)
CREATE TABLE IF NOT EXISTS public.circle_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL CHECK (start_time >= '05:00:00'),
    end_time TIME NOT NULL CHECK (end_time <= '23:00:00' AND end_time > start_time),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circle_schedules_circle ON public.circle_schedules(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_schedules_day_time ON public.circle_schedules(day_of_week, start_time, end_time);

-- 3. جدول انتساب وانتقال الطلاب بين الحلقات (circle_students)
CREATE TABLE IF NOT EXISTS public.circle_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'transferred', 'completed', 'withdrawn')),
    transfer_reason TEXT,
    previous_circle_id UUID REFERENCES public.circles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_enrollment_dates CHECK (end_date IS NULL OR end_date >= enrollment_date)
);

-- منع التسجيل النشط المكرر لنفس الطالب في نفس الحلقة
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_student_circle 
ON public.circle_students (circle_id, student_id) 
WHERE status = 'enrolled';

CREATE INDEX IF NOT EXISTS idx_circle_students_student ON public.circle_students(student_id);
CREATE INDEX IF NOT EXISTS idx_circle_students_circle ON public.circle_students(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_students_status ON public.circle_students(status);

CREATE TRIGGER trigger_circle_students_updated_at
BEFORE UPDATE ON public.circle_students
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


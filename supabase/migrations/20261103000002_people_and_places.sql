-- =============================================================================
-- Migration: 20261103000002_people_and_places.sql
-- Description: Academic Years, Halls, Teachers, Guardians, Students, and Relationships
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. جدول السنوات الدراسية (academic_years)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_academic_year_dates CHECK (end_date > start_date)
);

-- ضمان وجود سنة دراسية حالية واحدة فقط عبر Partial Unique Index
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_current_academic_year 
ON public.academic_years (is_current) 
WHERE is_current = true;

CREATE INDEX IF NOT EXISTS idx_academic_years_dates ON public.academic_years(start_date, end_date);

-- 2. جدول القاعات المادية بمسجد إبراهيم الخليل (halls)
CREATE TABLE IF NOT EXISTS public.halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_halls_status ON public.halls(status);

CREATE TRIGGER trigger_halls_updated_at
BEFORE UPDATE ON public.halls
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. جدول المعلمين والمحفظين (teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    qualification TEXT,
    specialization TEXT,
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON public.teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_phone ON public.teachers(phone);

CREATE TRIGGER trigger_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. جدول أولياء الأمور (guardians)
CREATE TABLE IF NOT EXISTS public.guardians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    secondary_phone TEXT,
    email TEXT,
    national_id TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_phone ON public.guardians(phone);
CREATE INDEX IF NOT EXISTS idx_guardians_national_id ON public.guardians(national_id);

CREATE TRIGGER trigger_guardians_updated_at
BEFORE UPDATE ON public.guardians
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. جدول الطلاب (students)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    registration_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    address TEXT,
    current_juz INTEGER NOT NULL DEFAULT 0 CHECK (current_juz BETWEEN 0 AND 30),
    target_juz INTEGER NOT NULL DEFAULT 30 CHECK (target_juz BETWEEN 0 AND 30),
    hifz_level TEXT NOT NULL DEFAULT 'مبتدئ' CHECK (hifz_level IN ('مبتدئ', 'متوسط', 'متقدم', 'إتمام الحفظ', 'مراجعة')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'graduated', 'withdrawn')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON public.students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_hifz_level ON public.students(hifz_level);

CREATE TRIGGER trigger_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. جدول ربط الأولياء بالطلاب (guardian_students - Many to Many)
CREATE TABLE IF NOT EXISTS public.guardian_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL DEFAULT 'ولي أمر',
    is_primary_contact BOOLEAN NOT NULL DEFAULT true,
    can_pickup BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_guardian_students UNIQUE (guardian_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_guardian_students_guardian ON public.guardian_students(guardian_id);
CREATE INDEX IF NOT EXISTS idx_guardian_students_student ON public.guardian_students(student_id);

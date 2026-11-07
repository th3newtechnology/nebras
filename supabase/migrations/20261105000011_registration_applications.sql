-- =============================================================================
-- Migration: 20261105000011_registration_applications.sql
-- Description: Public Student Registration & Enrollment Applications with Anti-Duplicate Idempotency and Strict RLS
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.registration_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    student_age INTEGER CHECK (student_age IS NULL OR (student_age >= 4 AND student_age <= 70)),
    guardian_name TEXT NOT NULL,
    guardian_phone TEXT NOT NULL,
    desired_track TEXT NOT NULL CHECK (desired_track IN ('BEGINNER', 'MEMORIZATION', 'TAJWEED', 'IJAZAH')),
    previous_memorization TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CONTACTED')),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_phone_min_len CHECK (length(trim(guardian_phone)) >= 8),
    CONSTRAINT chk_student_name_not_empty CHECK (length(trim(student_name)) > 0),
    CONSTRAINT chk_guardian_name_not_empty CHECK (length(trim(guardian_name)) > 0)
);

-- 1. فهرس فريد مشروط لمنع الإرسال المكرر لنفس الطالب بنفس هاتف ولي الأمر طالما أن الطلب قيد الدراسة
CREATE UNIQUE INDEX IF NOT EXISTS idx_reg_unique_pending_submission 
ON public.registration_applications(guardian_phone, lower(trim(student_name))) 
WHERE status = 'PENDING';

-- 2. فهارس تسريع الاستعلامات الإدارية والفرز
CREATE INDEX IF NOT EXISTS idx_reg_status ON public.registration_applications(status);
CREATE INDEX IF NOT EXISTS idx_reg_created_at ON public.registration_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_guardian_phone ON public.registration_applications(guardian_phone);

-- 3. زناد التحديث التلقائي لزمن التعديل
CREATE TRIGGER trigger_registration_applications_updated_at
BEFORE UPDATE ON public.registration_applications
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. تفعيل سياسات أمان مستوى الصفوف (Row Level Security - RLS)
ALTER TABLE public.registration_applications ENABLE ROW LEVEL SECURITY;

-- أ. سياسة الإدخال العام المجهول (INSERT ONLY للزوار والمستخدمين)
-- تضمن عدم إمكانية تزييف الحالة أثناء الإرسال (تفرض status = 'PENDING')
CREATE POLICY "Public registration submission policy"
ON public.registration_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
    length(trim(student_name)) > 0 AND
    length(trim(guardian_name)) > 0 AND
    length(trim(guardian_phone)) >= 8 AND
    status = 'PENDING'
);

-- ب. سياسة القراءة المحصورة للإدارة (SELECT للأدمن فقط)
-- حظر تام لأي مستخدم عادي أو زائر من استعراض طلبات التسجيل أو أرقام الهواتف
CREATE POLICY "Admins can view registration applications"
ON public.registration_applications
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
);

-- ج. سياسة التعديل المحصورة للإدارة (UPDATE للأدمن فقط للمراجعة وتغيير الحالة)
CREATE POLICY "Admins can update registration applications"
ON public.registration_applications
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
);

-- د. سياسة الحذف المحصورة للإدارة (DELETE للأدمن فقط)
CREATE POLICY "Admins can delete registration applications"
ON public.registration_applications
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'ADMIN'
    )
);

-- ====================================================================================
-- مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
-- ملف ترحيل Supabase للمرحلة الفرعية 8.4.4: تقارير المعلمين التربوية والدورية
-- (Teacher Reports: Weekly, Strengths & Weaknesses, Targets & RLS Isolation)
-- ====================================================================================

-- 1. إنشاء جدول تقارير المعلمين الدورية المعتمدة
CREATE TABLE IF NOT EXISTS public.teacher_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE RESTRICT,
    circle_id UUID NOT NULL REFERENCES public.circles(id) ON DELETE RESTRICT,
    report_type TEXT NOT NULL DEFAULT 'weekly' CHECK (report_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'term')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- المؤشرات الكمية والمواظبة
    attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    sessions_attended INTEGER NOT NULL DEFAULT 0,
    sessions_total INTEGER NOT NULL DEFAULT 0,
    
    -- الحفظ والمراجعة وأحكام ورش
    new_memorization_progress TEXT NOT NULL,
    revision_progress TEXT NOT NULL,
    tajweed_level TEXT NOT NULL,
    warsh_adherence TEXT NOT NULL DEFAULT 'ملتزم بأحكام الرواية (مد البدل، التقليل، نقل الهمز)',
    
    -- التقييم النوعي والتربوي
    behavior_notes TEXT,
    strengths TEXT NOT NULL,
    areas_for_improvement TEXT NOT NULL,
    recommendations_for_guardian TEXT NOT NULL,
    next_week_goals TEXT,
    overall_rating TEXT NOT NULL DEFAULT 'ممتاز' CHECK (overall_rating IN ('ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'يحتاج متابعة')),
    
    -- دورة الاعتماد والأمان وعدم القابلية للتعديل بعد الإرسال
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'sent_to_guardian')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    guardian_viewed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT chk_report_period CHECK (period_end >= period_start)
);

-- 2. الفهارس لتسريع الاستعلامات والتصفية
CREATE INDEX IF NOT EXISTS idx_teacher_reports_student ON public.teacher_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_teacher ON public.teacher_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_circle ON public.teacher_reports(circle_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_status ON public.teacher_reports(status);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_period ON public.teacher_reports(period_start, period_end);

-- 3. تفعيل RLS
ALTER TABLE public.teacher_reports ENABLE ROW LEVEL SECURITY;

-- 4. سياسات RLS المحكمة

-- أ) الإدارة (Admin): وصول كامل وغير مقيد
CREATE POLICY "admin_all_teacher_reports"
ON public.teacher_reports
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ب) المعلم (Teacher): قراءة تقاريره
CREATE POLICY "teacher_select_own_reports"
ON public.teacher_reports
FOR SELECT
TO authenticated
USING (
    public.is_teacher() 
    AND teacher_id = public.get_current_teacher_id()
);

-- ج) المعلم (Teacher): إدراج تقارير لطلابه
CREATE POLICY "teacher_insert_own_reports"
ON public.teacher_reports
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_teacher() 
    AND teacher_id = public.get_current_teacher_id()
);

-- د) المعلم (Teacher): تعديل المسودات أو التقارير المقدمة فقط، ويُمنع منعاً باتاً التعديل بعد إرسالها لولي الأمر
CREATE POLICY "teacher_update_draft_reports_only"
ON public.teacher_reports
FOR UPDATE
TO authenticated
USING (
    public.is_teacher() 
    AND teacher_id = public.get_current_teacher_id() 
    AND status IN ('draft', 'submitted')
)
WITH CHECK (
    public.is_teacher() 
    AND teacher_id = public.get_current_teacher_id() 
    AND status IN ('draft', 'submitted', 'approved', 'sent_to_guardian')
);

-- هـ) المعلم (Teacher): حذف المسودات فقط
CREATE POLICY "teacher_delete_draft_reports_only"
ON public.teacher_reports
FOR DELETE
TO authenticated
USING (
    public.is_teacher() 
    AND teacher_id = public.get_current_teacher_id() 
    AND status = 'draft'
);

-- و) ولي الأمر (Guardian): قراءة التقارير المعتمدة أو المرسلة لأبنائه فقط (عزل أمني تام)
CREATE POLICY "guardian_select_children_reports"
ON public.teacher_reports
FOR SELECT
TO authenticated
USING (
    public.is_guardian() 
    AND status IN ('approved', 'sent_to_guardian')
    AND student_id IN (
        SELECT gs.student_id 
        FROM public.guardian_students gs
        WHERE gs.guardian_id = public.get_current_guardian_id()
    )
);

-- ز) الطالب (Student): قراءة تقاريره المعتمدة فقط
CREATE POLICY "student_select_own_approved_reports"
ON public.teacher_reports
FOR SELECT
TO authenticated
USING (
    public.is_student() 
    AND status IN ('approved', 'sent_to_guardian')
    AND student_id = public.get_current_student_id()
);

-- 5. زناد التحديث التلقائي لحقل updated_at
CREATE OR REPLACE TRIGGER trg_teacher_reports_updated_at
BEFORE UPDATE ON public.teacher_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

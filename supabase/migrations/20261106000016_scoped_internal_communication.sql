-- ====================================================================================
-- مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
-- ملف ترحيل Supabase للمرحلة الفرعية 8.4.6: التواصل الداخلي المنظم وقفل الصلاحيات
-- (Scoped Internal Communication, Conversation Threading, and Read Receipts)
-- ====================================================================================

-- 1. إضافة حقل ربط الرسالة بالطالب المعني وحقل وقت القراءة
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'pedagogical', 'absence', 'compliment', 'inquiry'));

CREATE INDEX IF NOT EXISTS idx_messages_student ON public.messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_category ON public.messages(category);

-- 2. دالة التحقق الأمني من صلاحية التراسل المتبادل (منع الرسائل العشوائية والاتصال غير المصرح)
CREATE OR REPLACE FUNCTION public.can_communicate(p_sender_id UUID, p_recipient_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sender_role TEXT;
    v_recipient_role TEXT;
    v_teacher_id UUID;
    v_guardian_id UUID;
    v_is_authorized BOOLEAN := FALSE;
BEGIN
    -- 1. المدير له صلاحية التواصل مع الجميع دون قيود
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    -- جلب أدوار الطرفين
    SELECT role INTO v_sender_role FROM public.profiles WHERE id = p_sender_id;
    SELECT role INTO v_recipient_role FROM public.profiles WHERE id = p_recipient_id;

    -- إذا كان أحد الطرفين مديراً، التواصل مسموح
    IF v_sender_role = 'ADMIN' OR v_recipient_role = 'ADMIN' THEN
        RETURN TRUE;
    END IF;

    -- إذا كان المرسل معلماً والمستقبل ولي أمر:
    IF v_sender_role = 'TEACHER' AND v_recipient_role = 'GUARDIAN' THEN
        SELECT id INTO v_teacher_id FROM public.teachers WHERE user_id = p_sender_id;
        SELECT id INTO v_guardian_id FROM public.guardians WHERE user_id = p_recipient_id;

        -- التحقق من وجود طالب يدرس لدى هذا المعلم وهو ابن لهذا الولي
        SELECT EXISTS (
            SELECT 1 
            FROM public.circle_students cs
            JOIN public.circles c ON c.id = cs.circle_id
            JOIN public.guardian_students gs ON gs.student_id = cs.student_id
            WHERE c.teacher_id = v_teacher_id
              AND gs.guardian_id = v_guardian_id
        ) INTO v_is_authorized;

        RETURN v_is_authorized;
    END IF;

    -- إذا كان المرسل ولي أمر والمستقبل معلماً:
    IF v_sender_role = 'GUARDIAN' AND v_recipient_role = 'TEACHER' THEN
        SELECT id INTO v_guardian_id FROM public.guardians WHERE user_id = p_sender_id;
        SELECT id INTO v_teacher_id FROM public.teachers WHERE user_id = p_recipient_id;

        -- التحقق من أن المعلم يدرّس أحد أبناء هذا الولي
        SELECT EXISTS (
            SELECT 1 
            FROM public.circle_students cs
            JOIN public.circles c ON c.id = cs.circle_id
            JOIN public.guardian_students gs ON gs.student_id = cs.student_id
            WHERE c.teacher_id = v_teacher_id
              AND gs.guardian_id = v_guardian_id
        ) INTO v_is_authorized;

        RETURN v_is_authorized;
    END IF;

    -- التواصل بين المعلمين وزملائهم مسموح للتنسيق التربوي
    IF v_sender_role = 'TEACHER' AND v_recipient_role = 'TEACHER' THEN
        RETURN TRUE;
    END IF;

    -- التواصل بين الأولياء وبعضهم محظور تماماً (Zero Cross-Guardian Communication)
    IF v_sender_role = 'GUARDIAN' AND v_recipient_role = 'GUARDIAN' THEN
        RETURN FALSE;
    END IF;

    RETURN FALSE;
END;
$$;

-- 3. تحديث سياسة الإدراج في جدول messages لتطبيق الفحص الأمني
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND (
        public.is_admin() 
        OR public.can_communicate(auth.uid(), recipient_id)
    )
);

-- 4. زناد التحديث التلقائي لوقت القراءة read_at عند تغيير is_read إلى true
CREATE OR REPLACE FUNCTION public.handle_message_read_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.is_read = TRUE AND (OLD.is_read = FALSE OR OLD.is_read IS NULL) THEN
        NEW.read_at = now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_read_receipt ON public.messages;
CREATE TRIGGER trg_message_read_receipt
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_message_read_receipt();

-- ====================================================================================
-- مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
-- ملف ترحيل Supabase للمرحلة الفرعية 8.4.7: منظومة الإشعارات والتنبيهات المدرسية الميدانية
-- (Multi-Category Alerts Engine, Automated Event Triggers, and RLS Isolation)
-- ====================================================================================

-- 1. ترقية وتوسيع جدول الإشعارات (notifications)
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('session', 'absence', 'report', 'message', 'achievement', 'system')),
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS action_label TEXT,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- فهارس تحسين الاستعلامات والفلترة السريعة
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_user_cat ON public.notifications(user_id, category, is_read);

-- 2. سياسات الأمان والعزل الصارم على مستوى الصفوف (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() OR public.is_admin()
)
WITH CHECK (
    user_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "notifications_delete_policy" ON public.notifications;
CREATE POLICY "notifications_delete_policy"
ON public.notifications FOR DELETE
TO authenticated
USING (
    user_id = auth.uid() OR public.is_admin()
);

DROP POLICY IF EXISTS "notifications_insert_policy" ON public.notifications;
CREATE POLICY "notifications_insert_policy"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin() 
    OR public.is_teacher() 
    OR auth.uid() IS NOT NULL
);

-- 3. محفز أوتوماتيكي لتوثيق وقت القراءة read_at
CREATE OR REPLACE FUNCTION public.handle_notification_read_timestamp()
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

DROP TRIGGER IF EXISTS trg_notification_read_receipt ON public.notifications;
CREATE TRIGGER trg_notification_read_receipt
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_notification_read_timestamp();

-- 4. محفز تلقائي عند اعتماد وإرسال تقرير المعلم لولي الأمر (teacher_reports -> notifications)
CREATE OR REPLACE FUNCTION public.trigger_notify_report_to_guardian()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_guardian_user_id UUID;
    v_student_name TEXT;
BEGIN
    IF NEW.status = 'sent_to_guardian' AND (OLD.status IS NULL OR OLD.status <> 'sent_to_guardian') THEN
        -- جلب حساب المستخدم الخاص بولي أمر الطالب المعني
        SELECT g.user_id, s.name 
        INTO v_guardian_user_id, v_student_name
        FROM public.guardian_students gs
        JOIN public.guardians g ON g.id = gs.guardian_id
        JOIN public.students s ON s.id = NEW.student_id
        WHERE gs.student_id = NEW.student_id
        LIMIT 1;

        IF v_guardian_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                user_id,
                title,
                message,
                notification_type,
                category,
                priority,
                link_url,
                action_label,
                metadata
            ) VALUES (
                v_guardian_user_id,
                'تقرير تربوي جديد معتمد',
                'أصدر الشيخ المحفظ التقرير الدوري للطالب ' || COALESCE(v_student_name, 'ابنكم المبارك') || ' متضمناً مستجدات الحفظ والتجويد والمواظبة.',
                'info',
                'report',
                'high',
                '/guardian-dashboard',
                'معاينة التقرير',
                jsonb_build_object(
                    'reportId', NEW.id,
                    'studentId', NEW.student_id,
                    'studentName', v_student_name,
                    'reportType', NEW.report_type
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_report_sent ON public.teacher_reports;
CREATE TRIGGER trg_notify_report_sent
AFTER UPDATE ON public.teacher_reports
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_report_to_guardian();

-- 5. محفز تلقائي عند تسجيل استثناء أو إلغاء حصة (schedule_exceptions -> notifications)
CREATE OR REPLACE FUNCTION public.trigger_notify_schedule_exception()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_circle_name TEXT;
    v_guardian RECORD;
    v_exception_label TEXT;
BEGIN
    SELECT name INTO v_circle_name FROM public.circles WHERE id = NEW.circle_id;
    
    v_exception_label := CASE NEW.exception_type
        WHEN 'cancelled' THEN 'إلغاء حصة تحفيظ'
        WHEN 'rescheduled' THEN 'تعديل موعد حصة'
        WHEN 'room_change' THEN 'تغيير قاعة الحصة'
        WHEN 'substitute_teacher' THEN 'تكليف محفظ بديل'
        ELSE 'تعديل في الجدول الأسبوعي'
    END;

    -- إشعار أولياء أمور جميع الطلاب المقيدين في هذه الحلقة
    FOR v_guardian IN
        SELECT DISTINCT g.user_id, s.name as student_name
        FROM public.circle_students cs
        JOIN public.guardian_students gs ON gs.student_id = cs.student_id
        JOIN public.guardians g ON g.id = gs.guardian_id
        JOIN public.students s ON s.id = cs.student_id
        WHERE cs.circle_id = NEW.circle_id
          AND g.user_id IS NOT NULL
    LOOP
        INSERT INTO public.notifications (
            user_id,
            title,
            message,
            notification_type,
            category,
            priority,
            link_url,
            action_label,
            metadata
        ) VALUES (
            v_guardian.user_id,
            v_exception_label || ': ' || COALESCE(v_circle_name, 'الحلقة'),
            'نحيطكم علماً بـ ' || v_exception_label || ' لحلقة ' || COALESCE(v_circle_name, '') || ' بتاريخ ' || to_char(NEW.exception_date, 'YYYY-MM-DD') || '. السبب: ' || NEW.reason,
            CASE WHEN NEW.exception_type = 'cancelled' THEN 'warning' ELSE 'info' END,
            'session',
            'urgent',
            '/timetable',
            'تفاصيل الحصة',
            jsonb_build_object(
                'exceptionId', NEW.id,
                'circleId', NEW.circle_id,
                'exceptionType', NEW.exception_type,
                'date', NEW.exception_date
            )
        );
    END LOOP;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_schedule_exception ON public.schedule_exceptions;
CREATE TRIGGER trg_notify_schedule_exception
AFTER INSERT ON public.schedule_exceptions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_schedule_exception();

-- 6. محفز تلقائي عند استلام رسالة جديدة (messages -> notifications)
CREATE OR REPLACE FUNCTION public.trigger_notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sender_name TEXT;
BEGIN
    SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        notification_type,
        category,
        priority,
        link_url,
        action_label,
        metadata
    ) VALUES (
        NEW.recipient_id,
        'رسالة جديدة من ' || COALESCE(v_sender_name, 'المرسل'),
        substring(NEW.content from 1 for 120),
        'info',
        'message',
        'normal',
        '/messages',
        'فتح المحادثة',
        jsonb_build_object(
            'messageId', NEW.id,
            'senderId', NEW.sender_id,
            'studentId', NEW.student_id
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_message ON public.messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.trigger_notify_new_message();

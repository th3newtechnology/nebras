-- =============================================================================
-- Migration: 20261103000006_communication_and_audit.sql
-- Description: Events, Announcements, Secure Messaging, Notifications, and Immutable Audit Log
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. جدول الفعاليات والأنشطة (events)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location TEXT,
    target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'guardians', 'teachers', 'students')),
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_event_times CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_target ON public.events(target_audience);

CREATE TRIGGER trigger_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. جدول الإعلانات المدرسية (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    announcement_type TEXT NOT NULL DEFAULT 'info' CHECK (announcement_type IN ('info', 'warning', 'success', 'urgent')),
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    target_role TEXT NOT NULL DEFAULT 'all' CHECK (target_role IN ('all', 'ADMIN', 'TEACHER', 'GUARDIAN', 'STUDENT')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_announcement_dates CHECK (expiry_date IS NULL OR expiry_date >= publish_date)
);

CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON public.announcements(publish_date);
CREATE INDEX IF NOT EXISTS idx_announcements_target_role ON public.announcements(target_role);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON public.announcements(is_pinned);

CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. جدول المراسلات الآمنة (messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'image', 'document')),
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    is_deleted_by_sender BOOLEAN NOT NULL DEFAULT false,
    is_deleted_by_recipient BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_no_self_messaging CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- 4. جدول التنبيهات الفورية (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 5. جدول سجل التدقيق الرقابي غير القابل للتعديل (audit_logs - Append-Only Immutable Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email_snapshot TEXT NOT NULL DEFAULT 'system@nebras.edu',
    user_name_snapshot TEXT NOT NULL DEFAULT 'النظام الآلي',
    user_role_snapshot TEXT NOT NULL DEFAULT 'SYSTEM',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- منع التعديل أو الحذف في سجل التدقيق (Immutability Enforcement Trigger)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'سجل التدقيق (audit_logs) غير قابل للتعديل أو الحذف نهائياً لضمان النزاهة القانونية.'
    USING ERRCODE = 'P0003';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_audit_tampering
BEFORE UPDATE OR DELETE OR TRUNCATE ON public.audit_logs
FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_audit_log_tampering();

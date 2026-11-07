-- =============================================================================
-- Migration: 20261104000010_fix_events_rls_policy.sql
-- Description: تصحيح سياسة RLS لجدول events
--              السياسة السابقة (Migration 9) استخدمت عمود is_public الذي لا وجود
--              له في الجدول. العمود الصحيح هو is_published (Migration 6).
--              هذا التصحيح يُعيد كتابة سياسة SELECT فقط دون أي مساس
--              بسياسات الأدوار الأخرى (ADMIN manage) أو أي جدول آخر.
-- Author: Senior PostgreSQL / Supabase Security Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- ============================================================
-- التحقق الوقائي: التأكد من وجود العمود الصحيح قبل تطبيق السياسة
-- ============================================================
DO $$
BEGIN
    -- التحقق من وجود عمود is_published في جدول events
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'events'
          AND column_name = 'is_published'
    ) THEN
        RAISE EXCEPTION 'العمود is_published غير موجود في جدول events — يرجى مراجعة Migration 6.'
            USING ERRCODE = 'P0001';
    END IF;

    -- التحقق من عدم وجود عمود is_public (للتأكيد على الخطأ السابق)
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'events'
          AND column_name = 'is_public'
    ) THEN
        RAISE EXCEPTION 'العمود is_public موجود في جدول events — مراجعة البنية مطلوبة.'
            USING ERRCODE = 'P0001';
    END IF;
END $$;

-- ============================================================
-- إسقاط السياسة الخاطئة وإعادة بنائها بشكل صحيح
-- ============================================================
DROP POLICY IF EXISTS "events_select_policy" ON public.events;

-- سياسة القراءة للزوار (anon) والمستخدمين المصادق عليهم:
-- • الزائر غير المسجل: يرى الفعاليات المنشورة (is_published = true)
--   الموجهة للجميع (target_audience = 'all') فقط.
-- • المستخدم المصادق عليه: يرى جميع الفعاليات المنشورة
--   بغض النظر عن الجمهور المستهدف.
-- • الإدارة: تتحكم في الكتابة والحذف عبر "events_admin_manage_policy" (سياسة قائمة).
CREATE POLICY "events_select_policy"
ON public.events FOR SELECT
TO public
USING (
    -- شرط النشر إلزامي لكل الأطراف
    is_published = true
    AND (
        -- الجمهور المستهدف 'all' متاح للجميع بما فيهم الزوار
        target_audience = 'all'
        -- أو المستخدم مصادق عليه (يرى ما يخصه)
        OR auth.role() = 'authenticated'
    )
);

-- ============================================================
-- ملاحظة: سياسة ADMIN تبقى كما هي ولا تُمس
-- "events_admin_manage_policy" ON public.events FOR ALL TO authenticated
-- USING (public.is_admin()) WITH CHECK (public.is_admin())
-- ============================================================

-- ============================================================
-- التحقق من وجود السياستين معاً بعد التعديل
-- ============================================================
DO $$
DECLARE
    v_select_exists BOOLEAN;
    v_admin_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'events'
          AND policyname = 'events_select_policy'
          AND cmd = 'SELECT'
    ) INTO v_select_exists;

    SELECT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'events'
          AND policyname = 'events_admin_manage_policy'
    ) INTO v_admin_exists;

    IF NOT v_select_exists THEN
        RAISE EXCEPTION 'فشل إنشاء سياسة events_select_policy!'
            USING ERRCODE = 'P0001';
    END IF;

    -- سياسة الإدارة قد لا تكون موجودة إن لم تُطبَّق Migration 9 بعد
    -- هذا تحذير وليس خطأ حرجاً
    IF NOT v_admin_exists THEN
        RAISE WARNING 'سياسة events_admin_manage_policy غير موجودة — Migration 9 لم يُطبَّق بعد.';
    END IF;

    RAISE NOTICE '✅ تم تصحيح سياسة RLS لجدول events بنجاح.';
    RAISE NOTICE '   - events_select_policy: تستخدم is_published (صحيح)';
    RAISE NOTICE '   - events_admin_manage_policy: قائمة وغير متأثرة';
END $$;

-- =============================================================================
-- Migration: 20261103000001_core_and_settings.sql
-- Description: Extensions, Base Functions, School Settings, Profiles, and Roles
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. تفعيل الامتدادات الأساسية
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. دالة التحديث التلقائي لطابع الوقت (handle_updated_at)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. جدول إعدادات المدرسة (school_settings)
-- يحتوي على صف وحيد لضمان عدم تكرار الإعدادات الأساسية
CREATE TABLE IF NOT EXISTS public.school_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    school_name TEXT NOT NULL DEFAULT 'مدرسة نبراس القرآن',
    affiliation TEXT NOT NULL DEFAULT 'مسجد إبراهيم الخليل',
    default_currency VARCHAR(3) NOT NULL DEFAULT 'DZD',
    timezone TEXT NOT NULL DEFAULT 'Africa/Algiers',
    language VARCHAR(5) NOT NULL DEFAULT 'ar',
    direction VARCHAR(3) NOT NULL DEFAULT 'rtl',
    vision TEXT DEFAULT 'ريادة في تعليم القرآن الكريم وتخريج جيل متخلق بأخلاق القرآن',
    message TEXT DEFAULT 'تقديم تعليم قرآني متميز يجمع بين الإتقان في الحفظ والتجويد والتربية الإيمانية',
    email TEXT DEFAULT 'contact@nebras-quran.edu',
    phone TEXT DEFAULT '0500000000',
    address TEXT DEFAULT 'مسجد إبراهيم الخليل',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_school_settings_updated_at
BEFORE UPDATE ON public.school_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. جدول الملفات الشخصية (profiles)
-- مرتبط بـ auth.users، ويعتمد سياسة التعطيل (Soft Deactivation) بدلاً من الحذف الفيزيائي
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    deactivated_at TIMESTAMPTZ,
    deactivation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. جدول أدوار المستخدمين (user_roles)
-- يسمح بالأدوار المتعددة ويفصل الصلاحيات عن ملف المستخدم
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'GUARDIAN', 'STUDENT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

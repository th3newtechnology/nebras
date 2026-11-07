-- =============================================================================
-- Migration: 20261103000008_seed_data.sql
-- Description: Idempotent Seed Data for Nebras Quran School (Mosque of Ibrahim Al-Khalil)
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. إعدادات المدرسة الرسمية (Idempotent Upsert)
INSERT INTO public.school_settings (
    id, school_name, affiliation, default_currency, timezone, language, direction,
    vision, message, email, phone, address
) VALUES (
    1,
    'مدرسة نبراس القرآن',
    'مسجد إبراهيم الخليل',
    'DZD',
    'Africa/Algiers',
    'ar',
    'rtl',
    'ريادة في تعليم القرآن الكريم وتخريج جيل متخلق بأخلاق القرآن',
    'تقديم تعليم قرآني متميز يجمع بين الإتقان في الحفظ والتجويد والتربية الإيمانية',
    'contact@nebras-quran.edu',
    '0500000000',
    'مسجد إبراهيم الخليل'
)
ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    affiliation = EXCLUDED.affiliation,
    default_currency = EXCLUDED.default_currency,
    timezone = EXCLUDED.timezone,
    updated_at = now();

-- 2. السنة الدراسية التأسيسية
INSERT INTO public.academic_years (id, name, start_date, end_date, is_current)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '1447-1448 هـ / 2025-2026 م',
    '2025-09-01',
    '2026-06-30',
    true
)
ON CONFLICT (name) DO NOTHING;

-- 3. قاعات مسجد إبراهيم الخليل
INSERT INTO public.halls (id, name, location, capacity, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'قاعة الصديق', 'الطابق الأرضي - الجناح الشرقي', 20, 'active'),
    ('b0000000-0000-0000-0000-000000000002', 'قاعة الفاروق', 'الطابق الأرضي - الجناح الغربي', 18, 'active'),
    ('b0000000-0000-0000-0000-000000000003', 'قاعة أم المؤمنين عائشة', 'الطابق الأول - مصلى النساء', 15, 'active'),
    ('b0000000-0000-0000-0000-000000000004', 'قاعة الإمام نافع', 'ملحق المكتبة القرآنية', 12, 'active')
ON CONFLICT (name) DO NOTHING;

-- 4. نماذج المحفظين المؤسسين (بدون مستخدم Auth ثابت أو أسرار)
INSERT INTO public.teachers (id, full_name, phone, qualification, specialization, experience_years, hire_date, status)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'الشيخ عبد الرحمن السديس', '0550000001', 'ماجستير في القراءات العشر', 'تحفيظ وإتقان الروايات', 12, '2020-09-01', 'active'),
    ('c0000000-0000-0000-0000-000000000002', 'الأستاذة مريم إبراهيم', '0550000002', 'إجازة في حفظ القرآن الكريم برواية ورش', 'تحفيظ البراعم والتأسيس', 8, '2022-09-01', 'active')
ON CONFLICT DO NOTHING;

-- 5. نماذج الحلقات القرآنية لمستويات الحفظ المعتمدة
INSERT INTO public.circles (id, name, level, academic_year_id, teacher_id, hall_id, target_gender, capacity, status)
VALUES 
    (
        'd0000000-0000-0000-0000-000000000001',
        'حلقة البراعم التأسيسية',
        'مبتدئ',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000003',
        'mixed',
        15,
        'active'
    ),
    (
        'd0000000-0000-0000-0000-000000000002',
        'حلقة الصديق للمتقنين',
        'متقدم',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'male',
        16,
        'active'
    )
ON CONFLICT DO NOTHING;

-- 6. مواعيد الحصص الأسبوعية
INSERT INTO public.circle_schedules (circle_id, day_of_week, start_time, end_time)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 0, '16:30:00', '18:00:00'), -- الأحد
    ('d0000000-0000-0000-0000-000000000001', 2, '16:30:00', '18:00:00'), -- الثلاثاء
    ('d0000000-0000-0000-0000-000000000002', 1, '17:00:00', '19:00:00'), -- الاثنين
    ('d0000000-0000-0000-0000-000000000002', 3, '17:00:00', '19:00:00')  -- الأربعاء
ON CONFLICT DO NOTHING;

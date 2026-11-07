import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as any)[key]) {
    return (import.meta.env as any)[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabasePublishableKey =
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

/**
 * التحقق مما إذا كانت إعدادات Supabase مكتملة في متغيرات البيئة
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('your-project-ref') &&
    typeof supabasePublishableKey === 'string' &&
    supabasePublishableKey.trim().length > 0 &&
    !supabasePublishableKey.includes('your-publishable-key-here') &&
    !supabasePublishableKey.includes('your-anon-key-here')
  );
};

// إنشاء عميل Supabase بنمط آمن
// في حال عدم توفر المفاتيح، يتم إنشاء عميل افتراضي لتفادي انهيار التطبيق أثناء التطوير
export const supabase: SupabaseClient<Database> = createClient<Database>(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? supabasePublishableKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export interface SupabaseHealthResult {
  ok: boolean;
  configured: boolean;
  message: string;
  latencyMs?: number;
  url?: string;
  error?: string;
}

/**
 * فحص حالة الاتصال بخادم Supabase
 */
export const checkSupabaseHealth = async (): Promise<SupabaseHealthResult> => {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      configured: false,
      message: 'لم يتم ضبط مفاتيح Supabase في ملف .env.local بعد.',
    };
  }

  const startTime = performance.now();
  try {
    // إجراء استعلام خفيف للتحقق من الاتصال و RLS
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    const latencyMs = Math.round(performance.now() - startTime);

    if (error && error.code !== 'PGRST116') {
      // إذا كان الخطأ مجرد انعدام الجداول (المرحلة 4) ولكن الاتصال تم
      if (error.message.includes('relation "public.profiles" does not exist')) {
        return {
          ok: true,
          configured: true,
          message: 'الاتصال بـ Supabase ناجح تماماً! (جداول المخطط بانتظار الإنشاء في المرحلة 4)',
          latencyMs,
          url: supabaseUrl,
        };
      }
      return {
        ok: false,
        configured: true,
        message: `فشل التحقق من الاتصال: ${error.message}`,
        latencyMs,
        url: supabaseUrl,
        error: error.message,
      };
    }

    return {
      ok: true,
      configured: true,
      message: 'الاتصال بخادم Supabase مستقر ويعمل بنجاح!',
      latencyMs,
      url: supabaseUrl,
    };
  } catch (err: unknown) {
    const latencyMs = Math.round(performance.now() - startTime);
    const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف في الشبكة';
    return {
      ok: false,
      configured: true,
      message: `تعذر الاتصال بـ Supabase: ${errorMessage}`,
      latencyMs,
      url: supabaseUrl,
      error: errorMessage,
    };
  }
};




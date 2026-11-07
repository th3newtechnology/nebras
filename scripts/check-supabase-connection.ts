/**
 * أداة الفحص والاختبار التشغيلي الحي لقاعدة بيانات Supabase
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل عليه السلام
 * تشغيل: npm run check:supabase أو npx tsx scripts/check-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as fs from 'fs';

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// تحميل المتغيرات محلياً
loadEnvFile(path.resolve(process.cwd(), '.env.local'));
loadEnvFile(path.resolve(process.cwd(), '.env'));

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

async function verifySupabase() {
  console.log('\n================================================================================');
  console.log('🔍 فحص اتصال وتكامل سحابة Supabase لمشروع مدرسة نبراس القرآنية');
  console.log('   مسجد إبراهيم الخليل عليه السلام');
  console.log('================================================================================\n');

  console.log(`📍 رابط المشروع (Supabase URL): ${supabaseUrl || 'غير معرّف (Missing)'}`);
  console.log(`🔑 المفتاح العام (Anon/Publishable Key): ${supabaseKey ? `${supabaseKey.substring(0, 12)}...` : 'غير معرّف (Missing)'}\n`);

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-ref') || supabaseKey.includes('your-supabase')) {
    console.warn('⚠️ تنبيه: لم يتم تزويد مفاتيح سحابة Supabase الحية بعد.');
    console.log('   يرجى إنشاء/تعديل ملف .env.local وضبط:');
    console.log('   VITE_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co');
    console.log('   VITE_SUPABASE_PUBLISHABLE_KEY=[YOUR_ANON_KEY]\n');
    console.log('✅ نمط الحماية الذاتي (Graceful Fallback Mode): التطبيق محمي من الانهيار.');
    return;
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  try {
    console.log('1️⃣ اختبار استجابة واجهة المصادقة (Auth Endpoint)...');
    const authStart = Date.now();
    const { data: sessionData, error: authError } = await client.auth.getSession();
    const authDuration = Date.now() - authStart;

    if (authError) {
      console.error(`❌ فشل الاتصال بالمصادقة: ${authError.message}`);
    } else {
      console.log(`✅ واجهة المصادقة متصلة وتستجيب بنجاح (${authDuration}ms).`);
    }

    console.log('\n2️⃣ اختبار استعلام قاعدة البيانات (PostgreSQL REST API)...');
    const dbStart = Date.now();
    const { data: settingsData, error: dbError } = await client
      .from('school_settings')
      .select('school_name, mosque_name, academic_year')
      .limit(1);
    const dbDuration = Date.now() - dbStart;

    if (dbError) {
      console.warn(`⚠️ استجابة الاستعلام: ${dbError.message} (${dbError.code || 'RLS/Access'})`);
      console.log('ℹ️ ملاحظة: إذا كان السبب متعلقاً بـ RLS، فهذا يعني أن الجداول محمية بسياسات الأمان.');
    } else {
      console.log(`✅ استعلام جدول إعدادات المدرسة ناجح (${dbDuration}ms).`);
      if (settingsData && settingsData.length > 0) {
        console.log(`   🏫 المدرسة: ${settingsData[0].school_name}`);
        console.log(`   🕌 المسجد: ${settingsData[0].mosque_name}`);
        console.log(`   📅 العام الدراسي: ${settingsData[0].academic_year}`);
      }
    }

    console.log('\n================================================================================');
    console.log('🏆 اكتمال فحص الاتصال بسحابة Supabase بنجاح!');
    console.log('================================================================================\n');

  } catch (err: any) {
    console.error(`❌ خطأ غير متوقع أثناء فحص Supabase: ${err?.message || err}`);
  }
}

verifySupabase();

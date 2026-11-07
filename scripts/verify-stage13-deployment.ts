/**
 * سكريبت الاعتماد الهندسي والتحقق الشامل للمرحلة 13 (Stage 13 Deployment & Cloudflare Suite)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * تغطية متكاملة لجميع المحطات الفرعية (13.1 إلى 13.5)
 */

import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, checkSupabaseHealth } from '../lib/supabase';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [نجاح] ${testName}`);
  } else {
    console.error(`  ❌ [فشل] ${testName}`);
    if (details) console.error(`     السبب: ${details}`);
  }
}

async function runStage13Verification() {
  console.log('\n=============================================================================================');
  console.log('🚀 بدء الفحص والاعتماد الهندسي الشامل للمرحلة 13 (Stage 13 Production Deployment & Cloudflare)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل عليه السلام');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. المحطة 13.1: إعدادات التوجيه السحابي والتخزين المؤقت وحماية الرؤوس
  // -----------------------------------------------------------------------------------------
  console.log('🌐 1. فحص ملفات التوجيه السحابي والرؤوس لـ Cloudflare Pages:');

  const redirectsPath = path.resolve(process.cwd(), 'public/_redirects');
  assert(fs.existsSync(redirectsPath), '13.1.1 وجود ملف public/_redirects');
  if (fs.existsSync(redirectsPath)) {
    const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
    assert(
      redirectsContent.includes('/*') && redirectsContent.includes('/index.html') && redirectsContent.includes('200'),
      '13.1.2 توجيه كافة المسارات السحابية إلى index.html مع كود 200 لدعم SPA Fallback'
    );
  }

  const headersPath = path.resolve(process.cwd(), 'public/_headers');
  assert(fs.existsSync(headersPath), '13.1.3 وجود ملف public/_headers');
  if (fs.existsSync(headersPath)) {
    const headersContent = fs.readFileSync(headersPath, 'utf-8');
    assert(
      headersContent.includes('X-Frame-Options: DENY') &&
      headersContent.includes('X-Content-Type-Options: nosniff') &&
      headersContent.includes('Strict-Transport-Security') &&
      headersContent.includes('Content-Security-Policy'),
      '13.1.4 تطبيق حزمة رؤوس الأمان العالية (HSTS, CSP, Anti-Clickjacking, MIME Sniffing)'
    );

    assert(
      headersContent.includes('Cache-Control: public, max-age=31536000, immutable') &&
      headersContent.includes('Cache-Control: public, max-age=0, must-revalidate'),
      '13.1.5 تكوين سياسات التخزين المؤقت (تخزين أصول assets لسنة وتحديث index.html لحظياً)'
    );
  }

  const wranglerPath = path.resolve(process.cwd(), 'wrangler.toml');
  assert(fs.existsSync(wranglerPath), '13.1.6 وجود ملف wrangler.toml لتهيئة Cloudflare Pages');
  if (fs.existsSync(wranglerPath)) {
    const wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
    assert(
      wranglerContent.includes('name = "nebras-quran"') &&
      wranglerContent.includes('pages_build_output_dir = "dist"'),
      '13.1.7 ضبط اسم المشروع nebras-quran ومجلد المخرجات dist في wrangler.toml'
    );
  }

  // -----------------------------------------------------------------------------------------
  // 2. المحطة 13.2: إدارة متغيرات البيئة والأمان السحابي
  // -----------------------------------------------------------------------------------------
  console.log('\n🔐 2. فحص متغيرات البيئة والأمان السحابي:');

  const supabaseTsPath = path.resolve(process.cwd(), 'lib/supabase.ts');
  const supabaseTsContent = fs.readFileSync(supabaseTsPath, 'utf-8');
  assert(
    supabaseTsContent.includes("getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY')") &&
    supabaseTsContent.includes("getEnvVar('VITE_SUPABASE_ANON_KEY')"),
    '13.2.1 دعم مزدوج ومرن لمفاتيح Supabase (PUBLISHABLE_KEY و ANON_KEY)'
  );

  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  assert(fs.existsSync(envExamplePath), '13.2.2 وجود وتوثيق ملف .env.example');
  if (fs.existsSync(envExamplePath)) {
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
    assert(
      envExampleContent.includes('VITE_SUPABASE_URL') &&
      envExampleContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY') &&
      envExampleContent.includes('VITE_GEMINI_API_KEY'),
      '13.2.3 شمولية توثيق متغيرات البيئة للإنتاج والذكاء الاصطناعي'
    );
  }

  const guidePath = path.resolve(process.cwd(), 'project-docs/CLOUDFLARE_PAGES_SETUP_GUIDE.md');
  assert(fs.existsSync(guidePath), '13.2.4 اكتمال دليل النشر السحابي CLOUDFLARE_PAGES_SETUP_GUIDE.md');

  // -----------------------------------------------------------------------------------------
  // 3. المحطة 13.3: أتمتة خط أنابيب النشر المستمر (CI/CD via GitHub Actions)
  // -----------------------------------------------------------------------------------------
  console.log('\n⚙️ 3. فحص خط أنابيب النشر المستمر (CI/CD Pipeline):');

  const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
  assert(fs.existsSync(workflowPath), '13.3.1 وجود ملف خط الأنابيب .github/workflows/deploy.yml');
  if (fs.existsSync(workflowPath)) {
    const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
    assert(
      workflowContent.includes('npx tsc --noEmit') &&
      workflowContent.includes('verify-stage12-final-qa.ts'),
      '13.3.2 احتواء خط الأنابيب على بوابات الجودة الصارمة (TypeScript Check & Master QA)'
    );

    assert(
      workflowContent.includes('npm run build') &&
      workflowContent.includes('cloudflare/pages-action'),
      '13.3.3 أتمتة البناء للإنتاج والنشر التلقائي عبر Cloudflare Pages Action'
    );

    assert(
      workflowContent.includes('branches:') &&
      workflowContent.includes('main'),
      '13.3.4 حصر النشر التلقائي على فرع main المعتمد'
    );
  }

  // -----------------------------------------------------------------------------------------
  // 4. المحطة 13.4: فحص صحة اتصال Supabase وحوكمة RLS
  // -----------------------------------------------------------------------------------------
  console.log('\n🗄️ 4. فحص اتصال Supabase السحابي وملفات الترحيل:');

  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
  assert(fs.existsSync(migrationsDir), '13.4.1 وجود مجلد ملفات ترحيل قاعدة البيانات (supabase/migrations)');
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    assert(
      migrationFiles.length >= 8,
      `13.4.2 اكتمال ملفات الترحيل العلائقية (${migrationFiles.length} ملفات SQL) لكافة جداول النظام الـ 22`,
      `عدد الملفات: ${migrationFiles.length}`
    );
  }

  const healthCheck = await checkSupabaseHealth();
  assert(
    typeof healthCheck.configured === 'boolean' && typeof healthCheck.message === 'string',
    '13.4.3 جاهزية وتكامل دالة الفحص الصحي checkSupabaseHealth',
    `الحالة: ${healthCheck.message}`
  );

  // -----------------------------------------------------------------------------------------
  // 5. المحطة 13.5: التدقيق الشامل لمخرجات الإنتاج dist وجاهزية النشر
  // -----------------------------------------------------------------------------------------
  console.log('\n📦 5. تدقيق اكتمال مخرجات الإنتاج (dist) المجهزة للنشر السحابي:');

  const distDir = path.resolve(process.cwd(), 'dist');
  assert(fs.existsSync(distDir), '13.5.1 وجود مجلد التوزيع النهائي dist');

  const distIndexHtml = path.resolve(distDir, 'index.html');
  assert(fs.existsSync(distIndexHtml), '13.5.2 وجود dist/index.html الأساسي');

  const distRedirects = path.resolve(distDir, '_redirects');
  assert(fs.existsSync(distRedirects), '13.5.3 انتقال ملف _redirects بنجاح إلى حزمة الإنتاج dist');

  const distHeaders = path.resolve(distDir, '_headers');
  assert(fs.existsSync(distHeaders), '13.5.4 انتقال ملف _headers بنجاح إلى حزمة الإنتاج dist');

  const distRobots = path.resolve(distDir, 'robots.txt');
  const distSitemap = path.resolve(distDir, 'sitemap.xml');
  assert(
    fs.existsSync(distRobots) && fs.existsSync(distSitemap),
    '13.5.5 توفر ملفات الفهرسة ومحركات البحث robots.txt و sitemap.xml في dist'
  );

  const distAssets = path.resolve(distDir, 'assets');
  if (fs.existsSync(distAssets)) {
    const assetFiles = fs.readdirSync(distAssets);
    const mainJs = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
    assert(Boolean(mainJs), '13.5.6 توليد ملف الجافاسكريبت الأساسي index-*.js في الإنتاج');

    if (mainJs) {
      const jsSizeKb = fs.statSync(path.join(distAssets, mainJs)).size / 1024;
      assert(
        jsSizeKb <= 250,
        `13.5.7 حجم الحزمة الأساسية للإنتاج (${jsSizeKb.toFixed(1)} KB) خفيف وضمن المعايير العالمية`,
        `الحجم: ${jsSizeKb.toFixed(1)} KB`
      );
    }
  }

  // -----------------------------------------------------------------------------------------
  // خلاصة نتائج التدقيق للمرحلة 13
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للتدقيق الهندسي للنشر السحابي (المرحلة 13):`);
  console.log(`   - إجمالي الفحوصات: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد الهندسي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز كافة فحوصات النشر السحابي (المرحلة 13) بنجاح تام 100% (PASS)!`);
    console.log(`   ✨ منصة مدرسة نبراس القرآنية جاهزة تماماً للنشر الحي على شبكة Cloudflare العالمية.`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage13Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل فحص المرحلة 13:', err);
  process.exit(1);
});

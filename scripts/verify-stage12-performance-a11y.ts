/**
 * سكريبت تدقيق الأداء ومؤشرات السرعة وإمكانية الوصول والتوافقية (Stage 12 Performance & A11y Suite)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * المحطات: 12.1، 12.3، 12.4
 */

import fs from 'fs';
import path from 'path';

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

async function runPerformanceAndA11yAudit() {
  console.log('\n=============================================================================================');
  console.log('⚡ فحص تحسين الأداء، مؤشرات السرعة، وإمكانية الوصول (Stage 12 Performance & A11y Audit)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. تدقيق التحميل الكسول والتقسيم الذكي للحزم (Code Splitting in App.tsx)
  // -----------------------------------------------------------------------------------------
  console.log('📦 1. تدقيق بنية التحميل الكسول (Dynamic Imports & React.lazy) في App.tsx:');

  const appTsxPath = path.resolve(process.cwd(), 'App.tsx');
  assert(fs.existsSync(appTsxPath), 'وجود ملف App.tsx الرئيسي');

  const appContent = fs.readFileSync(appTsxPath, 'utf-8');
  assert(
    appContent.includes("lazy(() => import('./pages/Dashboard'))") &&
    appContent.includes("lazy(() => import('./pages/TeacherDashboard'))") &&
    appContent.includes("lazy(() => import('./pages/GuardianDashboard'))") &&
    appContent.includes("lazy(() => import('./pages/StudentDashboard'))"),
    'تطبيق React.lazy على كافة بوابات النظام الأربع (Admin, Teacher, Guardian, Student)'
  );

  assert(
    appContent.includes('<Suspense fallback={<PortalLoadingFallback />}>'),
    'تغليف مسار البوابات الداخلية بمكون Suspense وغلاف تحميل إسلامي هادئ'
  );

  assert(
    appContent.includes("lazy(() => import('./pages/LiveRecitationStation'))"),
    'فصل محطة الإقراء المباشرة بحزمة برمجية مستقلة لتسريع تحميل لوحة المعلم'
  );

  // -----------------------------------------------------------------------------------------
  // 2. تدقيق إعدادات التجميع Rollup & Vite (Performance & Chunk Optimization)
  // -----------------------------------------------------------------------------------------
  console.log('\n⚙️ 2. تدقيق إعدادات التجميع وتجزئة الحزم في vite.config.ts:');

  const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
  const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');

  assert(
    viteContent.includes("manualChunks(id)") &&
    viteContent.includes("'vendor-supabase'") &&
    viteContent.includes("'vendor-charts'") &&
    viteContent.includes("'vendor-icons'"),
    'تخصيص manualChunks لفصل مكتبات الطرف الثالث (Supabase, Recharts, Lucide-React)'
  );

  assert(
    viteContent.includes("cssCodeSplit: true"),
    'تفعيل تقسيم ملفات التنسيق cssCodeSplit لتحسين زمن التحميل الأولي'
  );

  // -----------------------------------------------------------------------------------------
  // 3. فحص مجلد مخرجات الإنتاج dist وأوزان الملفات
  // -----------------------------------------------------------------------------------------
  console.log('\n📊 3. فحص أوزان الملفات التوزيعية للإنتاج في dist/assets:');

  const distDir = path.resolve(process.cwd(), 'dist');
  const distAssetsDir = path.resolve(distDir, 'assets');
  assert(fs.existsSync(distAssetsDir), 'وجود مجلد الإنتاج dist/assets');

  const assetFiles = fs.readdirSync(distAssetsDir);

  // التحقق من أن حجم index.js الأساسي خفيف جداً
  const mainJsFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
  assert(Boolean(mainJsFile), 'توليد ملف index.js الأساسي');

  if (mainJsFile) {
    const mainJsSize = fs.statSync(path.join(distAssetsDir, mainJsFile)).size / 1024;
    assert(
      mainJsSize <= 200,
      `حجم ملف index.js الأساسي (${mainJsSize.toFixed(1)} KB) أقل من السقف المستهدف (200 KB)`,
      `الحجم الفعلي: ${mainJsSize.toFixed(1)} KB`
    );
  }

  // التحقق من الحزم الكسولة للبوابات
  const portalChunks = [
    { name: 'بوابة الطالب', prefix: 'StudentDashboard-' },
    { name: 'بوابة الولي', prefix: 'GuardianDashboard-' },
    { name: 'بوابة المعلم', prefix: 'TeacherDashboard-' },
    { name: 'محطة الإقراء', prefix: 'LiveRecitationStation-' },
    { name: 'لوحة الإدارة', prefix: 'Dashboard-' },
  ];

  for (const chunk of portalChunks) {
    const found = assetFiles.some(f => f.startsWith(chunk.prefix) && f.endsWith('.js'));
    assert(found, `توليد حزمة مستقلة لـ ${chunk.name} (${chunk.prefix}*.js)`);
  }

  // التحقق من ملف التنسيق الموحد CSS
  const mainCssFile = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.css'));
  assert(Boolean(mainCssFile), 'توليد ملف التنسيق الأساسي index.css');
  if (mainCssFile) {
    const cssSize = fs.statSync(path.join(distAssetsDir, mainCssFile)).size / 1024;
    assert(
      cssSize < 150,
      `حجم ملف التنسيقات (${cssSize.toFixed(1)} KB) مثالي ومضغوط دون هدر`,
      `الحجم الفعلي: ${cssSize.toFixed(1)} KB`
    );
  }

  // -----------------------------------------------------------------------------------------
  // 4. تدقيق إمكانية الوصول والتوافقية مع الهواتف والأجهزة المختلفة (A11y & Responsiveness)
  // -----------------------------------------------------------------------------------------
  console.log('\n♿ 4. تدقيق إمكانية الوصول (A11y) والتوافقية مع الأجهزة والشاشات:');

  const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

  assert(
    indexHtmlContent.includes('lang="ar"') && indexHtmlContent.includes('dir="rtl"'),
    'تثبيت اتجاه الصفحة من اليمين لليسار (dir="rtl") واللغة العربية (lang="ar")'
  );

  assert(
    indexHtmlContent.includes('name="viewport"') && indexHtmlContent.includes('width=device-width, initial-scale=1.0'),
    'ضبط وسم viewport لدعم كافة مقاسات شاشات الهواتف والألواح الذكية'
  );

  assert(
    indexHtmlContent.includes('rel="preconnect"') && indexHtmlContent.includes('display=swap'),
    'استخدام التحميل المتوازي المبكر للخطوط العربية (preconnect & display=swap)'
  );

  // فحص ألوان التباين في Tailwind Config
  const tailwindPath = path.resolve(process.cwd(), 'tailwind.config.js');
  const tailwindContent = fs.readFileSync(tailwindPath, 'utf-8');
  assert(
    tailwindContent.includes('islamic:') && tailwindContent.includes('gold:') && tailwindContent.includes('ivory:'),
    'تثبيت لوحة الألوان المعتمدة (Islamic Green, Gold, Ivory) ذات التباين العالي'
  );

  // فحص تخطيط لوحة التحكم DashboardLayout من حيث الاستجابة للشاشات الصغيرة
  const dashboardLayoutPath = path.resolve(process.cwd(), 'layouts/DashboardLayout.tsx');
  const layoutContent = fs.readFileSync(dashboardLayoutPath, 'utf-8');
  assert(
    layoutContent.includes('md:hidden') || layoutContent.includes('lg:hidden') || layoutContent.includes('mobile'),
    'دعم الشريط الجانبي القابل للطي والقائمة المتجاوبة مع الهواتف الذكية'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة نتائج التدقيق
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية لتدقيق الأداء وإمكانية الوصول للمرحلة 12:`);
  console.log(`   - إجمالي الفحوصات: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة النجاح: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز تدقيق الأداء ومؤشرات السرعة وإمكانية الوصول بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runPerformanceAndA11yAudit().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل فحص الأداء وإمكانية الوصول:', err);
  process.exit(1);
});

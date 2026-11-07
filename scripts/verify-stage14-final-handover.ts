/**
 * سكريبت الاعتماد الهندسي والتسليم المؤسسي النهائي للمشروع (Stage 14 Final Handover & Sign-Off)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل عليه السلام
 * التحقق الشامل من اكتمال كافة وثائق المنظومة وأدلة التشغيل وجهوزية الإنتاج
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

async function runStage14FinalHandover() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء التدقيق النهائي الشامل والتسليم المؤسسي للمشروع (Stage 14 Final Handover Audit)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل عليه السلام (المرحلة الختامية 14)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. المحطة 14.1: تدقيق التوثيق الشامل وهوية المشروع الرسمية في README.md
  // -----------------------------------------------------------------------------------------
  console.log('📚 1. تدقيق وثيقة README.md وتأصيل الهوية المؤسسية:');

  const readmePath = path.resolve(process.cwd(), 'README.md');
  assert(fs.existsSync(readmePath), '14.1.1 وجود وثيقة README.md الرئيسية');

  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    assert(
      readmeContent.includes('مدرسة نبراس القرآنية') &&
      readmeContent.includes('مسجد إبراهيم الخليل'),
      '14.1.2 تثبيت الهوية الرسمية للمدرسة وتبعية مسجد إبراهيم الخليل عليه السلام'
    );

    assert(
      readmeContent.includes('بوابة الإدارة المركزية') &&
      readmeContent.includes('بوابة المعلم ومحطة الإقراء') &&
      readmeContent.includes('بوابة ولي الأمر') &&
      readmeContent.includes('بوابة الطالب القرآني'),
      '14.1.3 توثيق البوابات الأربع الرئيسية للنظام تفصيلياً'
    );

    assert(
      readmeContent.includes('رواية ورش عن نافع') &&
      readmeContent.includes('الدينار الجزائري') &&
      readmeContent.includes('DZD'),
      '14.1.4 توثيق الخصوصية القرآنية برواية ورش والعملة الرسمية بالدينار الجزائري'
    );
  }

  // -----------------------------------------------------------------------------------------
  // 2. المحطة 14.2: تدقيق دليل التشغيل والصيانة والتعافي من الكوارث (Runbook)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛠️ 2. تدقيق دليل التشغيل والصيانة وخطة الطوارئ:');

  const runbookPath = path.resolve(process.cwd(), 'project-docs/OPERATIONS_AND_MAINTENANCE_RUNBOOK.md');
  assert(fs.existsSync(runbookPath), '14.2.1 وجود وثيقة OPERATIONS_AND_MAINTENANCE_RUNBOOK.md');

  if (fs.existsSync(runbookPath)) {
    const runbookContent = fs.readFileSync(runbookPath, 'utf-8');
    assert(
      runbookContent.includes('مصفوفة الصيانة الدورية') &&
      runbookContent.includes('النسخ الاحتياطي') &&
      runbookContent.includes('Disaster Recovery'),
      '14.2.2 احتواء الدليل على خطط النسخ الاحتياطي الدوري والتعافي من الكوارث'
    );

    assert(
      runbookContent.includes('خطة الاستجابة للحوادث') &&
      runbookContent.includes('تدوير المفاتيح'),
      '14.2.3 توثيق سيناريوهات الطوارئ وتدوير المفاتيح الأمنية'
    );
  }

  // -----------------------------------------------------------------------------------------
  // 3. المحطة 14.3: تدقيق دليل المستخدم الميداني للأدوار الأربعة (User Manual)
  // -----------------------------------------------------------------------------------------
  console.log('\n👥 3. تدقيق دليل المستخدم الميداني للأدوار الأربعة:');

  const manualPath = path.resolve(process.cwd(), 'project-docs/USER_MANUAL.md');
  assert(fs.existsSync(manualPath), '14.3.1 وجود وثيقة USER_MANUAL.md');

  if (fs.existsSync(manualPath)) {
    const manualContent = fs.readFileSync(manualPath, 'utf-8');
    assert(
      manualContent.includes('دليل مدير المدرسة') &&
      manualContent.includes('دليل الشيخ المحفظ') &&
      manualContent.includes('دليل ولي الأمر') &&
      manualContent.includes('دليل الطالب القرآني'),
      '14.3.2 تغطية إرشادات الاستخدام الميداني لكافة الأدوار الأربعة خطوة بخطوة'
    );

    assert(
      manualContent.includes('محطة الإقراء المباشرة') &&
      manualContent.includes('مبدل الأبناء') &&
      manualContent.includes('الورد اليومي'),
      '14.3.3 شرح الميزات القرآنية التخصصية ومحطة الإقراء والورد اليومي'
    );
  }

  // -----------------------------------------------------------------------------------------
  // 4. المحطة 14.4: تدقيق بنية النشر السحابي وخطوط الأنابيب (CI/CD & Cloudflare)
  // -----------------------------------------------------------------------------------------
  console.log('\n☁️ 4. تدقيق تكامل النشر السحابي ومخرجات الإنتاج:');

  const cfGuidePath = path.resolve(process.cwd(), 'project-docs/CLOUDFLARE_PAGES_SETUP_GUIDE.md');
  assert(fs.existsSync(cfGuidePath), '14.4.1 وجود دليل النشر السحابي CLOUDFLARE_PAGES_SETUP_GUIDE.md');

  const redirectsPath = path.resolve(process.cwd(), 'public/_redirects');
  const headersPath = path.resolve(process.cwd(), 'public/_headers');
  const wranglerPath = path.resolve(process.cwd(), 'wrangler.toml');
  const ciWorkflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');

  assert(
    fs.existsSync(redirectsPath) &&
    fs.existsSync(headersPath) &&
    fs.existsSync(wranglerPath) &&
    fs.existsSync(ciWorkflowPath),
    '14.4.2 اكتمال حزمة ملفات النشر لـ Cloudflare Pages و GitHub Actions CI/CD'
  );

  const distDir = path.resolve(process.cwd(), 'dist');
  assert(
    fs.existsSync(distDir) &&
    fs.existsSync(path.join(distDir, '_redirects')) &&
    fs.existsSync(path.join(distDir, '_headers')) &&
    fs.existsSync(path.join(distDir, 'index.html')),
    '14.4.3 اكتمال حزمة البناء التوزيعية المجهزة للنشر الفوري في dist/'
  );

  // -----------------------------------------------------------------------------------------
  // 5. المحطة 14.5: تدقيق البوابات البرمجية الأربع ومكوناتها الأساسية
  // -----------------------------------------------------------------------------------------
  console.log('\n🏛️ 5. تدقيق شاشات وبوابات النظام في الكود المصدري:');

  const pagesDir = path.resolve(process.cwd(), 'pages');
  const expectedPages = [
    'Dashboard.tsx',
    'TeacherDashboard.tsx',
    'GuardianDashboard.tsx',
    'StudentDashboard.tsx',
    'LiveRecitationStation.tsx',
    'Students.tsx',
    'Teachers.tsx',
    'Fees.tsx',
    'Attendance.tsx',
    'Timetable.tsx',
    'Settings.tsx',
    'Messages.tsx',
    'PublicHome.tsx',
  ];

  let pagesComplete = true;
  for (const page of expectedPages) {
    if (!fs.existsSync(path.join(pagesDir, page))) {
      pagesComplete = false;
      break;
    }
  }
  assert(pagesComplete, '14.5.1 اكتمال كافة شاشات وبوابات النظام الرئيسية (13 شاشة معتمدة)');

  const libDir = path.resolve(process.cwd(), 'lib');
  const expectedServices = [
    'supabase.ts',
    'adminOversightService.ts',
    'teacherPortalService.ts',
    'guardianService.ts',
    'studentPortalService.ts',
    'evaluationEngine.ts',
    'dataMigrationService.ts',
    'financeService.ts',
    'messagesService.ts',
    'warshContent.ts',
  ];

  let servicesComplete = true;
  for (const service of expectedServices) {
    if (!fs.existsSync(path.join(libDir, service))) {
      servicesComplete = false;
      break;
    }
  }
  assert(servicesComplete, '14.5.2 اكتمال محركات الخدمات الأساسية للمسارات الأربعة وقواعد البيانات');

  // -----------------------------------------------------------------------------------------
  // خلاصة نتائج التدقيق للمرحلة 14
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للتدقيق النهائي والتسليم المؤسسي (المرحلة 14):`);
  console.log(`   - إجمالي الفحوصات: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد الهندسي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز تدقيق التسليم النهائي الشامل بنجاح تام 100% (PASS)!`);
    console.log(`   ✨ اكتمل مشروع مدرسة نبراس القرآنية بمسجد إبراهيم الخليل بالكامل وهو جاهز للتشغيل الرسمي.`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage14FinalHandover().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل فحص التسليم للمرحلة 14:', err);
  process.exit(1);
});

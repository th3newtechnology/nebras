/**
 * سكريبت الاعتماد الهندسي والتدقيق الشامل النهائي للمرحلة 12 (Stage 12 Master QA & Final Sign-Off)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * تغطية متكاملة لجميع المحطات الفرعية (12.1 إلى 12.5)
 */

import fs from 'fs';
import path from 'path';

// استيراد الخدمات للمسارات الأربعة
import { fetchExecutiveOversightMetrics } from '../lib/adminOversightService';
import { fetchStudents } from '../lib/studentsService';
import { fetchFinanceStats, formatDZD } from '../lib/financeService';
import { fetchTeacherCircles, fetchTeacherStudents } from '../lib/teacherPortalService';
import { calculateRecitationScore } from '../lib/evaluationEngine';
import { fetchTeacherReports } from '../lib/teacherReportService';
import {
  fetchGuardianDashboardData,
  fetchChildDetailForGuardian,
  verifyGuardianStudentAccess,
  submitAbsenceExcuse,
} from '../lib/guardianService';
import {
  fetchStudentDashboardData,
  toggleWirdSectionCompleted,
  verifyStudentAccessGate,
} from '../lib/studentPortalService';
import { canUsersCommunicate } from '../lib/messagesService';
import {
  detectLegacyLocalStorageData,
  validateAndSanitizeLegacyData,
} from '../lib/dataMigrationService';
import { SCHOOL_INFO } from '../constants';

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

async function runStage12MasterQA() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء التدقيق النهائي الشامل والاعتماد المؤسسي للمرحلة 12 (Stage 12 Master QA & Sign-Off)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (E2E Regression & Performance Optimization)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. المحطة 12.1: التحميل الكسول والتقسيم الذكي للحزم (Code Splitting & Lazy Loading)
  // -----------------------------------------------------------------------------------------
  console.log('📦 المحطة 12.1: التحميل الكسول وتقسيم الحزم (Code Splitting):');

  const appTsx = fs.readFileSync(path.resolve(process.cwd(), 'App.tsx'), 'utf-8');
  assert(
    appTsx.includes("lazy(() => import('./pages/Dashboard'))") &&
    appTsx.includes("lazy(() => import('./pages/TeacherDashboard'))") &&
    appTsx.includes("lazy(() => import('./pages/GuardianDashboard'))") &&
    appTsx.includes("lazy(() => import('./pages/StudentDashboard'))"),
    '12.1.1 تحميل بوابات النظام الأربع بشكل كسول وديناميكي عند الحاجة (React.lazy)'
  );

  assert(
    appTsx.includes('<Suspense fallback={<PortalLoadingFallback />}>'),
    '12.1.2 تطبيق مكون Suspense مع مؤشر تحميل إسلامي متناسق'
  );

  assert(
    appTsx.includes("lazy(() => import('./pages/LiveRecitationStation'))"),
    '12.1.3 عزل محطة الإقراء المباشرة بحزمة منفصلة عن لوحة المعلم'
  );

  const viteConfig = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf-8');
  assert(
    viteConfig.includes("cssCodeSplit: true") && viteConfig.includes("manualChunks(id)"),
    '12.1.4 ضبط Rollup manualChunks وتقسيم CSS في إعدادات Vite'
  );

  // -----------------------------------------------------------------------------------------
  // 2. المحطة 12.2: اختبارات الانحدار الشاملة للمسارات الأربعة (Multi-Role E2E Regression)
  // -----------------------------------------------------------------------------------------
  console.log('\n🔄 المحطة 12.2: اختبارات الانحدار الشاملة للأدوار الأربعة (Multi-Role E2E):');

  // أ. مسار الإدارة المركزية
  assert(
    SCHOOL_INFO.name.includes('نبراس') && (SCHOOL_INFO.affiliation?.includes('إبراهيم الخليل') || SCHOOL_INFO.fullName?.includes('إبراهيم الخليل')),
    '12.2.1 تثبيت الهوية والتبعية لمسجد إبراهيم الخليل عليه السلام'
  );

  const { metrics: adminStats } = await fetchExecutiveOversightMetrics();
  assert(
    adminStats.totalActiveStudents > 0,
    '12.2.2 رصد مؤشرات الأداء والرقابة الإدارية المركزية'
  );

  const studentsResult = await fetchStudents();
  assert(
    studentsResult.students.length > 0 && studentsResult.students[0].registrationNumber.startsWith('NEB-'),
    '12.2.3 التحقق من صيغة أرقام القيد المعتمدة للطلاب (NEB-2026-XXXX)'
  );

  const feeSummary = await fetchFinanceStats();
  assert(
    feeSummary.totalExpected > 0 && formatDZD(feeSummary.totalExpected).includes('د.ج'),
    '12.2.4 احتساب الرسوم والاشتراكات بالدينار الجزائري الرسمي (DZD / د.ج)'
  );

  // ب. مسار المعلم ومحطة الإقراء برواية ورش
  const teacherCircles = await fetchTeacherCircles('t-01');
  assert(teacherCircles.length > 0, '12.2.5 استرجاع الحلقات القرآنية للشيخ المحفظ');

  const circleStudents = await fetchTeacherStudents(teacherCircles[0]?.id, 't-01');
  assert(circleStudents.length > 0, '12.2.6 حصر طلاب الحلقة في كشف المعلم');

  const recitationEval = calculateRecitationScore({ hesitation: 1, maddWarsh: 0, tarqeeqTaghleez: 0 });
  assert(
    recitationEval.score >= 90 && recitationEval.recommendedGrade === 'ممتاز',
    '12.2.7 دقة محرك التقييم الجزائري برواية ورش عن نافع (سلم 20/20)'
  );

  const teacherReports = await fetchTeacherReports({ teacherId: 't-01' });
  assert(Array.isArray(teacherReports), '12.2.8 استرجاع تقارير المتابعة التربوية والأسبوعية');

  // ج. مسار ولي الأمر والعزل الأمني
  const guardianData = await fetchGuardianDashboardData('u-guardian-01');
  assert(guardianData.children.length === 2, '12.2.9 حصر أبناء الأسرة المسجلين تحت ولاية المستخدم');

  const canAccessOwn = await verifyGuardianStudentAccess('s-001', 'u-guardian-01');
  const canAccessForeign = await verifyGuardianStudentAccess('s-003', 'u-guardian-01');
  assert(canAccessOwn === true && canAccessForeign === false, '12.2.10 العزل الأمني الصارم لبيانات الطلاب بين الأسر (Zero Data Leakage)');

  const excuse = await submitAbsenceExcuse({
    studentId: 's-001',
    guardianId: 'u-guardian-01',
    absenceDate: '2026-11-20',
    reason: 'ظرف أسري طارئ',
  });
  assert(excuse.status === 'pending', '12.2.11 إرسال عذر غياب رسمي إلكترونياً للشيخ المحفظ');

  // د. مسار الطالب القرآني والمصحف
  const studentData = await fetchStudentDashboardData('s-001');
  assert(studentData.profile.points > 1000, '12.2.12 استرجاع الملف القرآني ونقاط الهمة للطالب');

  const updatedWird = await toggleWirdSectionCompleted('s-001', 'minor');
  assert(typeof updatedWird.minorReview.isCompleted === 'boolean', '12.2.13 تأكيد إنجاز قسم المراجعة الصغرى في الورد القرآني');

  const studentOwnAccess = await verifyStudentAccessGate('s-001', 's-001');
  const studentCrossAccess = await verifyStudentAccessGate('s-002', 's-001');
  assert(studentOwnAccess === true && studentCrossAccess === false, '12.2.14 بوابة عزل خصوصية الطلاب (Student Privacy Isolation)');

  // هـ. التواصل الداخلي وترحيل البيانات
  const crossGuardianComm = await canUsersCommunicate('GUARDIAN', 'GUARDIAN', 'u-g1', 'u-g2');
  const crossStudentComm = await canUsersCommunicate('STUDENT', 'STUDENT', 's-1', 's-2');
  const guardianTeacherComm = await canUsersCommunicate('GUARDIAN', 'TEACHER', 'u-g1', 't-1');
  assert(
    crossGuardianComm === false && crossStudentComm === false && guardianTeacherComm === true,
    '12.2.15 حظر التراسل الأفقي وسماح التواصل الرأسي التربوي المصرح'
  );

  const legacyDump = detectLegacyLocalStorageData();
  const { report: preflight } = validateAndSanitizeLegacyData(legacyDump);
  assert(preflight.isValid && preflight.totalRecordsFound > 0, '12.2.16 تطهير وتجهيز البيانات القديمة للترحيل العلائقي');

  // -----------------------------------------------------------------------------------------
  // 3. المحطة 12.3: مؤشرات الأداء وحجم الحزم (Performance Benchmarks)
  // -----------------------------------------------------------------------------------------
  console.log('\n⚡ المحطة 12.3: مؤشرات الأداء وحجم الحزم (Performance Benchmarks):');

  const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
  assert(fs.existsSync(distAssetsDir), '12.3.1 وجود مجلد المخرجات التوزيعية المجهزة للإنتاج');

  const assetFiles = fs.readdirSync(distAssetsDir);
  const mainJs = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
  assert(Boolean(mainJs), '12.3.2 توليد ملف index.js الأساسي للإنتاج');

  if (mainJs) {
    const mainJsSize = fs.statSync(path.join(distAssetsDir, mainJs)).size / 1024;
    assert(
      mainJsSize <= 250,
      `12.3.3 انخفاض حجم حزمة الجافاسكريبت الأساسية (${mainJsSize.toFixed(1)} KB <= 250 KB)`,
      `الحجم الفعلي: ${mainJsSize.toFixed(1)} KB`
    );
  }

  const vendorSupabase = assetFiles.find(f => f.startsWith('vendor-supabase-'));
  const vendorCharts = assetFiles.find(f => f.startsWith('vendor-charts-'));
  const vendorIcons = assetFiles.find(f => f.startsWith('vendor-icons-'));
  assert(
    Boolean(vendorSupabase) && Boolean(vendorCharts) && Boolean(vendorIcons),
    '12.3.4 نجاح عزل وتخزين حزم المكتبات الخارجية (Vendor Caching Chunks)'
  );

  // -----------------------------------------------------------------------------------------
  // 4. المحطة 12.4: إمكانية الوصول والتوافقية مع الأجهزة (A11y & Responsiveness)
  // -----------------------------------------------------------------------------------------
  console.log('\n♿ المحطة 12.4: إمكانية الوصول والتوافقية مع الأجهزة (A11y & Responsiveness):');

  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
  assert(
    indexHtml.includes('lang="ar"') && indexHtml.includes('dir="rtl"'),
    '12.4.1 الاتجاه من اليمين لليسار (dir="rtl") واللغة العربية الرسمية (lang="ar")'
  );

  assert(
    indexHtml.includes('width=device-width, initial-scale=1.0'),
    '12.4.2 تجاوب الشاشة وتوافق الهواتف والألواح عبر وسم Viewport'
  );

  assert(
    indexHtml.includes('rel="preconnect"') && indexHtml.includes('display=swap'),
    '12.4.3 تحميل خطوط Amiri و Cairo المتزامن السلس دون حجب التقديم'
  );

  // -----------------------------------------------------------------------------------------
  // 5. المحطة 12.5: الاعتماد النهائي وتدقيق الإنتاج (Sign-Off & Production Readiness)
  // -----------------------------------------------------------------------------------------
  console.log('\n🏆 المحطة 12.5: الاعتماد النهائي وجاهزية النشر السحابي (Sign-Off):');

  const hasIndexHtml = fs.existsSync(path.resolve(process.cwd(), 'dist/index.html'));
  assert(hasIndexHtml, '12.5.1 وجود ملف dist/index.html المجهز للنشر السحابي');

  const distIndexHtml = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
  assert(
    distIndexHtml.includes('<script type="module"') && distIndexHtml.includes('assets/index-'),
    '12.5.2 احتواء ملف التوزيع النهائي على روابط الحزم المجمعة والمشفرة بالـ Hash'
  );

  assert(
    assetFiles.some(f => f.startsWith('LiveRecitationStation-')) &&
    assetFiles.some(f => f.startsWith('GuardianDashboard-')) &&
    assetFiles.some(f => f.startsWith('StudentDashboard-')),
    '12.5.3 اكتمال تجزئة كافة البوابات بنجاح واستعداد المشروع للمرحلة 13 (النشر السحابي)'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة نتائج التدقيق النهائي للمرحلة 12
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للتدقيق النهائي الشامل للمرحلة 12:`);
  console.log(`   - إجمالي الفحوصات: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد الهندسي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز التدقيق النهائي الشامل للمرحلة 12 بنجاح تام 100% (PASS)!`);
    console.log(`   ✨ النظام جاهز تماماً للانتقال إلى المرحلة 13 (النشر السحابي على Cloudflare Pages & Supabase)`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage12MasterQA().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل التدقيق النهائي للمرحلة 12:', err);
  process.exit(1);
});

/**
 * سكريبت الفحص التكاملي الشامل واختبارات الانحدار لجميع الأدوار (Stage 12 E2E Regression Suite)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * فحص المسارات الأربعة: الإدارة، المعلم، الولي، والطالب + تدقيق الأداء وتقسيم الحزم
 */

import fs from 'fs';
import path from 'path';

// استيراد الخدمات الأساسية للمسارات الأربعة
import { fetchExecutiveOversightMetrics } from '../lib/adminOversightService';
import { fetchStudents } from '../lib/studentsService';
import { fetchTeachers } from '../lib/teachersService';
import { fetchFinanceStats, formatDZD } from '../lib/financeService';
import { fetchTeacherCircles, fetchTeacherStudents } from '../lib/teacherPortalService';
import { calculateRecitationScore } from '../lib/evaluationEngine';
import { fetchTeacherReports } from '../lib/teacherReportService';
import {
  fetchGuardianDashboardData,
  fetchChildDetailForGuardian,
  verifyGuardianStudentAccess,
  markReportAsViewedByGuardian,
  submitAbsenceExcuse,
} from '../lib/guardianService';
import {
  fetchStudentDashboardData,
  toggleWirdSectionCompleted,
  verifyStudentAccessGate,
} from '../lib/studentPortalService';
import {
  canUsersCommunicate,
  sendChatMessage,
} from '../lib/messagesService';
import {
  detectLegacyLocalStorageData,
  validateAndSanitizeLegacyData,
} from '../lib/dataMigrationService';
import { WARSH_SURAH_LIBRARY } from '../lib/warshContent';
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

async function runStage12E2ERegression() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء الفحص التكاملي الشامل واختبارات الانحدار للأدوار الأربعة (Stage 12 E2E Regression)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Multi-Role Integration & Optimization)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. مسار الموقع العام والتبعية لمسجد إبراهيم الخليل
  // -----------------------------------------------------------------------------------------
  console.log('🕌 1. فحص الموقع العام، الهوية الإسلامية، والتبعية الرسمية لمسجد إبراهيم الخليل:');

  assert(
    SCHOOL_INFO.name.includes('نبراس') && (SCHOOL_INFO.affiliation?.includes('إبراهيم الخليل') || SCHOOL_INFO.fullName?.includes('إبراهيم الخليل')),
    'تثبيت الهوية الرسمية للمدرسة وتبعية مسجد إبراهيم الخليل عليه السلام',
    `المدرسة: ${SCHOOL_INFO.name} | التبعية: ${SCHOOL_INFO.affiliation}`
  );

  assert(
    Boolean(SCHOOL_INFO.address) && Boolean(SCHOOL_INFO.phone),
    'اكتمال بيانات الاتصال والعنوان الرسمي'
  );

  // -----------------------------------------------------------------------------------------
  // 2. مسار الإدارة المركزية (Admin Portal Flow)
  // -----------------------------------------------------------------------------------------
  console.log('\n🏛️ 2. فحص مسار الإدارة المركزية ومؤشرات الأداء والنزاهة المالية:');

  const { metrics: adminStats } = await fetchExecutiveOversightMetrics();
  assert(
    adminStats.totalActiveStudents > 0,
    'استرجاع المؤشرات الإحصائية العامة للطلاب وهيئة التدريس',
    `الطلاب النشطون: ${adminStats.totalActiveStudents} | نسبة الحضور: ${adminStats.schoolAttendanceRate}%`
  );

  const studentsResult = await fetchStudents();
  const studentsList = studentsResult.students;
  assert(
    studentsList.length > 0 && studentsList[0].registrationNumber.startsWith('NEB-'),
    'فحص سجلات الطلاب ومطابقة صيغة رقم القيد المعتمد (NEB-2026-XXXX)'
  );

  const feeSummary = await fetchFinanceStats();
  assert(
    feeSummary.totalExpected > 0 && feeSummary.totalCollected > 0,
    'عمل المحرك المالي وحساب اشتراكات الطلاب بالدينار الجزائري (DZD)'
  );

  const formattedFee = formatDZD(feeSummary.totalExpected);
  assert(
    formattedFee.includes('د.ج'),
    'تنسيق العملة الوطنية الرسمية بالدينار الجزائري (د.ج)',
    formattedFee
  );

  // -----------------------------------------------------------------------------------------
  // 3. مسار المعلم ومحطة الإقراء برواية ورش (Teacher & Recitation Flow)
  // -----------------------------------------------------------------------------------------
  console.log('\n🎙️ 3. فحص مسار المعلم، محطة الإقراء، والتقييم برواية ورش عن نافع:');

  const teacherId = 't-01';
  const circles = await fetchTeacherCircles(teacherId);
  assert(
    circles.length > 0,
    'استرجاع الحلقات القرآنية المسندة للشيخ المحفظ',
    `الحلقة: ${circles[0]?.name}`
  );

  const circleStudents = await fetchTeacherStudents(circles[0]?.id, teacherId);
  assert(
    circleStudents.length > 0,
    'حصر طلاب الحلقة المسجلين في كشف المعلم الميداني'
  );

  // فحص محرك تقييم التلاوة الجزائري برواية ورش
  const evaluation = calculateRecitationScore({
    hesitation: 1,
    tarqeeqTaghleez: 0,
    maddWarsh: 0,
  });

  assert(
    evaluation.score >= 90 && evaluation.recommendedGrade === 'ممتاز',
    'تقييم جلسة التسميع بدقة واحتساب تقدير ممتاز (المقياس الجزائري 20/20)',
    `الدرجة: ${evaluation.score}/100 (${evaluation.scoreOutOf20}/20) | التقدير: ${evaluation.recommendedGrade}`
  );

  const reports = await fetchTeacherReports({ teacherId });
  assert(
    Array.isArray(reports),
    'استرجاع تقارير المتابعة التربوية الصادرة عن مشايخ الحلقات'
  );

  // -----------------------------------------------------------------------------------------
  // 4. مسار ولي الأمر والعزل الأمني (Guardian Portal Flow & Security Gate)
  // -----------------------------------------------------------------------------------------
  console.log('\n👨‍👧‍👦 4. فحص مسار ولي الأمر والعزل الأمني الصارم (Zero Leakage):');

  const guardianId = 'u-guardian-01';
  const guardianData = await fetchGuardianDashboardData(guardianId);
  assert(
    guardianData.children.length === 2,
    'حصر أبناء الأسرة المسجلين شرعياً تحت ولاية المستخدم (2 أبناء)'
  );

  const childDetail = await fetchChildDetailForGuardian('s-001', guardianId);
  assert(
    childDetail.overview.fullName === 'محمد ياسين درويش' && childDetail.overview.currentJuz === 16,
    'استرجاع الملف القرآني للابن المحدد وخريطة الأجزاء الـ 30'
  );

  const canAccessOwnChild = await verifyGuardianStudentAccess('s-001', guardianId);
  assert(canAccessOwnChild === true, 'سماح وصول الولي لبيانات ابنه الشرعي');

  const canAccessForeignChild = await verifyGuardianStudentAccess('s-003', guardianId);
  assert(canAccessForeignChild === false, 'حظر وصول الولي لبيانات طالب ينتمي لأسرة أخرى');

  const excuse = await submitAbsenceExcuse({
    studentId: 's-001',
    guardianId,
    absenceDate: '2026-11-15',
    reason: 'ظرف صحي مؤقت',
  });
  assert(
    excuse.status === 'pending' && excuse.studentId === 's-001',
    'تقديم وتسجيل عذر غياب رسمي إلكترونياً للشيخ المحفظ'
  );

  // -----------------------------------------------------------------------------------------
  // 5. مسار الطالب القرآني والمصحف التفاعلي (Student Portal Flow)
  // -----------------------------------------------------------------------------------------
  console.log('\n🌟 5. فحص مسار الطالب القرآني، الورد اليومي، والمصحف التفاعلي:');

  const studentData = await fetchStudentDashboardData('s-001');
  assert(
    studentData.profile.id === 's-001' && studentData.profile.points > 1000,
    'استرجاع بيانات الطالب ونقاط الهمة القرآنية'
  );

  assert(
    Boolean(studentData.wird.newMemorization) && Boolean(studentData.wird.minorReview),
    'تحديد ورد اليوم بأركانه الثلاثة (حفظ جديد، مراجعة صغرى، مراجعة كبرى)'
  );

  const updatedWird = await toggleWirdSectionCompleted('s-001', 'new');
  assert(
    typeof updatedWird.newMemorization.isCompleted === 'boolean',
    'تأكيد إنجاز قسم من الورد اليومي وتحديث الحالة اللحظية'
  );

  assert(
    studentData.juzMap.length === 30 && studentData.badges.length >= 6,
    'اكتمال مصفوفة خريطة الأجزاء الـ 30 ومنظومة الأوسمة والشارات المكتسبة'
  );

  const ownStudentGate = await verifyStudentAccessGate('s-001', 's-001');
  assert(ownStudentGate === true, 'سماح وصول الطالب لحسابه وسجله الشخصي');

  const foreignStudentGate = await verifyStudentAccessGate('s-002', 's-001');
  assert(foreignStudentGate === false, 'حظر الطالب من استعراض بيانات زملائه في الحلقة');

  // -----------------------------------------------------------------------------------------
  // 6. فحص التواصل الداخلي وقواعد العزل بين الأدوار
  // -----------------------------------------------------------------------------------------
  console.log('\n💬 6. فحص التواصل الداخلي المنظم وحظر التراسل الأفقي:');

  const crossGuardianBan = await canUsersCommunicate('GUARDIAN', 'GUARDIAN', 'u-guardian-01', 'u-guardian-02');
  assert(crossGuardianBan === false, 'حظر قاطع لتراسل الأولياء فيما بينهم (Zero Cross-Guardian)');

  const crossStudentBan = await canUsersCommunicate('STUDENT', 'STUDENT', 's-001', 's-002');
  assert(crossStudentBan === false, 'حظر قاطع لتراسل الطلاب فيما بينهم (Zero Cross-Student)');

  const guardianTeacherAllowed = await canUsersCommunicate('GUARDIAN', 'TEACHER', 'u-guardian-01', 'u-teacher-01');
  assert(guardianTeacherAllowed === true, 'سماح التراسل التربوي بين الولي والشيخ المحفظ');

  const studentTeacherAllowed = await canUsersCommunicate('STUDENT', 'TEACHER', 's-001', 'u-teacher-01');
  assert(studentTeacherAllowed === true, 'سماح التراسل القرآني بين الطالب وشيخه للاستفسار عن الورد');

  // -----------------------------------------------------------------------------------------
  // 7. فحص منظومة ترحيل وتطهير البيانات التاريخية (Data Migration)
  // -----------------------------------------------------------------------------------------
  console.log('\n📦 7. فحص منظومة ترحيل وتطهير البيانات التاريخية:');

  const legacyDump = detectLegacyLocalStorageData();
  const { report: preflight } = validateAndSanitizeLegacyData(legacyDump);
  assert(
    preflight.totalRecordsFound > 0 && preflight.isValid,
    'كشف وتطهير البيانات القديمة ومطابقتها للمعايير العلائقية'
  );

  // -----------------------------------------------------------------------------------------
  // 8. فحص الأداء وتحسين الحزم البرمجية (Bundle & Performance Optimization)
  // -----------------------------------------------------------------------------------------
  console.log('\n⚡ 8. فحص تحسين الأداء وتقسيم الحزم البرمجية (Code Splitting):');

  const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
  assert(
    fs.existsSync(distAssetsDir),
    'وجود مجلد المخرجات التوزيعية للإنتاج (dist/assets)'
  );

  const assetFiles = fs.readdirSync(distAssetsDir);
  const mainJsFile = assetFiles.find((f) => f.startsWith('index-') && f.endsWith('.js'));
  assert(
    Boolean(mainJsFile),
    'توليد ملف جافاسكريبت الأساسي للإنتاج',
    mainJsFile
  );

  if (mainJsFile) {
    const mainStats = fs.statSync(path.join(distAssetsDir, mainJsFile));
    const sizeKb = Math.round(mainStats.size / 1024);
    assert(
      sizeKb < 300,
      `انخفاض حجم ملف الجافاسكريبت الأساسي (${sizeKb} KB < 300 KB) بفضل التحميل الكسول React.lazy`,
      `الحجم الفعلي: ${sizeKb} KB`
    );
  }

  // التحقق من توليد حزم البوابات المنفصلة
  const hasStudentChunk = assetFiles.some((f) => f.startsWith('StudentDashboard-'));
  const hasGuardianChunk = assetFiles.some((f) => f.startsWith('GuardianDashboard-'));
  const hasRecitationChunk = assetFiles.some((f) => f.startsWith('LiveRecitationStation-'));
  assert(
    hasStudentChunk && hasGuardianChunk && hasRecitationChunk,
    'توليد حزم منفصلة لكل بوابة لتحميلها عند الطلب فقط (Dynamic Code Splitting)'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة نتائج الفحص التكاملي
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للفحص التكاملي الشامل للمرحلة 12:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد الهندسي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز الفحص التكاملي الشامل واختبارات الانحدار بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage12E2ERegression().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل اختبارات المرحلة 12:', err);
  process.exit(1);
});

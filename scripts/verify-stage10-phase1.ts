/**
 * سكريبت الفحص والتحقق الآلي للمرحلة الفرعية 10.1
 * البنية الهيكلية وخدمة بوابة الطالب والورد اليومي (Student Portal Foundation & Daily Wird)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  fetchStudentDashboardData,
  toggleWirdSectionCompleted,
  verifyStudentAccessGate,
} from '../lib/studentPortalService';

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

async function runStage10Phase1Verification() {
  console.log('\n=============================================================================================');
  console.log('🧪 بدء الاختبارات الآلية للمرحلة الفرعية 10.1: بوابة الطالب القرآني والورد اليومي');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Student Portal Foundation)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المجموعة 1: فحص تكامل ملفات ومكونات بوابة الطالب
  // -----------------------------------------------------------------------------------------
  console.log('📂 المجموعة 1: فحص تكامل ملفات ومكونات بوابة الطالب في شجرة الكود:');

  const requiredFiles = [
    'types/studentPortal.types.ts',
    'lib/studentPortalService.ts',
    'pages/StudentDashboard.tsx',
    'components/student/StudentHeader.tsx',
    'components/student/DailyWirdCard.tsx',
    'components/student/StudentMushafModal.tsx',
    'components/student/StudentJuzMap.tsx',
    'components/student/StudentBadgesTab.tsx',
    'components/student/StudentCertificateModal.tsx',
    'components/student/StudentScheduleTab.tsx',
    'project-docs/STAGE_10_EXECUTION_PLAN.md',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(fullPath), `وجود الملف الأساسي: ${file}`);
  }

  // -----------------------------------------------------------------------------------------
  // المجموعة 2: فحص استرجاع ملف الطالب وبيانات الهوية القرآنية
  // -----------------------------------------------------------------------------------------
  console.log('\n👤 المجموعة 2: فحص استرجاع ملف الطالب وبيانات الهوية القرآنية:');

  const studentId = 's-001';
  const data = await fetchStudentDashboardData(studentId);

  assert(
    data.profile.id === 's-001' && data.profile.fullName === 'محمد ياسين درويش',
    'استرجاع بيانات الطالب المصرح له بنجاح',
    `الاسم: ${data.profile.fullName}`
  );

  assert(
    Boolean(data.profile.circleName) && Boolean(data.profile.teacherName),
    'ربط الطالب بحلقته وشيخه المحفظ بمسجد إبراهيم الخليل',
    `الحلقة: ${data.profile.circleName} | الشيخ: ${data.profile.teacherName}`
  );

  assert(
    data.profile.currentJuz === 16 && data.profile.completionPercentage === 53,
    'رصد مستوى الحفظ الحالي ونسبة إتمام الختمة (الجزء 16 بنسبة 53%)'
  );

  assert(
    data.profile.points > 1000,
    'حساب رصيد نقاط الهمة القرآنية المكتسبة',
    `نقاط الهمة: ${data.profile.points} نقطة`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 3: فحص الورد القرآني اليومي وتأكيد الإنجاز
  // -----------------------------------------------------------------------------------------
  console.log('\n📖 المجموعة 3: فحص الورد اليومي وأقسامه الثلاثة:');

  assert(
    Boolean(data.wird.newMemorization) && data.wird.newMemorization.surahNumber > 0,
    'تحديد قسم الحفظ الجديد وسورته وآياته المقررة',
    `السورة: ${data.wird.newMemorization.surahName} (${data.wird.newMemorization.fromAyah}-${data.wird.newMemorization.toAyah})`
  );

  assert(
    Boolean(data.wird.minorReview) && data.wird.minorReview.surahNumber > 0,
    'تحديد قسم المراجعة الصغرى القريبة'
  );

  assert(
    Boolean(data.wird.majorReview) && data.wird.majorReview.juzNumber > 0,
    'تحديد قسم المراجعة الكبرى البعيدة'
  );

  const initialMinorStatus = data.wird.minorReview.isCompleted;
  const updatedWird = await toggleWirdSectionCompleted(studentId, 'minor');
  assert(
    updatedWird.minorReview.isCompleted !== initialMinorStatus,
    'تأكيد الطالب إنجاز أحد أقسام الورد وتحديث حالته بنجاح'
  );

  // إعادة الحالة
  await toggleWirdSectionCompleted(studentId, 'minor');

  // -----------------------------------------------------------------------------------------
  // المجموعة 4: فحص العزل الأمني وبوابة صلاحيات الطالب
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ المجموعة 4: فحص العزل الأمني وبوابة صلاحيات الطالب:');

  const ownAccess = await verifyStudentAccessGate('s-001', 's-001');
  assert(ownAccess === true, 'السماح للطالب بالوصول لحسابه وسجله الشخصي');

  const foreignAccess = await verifyStudentAccessGate('s-002', 's-001');
  assert(foreignAccess === false, 'حظر الطالب من الوصول لملف أو سجل أي طالب زميل آخر');

  // -----------------------------------------------------------------------------------------
  // خلاصة النتائج
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية لاختبارات المرحلة الفرعية 10.1:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الإنجاز والاعتماد: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز جميع اختبارات المرحلة الفرعية 10.1 بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage10Phase1Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل اختبارات المرحلة 10.1:', err);
  process.exit(1);
});

/**
 * سكريبت الفحص والتحقق الآلي الشامل للمرحلة الفرعية 9.1
 * البنية الهيكلية ولوحة تحكم الولي ومبدل الأبناء (Guardian Dashboard & Layout & Child Switcher)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  fetchGuardianDashboardData,
  fetchGuardianChildren,
  verifyGuardianStudentAccess,
  fetchChildDetailForGuardian,
  submitAbsenceExcuse,
  fetchChildAttendanceLog,
  fetchChildFeeSummary,
  markReportAsViewedByGuardian,
} from '../lib/guardianService';
import { formatDZD } from '../lib/financeService';
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

async function runStage9Phase1Verification() {
  console.log('\n=============================================================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 9.1: بوابة الولي ومبدل الأبناء');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Parent / Guardian Portal Engine)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المجموعة 1: التحقق من وجود ملفات ومكونات بوابة الولي المنفصلة
  // -----------------------------------------------------------------------------------------
  console.log('📂 المجموعة 1: فحص تكامل ملفات ومكونات بوابة الولي في شجرة الكود:');

  const requiredFiles = [
    'types/guardianPortal.types.ts',
    'lib/guardianService.ts',
    'pages/GuardianDashboard.tsx',
    'components/guardian/GuardianHeader.tsx',
    'components/guardian/ChildQuickSwitcher.tsx',
    'components/guardian/ChildQuranProgress.tsx',
    'components/guardian/ChildReportsTab.tsx',
    'components/guardian/ChildAttendanceTab.tsx',
    'components/guardian/ChildFeesTab.tsx',
    'components/guardian/ChildScheduleTab.tsx',
    'project-docs/STAGE_9_EXECUTION_PLAN.md',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(fullPath), `وجود الملف الأساسي: ${file}`);
  }

  // -----------------------------------------------------------------------------------------
  // المجموعة 2: فحص لوحة قيادة الولي والمؤشرات الإحصائية المجمعة للأسرة
  // -----------------------------------------------------------------------------------------
  console.log('\n📊 المجموعة 2: فحص لوحة قيادة الولي والمؤشرات المجمعة للأسرة:');

  const guardianUserId = 'u-guardian-01'; // ولي أمر الطالبين s-001 و s-002
  const dashboardData = await fetchGuardianDashboardData(guardianUserId);

  assert(
    dashboardData.children.length === 2,
    'حصر أبناء الولي الشرعيين بدقة (2 أبناء مسجلين)',
    `عدد الأبناء: ${dashboardData.children.length}`
  );

  assert(
    dashboardData.totalMemorizedAjza > 0,
    'حساب مجموع الأجزاء المحفوظة لكافة أفراد الأسرة',
    `إجمالي المحفوظ: ${dashboardData.totalMemorizedAjza} جزءاً`
  );

  assert(
    dashboardData.averageAttendanceRate >= 90,
    'حساب متوسط المواظبة والحضور لجميع الأبناء (أعلى من 90%)',
    `نسبة الحضور: ${dashboardData.averageAttendanceRate}%`
  );

  assert(
    Array.isArray(dashboardData.recentReports) && dashboardData.recentReports.length > 0,
    'استرجاع التقارير المعتمدة الموجهة للولي',
    `عدد التقارير: ${dashboardData.recentReports.length}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 3: فحص مبدل الأبناء التفاعلي وبيانات الابن النشط
  // -----------------------------------------------------------------------------------------
  console.log('\n🔄 المجموعة 3: فحص مبدل الأبناء التفاعلي واسترجاع تفاصيل كل ابن:');

  const child1Id = 's-001';
  const child1Detail = await fetchChildDetailForGuardian(child1Id, guardianUserId);

  assert(
    child1Detail.overview.fullName === 'محمد ياسين درويش' && child1Detail.overview.registrationNumber === 'NEB-2026-0001',
    'استرجاع بيانات الابن الأول ورقم القيد والحلقة',
    `الاسم: ${child1Detail.overview.fullName} • القيد: ${child1Detail.overview.registrationNumber}`
  );

  assert(
    child1Detail.overview.currentJuz === 16 && child1Detail.overview.completionPercentage === 53,
    'تحديد جزء الحفظ الحالي ومعدل إتمام الختمة المباركة (53%)',
    `جزء: ${child1Detail.overview.currentJuz}/30 (${child1Detail.overview.completionPercentage}%)`
  );

  const child2Id = 's-002';
  const child2Detail = await fetchChildDetailForGuardian(child2Id, guardianUserId);

  assert(
    child2Detail.overview.fullName === 'إبراهيم بن خليل' && child2Detail.overview.registrationNumber === 'NEB-2026-0002',
    'التبديل واسترجاع بيانات الابن الثاني بنجاح',
    `الاسم: ${child2Detail.overview.fullName} • الجزء: ${child2Detail.overview.currentJuz}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 4: فحص العزل الأمني الصارم للبيانات (Zero Leakage Enforcement)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ المجموعة 4: فحص العزل الأمني الصارم ومنع تسريب بيانات الأسر الأخرى:');

  const foreignChildId = 's-003'; // ابن ولي أمر آخر (فريد الجزائري)
  const isSelfChildAllowed = await verifyGuardianStudentAccess(child1Id, guardianUserId);
  const isForeignChildAllowed = await verifyGuardianStudentAccess(foreignChildId, guardianUserId);

  assert(
    isSelfChildAllowed === true,
    'تصريح أمني مشروع: السماح بالوصول للابن المقيد شرعياً تحت ولاية المستخدم'
  );

  assert(
    isForeignChildAllowed === false,
    'حظر أمني قاطع: منع الوصول لأي طالب ينتمي لعائلة أخرى'
  );

  let securityLeakPrevented = false;
  try {
    await fetchChildDetailForGuardian(foreignChildId, guardianUserId);
  } catch (err: any) {
    if (err.message.includes('اختراق أمني مرفوض')) {
      securityLeakPrevented = true;
    }
  }

  assert(
    securityLeakPrevented === true,
    'منع تسريب البيانات: إلقاء استثناء أمني صارم عند محاولة فتح ملف طالب أجنبي'
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 5: فحص سجل المواظبة وتبرير الغياب
  // -----------------------------------------------------------------------------------------
  console.log('\n⏱️ المجموعة 5: فحص سجل المواظبة وتقديم أعذار الغياب إلكترونياً:');

  const attendanceLog = await fetchChildAttendanceLog(child1Id);
  assert(
    attendanceLog.length > 0 && attendanceLog[0].status === 'present',
    'استرجاع كشف الحضور والانضباط الشهري للابن',
    `عدد الجلسات المرصودة: ${attendanceLog.length}`
  );

  const submittedExcuse = await submitAbsenceExcuse({
    studentId: child1Id,
    guardianId: guardianUserId,
    absenceDate: '2026-11-08',
    reason: 'موعد طبي لدى طبيب الأسنان',
  });

  assert(
    submittedExcuse.status === 'pending' && Boolean(submittedExcuse.id),
    'تسجيل وتوثيق عذر غياب جديد من ولي الأمر لشيخ الحلقة',
    `معرف العذر: ${submittedExcuse.id}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 6: فحص الاشتراكات والرسوم بالدينار الجزائري (DZD)
  // -----------------------------------------------------------------------------------------
  console.log('\n💰 المجموعة 6: فحص الاشتراكات والرسوم المدرسية وسندات القبض (DZD):');

  const child1FeeSummary = await fetchChildFeeSummary(child1Id);
  assert(
    child1FeeSummary.currency === 'DZD' && child1FeeSummary.totalRequired === 4500 && child1FeeSummary.isFullyPaid,
    'حساب الاشتراكات بالدينار الجزائري وتأكيد السداد الكامل بسندات القبض المعتمدة',
    `المطلوب: ${formatDZD(child1FeeSummary.totalRequired)} • المسدد: ${formatDZD(child1FeeSummary.totalPaid)}`
  );

  const child2FeeSummary = await fetchChildFeeSummary(child2Id);
  assert(
    child2FeeSummary.remaining > 0 && child2FeeSummary.isFullyPaid === false,
    'رصد المبالغ المتبقية للابن الثاني بدقة',
    `المتبقي: ${formatDZD(child2FeeSummary.remaining)}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 7: فحص جدول الحصص الأسبوعية لحلقة الابن بمسجد إبراهيم الخليل
  // -----------------------------------------------------------------------------------------
  console.log('\n📅 المجموعة 7: فحص جدول الحصص الأسبوعية وفق التقويم الجزائري:');

  assert(
    child1Detail.weeklySchedule.length > 0 && child1Detail.weeklySchedule[0].dayName === 'السبت',
    'استرجاع جدول الحصص الأسبوعية ومطابقة بدء الأسبوع الجزائري بيوم السبت',
    `الحصص: ${child1Detail.weeklySchedule.length} حصص أسبوعياً`
  );

  assert(
    child1Detail.weeklySchedule.every((s) => Boolean(s.hallName)),
    'ربط كافة الحصص بقاعات مسجد إبراهيم الخليل المعتمدة'
  );

  // -----------------------------------------------------------------------------------------
  // الإغلاق والاعتماد للمرحلة الفرعية 9.1
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية لاختبارات المرحلة الفرعية 9.1:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   - نسبة الإنجاز والاعتماد: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  if (passedTests === totalTests) {
    console.log('   🏆 تم اجتياز جميع اختبارات المرحلة الفرعية 9.1 بنجاح تام 100%!');
  } else {
    console.error('   ⚠️ توجد بعض الاختبارات التي لم تكتمل بنجاح، يرجى المراجعة.');
  }
  console.log('=============================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runStage9Phase1Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء الفحص 9.1:', err);
  process.exit(1);
});

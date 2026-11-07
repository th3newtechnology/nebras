/**
 * سكريبت الفحص والتحقق الآلي الشامل للمرحلة الفرعية 9.3
 * منظومة التقارير الدورية وسجل الانضباط وتبرير الغياب (Reports & Attendance & Excuses)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  fetchChildDetailForGuardian,
  verifyGuardianStudentAccess,
  submitAbsenceExcuse,
  fetchChildAttendanceLog,
  markReportAsViewedByGuardian,
} from '../lib/guardianService';
import { fetchTeacherReports } from '../lib/teacherReportService';

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

async function runStage9Phase3Verification() {
  console.log('\n=============================================================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 9.3: التقارير الدورية والمواظبة وتبرير الغياب');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Parent Reports & Discipline Engine)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المجموعة 1: فحص تكامل ملفات ومكونات التقارير الدورية وسجل المواظبة
  // -----------------------------------------------------------------------------------------
  console.log('📂 المجموعة 1: فحص تكامل ملفات ومكونات التقارير وسجل المواظبة في شجرة الكود:');

  const requiredFiles = [
    'components/guardian/ChildReportsTab.tsx',
    'components/guardian/ChildAttendanceTab.tsx',
    'components/teacher/reports/TeacherReportPrintModal.tsx',
    'lib/guardianService.ts',
    'lib/teacherReportService.ts',
    'types/guardianPortal.types.ts',
    'types/teacherReport.types.ts',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(fullPath), `وجود الملف الأساسي: ${file}`);
  }

  // -----------------------------------------------------------------------------------------
  // المجموعة 2: فحص استرجاع التقارير التربوية المعتمدة والمقفلة أمنياً
  // -----------------------------------------------------------------------------------------
  console.log('\n📄 المجموعة 2: فحص التقارير الدورية المعتمدة الموجهة للولي:');

  const guardianUserId = 'u-guardian-01';
  const child1Detail = await fetchChildDetailForGuardian('s-001', guardianUserId);

  assert(
    Array.isArray(child1Detail.reports) && child1Detail.reports.length > 0,
    'استرجاع التقارير الدورية المعتمدة للطالب الأول',
    `عدد التقارير: ${child1Detail.reports.length}`
  );

  const report = child1Detail.reports[0];
  assert(
    report.studentId === 's-001',
    'مطابقة معرف الطالب في التقرير مع الطالب المحدد',
    `معرف الطالب: ${report.studentId}`
  );

  assert(
    Boolean(report.overallRating) && Boolean(report.strengths) && Boolean(report.recommendationsForGuardian),
    'اشتمال التقرير على التقييم العام ونقاط القوة وتوجيهات الأسرة المنزلية',
    `التقدير: ${report.overallRating}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 3: فحص التوقيع والتأكيد الإلكتروني لاطلاع ولي الأمر (Timestamping)
  // -----------------------------------------------------------------------------------------
  console.log('\n✍️ المجموعة 3: فحص التوثيق والتأكيد الإلكتروني لاطلاع الولي:');

  const markSuccess = await markReportAsViewedByGuardian(report.id, guardianUserId);
  assert(
    markSuccess === true,
    'نجاح توثيق اطلاع وقراءة ولي الأمر للتقرير إلكترونياً'
  );

  const updatedReports = await fetchTeacherReports({ studentId: 's-001' });
  const updatedReport = updatedReports.find((r) => r.id === report.id);
  assert(
    Boolean(updatedReport?.guardianViewedAt),
    'تثبيت الطابع الزمني لقراءة الولي للتقرير بدقة (guardianViewedAt)',
    `تاريخ الاطلاع: ${updatedReport?.guardianViewedAt}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 4: فحص كشف المواظبة وسجل الحضور والانضباط الشهري
  // -----------------------------------------------------------------------------------------
  console.log('\n⏱️ المجموعة 4: فحص كشف المواظبة الميدانية وسجل الحضور:');

  const attendanceLog = await fetchChildAttendanceLog('s-001');
  assert(
    Array.isArray(attendanceLog) && attendanceLog.length > 0,
    'استرجاع كشف الحضور والانضباط التراكمي للابن',
    `عدد الجلسات المرصودة: ${attendanceLog.length}`
  );

  const presentCount = attendanceLog.filter((l) => l.status === 'present').length;
  assert(
    presentCount > 0,
    'رصد جلسات الحضور الفعلي في محراب المسجد',
    `جلسات الحضور: ${presentCount}`
  );

  const hasExcused = attendanceLog.some((l) => l.status === 'excused');
  assert(
    hasExcused,
    'رصد حالات الغياب المبرر والمعذور إلكترونياً'
  );

  assert(
    child1Detail.overview.attendanceRate >= 90,
    'حساب نسبة المواظبة العامة للابن بدقة عالية',
    `نسبة الحضور: ${child1Detail.overview.attendanceRate}%`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 5: فحص تقديم عذر وتبرير الغياب إلكترونياً
  // -----------------------------------------------------------------------------------------
  console.log('\n📬 المجموعة 5: فحص تقديم عذر الغياب لشيخ الحلقة وتتبع الرد:');

  const testAbsenceDate = '2026-11-10';
  const testReason = 'ظرف عائلي طارئ وسفر مفاجئ';
  const newExcuse = await submitAbsenceExcuse({
    studentId: 's-001',
    guardianId: guardianUserId,
    absenceDate: testAbsenceDate,
    reason: testReason,
  });

  assert(
    Boolean(newExcuse.id) && newExcuse.status === 'pending',
    'إنشاء وتسجيل عذر الغياب بحالة قيد المراجعة (Pending)',
    `معرف العذر: ${newExcuse.id}`
  );

  assert(
    newExcuse.studentId === 's-001' && newExcuse.reason === testReason,
    'مطابقة بيانات العذر والتبرير المرسل بدقة'
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 6: فحص العزل الأمني الصارم للتقارير والأعذار (Security Gate)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ المجموعة 6: فحص العزل الأمني الصارم ومنع التطفل على تقارير الأسر الأخرى:');

  let blockedOtherChildExcuse = false;
  try {
    // محاولة تقديم عذر لطالب غير مقيد تحت ولاية المستخدم
    await submitAbsenceExcuse({
      studentId: 's-003',
      guardianId: guardianUserId,
      absenceDate: '2026-11-10',
      reason: 'محاولة غير شرعية',
    });
  } catch (err: any) {
    blockedOtherChildExcuse = true;
    assert(
      err.message.includes('غير مصرح لك'),
      'حظر تقديم عذر غياب لطالب أجنبي لا يتبع للولي',
      err.message
    );
  }

  assert(
    blockedOtherChildExcuse,
    'تأكيد منع تقديم الأعذار لطلاب لا ينتمون للأسرة'
  );

  let blockedOtherChildReportView = false;
  try {
    // محاولة توثيق قراءة تقرير يخص طالباً آخر
    const otherChildReports = await fetchTeacherReports({ studentId: 's-003' });
    if (otherChildReports.length > 0) {
      const result = await markReportAsViewedByGuardian(otherChildReports[0].id, guardianUserId);
      if (result === false) {
        blockedOtherChildReportView = true;
      }
    } else {
      const hasAccess = await verifyGuardianStudentAccess('s-003', guardianUserId);
      if (!hasAccess) blockedOtherChildReportView = true;
    }
  } catch (err: any) {
    blockedOtherChildReportView = true;
  }

  assert(
    blockedOtherChildReportView,
    'حظر المصادقة والتأكيد على تقارير طلاب العائلات الأخرى'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة النتائج
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية لاختبارات المرحلة الفرعية 9.3:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الإنجاز والاعتماد: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز جميع اختبارات المرحلة الفرعية 9.3 بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage9Phase3Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل اختبارات المرحلة 9.3:', err);
  process.exit(1);
});

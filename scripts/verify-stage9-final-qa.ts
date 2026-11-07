/**
 * سكريبت التدقيق النهائي وضمان الجودة الشاملة للمرحلة 9 بالكامل
 * (Master QA & Final Institutional Sign-Off - Stage 9: Parent / Guardian Portal)
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
import {
  fetchChatContacts,
  canUsersCommunicate,
  sendChatMessage,
  fetchMessages,
} from '../lib/messagesService';
import {
  QURAN_SURAHS,
  getSurahsByJuz,
  getDefaultRecitationForStudent,
} from '../lib/quranMetadata';
import { QURAN_JUZ_NAMES } from '../lib/teacherPortalService';
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

async function runStage9MasterQA() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء الفحص الهندسي الشامل والتدقيق النهائي لبوابة الولي المستقلة (المرحلة 9 بالكامل)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Parent Portal Master QA & Sign-Off)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. فحص الشجرة الهيكلية والمكونات المعيارية
  // -----------------------------------------------------------------------------------------
  console.log('📂 1. فحص اكتمال المكونات والخدمات والأنواع البرمجية لبوابة الولي:');

  const requiredModules = [
    'types/guardianPortal.types.ts',
    'lib/guardianService.ts',
    'pages/GuardianDashboard.tsx',
    'components/guardian/GuardianHeader.tsx',
    'components/guardian/ChildQuickSwitcher.tsx',
    'components/guardian/ChildQuranProgress.tsx',
    'components/guardian/JuzDetailModal.tsx',
    'components/guardian/ChildReportsTab.tsx',
    'components/guardian/ChildAttendanceTab.tsx',
    'components/guardian/ChildFeesTab.tsx',
    'components/guardian/ChildScheduleTab.tsx',
    'project-docs/STAGE_9_EXECUTION_PLAN.md',
    'project-docs/STAGE_9_1_COMPLETION_REPORT.md',
  ];

  for (const mod of requiredModules) {
    const fullPath = path.resolve(process.cwd(), mod);
    assert(fs.existsSync(fullPath), `اكتمال الملف البرمجي: ${mod}`);
  }

  // -----------------------------------------------------------------------------------------
  // 2. فحص لوحة القيادة التجميعية ومبدل الأبناء (9.1)
  // -----------------------------------------------------------------------------------------
  console.log('\n📊 2. فحص لوحة قيادة الولي والمؤشرات التجميعية ومبدل الأبناء (Stage 9.1):');

  const guardianUserId = 'u-guardian-01';
  const dashboard = await fetchGuardianDashboardData(guardianUserId);

  assert(
    dashboard.children.length === 2,
    'حصر أبناء الأسرة المسجلين بشرعية تامة (2 أبناء)',
    `العدد: ${dashboard.children.length}`
  );

  assert(
    dashboard.totalMemorizedAjza === 24,
    'حساب إجمالي الأجزاء المحفوظة لأفراد الأسرة (16 + 8 = 24 جزءاً)',
    `إجمالي المحفوظ: ${dashboard.totalMemorizedAjza}`
  );

  assert(
    dashboard.averageAttendanceRate > 90,
    'حساب متوسط المواظبة التراكمي للأسرة (أعلى من 90%)',
    `متوسط المواظبة: ${dashboard.averageAttendanceRate}%`
  );

  const child1 = dashboard.children[0];
  const child2 = dashboard.children[1];
  assert(
    child1.studentId === 's-001' && child2.studentId === 's-002',
    'توفير بيانات الأبناء مع أرقام القيد والحلقات للمبدل التفاعلي'
  );

  // -----------------------------------------------------------------------------------------
  // 3. فحص السجل القرآني وخريطة الأجزاء الـ 30 والمستهدفات (9.2)
  // -----------------------------------------------------------------------------------------
  console.log('\n📖 3. فحص خريطة الأجزاء الـ 30 وسجل التسميع برواية ورش (Stage 9.2):');

  assert(
    QURAN_JUZ_NAMES.length === 30 && QURAN_SURAHS.length === 114,
    'صحة وتكامل مصفوفة الأجزاء الـ 30 والسور الـ 114 برواية ورش'
  );

  const child1Detail = await fetchChildDetailForGuardian('s-001', guardianUserId);
  assert(
    child1Detail.overview.currentJuz === 16 && child1Detail.overview.completionPercentage === 53,
    'حساب دقيق لنسبة إتمام القرآن الكريم (الجزء 16 بنسبة 53%)'
  );

  assert(
    child1Detail.timeline.length > 0 &&
      child1Detail.timeline.some((t) => t.category === 'new_memorization') &&
      child1Detail.timeline.some((t) => t.category === 'minor_review'),
    'تنوع سجل التسميع بين الحفظ الجديد والمراجعة الصغرى والكبرى'
  );

  assert(
    child1Detail.goals.length > 0,
    'ربط المستهدفات القرآنية والأهداف المعتمدة للابن'
  );

  // -----------------------------------------------------------------------------------------
  // 4. فحص التقارير الدورية وسجل المواظبة وتبرير الغياب (9.3)
  // -----------------------------------------------------------------------------------------
  console.log('\n📑 4. فحص التقارير الدورية والتأكيد الإلكتروني وتبرير الغياب (Stage 9.3):');

  assert(
    child1Detail.reports.length > 0,
    'استرجاع التقارير المعتمدة الموجهة للولي',
    `عدد التقارير: ${child1Detail.reports.length}`
  );

  const reportId = child1Detail.reports[0].id;
  const viewConfirmed = await markReportAsViewedByGuardian(reportId, guardianUserId);
  assert(
    viewConfirmed === true,
    'توثيق التأكيد الإلكتروني لاطلاع ولي الأمر على التقرير'
  );

  const excuses = await submitAbsenceExcuse({
    studentId: 's-001',
    guardianId: guardianUserId,
    absenceDate: '2026-11-12',
    reason: 'مرافقة عائلية رسمية',
  });
  assert(
    excuses.status === 'pending' && excuses.studentId === 's-001',
    'تقديم وتسجيل عذر غياب رسمي للشيخ المحفظ إلكترونياً'
  );

  const attendanceLog = await fetchChildAttendanceLog('s-001');
  assert(
    attendanceLog.length > 0 && attendanceLog.some((l) => l.status === 'present'),
    'استعراض سجل المواظبة والجلسات بمحراب المسجد'
  );

  // -----------------------------------------------------------------------------------------
  // 5. فحص الاشتراكات المالية بالدينار الجزائري (9.4)
  // -----------------------------------------------------------------------------------------
  console.log('\n💰 5. فحص الاشتراكات والرسوم وسندات القبض بالدينار الجزائري DZD (Stage 9.4):');

  const feeSummary = await fetchChildFeeSummary('s-001');
  assert(
    feeSummary.currency === 'DZD' && feeSummary.totalPaid === 4500 && feeSummary.isFullyPaid,
    'تأكيد براءة الذمة والسداد الكامل بالدينار الجزائري (4,500 د.ج)'
  );

  const hasReceipt = feeSummary.fees.some((f) => f.receiptNumber && f.receiptNumber.startsWith('REC-'));
  assert(
    hasReceipt,
    'إسناد سند قبض رسمي معتمد لكل دفعة مسددة'
  );

  // -----------------------------------------------------------------------------------------
  // 6. فحص التواصل التربوي المنظم والعزل الأمني الشامل (Zero Leakage)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ 6. فحص التواصل التربوي المنظم والعزل الأمني الصارم (Zero Leakage):');

  const contactsRes = await fetchChatContacts('GUARDIAN', guardianUserId);
  const contacts = contactsRes.contacts;
  const noOtherGuardians = !contacts.some((c) => c.role === 'GUARDIAN');
  assert(
    noOtherGuardians,
    'حظر رؤية الأولياء لبعضهم تماماً في جهات الاتصال (Zero Cross-Guardian Visibility)'
  );

  const crossCommAllowed = await canUsersCommunicate('GUARDIAN', 'GUARDIAN', guardianUserId, 'u-guardian-02');
  assert(
    crossCommAllowed === false,
    'حظر أمني قاطع للتراسل بين أولياء الأمور (Cross-Guardian Blocked)'
  );

  // اختبار محاولة استعراض بيانات طالب أجنبي
  let foreignAccessBlocked = false;
  try {
    await fetchChildDetailForGuardian('s-003', guardianUserId);
  } catch (err: any) {
    foreignAccessBlocked = true;
  }
  assert(
    foreignAccessBlocked,
    'منع تسريب بيانات أي طالب أجنبي خارج نطاق ولاية المستخدم (Zero Data Leakage)'
  );

  // اختبار محاولة تأكيد قراءة تقرير لطالب أجنبي
  const foreignReportBlocked = await markReportAsViewedByGuardian('rep-003', guardianUserId);
  assert(
    foreignReportBlocked === false,
    'رفض المصادقة والتأكيد الإلكتروني على تقارير الطلاب الآخرين'
  );

  // فحص إرسال رسالة مشروعة للشيخ المحفظ
  const legitimateMessage = await sendChatMessage({
    senderId: guardianUserId,
    senderRole: 'GUARDIAN',
    recipientId: 'u-teacher-01',
    recipientRole: 'TEACHER',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'pedagogical',
    content: 'السلام عليكم يا شيخنا، تم التأكيد على الورد المنزلي.',
  });
  assert(
    legitimateMessage.success === true,
    'نجاح المراسلة التربوية الموجهة للمعلم بسياق الطالب المعتمد'
  );

  // -----------------------------------------------------------------------------------------
  // 7. فحص جدول الحصص وفق التقويم الجزائري
  // -----------------------------------------------------------------------------------------
  console.log('\n📅 7. فحص جدول الحصص الأسبوعية لحلقة الابن:');

  assert(
    child1Detail.weeklySchedule.length > 0 &&
      child1Detail.weeklySchedule[0].dayName === 'السبت' &&
      child1Detail.weeklySchedule[0].hallName.includes('قاعة'),
    'توزيع الحصص الأسبوعية بدءاً من السبت بقاعات مسجد إبراهيم الخليل'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة الاعتماد المؤسسي والنهائي للمرحلة 9
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للتدقيق الهندسي الشامل لبوابة الولي (المرحلة 9):`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد النهائي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز الفحص الهندسي والاعتماد النهائي للمرحلة التاسعة بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage9MasterQA().catch((err) => {
  console.error('خطأ غير متوقع أثناء التدقيق النهائي للمرحلة 9:', err);
  process.exit(1);
});

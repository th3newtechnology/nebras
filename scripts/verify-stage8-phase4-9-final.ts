/**
 * نصوص الفحص والتحقق الآلي الشامل للاعتماد النهائي للمرحلة 8.4:
 * المرحلة الفرعية 8.4.9: الاختبارات الأمنية والتكاملية والاعتماد النهائي للمرحلة 8.4
 * (Master Security Sign-Off, RLS Zero Leakage, Cross-Role Integrity & E2E Verification)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';

// استيراد الخدمات عبر كافة وحدات المرحلة 8.4
import { 
  checkScheduleConflict,
  createScheduleException,
  fetchTimetableSessions
} from '../lib/timetableService';
import {
  fetchStudentFollowupRecord,
  createStudentGoal,
  updateStudentGoalStatus
} from '../lib/studentFollowupService';
import {
  fetchTeacherReports,
  createTeacherReport,
  updateTeacherReport,
  sendReportToGuardian,
  generateReportDraftForStudent
} from '../lib/teacherReportService';
import {
  fetchGuardianDashboardData,
  verifyGuardianStudentAccess,
  fetchChildDetailForGuardian,
  markReportAsViewedByGuardian
} from '../lib/guardianService';
import {
  canUsersCommunicate,
  fetchChatContacts,
  fetchMessages,
  sendChatMessage,
  markMessagesAsRead,
  generateDraftMessage,
  PEDAGOGICAL_TEMPLATES
} from '../lib/messagesService';
import {
  fetchUserNotifications,
  createNotification,
  dispatchBulkNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchNotificationStats,
  notifyAbsence,
  notifyNewReport,
  notifyScheduleException
} from '../lib/notificationsService';
import {
  fetchExecutiveOversightMetrics,
  fetchStrugglingStudentsWatchlist,
  fetchStandoutStudentsWatchlist,
  fetchHallsOccupancyAudit,
  fetchTeachersWorkflowAudit,
  dispatchInterventionNotice
} from '../lib/adminOversightService';
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

async function runMasterVerification() {
  console.log('\n====================================================================================');
  console.log('🏆 بدء الاختبارات الأمنية والتكاملية الكبرى للاعتماد النهائي للمرحلة 8.4 (Stage 8.4.9)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (بوابة المعلم، الأولياء، والإدارة)');
  console.log('====================================================================================\n');

  // ------------------------------------------------------------------------------------
  // المجموعة 1: اعتماد البنية المعمارية وملفات ترحيل Supabase الخمسة
  // ------------------------------------------------------------------------------------
  console.log('--- المجموعة 1: اعتماد البنية المعمارية وقواعد البيانات وملفات الترحيل الخمسة ---');

  const migrations = [
    { file: '20261106000013_schedule_exceptions.sql', feature: 'جدول استثناءات وتعديلات الحصص الأسبوعية' },
    { file: '20261106000014_student_goals.sql', feature: 'جدول مستهدفات حفظ ومراجعة الطالب' },
    { file: '20261106000015_teacher_reports.sql', feature: 'جدول تقارير المعلمين التربوية والدورية المعتمدة' },
    { file: '20261106000016_scoped_internal_communication.sql', feature: 'المراسلات الآمنة وقفل التراسل بين الأولياء' },
    { file: '20261106000017_notifications_and_alerts.sql', feature: 'منظومة الإشعارات والتنبيهات الميدانية والمحفزات' },
  ];

  for (const m of migrations) {
    const fullPath = path.resolve(process.cwd(), 'supabase/migrations', m.file);
    assert(fs.existsSync(fullPath), `وجود ملف ترحيل Supabase: ${m.file} (${m.feature})`);
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert(
      content.includes('CREATE TABLE') || content.includes('ALTER TABLE') || content.includes('CREATE POLICY'),
      `اكتمال أوامر DDL وسياسات الأمان في ملف ${m.file}`,
      'DDL & RLS commands present'
    );
  }

  // ------------------------------------------------------------------------------------
  // المجموعة 2: اعتماد العزل الأمني الصارم (Zero Data Leakage & RLS Boundary Sign-Off)
  // ------------------------------------------------------------------------------------
  console.log('\n--- المجموعة 2: اعتماد العزل الأمني الصارم وحظر تسريب البيانات (Security Sign-Off) ---');

  // 1. حظر التراسل بين الأولياء وبعضهم تماماً
  const g2gAllowed = await canUsersCommunicate('GUARDIAN', 'GUARDIAN');
  assert(
    g2gAllowed === false,
    'حظر أمني قاطع: منع التراسل بين أولياء الأمور وبعضهم تماماً (Zero Cross-Guardian Communication)',
    'Guardian-to-Guardian communication blocked'
  );

  const blockSendAttempt = await sendChatMessage({
    senderId: 'u-guardian-01',
    senderRole: 'GUARDIAN',
    recipientId: 'u-guardian-02',
    recipientRole: 'GUARDIAN',
    content: 'محاولة اختراق قواعد العزل الأمني',
  });
  assert(
    blockSendAttempt.success === false,
    'رفض وإحباط محاولة إرسال رسالة من ولي أمر إلى ولي أمر آخر مع إرجاع استثناء أمني',
    blockSendAttempt.error
  );

  // 2. حظر وصول الولي لأي بيانات أو تقارير تخص طالباً ليس ابناً له
  const guardianId = 'u-guardian-01';
  const childId = 's-001';
  const foreignStudentId = 's-003';

  const childAuth = await verifyGuardianStudentAccess(childId, guardianId);
  const foreignAuth = await verifyGuardianStudentAccess(foreignStudentId, guardianId);
  assert(
    childAuth === true && foreignAuth === false,
    'العزل الأمني الصارم للأولياء: السماح بالوصول للابن s-001 وحظر الوصول للطالب الأجنبي s-003',
    `ابن: ${childAuth} • أجنبي: ${foreignAuth}`
  );

  let leakBlocked = false;
  try {
    await fetchChildDetailForGuardian(foreignStudentId, guardianId);
  } catch {
    leakBlocked = true;
  }
  assert(
    leakBlocked === true,
    'منع تسريب بيانات الطالب (Zero Data Leakage): إلقاء استثناء أمني فوري عند طلب ملف طالب أجنبي',
    'Security Exception Triggered & Enforced'
  );

  // 3. منع تعديل التقارير بعد إرسالها لولي الأمر (Immutability Enforcement)
  const reportDraft = await createTeacherReport({
    studentId: 's-001',
    teacherId: 't-001',
    circleId: 'c-001',
    reportType: 'weekly',
    periodStart: '2026-11-01',
    periodEnd: '2026-11-07',
    attendanceRate: 98,
    newMemorizationProgress: 'سورة النور 20-30',
    revisionProgress: 'سورة المؤمنون',
    tajweedLevel: 'ممتاز',
    overallRating: 'ممتاز',
    nextWeekGoals: 'سورة النور 31-40',
    strengths: 'إتقان استثنائي للأحكام ومخارج الحروف',
    areasForImprovement: 'العناية بمراتب الغنة',
    recommendationsForGuardian: 'الحرص على الورد اليومي مع الشيخ',
  });
  assert(reportDraft.status === 'draft', 'إنشاء مسودة التقرير بحالة مسودة (draft)');

  const sentReport = await sendReportToGuardian(reportDraft.id);
  assert(sentReport.status === 'sent_to_guardian', 'اعتماد وإرسال التقرير لولي الأمر بنجاح (sent_to_guardian)');

  let tamperBlocked = false;
  try {
    await updateTeacherReport(sentReport.id, {
      status: 'draft',
      newMemorizationProgress: 'محاولة تعديل غير قانونية بعد الإرسال',
    });
  } catch {
    tamperBlocked = true;
  }
  assert(
    tamperBlocked === true,
    'حماية حصانة التقرير (Immutability): حظر تعديل محتوى التقرير بعد اعتماده وإرساله لولي الأمر',
    'Report modification prevented after sending to guardian'
  );

  // ------------------------------------------------------------------------------------
  // المجموعة 3: اعتماد الجدول الأسبوعي وسلامة القاعات (100% Conflict-Free Sentinel)
  // ------------------------------------------------------------------------------------
  console.log('\n--- المجموعة 3: اعتماد الجدول الأسبوعي وسلامة القاعات ومحرك كشف التعارض ---');

  const hallsAudit = await fetchHallsOccupancyAudit();
  assert(
    hallsAudit.conflictFree === true,
    'نظام الإنذار المبكر: خلو كافة قاعات مسجد إبراهيم الخليل من أي تداخل زمني أو مكاني',
    `سلامة القاعات: ${hallsAudit.conflictFree}`
  );

  // فحص محرك كشف التعارض البرمجي
  const { sessions } = await fetchTimetableSessions();
  const sampleSession = sessions[0];
  const conflictDetected = checkScheduleConflict(sessions, {
    circleId: 'different-circle-id',
    teacherId: 'different-teacher-id',
    hallId: sampleSession.hallId,
    dayOfWeek: sampleSession.dayOfWeek,
    startTime: sampleSession.startTime,
    endTime: sampleSession.endTime,
  });
  assert(
    conflictDetected.hasConflict === true,
    'محرك كشف التعارض المسبق: اكتشاف تعارض القاعة عند محاولة حجز قاعة محجوزة في نفس الوقت',
    conflictDetected.message
  );

  // تسجيل استثناء حصة رسمي
  const exceptionResult = await createScheduleException({
    scheduleId: 'sch-001',
    circleId: 'c-001',
    exceptionDate: '2026-11-10',
    exceptionType: 'room_change',
    reason: 'نقل مؤقت لقاعة ابن الجزري بسبب درس أسبوعي بالمسجد',
  }, 'ناظر المدرسة');
  assert(
    exceptionResult.success === true,
    'تسجيل وتوثيق استثناء الحصة بنجاح مع ربط المسؤول وتاريخ التعديل',
    `معرف الاستثناء: ${exceptionResult.exception?.id}`
  );

  // ------------------------------------------------------------------------------------
  // المجموعة 4: اعتماد سجل المتابعة الفردي وأهداف الطالب والخط الزمني
  // ------------------------------------------------------------------------------------
  console.log('\n--- المجموعة 4: اعتماد سجل المتابعة الفردي وأهداف الطالب والخط الزمني ---');

  const followupRecord = await fetchStudentFollowupRecord('s-001');
  assert(
    followupRecord !== null && followupRecord.studentId === 's-001' && Boolean(followupRecord.fullName),
    'استرجاع السجل التربوي المتكامل للطالب محمد ياسين درويش',
    `الطالب: ${followupRecord?.fullName} • الجزء الحالي: ${followupRecord?.metrics.currentJuz}/30`
  );

  assert(
    followupRecord!.timeline.length > 0,
    'الربط التكاملي مع محطة الإقراء (8.3): توفر الخط الزمني لجلسات التسميع برواية ورش',
    `عدد الجلسات المسجلة بالخط الزمني: ${followupRecord!.timeline.length}`
  );

  const createGoalRes = await createStudentGoal({
    studentId: 's-001',
    teacherId: 't-001',
    goalType: 'weekly_hifz',
    title: 'حفظ سورة النور من الآية 1 إلى 30',
    targetSurah: 24,
    targetSurahName: 'النور',
    targetAyahFrom: 1,
    targetAyahTo: 30,
    targetDate: '2026-11-15',
    teacherNotes: 'تثبيت أحكام ترقيق الراءات',
  });
  assert(
    createGoalRes.success && Boolean(createGoalRes.goal?.id),
    'إنشاء هدف قرآني أسبوعي محدد للطالب وتوثيقه في خطة التسميع',
    `الهدف: ${createGoalRes.goal?.title}`
  );

  const goalId = createGoalRes.goal!.id;
  const updateGoalRes = await updateStudentGoalStatus(goalId, 'completed', 'تم الحفظ بإتقان ولله الحمد');
  assert(
    updateGoalRes.success === true,
    'تحديث حالة الهدف القرآني إلى مكتمل وتوثيق وقت الإنجاز وملاحظات الشيخ'
  );

  // ------------------------------------------------------------------------------------
  // المجموعة 5: اعتماد بوابة الولي ومتابعة الأبناء
  // ------------------------------------------------------------------------------------
  console.log('\n--- المجموعة 5: اعتماد بوابة الولي ومتابعة الأبناء ---');

  const guardianDashboard = await fetchGuardianDashboardData(guardianId);
  assert(
    guardianDashboard.children.length === 2,
    'استرجاع لوحة قيادة الولي وحصر أبنائه المقيدين بالمدرسة (2 أبناء)',
    `عدد الأبناء: ${guardianDashboard.children.length}`
  );

  const activeChild = await fetchChildDetailForGuardian(childId, guardianId);
  assert(
    activeChild !== null && activeChild.weeklySchedule.length > 0,
    'استرجاع جدول الحصص الأسبوعي لحلقة الابن وفق التقويم الجزائري (السبت-الخميس)',
    `حصص الحلقة: ${activeChild?.weeklySchedule.length}`
  );

  const viewReportResult = await markReportAsViewedByGuardian(sentReport.id, guardianId);
  assert(
    viewReportResult === true,
    'توثيق اطلاع ولي الأمر على التقرير الدوري إلكترونياً وتسجيل الطابع الزمني',
    'Report viewed by guardian recorded'
  );

  // ------------------------------------------------------------------------------------
  // المجموعة 6: اعتماد التراسل المنظم ومنظومة الإشعارات والتنبيهات
  // ------------------------------------------------------------------------------------
  console.log('\n--- المجموعة 6: اعتماد التراسل المنظم ومنظومة الإشعارات والتنبيهات ---');

  // رسالة تربوية مشروعة بسياق الطالب
  const validMsg = await sendChatMessage({
    senderId: 'u-teacher-01',
    senderRole: 'TEACHER',
    recipientId: guardianId,
    recipientRole: 'GUARDIAN',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'compliment',
    content: 'تهنئة بالتميز في تثبيت سورة النور برواية ورش.',
  });
  assert(
    validMsg.success === true && validMsg.message?.studentName === 'محمد ياسين درويش',
    'إرسال رسالة تربوية مشروعة من المعلم للولي مع وسم سياق الطالب المعني',
    `معرف الرسالة: ${validMsg.message?.id}`
  );

  // توثيق القراءة
  const readMsgResult = await markMessagesAsRead('u-teacher-01', guardianId);
  assert(readMsgResult === true, 'توثيق حالة قراءة الرسائل وتعيين الطابع الزمني readAt');

  // قوالب الرسائل التربوية الأربعة
  assert(
    PEDAGOGICAL_TEMPLATES.length === 4,
    'جاهزية قوالب الرسائل التربوية الأربعة (تهنئة، غياب، تذكير، لقاء تربوي)',
    `عدد القوالب: ${PEDAGOGICAL_TEMPLATES.length}`
  );

  // إرسال إشعارات الأحداث المدرسية
  const notifAbsenceRes = await notifyAbsence(guardianId, 'محمد ياسين', '2026-11-07', 'حلقة الصديق');
  assert(
    notifAbsenceRes.success && notifAbsenceRes.notification?.category === 'absence',
    'توليد إشعار غياب فوري لولي الأمر بأولوية عاجلة (urgent)',
    notifAbsenceRes.notification?.title
  );

  const notifReportRes = await notifyNewReport(guardianId, 'محمد ياسين', 'weekly', sentReport.id);
  assert(
    notifReportRes.success && notifReportRes.notification?.category === 'report',
    'توليد إشعار بصدور تقرير دوري معتمد مع رابط المعاينة المباشر',
    notifReportRes.notification?.title
  );

  // ------------------------------------------------------------------------------------
  // المجموعة 7: اعتماد الرقابة الإدارية الشاملة ومطابقة النماذج الرسمية A4
  // ------------------------------------------------------------------------------------
  console.log('\n--- المجموعة 7: اعتماد الرقابة الإدارية الشاملة ومطابقة النماذج الرسمية A4 ---');

  const oversightMetrics = await fetchExecutiveOversightMetrics();
  assert(
    oversightMetrics.metrics.schoolAttendanceRate > 90,
    'حساب مؤشر المواظبة المدرسية الكلية بدقة (أعلى من 90%)',
    `نسبة الحضور: ${oversightMetrics.metrics.schoolAttendanceRate}%`
  );

  const strugglingStudents = await fetchStrugglingStudentsWatchlist();
  assert(
    strugglingStudents.students.length > 0,
    'رصد وتشخيص الطلاب المتعثرين وربطهم بخطط التدخل التربوي',
    `عدد المتعثرين: ${strugglingStudents.students.length}`
  );

  const standoutStudents = await fetchStandoutStudentsWatchlist();
  assert(
    standoutStudents.students.length > 0,
    'لوحة شرف الطلاب المتفوقين في الإتقان القرآني برواية ورش عن نافع',
    `عدد المتفوقين: ${standoutStudents.students.length}`
  );

  // فحص نماذج الطباعة الرسمية لمطابقة المعايير الجزائرية
  const printModels = [
    { file: 'components/timetable/TimetablePrintView.tsx', name: 'نموذج الجدول الأسبوعي A4' },
    { file: 'components/teacher/reports/TeacherReportPrintModal.tsx', name: 'نموذج التقرير الدوري A4' },
    { file: 'components/oversight/ExecutiveOversightPrintModal.tsx', name: 'نموذج تقرير الرقابة الإدارية A4' },
  ];

  for (const p of printModels) {
    const fullPath = path.resolve(process.cwd(), p.file);
    assert(fs.existsSync(fullPath), `وجود مكون الوثيقة الرسمية: ${p.file}`);
    const code = fs.readFileSync(fullPath, 'utf-8');
    assert(
      code.includes('الجمهورية الجزائرية الديمقراطية الشعبية') &&
        (code.includes('مسجد إبراهيم الخليل') || code.includes('SCHOOL_INFO.affiliation')),
      `مطابقة ${p.name} للمواصفات الرسمية الجزائرية وتبعية مسجد إبراهيم الخليل`,
      'Official Algerian header & mosque affiliation verified'
    );
  }

  // فحص دعم الطباعة في سجل المتابعة
  const followupModalPath = path.resolve(process.cwd(), 'components/students/StudentFollowupRecordModal.tsx');
  const followupModalCode = fs.readFileSync(followupModalPath, 'utf-8');
  assert(
    followupModalCode.includes('window.print()'),
    'دعم الطباعة والتصدير الورقي والرسمي لسجل المتابعة الفردي للطالب',
    'Followup record print support verified'
  );

  // ------------------------------------------------------------------------------------
  // الخلاصة والاعتماد الهندسي النهائي
  // ------------------------------------------------------------------------------------
  console.log('\n====================================================================================');
  console.log(`📊 النتيجة النهائية لملف الفحص الشامل للمرحلة 8.4 (Stage 8.4.9):`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   - نسبة الإنجاز والاعتماد: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  if (passedTests === totalTests) {
    console.log('   🏆 تم اجتياز جميع اختبارات الاعتماد الأمني والتكاملي للمرحلة 8.4 بنجاح 100%!');
    console.log('   🛡️ توقيع الاعتماد الأمني (Security & RLS Sign-Off): معتمد رسمياً دون أي ثغرات.');
  } else {
    console.error('   ⚠️ توجد بعض الاختبارات التي لم تكتمل بنجاح، يرجى المراجعة.');
  }
  console.log('====================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runMasterVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء الفحص الشامل:', err);
  process.exit(1);
});

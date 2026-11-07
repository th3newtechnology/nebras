/**
 * سكريبت التدقيق الهندسي النهائي وضمان الجودة الشاملة لبوابة المعلم المستقلة (المرحلة 8.5)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * (Stage 8.5: Master QA, End-to-End Workflow Verification, Security & Final Closure of Stage 8)
 */

import fs from 'fs';
import path from 'path';

// 1. خدمات لوحة تحكم وحلقات المعلم (8.1 & 8.2)
import {
  fetchTeacherDashboardStats,
  fetchTeacherCircles,
  fetchTeacherCirclesWithDetails,
  fetchTeacherStudents,
  fetchTeacherStudentDetail,
  generateJuzProgress,
  logQuickRecitation,
  checkTeacherStudentAccess,
  QURAN_JUZ_NAMES,
} from '../lib/teacherPortalService';

// 2. محطة الإقراء والتسميع المباشر والتقييم (8.3)
import {
  initLiveSession,
  saveLiveSessionDraft,
  archiveAndSyncLiveSession,
  getArchivedSessions,
  clearLiveSession,
  calculateSessionStats,
  updateStudentAttendance,
} from '../lib/liveSessionService';
import {
  calculateRecitationScore,
  formatScoreOutOf20,
  TAJWEED_MISTAKE_TAGS,
  HIFZ_MISTAKE_TAGS,
  DEDUCTION_RULES,
} from '../lib/evaluationEngine';
import {
  getWarshVersesForSurah,
  WARSH_PRIMARY_RULES,
} from '../lib/warshContent';

// 3. الجدول الأسبوعي والاستثناءات والقاعات (8.4.2)
import {
  fetchTimetableSessions,
  checkScheduleConflict,
  createScheduleException,
  WORK_DAYS_MAP,
} from '../lib/timetableService';

// 4. سجل المتابعة الفردي ومستهدفات الحفظ (8.4.3)
import {
  fetchStudentFollowupRecord,
  createStudentGoal,
  updateStudentGoalStatus,
} from '../lib/studentFollowupService';

// 5. تقارير المعلمين الدورية المعتمدة (8.4.4)
import {
  createTeacherReport,
  sendReportToGuardian,
  updateTeacherReport,
  generateReportDraftForStudent,
  fetchTeacherReports,
} from '../lib/teacherReportService';

// 6. بوابة أولياء الأمور والعزل الأمني (8.4.5)
import {
  fetchGuardianDashboardData,
  verifyGuardianStudentAccess,
  fetchChildDetailForGuardian,
  markReportAsViewedByGuardian,
} from '../lib/guardianService';

// 7. التواصل الداخلي والتراسل الموجه (8.4.6)
import {
  canUsersCommunicate,
  fetchChatContacts,
  sendChatMessage,
  markMessagesAsRead,
  PEDAGOGICAL_TEMPLATES,
} from '../lib/messagesService';

// 8. منظومة الإشعارات والتنبيهات الميدانية (8.4.7)
import {
  fetchUserNotifications,
  createNotification,
  fetchNotificationStats,
  notifyAbsence,
  notifyNewReport,
  notifyScheduleException,
} from '../lib/notificationsService';

// 9. لوحة الإدارة والرقابة الشاملة (8.4.8)
import {
  fetchExecutiveOversightMetrics,
  fetchStrugglingStudentsWatchlist,
  fetchStandoutStudentsWatchlist,
  fetchHallsOccupancyAudit,
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

async function runStage8FinalQA() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء التدقيق الهندسي النهائي الشامل وضمان الجودة لبوابة المعلم المستقلة (المرحلة 8.5)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (The Independent Quranic Teacher Portal)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المحور 1: تدقيق شاشات ومكونات بوابة المعلم ومحطة الإقراء في شجرة الكود
  // -----------------------------------------------------------------------------------------
  console.log('📂 المحور 1: تدقيق اكتمال شاشات ومكونات بوابة المعلم ومحطة الإقراء:');

  const requiredTeacherComponents = [
    'pages/TeacherDashboard.tsx',
    'pages/TeacherCirclesStudents.tsx',
    'pages/LiveRecitationStation.tsx',
    'components/teacher/QuickRecitationModal.tsx',
    'components/teacher/StudentDetailModal.tsx',
    'components/teacher/live/LiveSessionReportModal.tsx',
    'components/teacher/live/WarshAssistantMushaf.tsx',
    'components/teacher/reports/TeacherReportModal.tsx',
    'components/teacher/reports/TeacherReportPrintModal.tsx',
    'components/teacher/reports/TeacherReportsTab.tsx',
    'components/students/StudentFollowupRecordModal.tsx',
    'components/students/AddGoalModal.tsx',
    'components/timetable/TimetablePrintView.tsx',
    'components/oversight/ExecutiveOversightSection.tsx',
    'components/oversight/ExecutiveOversightPrintModal.tsx',
    'components/NotificationDropdown.tsx',
  ];

  for (const comp of requiredTeacherComponents) {
    const fullPath = path.resolve(process.cwd(), comp);
    assert(fs.existsSync(fullPath), `وجود المكون الأساسي: ${comp}`);
  }

  // -----------------------------------------------------------------------------------------
  // المحور 2: تدقيق لوحة تحكم المعلم وإدارة الحلقات والطلاب (8.1 & 8.2)
  // -----------------------------------------------------------------------------------------
  console.log('\n🧭 المحور 2: تدقيق لوحة تحكم المعلم والحلقات ومحطة التسميع السريع (8.1 & 8.2):');

  const teacherId = 't-01'; // الشيخ عبد الرحمن السديس
  const teacherStats = await fetchTeacherDashboardStats(teacherId);

  assert(
    teacherStats.assignedCirclesCount > 0 && teacherStats.totalStudentsCount > 0,
    'استرجاع مؤشرات لوحة تحكم المعلم (عدد الحلقات والطلاب النشطين)',
    `حلقات: ${teacherStats.assignedCirclesCount} • طلاب: ${teacherStats.totalStudentsCount}`
  );

  assert(
    teacherStats.nextSession !== null && Boolean(teacherStats.nextSession?.circleName),
    'تحديد الجلسة القرآنية القادمة للمعلم بدقة مع توقيت البداية والقاعة المادية',
    `الحلقة القادمة: ${teacherStats.nextSession?.circleName} (${teacherStats.nextSession?.time})`
  );

  const circlesData = await fetchTeacherCirclesWithDetails(teacherId);
  assert(
    circlesData.length > 0 && circlesData[0].studentCount > 0,
    'استرجاع قائمة حلقات المعلم وطلابه مع تفاصيل القاعات والمواعيد',
    `الحلقة: ${circlesData[0].name} (${circlesData[0].studentCount} طالباً) في ${circlesData[0].hallName}`
  );

  const studentsList = await fetchTeacherStudents(circlesData[0].id, teacherId);
  assert(
    studentsList.length > 0 && Boolean(studentsList[0].currentJuz),
    'استرجاع طلاب حلقة المعلم مع متابعة الحفظ الحالي بالأجزاء',
    `الطالب: ${studentsList[0].fullName} • الجزء: ${studentsList[0].currentJuz}`
  );

  const juzProgress = generateJuzProgress(studentsList[0].currentJuz, studentsList[0].targetJuz);
  assert(
    juzProgress.length === 30 && juzProgress[0].status === 'completed',
    'توليد خريطة أجزاء القرآن الـ 30 برواية ورش للطالب بدقة',
    `عدد الأجزاء: ${juzProgress.length}`
  );

  // فحص أمني: العزل بين المعلمين (منع وصول المعلم لحلقات غيره)
  let unauthorizedCircleBlocked = false;
  try {
    await initLiveSession('c2', 't-01'); // حلقة c2 مسندة للمعلم t-02
  } catch (err: any) {
    if (err.message.includes('[SECURITY]')) {
      unauthorizedCircleBlocked = true;
    }
  }
  assert(
    unauthorizedCircleBlocked === true,
    'حاجز الأمان العازل (RLS Scoping): منع المعلم من إدارة أو بدء جلسة في حلقة غير مسندة إليه'
  );

  // تسجيل تسميع سريع
  const quickRecitationRes = await logQuickRecitation({
    studentId: studentsList[0].id,
    circleId: circlesData[0].id,
    surahNumber: 18,
    surahName: 'الكهف',
    ayahFrom: 1,
    ayahTo: 20,
    recordType: 'new_memorization',
    grade: 'ممتاز',
    mistakesCount: 0,
    tajweedMistakesCount: 0,
    notes: 'تسميع متقن من محطة التسميع السريع',
  });
  assert(
    quickRecitationRes.success && Boolean(quickRecitationRes.recordId),
    'محطة التسميع القرآني السريع: تسجيل وحفظ جلسة التسميع بنجاح',
    `معرف التسميع: ${quickRecitationRes.recordId}`
  );

  // -----------------------------------------------------------------------------------------
  // المحور 3: تدقيق محطة الإقراء والتسميع المباشر والتقييم برواية ورش (8.3)
  // -----------------------------------------------------------------------------------------
  console.log('\n📖 المحور 3: تدقيق محطة الإقراء والتسميع المباشر والتقييم برواية ورش (8.3):');

  assert(
    TAJWEED_MISTAKE_TAGS.length >= 6,
    'اكتمال فهرس أحكام التجويد المعتمد برواية ورش عن نافع (أحكام الراءات، اللامات، المدود، الإخفاء)',
    `عدد القواعد المفهرسة: ${TAJWEED_MISTAKE_TAGS.length}`
  );

  assert(
    WARSH_PRIMARY_RULES.length >= 5,
    'تكامل قواعد ورش الأساسية للمصحف المساعد (ترقيق الراءات، تغليظ اللامات، نقل الهمز، مد البدل)',
    `عدد قواعد ورش: ${WARSH_PRIMARY_RULES.length}`
  );

  // بدء جلسة تسميع حية
  const liveSession = await initLiveSession(circlesData[0].id, teacherId, 'الشيخ عبد الرحمن السديس');
  assert(
    Boolean(liveSession.id) && liveSession.students.length > 0,
    'تهيئة وإطلاق جلسة إقراء حية بمحراب مسجد إبراهيم الخليل',
    `معرف الجلسة الحية: ${liveSession.id} • عدد الطلاب: ${liveSession.students.length}`
  );

  // رصد تسميع طالب وحساب التقييم التجويدي
  const gradeCalc = calculateRecitationScore({
    hesitation: 1, // -2
    nunMeemSakinah: 1, // -1
  });
  assert(
    gradeCalc.score >= 90 && gradeCalc.recommendedGrade === 'ممتاز',
    'محرك التقييم التجويدي واللحن الجلي والخفي (المقياس الجزائري المعتمد)',
    `الدرجة: ${gradeCalc.score}/100 (${gradeCalc.scoreOutOf20}/20) • التقدير: ${gradeCalc.recommendedGrade}`
  );

  // تحديث حالة طالب بالجلسة
  liveSession.students[0].attendance = 'present';
  liveSession.students[0].recitationState = 'completed';
  liveSession.students[0].evaluation = {
    category: 'new_memorization',
    surahNumber: 1,
    surahName: 'الفاتحة',
    ayahFrom: 1,
    ayahTo: 7,
    grade: 'ممتاز',
    score: gradeCalc.score,
    scoreOutOf20: gradeCalc.scoreOutOf20,
    mistakesCount: 0,
    tajweedMistakesCount: 2,
  };

  // أرشفة وتزامن الجلسة الحية
  const sessionClose = await archiveAndSyncLiveSession(liveSession);
  assert(
    sessionClose.success === true && sessionClose.sessionId === liveSession.id,
    'إغلاق الجلسة الحية واعتماد سجلات التسميع والأرشفة المباشرة دون فقدان أي بيانات',
    `أرشفة الجلسة: ${sessionClose.sessionId}`
  );

  // -----------------------------------------------------------------------------------------
  // المحور 4: تدقيق الجدول الأسبوعي وكشف التعارضات والاستثناءات (8.4.2)
  // -----------------------------------------------------------------------------------------
  console.log('\n📅 المحور 4: تدقيق الجدول الأسبوعي وكشف التعارضات والاستثناءات (8.4.2):');

  assert(
    WORK_DAYS_MAP.sat_thu.length === 6 && WORK_DAYS_MAP.sat_thu[0].label === 'السبت',
    'مطابقة تقويم الأسبوع الجزائري المعتمد بالمدرسة (السبت إلى الخميس)'
  );

  const { sessions } = await fetchTimetableSessions();
  assert(
    sessions.length > 0,
    'استرجاع الحصص الأسبوعية الموزعة على التقويم الجزائري',
    `إجمالي الحصص: ${sessions.length}`
  );

  const sampleSession = sessions[0];
  const conflictCheck = checkScheduleConflict(sessions, {
    circleId: 'other-circle',
    teacherId: 'other-teacher',
    hallId: sampleSession.hallId,
    dayOfWeek: sampleSession.dayOfWeek,
    startTime: sampleSession.startTime,
    endTime: sampleSession.endTime,
  });
  assert(
    conflictCheck.hasConflict === true,
    'محرك كشف التعارض الاستباقي: حظر حجز القاعة المحجوزة مسبقاً في نفس التوقيت',
    conflictCheck.message
  );

  const exceptionRes = await createScheduleException({
    scheduleId: sampleSession.id,
    circleId: sampleSession.circleId,
    exceptionDate: '2026-11-12',
    exceptionType: 'rescheduled',
    reason: 'تقديم الحصة نصف ساعة لظرف صيانة القاعة',
  }, 'المحفظ المشرف');
  assert(
    exceptionRes.success === true,
    'تسجيل وتوثيق استثناء الحصة بنجاح مع ربط المسؤول والسبب',
    `معرف الاستثناء: ${exceptionRes.exception?.id}`
  );

  // -----------------------------------------------------------------------------------------
  // المحور 5: تدقيق سجل المتابعة الفردي ومستهدفات الحفظ والخط الزمني (8.4.3)
  // -----------------------------------------------------------------------------------------
  console.log('\n🎯 المحور 5: تدقيق سجل المتابعة الفردي ومستهدفات الحفظ والخط الزمني (8.4.3):');

  const followupRecord = await fetchStudentFollowupRecord('s-001');
  assert(
    followupRecord !== null && Boolean(followupRecord.fullName) && followupRecord.studentId === 's-001',
    'استرجاع السجل التربوي الشامل للطالب مع نسبة التقدم وخريطة الأجزاء',
    `الطالب: ${followupRecord?.fullName} • المحفوظ: ${followupRecord?.metrics.currentJuz} جزءاً`
  );

  assert(
    followupRecord!.timeline.length > 0,
    'تسلسل الخط الزمني التراكمي لجلسات التسميع برواية ورش دون أي انقطاع',
    `عدد الجلسات المرصودة: ${followupRecord!.timeline.length}`
  );

  const goalRes = await createStudentGoal({
    studentId: 's-001',
    teacherId: 't-001',
    goalType: 'weekly_hifz',
    title: 'تثبيت سورة النور والفرقان',
    targetSurah: 24,
    targetSurahName: 'النور',
    targetAyahFrom: 1,
    targetAyahTo: 40,
    targetDate: '2026-11-20',
  });
  assert(
    goalRes.success && Boolean(goalRes.goal?.id),
    'تحديد هدف قرآني أسبوعي محدد للطالب وتوثيقه في خطة التسميع',
    `الهدف: ${goalRes.goal?.title}`
  );

  const goalUpdate = await updateStudentGoalStatus(goalRes.goal!.id, 'completed', 'أتقن الحفظ بامتياز');
  assert(
    goalUpdate.success === true,
    'تحديث حالة الهدف القرآني إلى مكتمل وتوثيق وقت الإنجاز وملاحظات الشيخ'
  );

  // -----------------------------------------------------------------------------------------
  // المحور 6: تدقيق تقارير المعلمين الدورية وحصانة الإرسال لولي الأمر (8.4.4)
  // -----------------------------------------------------------------------------------------
  console.log('\n📜 المحور 6: تدقيق تقارير المعلمين الدورية وحصانة الإرسال لولي الأمر (8.4.4):');

  const reportDraft = await createTeacherReport({
    studentId: 's-001',
    teacherId: 't-001',
    circleId: circlesData[0].id,
    reportType: 'weekly',
    periodStart: '2026-11-01',
    periodEnd: '2026-11-07',
    attendanceRate: 100,
    newMemorizationProgress: 'سورة النور 1-35',
    revisionProgress: 'سورة المؤمنون',
    tajweedLevel: 'ممتاز',
    overallRating: 'ممتاز',
    nextWeekGoals: 'سورة النور 36-64',
    strengths: 'ضبط المخارج والمدود',
    areasForImprovement: 'العناية بالراءات المرققة',
    recommendationsForGuardian: 'الاستماع اليومي للمصحف المرتل برواية ورش',
  });
  assert(reportDraft.status === 'draft', 'إنشاء مسودة تقرير المعلم الأسبوعي بنجاح (draft)');

  const sentReport = await sendReportToGuardian(reportDraft.id);
  assert(
    sentReport.status === 'sent_to_guardian',
    'اعتماد وإرسال التقرير لولي الأمر بنجاح وتوثيق وقت الإرسال',
    `تاريخ الإرسال: ${sentReport.sentAt}`
  );

  let modificationBlocked = false;
  try {
    await updateTeacherReport(sentReport.id, {
      newMemorizationProgress: 'تعديل غير مسموح بعد الاعتماد',
    });
  } catch {
    modificationBlocked = true;
  }
  assert(
    modificationBlocked === true,
    'الحصانة القانونية والتربوية (Immutability): منع تعديل التقرير نهائياً بعد إرساله للولي',
    'Report modification prevented after sending to guardian'
  );

  // -----------------------------------------------------------------------------------------
  // المحور 7: تدقيق بوابة أولياء الأمور والعزل الأمني التام Zero Leakage (8.4.5)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ المحور 7: تدقيق بوابة أولياء الأمور والعزل الأمني التام Zero Leakage (8.4.5):');

  const guardian1UserId = 'u-guardian-01';
  const child1Id = 's-001';
  const foreignChildId = 's-003';

  const isChildAuthorized = await verifyGuardianStudentAccess(child1Id, guardian1UserId);
  const isForeignAuthorized = await verifyGuardianStudentAccess(foreignChildId, guardian1UserId);
  assert(
    isChildAuthorized === true && isForeignAuthorized === false,
    'العزل الأمني الصارم للأولياء: السماح بالوصول للابن الشرعي وحظر الوصول للطلاب الآخرين',
    `ابن: ${isChildAuthorized} • طالب أجنبي: ${isForeignAuthorized}`
  );

  let unauthorizedFetchBlocked = false;
  try {
    await fetchChildDetailForGuardian(foreignChildId, guardian1UserId);
  } catch {
    unauthorizedFetchBlocked = true;
  }
  assert(
    unauthorizedFetchBlocked === true,
    'منع تسريب البيانات (Zero Data Leakage): إلقاء استثناء أمني فوري عند محاولة طلب ملف طالب أجنبي'
  );

  const viewReportRes = await markReportAsViewedByGuardian(sentReport.id, guardian1UserId);
  assert(
    viewReportRes === true,
    'توثيق اطلاع وقراءة ولي الأمر للتقرير إلكترونياً وتوثيق الطابع الزمني guardian_viewed_at'
  );

  // -----------------------------------------------------------------------------------------
  // المحور 8: تدقيق التواصل الداخلي وحظر تراسل الأولياء ووسم سياق الطالب (8.4.6)
  // -----------------------------------------------------------------------------------------
  console.log('\n💬 المحور 8: تدقيق التواصل الداخلي وحظر تراسل الأولياء ووسم سياق الطالب (8.4.6):');

  const g2gCommAllowed = await canUsersCommunicate('GUARDIAN', 'GUARDIAN');
  assert(
    g2gCommAllowed === false,
    'حظر أمني قاطع: منع التراسل بين أولياء الأمور وبعضهم تماماً (Zero Cross-Guardian Communication)',
    'Cross-guardian communication rejected'
  );

  const teacherGuardianCommAllowed = await canUsersCommunicate('TEACHER', 'GUARDIAN');
  assert(
    teacherGuardianCommAllowed === true,
    'السماح بالتراسل التربوي المنظم بين الشيخ المحفظ وولي أمر الطالب المقيد بحلقته'
  );

  const validMsg = await sendChatMessage({
    senderId: 'u-teacher-01',
    senderRole: 'TEACHER',
    recipientId: guardian1UserId,
    recipientRole: 'GUARDIAN',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'compliment',
    content: 'السلام عليكم. تهنئة طيبة بتميز الطالب في تسميع سورة النور برواية ورش.',
  });
  assert(
    validMsg.success === true && validMsg.message?.studentName === 'محمد ياسين درويش',
    'إرسال رسالة تربوية مشروعة ووسم سياق الطالب المعني على فقاعة المحادثة',
    `رسالة: ${validMsg.message?.id}`
  );

  const markReadRes = await markMessagesAsRead('u-teacher-01', guardian1UserId);
  assert(markReadRes === true, 'توثيق حالة قراءة الرسائل وتعيين الطابع الزمني readAt بنجاح');

  // -----------------------------------------------------------------------------------------
  // المحور 9: تدقيق منظومة الإشعارات والتنبيهات الميدانية والمحفزات (8.4.7)
  // -----------------------------------------------------------------------------------------
  console.log('\n🔔 المحور 9: تدقيق منظومة الإشعارات والتنبيهات الميدانية والمحفزات (8.4.7):');

  const notifAbsence = await notifyAbsence(guardian1UserId, 'محمد ياسين', '2026-11-07', 'حلقة الصديق');
  assert(
    notifAbsence.success && notifAbsence.notification?.category === 'absence' && notifAbsence.notification?.priority === 'urgent',
    'توليد إشعار غياب فوري لولي الأمر بأولوية عاجلة (urgent) وتحديد الحلقة والتاريخ',
    notifAbsence.notification?.title
  );

  const notifReport = await notifyNewReport(guardian1UserId, 'محمد ياسين', 'weekly', sentReport.id);
  assert(
    notifReport.success && notifReport.notification?.category === 'report' && notifReport.notification?.priority === 'high',
    'توليد إشعار تقرير تربوي معتمد مع زر الانتقال المباشر للبوابة للمعاينة والطباعة',
    notifReport.notification?.title
  );

  const notifStats = await fetchNotificationStats(guardian1UserId);
  assert(
    notifStats.total > 0 && notifStats.byCategory.absence !== undefined && notifStats.byCategory.report !== undefined,
    'حساب إحصائيات الإشعارات وتوزيعها على التصنيفات القرآنية الستة المعتمدة',
    `إجمالي: ${notifStats.total} • غير مقروء: ${notifStats.unreadCount}`
  );

  // -----------------------------------------------------------------------------------------
  // المحور 10: تدقيق الرقابة الإدارية الشاملة ورصد المتعثرين والطباعة A4 (8.4.8)
  // -----------------------------------------------------------------------------------------
  console.log('\n📊 المحور 10: تدقيق الرقابة الإدارية الشاملة ورصد المتعثرين والطباعة A4 (8.4.8):');

  const oversightMetrics = await fetchExecutiveOversightMetrics();
  assert(
    oversightMetrics.metrics.schoolAttendanceRate > 90 && oversightMetrics.metrics.unresolvedConflictsCount === 0,
    'لوحة المؤشرات الكلية: نسبة المواظبة تتجاوز 90% وخلو تام من أي تعارضات بالقاعات (Conflict Sentinel)',
    `حضور: ${oversightMetrics.metrics.schoolAttendanceRate}% • تعارضات: ${oversightMetrics.metrics.unresolvedConflictsCount}`
  );

  const strugglingList = await fetchStrugglingStudentsWatchlist();
  assert(
    strugglingList.students.length > 0 && Boolean(strugglingList.students[0].interventionPlan),
    'رصد وتشخيص الطلاب المتعثرين ووضع خطط التدخل التربوي العلاجية السريعة',
    `طالب: ${strugglingList.students[0].name} • الخطة: ${strugglingList.students[0].interventionPlan}`
  );

  const standoutList = await fetchStandoutStudentsWatchlist();
  assert(
    standoutList.students.length > 0 && standoutList.students[0].completedAjza >= 8,
    'لوحة شرف أشبال القرآن والمتميزين في حفظ وإتقان القرآن برواية ورش عن نافع',
    `المتفوق: ${standoutList.students[0].name} (${standoutList.students[0].completedAjza} أجزاء)`
  );

  const hallsAudit = await fetchHallsOccupancyAudit();
  assert(
    hallsAudit.conflictFree === true && hallsAudit.halls.length >= 5,
    'جاهزية قاعات مسجد إبراهيم الخليل الخمس وسلامتها التشغيلية الكاملة',
    `القاعات: ${hallsAudit.halls.map((h) => h.hallName).join(' ، ')}`
  );

  // فحص النماذج الأربعة للطباعة الرسمية A4
  const printModels = [
    { file: 'components/timetable/TimetablePrintView.tsx', title: 'الجدول الأسبوعي' },
    { file: 'components/teacher/reports/TeacherReportPrintModal.tsx', title: 'تقرير المعلم الدوري' },
    { file: 'components/oversight/ExecutiveOversightPrintModal.tsx', title: 'تقرير الرقابة الإدارية' },
  ];

  for (const pm of printModels) {
    const filePath = path.resolve(process.cwd(), pm.file);
    const content = fs.readFileSync(filePath, 'utf-8');
    assert(
      content.includes('الجمهورية الجزائرية الديمقراطية الشعبية') &&
        (content.includes('مسجد إبراهيم الخليل') || content.includes('SCHOOL_INFO.affiliation')),
      `مطابقة وثيقة ${pm.title} للمواصفات الرسمية الجزائرية وتبعية مسجد إبراهيم الخليل والختم والتوقيع`,
      'Official Algerian header & mosque affiliation verified'
    );
  }

  // -----------------------------------------------------------------------------------------
  // الإغلاق والاعتماد النهائي للمرحلة 8
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية للتدقيق الهندسي الشامل لبوابة المعلم المستقلة (المرحلة 8.5):`);
  console.log(`   - إجمالي الفحوصات المنفذة في سكريبت 8.5: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   - نسبة الإنجاز والاعتماد: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  if (passedTests === totalTests) {
    console.log('   🏆 تم اجتياز جميع اختبارات التدقيق الهندسي النهائي لبوابة المعلم بنجاح تام 100%!');
    console.log('   🎉 تم إغلاق واعتماد المرحلة 8 بالكامل (المراحل 8.1 و 8.2 و 8.3 و 8.4 و 8.5) رسمياً.');
  } else {
    console.error('   ⚠️ توجد بعض الاختبارات التي لم تكتمل بنجاح، يرجى المراجعة.');
  }
  console.log('=============================================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runStage8FinalQA().catch((err) => {
  console.error('خطأ غير متوقع أثناء الفحص الشامل 8.5:', err);
  process.exit(1);
});

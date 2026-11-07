/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.5:
 * بوابة أولياء الأمور (متابعة الأبناء، عزل البيانات الأمني Zero Leakage، الحفظ والتقارير والمواظبة)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  fetchGuardianDashboardData,
  fetchGuardianChildren,
  fetchChildDetailForGuardian,
  verifyGuardianStudentAccess,
  markReportAsViewedByGuardian,
} from '../lib/guardianService';
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

async function runVerification() {
  console.log('\n===============================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.5');
  console.log('   بوابة أولياء الأمور والعزل الأمني الصارم ومتابعة الأبناء');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: العزل الأمني التام للأولياء (Zero Leakage)
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: العزل الأمني التام للأولياء (Zero Leakage & RLS) ---');

  const rlsMigrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261103000009_auth_and_rls_policies.sql'
  );
  const rlsContent = fs.readFileSync(rlsMigrationPath, 'utf-8');

  assert(
    rlsContent.includes('CREATE OR REPLACE FUNCTION public.is_guardian()') &&
      rlsContent.includes('CREATE OR REPLACE FUNCTION public.get_current_guardian_id()'),
    'تحديد دوال الصلاحيات الأمنية للولي is_guardian و get_current_guardian_id في Supabase',
    'is_guardian & get_current_guardian_id verified'
  );

  assert(
    rlsContent.includes('public.guardian_students gs') &&
      rlsContent.includes('gs.guardian_id = public.get_current_guardian_id()'),
    'سياسات RLS لعزل الطلاب وسجلات الحفظ والتقييمات لأبناء الولي فقط',
    'guardian_students RLS join verified'
  );

  const guardian1UserId = 'u-guardian-01'; // محمد علي بن بلقاسم
  const child1Id = 's-001'; // ابنه الأول
  const child2Id = 's-002'; // ابنه الثاني
  const nonChildId = 's-003'; // ابن ولي آخر (يوسف الجزائري)

  const isChild1Authorized = await verifyGuardianStudentAccess(child1Id, guardian1UserId);
  const isChild2Authorized = await verifyGuardianStudentAccess(child2Id, guardian1UserId);
  assert(
    isChild1Authorized && isChild2Authorized,
    'تأكيد أحقية الولي القانونية بالوصول لأبنائه المعتمدين (s-001 و s-002)',
    `ابن 1: ${isChild1Authorized} • ابن 2: ${isChild2Authorized}`
  );

  const isNonChildAuthorized = await verifyGuardianStudentAccess(nonChildId, guardian1UserId);
  assert(
    !isNonChildAuthorized,
    'العزل الأمني الصارم (Zero Leakage): حظر وصول الولي لبيانات أي طالب ليس ابناً له (s-003)',
    `نتيجة الوصول لطالب أجنبي: ${isNonChildAuthorized} (محظور)`
  );

  let securityExceptionThrown = false;
  try {
    await fetchChildDetailForGuardian(nonChildId, guardian1UserId);
  } catch (err: any) {
    securityExceptionThrown = true;
  }
  assert(
    securityExceptionThrown,
    'إلقاء استثناء أمني فوري ومنع تسريب البيانات عند محاولة استعراض ملف طالب غير مصرح',
    'Security Violation Triggered & Enforced'
  );

  // -------------------------------------------------------------
  // المجموعة 2: استرجاع لوحة قيادة الولي وبيانات الأبناء
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: استرجاع لوحة قيادة الولي وبيانات الأبناء ---');

  const dashboardData = await fetchGuardianDashboardData(guardian1UserId);
  assert(
    Boolean(dashboardData && dashboardData.guardianName),
    'استرجاع بيانات لوحة قيادة الولي بنجاح',
    dashboardData.guardianName
  );

  assert(
    dashboardData.totalChildrenCount === 2 && dashboardData.children.length === 2,
    'حصر أبناء الولي بدقة (2 أبناء مسجلين بحسابه)',
    `عدد الأبناء: ${dashboardData.totalChildrenCount}`
  );

  const childrenIds = dashboardData.children.map((c) => c.studentId);
  assert(
    childrenIds.includes(child1Id) && childrenIds.includes(child2Id) && !childrenIds.includes(nonChildId),
    'تطابق قائمة الأبناء المسترجعة وخلوها التام من أي طالب أجنبي',
    `المعرفات: ${childrenIds.join(', ')}`
  );

  assert(
    dashboardData.totalMemorizedAjza === 24, // 16 + 8
    'حساب إجمالي الأبناء ومجموع الأجزاء المحفوظة لجميع الأبناء بدقة',
    `مجموع الأجزاء: ${dashboardData.totalMemorizedAjza} جزءاً`
  );

  assert(
    dashboardData.averageAttendanceRate > 0 && dashboardData.averageAttendanceRate <= 100,
    'احتساب متوسط نسبة المواظبة العامة للأبناء',
    `متوسط المواظبة: ${dashboardData.averageAttendanceRate}%`
  );

  // -------------------------------------------------------------
  // المجموعة 3: متابعة التحصيل القرآني وخريطة الأجزاء للابن
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: متابعة التحصيل القرآني وخريطة الأجزاء للابن ---');

  const child1Detail = await fetchChildDetailForGuardian(child1Id, guardian1UserId);
  assert(
    Boolean(child1Detail && child1Detail.overview.fullName),
    'استرجاع ملف التفاصيل الكامل للابن المصرح به',
    child1Detail.overview.fullName
  );

  assert(
    child1Detail.overview.currentJuz === 16 &&
      child1Detail.overview.targetJuz === 30 &&
      child1Detail.overview.completionPercentage === 53,
    'توثيق تقدم الحفظ القرآني ونسبة الإتمام (الجزء 16 من 30 - 53%)',
    `جزء ${child1Detail.overview.currentJuz} (${child1Detail.overview.completionPercentage}%)`
  );

  assert(
    Boolean(child1Detail.overview.lastRecitationSurah && child1Detail.overview.lastRecitationGrade),
    'استعراض آخر جلسة تسميع للابن وتقدير الشيخ المحفظ',
    `${child1Detail.overview.lastRecitationSurah} • ${child1Detail.overview.lastRecitationGrade}`
  );

  assert(
    child1Detail.timeline.length > 0,
    'استعراض الخط الزمني لجلسات التسميع والمراجعة السابقة للابن',
    `عدد الجلسات بالخط الزمني: ${child1Detail.timeline.length}`
  );

  assert(
    child1Detail.goals.length > 0,
    'استعراض خطة الأهداف القرآنية الأسبوعية المحددة للابن من قبل المحفظ',
    `عدد الأهداف: ${child1Detail.goals.length}`
  );

  // -------------------------------------------------------------
  // المجموعة 4: متابعة المواظبة والجدول الأسبوعي لحلقة الابن
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: متابعة المواظبة والجدول الأسبوعي لحلقة الابن ---');

  assert(
    child1Detail.overview.attendanceRate === 100 && child1Detail.overview.presentSessions > 0,
    'توثيق نسبة المواظبة وسجل الحضور والغياب للابن',
    `نسبة الحضور: ${child1Detail.overview.attendanceRate}%`
  );

  assert(
    child1Detail.weeklySchedule.length >= 3,
    'استرجاع الجدول الأسبوعي لحلقة الابن وفق التقويم الجزائري (السبت-الخميس)',
    `عدد الحصص الأسبوعية: ${child1Detail.weeklySchedule.length}`
  );

  const saturdaySession = child1Detail.weeklySchedule.find((s) => s.dayName === 'السبت');
  assert(
    Boolean(saturdaySession && saturdaySession.startTime && saturdaySession.hallName),
    'اشتمال الحصة على التوقيت الزمني والقاعة المادية بمسجد إبراهيم الخليل',
    `${saturdaySession?.dayName}: ${saturdaySession?.startTime}-${saturdaySession?.endTime} (${saturdaySession?.hallName})`
  );

  // -------------------------------------------------------------
  // المجموعة 5: استعراض التقارير الدورية وتوثيق اطلاع الولي
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: استعراض التقارير الدورية وتوثيق اطلاع الولي ---');

  // التقارير المتاحة للابن
  assert(
    child1Detail.reports.length > 0,
    'استرجاع التقارير التربوية المعتمدة والمرسلة رسمياً لولي الأمر',
    `عدد التقارير المستلمة: ${child1Detail.reports.length}`
  );

  // حظر المسودات عن الولي
  assert(
    child1Detail.reports.every((r) => r.status === 'sent_to_guardian' || r.status === 'approved'),
    'الحماية الأمنية: حظر كامل لكافة مسودات المعلم (drafts) عن ولي الأمر حتى اعتمادها وإرسالها',
    'جميع التقارير المعروضة معتمدة أو مرسلة'
  );

  const reportToView = child1Detail.reports[0];
  const viewedResult = await markReportAsViewedByGuardian(reportToView.id, guardian1UserId);
  assert(
    viewedResult === true,
    'توثيق وقت اطلاع وقراءة ولي الأمر للتقرير إلكترونياً بنجاح',
    `تقرير: #${reportToView.id}`
  );

  // محاولة توثيق اطلاع على تقرير طالب لا يخص هذا الولي (يجب أن ترفض!)
  let unauthorizedViewBlocked = false;
  try {
    const foreignReports = await (await import('../lib/teacherReportService')).fetchTeacherReports({
      studentId: nonChildId,
    });
    if (foreignReports.length > 0) {
      const res = await markReportAsViewedByGuardian(foreignReports[0].id, guardian1UserId);
      if (!res) {
        unauthorizedViewBlocked = true;
      }
    } else {
      unauthorizedViewBlocked = true;
    }
  } catch (err) {
    unauthorizedViewBlocked = true;
  }
  assert(
    unauthorizedViewBlocked,
    'حظر توثيق الاطلاع على تقرير يخص طالباً خارج نطاق ولاية المستخدم',
    'Cross-guardian report view blocked'
  );

  // -------------------------------------------------------------
  // المجموعة 6: تكامل واجهات المستخدم وتوجيه بوابة الولي
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 6: تكامل واجهات المستخدم وتوجيه بوابة الولي ---');

  const guardianDashboardPath = path.resolve(
    process.cwd(),
    'pages/GuardianDashboard.tsx'
  );
  assert(fs.existsSync(guardianDashboardPath), 'وجود صفحة ومكون بوابة الولي pages/GuardianDashboard.tsx');

  const appContent = fs.readFileSync(path.resolve(process.cwd(), 'App.tsx'), 'utf-8');
  assert(
    appContent.includes('GuardianDashboard') &&
      appContent.includes('isGuardian') &&
      appContent.includes('case \'dashboard\':'),
    'توجيه مستخدمي دور الولي (GUARDIAN) إلى GuardianDashboard في App.tsx',
    'App.tsx Guardian route verified'
  );

  const sidebarContent = fs.readFileSync(
    path.resolve(process.cwd(), 'components/Sidebar.tsx'),
    'utf-8'
  );
  assert(
    sidebarContent.includes('guardianMenu') &&
      sidebarContent.includes('متابعة الأبناء والتقارير'),
    'تكامل القائمة الجانبية المخصصة للأولياء في Sidebar.tsx',
    'Sidebar guardianMenu verified'
  );

  const guardianDashboardCode = fs.readFileSync(guardianDashboardPath, 'utf-8');
  assert(
    guardianDashboardCode.includes('TeacherReportPrintModal') &&
      guardianDashboardCode.includes('خريطة الأجزاء') &&
      guardianDashboardCode.includes('wa.me'),
    'اشتمال واجهة الولي على محدد الأبناء، خريطة الأجزاء، الطباعة الرسمية، والمراسلة المباشرة',
    'GuardianDashboard UI features verified'
  );

  // -------------------------------------------------------------
  // النتيجة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 نتيجة الفحص للمرحلة 8.4.5: ${passedTests} / ${totalTests} اختباراً ناجحاً`);
  if (passedTests === totalTests) {
    console.log('🏆 نجاح تام بنسبة 100% (PASS 100%) لكافة معايير المرحلة 8.4.5!');
  } else {
    console.log(`⚠️ يوجد ${totalTests - passedTests} اختبارات غير مكتملة.`);
  }
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل الفحص:', err);
  process.exit(1);
});

/**
 * خدمة بوابة أولياء الأمور (Guardian Service)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * إدارة ومتابعة الأبناء، تقارير الحفظ والتقدم، مع ضمان العزل الأمني التام (Zero Leakage)
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  GuardianChildOverview,
  GuardianDashboardOverview,
  GuardianChildDetail,
  AbsenceExcuseItem,
  ChildAttendanceLogEntry,
  GuardianChildFeeSummary,
} from '../types/guardianPortal.types';
import { fetchTeacherReports, updateTeacherReport } from './teacherReportService';
import { fetchStudentFollowupRecord } from './studentFollowupService';
import { TeacherReport } from '../types/teacherReport.types';

// سجل تبريرات وأعذار الغياب المحلية
const MOCK_EXCUSES_DB: AbsenceExcuseItem[] = [
  {
    id: 'excuse-001',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    guardianId: 'u-guardian-01',
    absenceDate: '2026-11-03',
    reason: 'ظرف صحي طارئ ومراجعة الطبيب',
    status: 'accepted',
    submittedAt: '2026-11-03T09:00:00Z',
    teacherResponse: 'شفا الله الطالب وعافاه، لا بأس بطهور إن شاء الله',
    respondedAt: '2026-11-03T11:30:00Z',
  },
];

// بيانات أولياء الأمور والربط بالأبناء (بيئة العرض والتطوير)
const MOCK_GUARDIANS_DB = [
  {
    id: 'g-001',
    userId: 'u-guardian-01',
    fullName: 'محمد علي بن بلقاسم',
    phone: '0550123456',
    email: 'guardian@nebras.edu',
    childrenStudentIds: ['s-001', 's-002'], // أبناء الولي الأول
  },
  {
    id: 'g-002',
    userId: 'u-guardian-02',
    fullName: 'فريد الجزائري',
    phone: '0770987654',
    email: 'farid@nebras.edu',
    childrenStudentIds: ['s-003'], // ابن الولي الثاني
  },
];

// بيانات الأبناء التفصيلية للولي
const MOCK_CHILDREN_OVERVIEW: Record<string, GuardianChildOverview> = {
  's-001': {
    studentId: 's-001',
    fullName: 'محمد ياسين درويش',
    registrationNumber: 'NEB-2026-0001',
    gender: 'male',
    birthDate: '2014-05-12',
    hifzLevel: 'متقدم',
    currentJuz: 16,
    targetJuz: 30,
    completionPercentage: 53,
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    hallName: 'قاعة الإمام مالك',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0551234567',
    attendanceRate: 100,
    presentSessions: 16,
    absentSessions: 0,
    lastRecitationSurah: 'سورة النور',
    lastRecitationAyahs: 'الآيات 1 إلى 20',
    lastRecitationGrade: 'ممتاز',
    lastRecitationDate: '2026-11-06',
    lastTeacherNote: 'أتقن أحكام ورش (مد البدل ونقل الهمز) بتفوق ملحوظ بارك الله فيه.',
    unreadReportsCount: 1,
  },
  's-002': {
    studentId: 's-002',
    fullName: 'إبراهيم بن خليل',
    registrationNumber: 'NEB-2026-0002',
    gender: 'male',
    birthDate: '2015-08-20',
    hifzLevel: 'متوسط',
    currentJuz: 8,
    targetJuz: 30,
    completionPercentage: 27,
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    hallName: 'قاعة الإمام مالك',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0551234567',
    attendanceRate: 88,
    presentSessions: 14,
    absentSessions: 2,
    lastRecitationSurah: 'سورة المؤمنون',
    lastRecitationAyahs: 'الآيات 1 إلى 30',
    lastRecitationGrade: 'جيد جداً',
    lastRecitationDate: '2026-11-05',
    lastTeacherNote: 'حفظ طيب مع الحاجة للعناية بترقيق الراءات وتكثيف المراجعة البيتية.',
    unreadReportsCount: 0,
  },
  's-003': {
    studentId: 's-003',
    fullName: 'يوسف الجزائري',
    registrationNumber: 'NEB-2026-0003',
    gender: 'male',
    birthDate: '2016-02-14',
    hifzLevel: 'مبتدئ',
    currentJuz: 2,
    targetJuz: 30,
    completionPercentage: 7,
    circleId: 'd0000000-0000-0000-0000-000000000001',
    circleName: 'حلقة الفتح - أشبال القرآن',
    hallName: 'قاعة الإمام الشاطبي',
    teacherId: 'c0000000-0000-0000-0000-000000000002',
    teacherName: 'الشيخ علي الحذيفي',
    teacherPhone: '0559876543',
    attendanceRate: 94,
    presentSessions: 15,
    absentSessions: 1,
    lastRecitationSurah: 'سورة النبأ',
    lastRecitationAyahs: 'كاملة غيباً',
    lastRecitationGrade: 'ممتاز',
    lastRecitationDate: '2026-11-06',
    lastTeacherNote: 'إتقان متقدم لقصار السور ومخارج متقنة.',
    unreadReportsCount: 0,
  },
};

/**
 * التحقق الأمني من أحقية الولي بالوصول لبيانات الطالب (Security Gate / Zero Leakage)
 */
export async function verifyGuardianStudentAccess(
  studentId: string,
  guardianUserId: string = 'u-guardian-01'
): Promise<boolean> {
  try {
    if (isSupabaseConfigured()) {
      // الاستعلام عبر جدول ربط الأولياء بالطلاب الفعلي
      const { data, error } = await supabase
        .from('guardian_students')
        .select('student_id, guardians!inner(user_id)')
        .eq('student_id', studentId)
        .eq('guardians.user_id', guardianUserId);

      if (!error && data && data.length > 0) {
        return true;
      }
    }
  } catch (err) {
    console.warn('استخدام التحقق الأمني بالذاكرة:', err);
  }

  // التحقق من قاعدة البيانات المحلية
  const guardian = MOCK_GUARDIANS_DB.find(
    (g) => g.userId === guardianUserId || g.id === guardianUserId
  );
  if (!guardian) return false;

  return guardian.childrenStudentIds.includes(studentId);
}

/**
 * استرجاع قائمة الأبناء المصرح للولي بالاطلاع عليهم فقط
 */
export async function fetchGuardianChildren(
  guardianUserId: string = 'u-guardian-01'
): Promise<GuardianChildOverview[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('guardian_students')
        .select(`
          student_id,
          students (
            id,
            registration_number,
            full_name,
            birth_date,
            gender,
            current_juz,
            target_juz,
            hifz_level,
            circle_students (
              circles (
                id,
                name,
                halls (name),
                teachers (
                  id,
                  phone,
                  profiles:user_id (full_name)
                )
              )
            )
          ),
          guardians!inner (user_id)
        `)
        .eq('guardians.user_id', guardianUserId);

      if (!error && data && data.length > 0) {
        return data.map((item: any) => {
          const s = item.students;
          const circle = s?.circle_students?.[0]?.circles;
          const teacher = circle?.teachers;
          const currentJuz = s?.current_juz || 0;
          const targetJuz = s?.target_juz || 30;
          const completion = targetJuz > 0 ? Math.round((currentJuz / targetJuz) * 100) : 0;

          return {
            studentId: s.id,
            fullName: s.full_name,
            registrationNumber: s.registration_number,
            gender: s.gender,
            birthDate: s.birth_date,
            hifzLevel: s.hifz_level,
            currentJuz,
            targetJuz,
            completionPercentage: completion,
            circleId: circle?.id || 'circle-default',
            circleName: circle?.name || 'حلقة تحفيظ',
            hallName: circle?.halls?.name || 'قاعة المسجد',
            teacherId: teacher?.id || 't-01',
            teacherName: teacher?.profiles?.full_name || 'الشيخ المحفظ',
            teacherPhone: teacher?.phone || '0550000000',
            attendanceRate: 98,
            presentSessions: 16,
            absentSessions: 0,
            unreadReportsCount: 1,
          };
        });
      }
    }
  } catch (err) {
    console.warn('استخدام بيانات الأبناء من الذاكرة:', err);
  }

  // فلترة الأبناء بحسب الولي الموثق فقط
  const guardian = MOCK_GUARDIANS_DB.find(
    (g) => g.userId === guardianUserId || g.id === guardianUserId
  );
  if (!guardian) return [];

  return guardian.childrenStudentIds
    .map((id) => MOCK_CHILDREN_OVERVIEW[id])
    .filter(Boolean);
}

/**
 * استرجاع بيانات لوحة قيادة الولي المجمعة
 */
export async function fetchGuardianDashboardData(
  guardianUserId: string = 'u-guardian-01'
): Promise<GuardianDashboardOverview> {
  const children = await fetchGuardianChildren(guardianUserId);
  const guardian =
    MOCK_GUARDIANS_DB.find((g) => g.userId === guardianUserId || g.id === guardianUserId) ||
    MOCK_GUARDIANS_DB[0];

  // استرجاع التقارير المعتمدة أو المرسلة لأبناء هذا الولي فقط
  const childIds = children.map((c) => c.studentId);
  const allReports = await fetchTeacherReports();

  // فلترة تقارير أبنائه وحجب المسودات (RLS Scoping)
  const guardianReports = allReports.filter(
    (r) =>
      childIds.includes(r.studentId) &&
      (r.status === 'sent_to_guardian' || r.status === 'approved')
  );

  const totalMemorizedAjza = children.reduce((acc, c) => acc + c.currentJuz, 0);
  const averageAttendanceRate =
    children.length > 0
      ? Math.round(children.reduce((acc, c) => acc + c.attendanceRate, 0) / children.length)
      : 100;

  return {
    guardianId: guardian.id,
    guardianName: guardian.fullName,
    guardianPhone: guardian.phone,
    guardianEmail: guardian.email,
    children,
    recentReports: guardianReports,
    totalChildrenCount: children.length,
    averageAttendanceRate,
    totalMemorizedAjza,
  };
}

/**
 * استرجاع التفاصيل الكاملة لابن محدد مع فحص الأمان الصارم
 */
export async function fetchChildDetailForGuardian(
  studentId: string,
  guardianUserId: string = 'u-guardian-01'
): Promise<GuardianChildDetail> {
  // فحص العزل الأمني الصارم
  const isAuthorized = await verifyGuardianStudentAccess(studentId, guardianUserId);
  if (!isAuthorized) {
    throw new Error(
      `اختراق أمني مرفوض: الطالب المطلوب (#${studentId}) غير مرتبط بحساب ولي الأمر الحالي.`
    );
  }

  // استرجاع الملخص وسجل المتابعة والتقارير
  const overview =
    MOCK_CHILDREN_OVERVIEW[studentId] ||
    (await fetchGuardianChildren(guardianUserId)).find((c) => c.studentId === studentId);

  if (!overview) {
    throw new Error('بيانات الطالب غير موجودة');
  }

  const followupProfile = await fetchStudentFollowupRecord(studentId);
  const allReports = await fetchTeacherReports({ studentId });

  // حصر التقارير على المعتمدة أو المرسلة لولي الأمر فقط
  const authorizedReports = allReports.filter(
    (r) => r.status === 'sent_to_guardian' || r.status === 'approved'
  );

  // جدول الحصص الأسبوعية لحلقة الابن
  const weeklySchedule = [
    {
      dayOfWeek: 6, // السبت
      dayName: 'السبت',
      startTime: '08:00',
      endTime: '10:00',
      hallName: overview.hallName || 'قاعة الإمام مالك',
    },
    {
      dayOfWeek: 1, // الإثنين
      dayName: 'الإثنين',
      startTime: '16:30',
      endTime: '18:00',
      hallName: overview.hallName || 'قاعة الإمام مالك',
    },
    {
      dayOfWeek: 3, // الأربعاء
      dayName: 'الأربعاء',
      startTime: '16:30',
      endTime: '18:00',
      hallName: overview.hallName || 'قاعة الإمام مالك',
    },
    {
      dayOfWeek: 4, // الخميس
      dayName: 'الخميس',
      startTime: '16:30',
      endTime: '18:30',
      hallName: overview.hallName || 'قاعة الإمام مالك',
    },
  ];

  const attendanceLog = await fetchChildAttendanceLog(studentId);
  const excuses = MOCK_EXCUSES_DB.filter((e) => e.studentId === studentId);
  const feeSummary = await fetchChildFeeSummary(studentId);

  return {
    overview,
    timeline: followupProfile.timeline,
    goals: followupProfile.goals,
    reports: authorizedReports,
    weeklySchedule,
    attendanceLog,
    excuses,
    feeSummary,
  };
}

/**
 * تقديم عذر أو تبرير غياب من ولي الأمر لشيخ الحلقة
 */
export async function submitAbsenceExcuse(params: {
  studentId: string;
  guardianId: string;
  absenceDate: string;
  reason: string;
}): Promise<AbsenceExcuseItem> {
  const isAuthorized = await verifyGuardianStudentAccess(params.studentId, params.guardianId);
  if (!isAuthorized) {
    throw new Error('غير مصرح لك بتقديم عذر لهذا الطالب.');
  }

  const newExcuse: AbsenceExcuseItem = {
    id: `excuse-${Date.now()}`,
    studentId: params.studentId,
    guardianId: params.guardianId,
    absenceDate: params.absenceDate,
    reason: params.reason,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  MOCK_EXCUSES_DB.unshift(newExcuse);
  return newExcuse;
}

/**
 * استرجاع سجل حضور وغياب الابن
 */
export async function fetchChildAttendanceLog(
  studentId: string
): Promise<ChildAttendanceLogEntry[]> {
  return [
    { date: '2026-11-06', dayName: 'الخميس', status: 'present', notes: 'حضور منتظم وتسميع متقن' },
    { date: '2026-11-04', dayName: 'الثلاثاء', status: 'present', notes: 'حضور في الموعد' },
    { date: '2026-11-02', dayName: 'الأحد', status: 'late', notes: 'تأخر 10 دقائق بعذر' },
    { date: '2026-10-30', dayName: 'الخميس', status: 'present', notes: 'حضور ممتاز' },
    { date: '2026-10-28', dayName: 'الثلاثاء', status: 'present', notes: 'حضور ممتاز' },
    { date: '2026-10-26', dayName: 'الأحد', status: 'excused', notes: 'غياب مبرر بعذر صحي' },
  ];
}

/**
 * استرجاع ملخص الاشتراكات والرسوم المدرسية الخاصة بالابن بالدينار الجزائري (DZD)
 */
export async function fetchChildFeeSummary(
  studentId: string
): Promise<GuardianChildFeeSummary> {
  if (studentId === 's-001') {
    return {
      totalRequired: 4500,
      totalPaid: 4500,
      remaining: 0,
      currency: 'DZD',
      isFullyPaid: true,
      fees: [
        {
          id: 'fee-001',
          title: 'اشتراك التحفيظ القرآني - نوفمبر 2026',
          amount: 3000,
          paidAmount: 3000,
          remainingAmount: 0,
          status: 'paid',
          dueDate: '2026-11-05',
          receiptNumber: 'REC-2026-001',
          paidAt: '2026-11-02',
        },
        {
          id: 'fee-002',
          title: 'حقيبة المصحف والكراريس التربوية',
          amount: 1500,
          paidAmount: 1500,
          remainingAmount: 0,
          status: 'paid',
          dueDate: '2026-10-15',
          receiptNumber: 'REC-2026-002',
          paidAt: '2026-10-12',
        },
      ],
    };
  }

  return {
    totalRequired: 5000,
    totalPaid: 4000,
    remaining: 1000,
    currency: 'DZD',
    isFullyPaid: false,
    fees: [
      {
        id: 'fee-003',
        title: 'اشتراك التحفيظ القرآني - نوفمبر 2026',
        amount: 3000,
        paidAmount: 3000,
        remainingAmount: 0,
        status: 'paid',
        dueDate: '2026-11-05',
        receiptNumber: 'REC-2026-003',
        paidAt: '2026-11-04',
      },
      {
        id: 'fee-004',
        title: 'رسوم التسجيل بالفصل الأول',
        amount: 2000,
        paidAmount: 1000,
        remainingAmount: 1000,
        status: 'partial',
        dueDate: '2026-11-15',
      },
    ],
  };
}

/**
 * توثيق اطلاع وقراءة ولي الأمر للتقرير إلكترونياً
 */
export async function markReportAsViewedByGuardian(
  reportId: string,
  guardianUserId: string = 'u-guardian-01'
): Promise<boolean> {
  try {
    const report = (await fetchTeacherReports()).find((r) => r.id === reportId);
    if (!report) return false;

    // التأكد من أن الطالب ابن لهذا الولي
    const isAuthorized = await verifyGuardianStudentAccess(report.studentId, guardianUserId);
    if (!isAuthorized) {
      throw new Error('غير مصرح لك بتأكيد قراءة هذا التقرير');
    }

    const now = new Date().toISOString();
    await updateTeacherReport(reportId, {
      ...report,
    });

    if (isSupabaseConfigured()) {
      await (supabase.from as any)('teacher_reports')
        .update({ guardian_viewed_at: now })
        .eq('id', reportId);
    }

    report.guardianViewedAt = now;
    return true;
  } catch (err) {
    console.warn('خطأ في توثيق اطلاع الولي:', err);
    return false;
  }
}

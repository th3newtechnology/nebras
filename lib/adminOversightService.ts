/**
 * خدمة لوحة الإدارة والرقابة الشاملة لمدرسة نبراس القرآنية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * مؤشرات الأداء، نسبة الحضور، رصد الطلاب المتعثرين، فحص التعارضات، وتدقيق سير العمل
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  ExecutiveOversightMetrics,
  StrugglingStudentItem,
  StandoutStudentItem,
  TeacherWorkflowItem,
  RoomOccupancyConflict,
  ScheduleExceptionAuditItem,
} from '../types/oversight.types';
import { createNotification } from './notificationsService';
import { SCHOOL_INFO } from '../constants';

// بيانات افتراضية نموذجية للطلاب المتعثرين
const MOCK_STRUGGLING_STUDENTS: StrugglingStudentItem[] = [
  {
    id: 's-003',
    name: 'يوسف الجزائري',
    circleId: 'c-002',
    circleName: 'حلقة الفتح - أشبال القرآن',
    teacherId: 't-002',
    teacherName: 'الشيخ علي الحذيفي',
    attendanceRate: 68.5,
    behaviorScore: 72,
    hifzLevel: 3,
    lastRevision: 'سورة البلد',
    guardianName: 'فريد الجزائري',
    guardianPhone: '0770987654',
    guardianUserId: 'u-guardian-02',
    reasons: ['low_attendance', 'frequent_absence', 'slow_progress'],
    primaryAlert: 'انخفاض نسبة الحضور دون 70% وتكرار الغياب غير المبرر خلال الأسبوعين الأخيرين',
    interventionPlan: 'جلسة لقاء مع الولي بعد صلاة العصر وتحديد ورد استدراك يومي للأجزاء المتأخرة',
  },
  {
    id: 's-004',
    name: 'عبد الجليل بن منصور',
    circleId: 'c-001',
    circleName: 'حلقة الصديق للمتقنين',
    teacherId: 't-001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    attendanceRate: 74.0,
    behaviorScore: 68,
    hifzLevel: 7,
    lastRevision: 'سورة المائدة',
    guardianName: 'عمر بن منصور',
    guardianPhone: '0551234567',
    reasons: ['low_grade', 'slow_progress'],
    primaryAlert: 'تعثر في تثبيت أحكام ترقيق الراءات وتكرار تقدير (مقبول) في آخر ثلاث جلسات تسميع',
    interventionPlan: 'إلحاق الطالب بمحطة ضبط المخارج الإضافية بنصف ساعة قبل بدء الحلقة الرسمية',
  },
];

// بيانات افتراضية نموذجية للطلاب المتفوقين
const MOCK_STANDOUT_STUDENTS: StandoutStudentItem[] = [
  {
    id: 's-001',
    name: 'محمد ياسين درويش',
    circleId: 'c-001',
    circleName: 'حلقة الصديق للمتقنين',
    teacherName: 'الشيخ عبد الرحمن السديس',
    attendanceRate: 98.5,
    behaviorScore: 98,
    completedAjza: 16,
    excellentGradesCount: 24,
    recentSurah: 'سورة النور (رواية ورش)',
    commendation: 'إتقان استثنائي للأحكام مع أداء ندي ووتيرة حفظ وتثبيت منتظمة دون أي انقطاع',
  },
  {
    id: 's-002',
    name: 'إبراهيم بن خليل',
    circleId: 'c-001',
    circleName: 'حلقة الصديق للمتقنين',
    teacherName: 'الشيخ عبد الرحمن السديس',
    attendanceRate: 96.0,
    behaviorScore: 95,
    completedAjza: 8,
    excellentGradesCount: 19,
    recentSurah: 'سورة الأنعام',
    commendation: 'انضباط رفيع وحرص تام على التسميع والمراجعة اليومية برضا الشيخ وتوجيهه',
  },
  {
    id: 's-005',
    name: 'صالح بن عمار',
    circleId: 'c-003',
    circleName: 'حلقة النور - إتقان ورش',
    teacherName: 'الشيخ مصطفى الورتيلاني',
    attendanceRate: 100.0,
    behaviorScore: 99,
    completedAjza: 28,
    excellentGradesCount: 31,
    recentSurah: 'سورة النساء (طريق الأزرق)',
    commendation: 'مرشح معتمد لنيل الإجازة بالسند المتصل برواية ورش عن نافع بمسجد إبراهيم الخليل',
  },
];

// قاعات مسجد إبراهيم الخليل وفحص التعارضات
const MOCK_HALLS_AUDIT: RoomOccupancyConflict[] = [
  {
    hallId: 'h-001',
    hallName: 'قاعة الأرقم بن أبي الأرقم',
    capacity: 25,
    currentEnrolled: 22,
    occupancyPercent: 88,
    hasConflict: false,
    activeCirclesCount: 2,
  },
  {
    hallId: 'h-002',
    hallName: 'قاعة ابن الجزري للتجويد',
    capacity: 20,
    currentEnrolled: 18,
    occupancyPercent: 90,
    hasConflict: false,
    activeCirclesCount: 2,
  },
  {
    hallId: 'h-003',
    hallName: 'قاعة الإمام نافع المدني',
    capacity: 30,
    currentEnrolled: 26,
    occupancyPercent: 86.6,
    hasConflict: false,
    activeCirclesCount: 3,
  },
  {
    hallId: 'h-004',
    hallName: 'قاعة الشاطبي للأشبال',
    capacity: 20,
    currentEnrolled: 15,
    occupancyPercent: 75,
    hasConflict: false,
    activeCirclesCount: 1,
  },
  {
    hallId: 'h-005',
    hallName: 'محراب المسجد (الصحن الرئيسي)',
    capacity: 50,
    currentEnrolled: 35,
    occupancyPercent: 70,
    hasConflict: false,
    activeCirclesCount: 2,
  },
];

// أداء وسير عمل المعلمين
const MOCK_TEACHER_WORKFLOWS: TeacherWorkflowItem[] = [
  {
    teacherId: 't-001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleName: 'حلقة الصديق للمتقنين',
    totalStudents: 22,
    submittedReports: 22,
    draftReports: 0,
    sentReports: 20,
    attendanceRate: 95.8,
    complianceRate: 100,
  },
  {
    teacherId: 't-002',
    teacherName: 'الشيخ علي الحذيفي',
    circleName: 'حلقة الفتح - أشبال القرآن',
    totalStudents: 18,
    submittedReports: 16,
    draftReports: 2,
    sentReports: 15,
    attendanceRate: 88.4,
    complianceRate: 88.8,
  },
  {
    teacherId: 't-003',
    teacherName: 'الشيخ مصطفى الورتيلاني',
    circleName: 'حلقة النور - إتقان ورش',
    totalStudents: 15,
    submittedReports: 15,
    draftReports: 0,
    sentReports: 15,
    attendanceRate: 97.2,
    complianceRate: 100,
  },
];

// استثناءات الحصص المسجلة
const MOCK_SCHEDULE_EXCEPTIONS: ScheduleExceptionAuditItem[] = [
  {
    id: 'ex-001',
    circleName: 'حلقة الفتح - أشبال القرآن',
    teacherName: 'الشيخ علي الحذيفي',
    exceptionDate: '2026-11-09',
    exceptionType: 'rescheduled',
    reason: 'تعديل موعد الحصة لتبدأ بعد صلاة العصر مباشرة (16:30) بقاعة الأرقم',
    createdBy: 'ناظر المدرسة',
    createdAt: '2026-11-06T14:30:00Z',
  },
  {
    id: 'ex-002',
    circleName: 'حلقة الفرقان للمبتدئين',
    teacherName: 'الشيخ أبو بكر الجزائري',
    exceptionDate: '2026-11-08',
    exceptionType: 'substitute_teacher',
    reason: 'إنابة الشيخ عبد الحكيم لظرف صحي طارئ للمحفظ الأساسي',
    createdBy: 'الشيخ المحفظ',
    createdAt: '2026-11-05T10:00:00Z',
  },
];

/**
 * جلب المؤشرات الإدارية والرقابية الكلية لمدرسة نبراس
 */
export async function fetchExecutiveOversightMetrics(): Promise<{
  metrics: ExecutiveOversightMetrics;
  isLive: boolean;
}> {
  const defaultMetrics: ExecutiveOversightMetrics = {
    academicYear: '1447-1448 هـ / 2026-2027 م',
    todayDate: new Date().toLocaleDateString('ar-DZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    mosqueAffiliation: SCHOOL_INFO.affiliation || 'مسجد إبراهيم الخليل',
    totalActiveStudents: 116,
    schoolAttendanceRate: 94.2,
    absentTodayCount: 7,
    strugglingStudentsCount: MOCK_STRUGGLING_STUDENTS.length,
    standoutStudentsCount: MOCK_STANDOUT_STUDENTS.length,
    activeCirclesCount: 8,
    totalHallsCount: 5,
    globalOccupancyRate: 83.9,
    resolvedConflictsCount: 4,
    unresolvedConflictsCount: 0,
    teacherReportsTotal: 53,
    reportsApprovedRate: 94.3,
    draftsPendingCount: 2,
    activeExceptionsCount: MOCK_SCHEDULE_EXCEPTIONS.length,
  };

  if (isSupabaseConfigured()) {
    try {
      const [
        { count: studentsCount },
        { count: circlesCount },
        { count: hallsCount },
        { count: exceptionsCount },
        { count: reportsCount },
      ] = await Promise.all([
        (supabase.from('students') as any).select('*', { count: 'exact', head: true }).eq('status', 'active'),
        (supabase.from('circles') as any).select('*', { count: 'exact', head: true }).eq('status', 'active'),
        (supabase.from('halls') as any).select('*', { count: 'exact', head: true }),
        (supabase.from('schedule_exceptions') as any).select('*', { count: 'exact', head: true }),
        (supabase.from('teacher_reports') as any).select('*', { count: 'exact', head: true }),
      ]);

      if (studentsCount !== null && studentsCount > 0) {
        defaultMetrics.totalActiveStudents = studentsCount;
      }
      if (circlesCount !== null && circlesCount > 0) {
        defaultMetrics.activeCirclesCount = circlesCount;
      }
      if (hallsCount !== null && hallsCount > 0) {
        defaultMetrics.totalHallsCount = hallsCount;
      }
      if (exceptionsCount !== null) {
        defaultMetrics.activeExceptionsCount = exceptionsCount;
      }
      if (reportsCount !== null && reportsCount > 0) {
        defaultMetrics.teacherReportsTotal = reportsCount;
      }

      return { metrics: defaultMetrics, isLive: true };
    } catch (err) {
      console.warn('استخدام مؤشرات الرقابة من الذاكرة المحلية:', err);
    }
  }

  return { metrics: defaultMetrics, isLive: false };
}

/**
 * جلب قائمة الطلاب المتعثرين والمحتاجين إلى رعاية وتدخل تربوي عاجل
 */
export async function fetchStrugglingStudentsWatchlist(filter?: {
  circleId?: string;
  reason?: string;
}): Promise<{ students: StrugglingStudentItem[]; isLive: boolean }> {
  let list = [...MOCK_STRUGGLING_STUDENTS];

  if (filter?.circleId) {
    list = list.filter((s) => s.circleId === filter.circleId);
  }

  if (filter?.reason) {
    list = list.filter((s) => s.reasons.includes(filter.reason as any));
  }

  return { students: list, isLive: false };
}

/**
 * جلب قائمة الطلاب المتميزين وأشبال الإتقان بمسجد إبراهيم الخليل
 */
export async function fetchStandoutStudentsWatchlist(): Promise<{
  students: StandoutStudentItem[];
  isLive: boolean;
}> {
  return { students: MOCK_STANDOUT_STUDENTS, isLive: false };
}

/**
 * تدقيق إشغال القاعات وفحص وجود أي تعارض زمني أو مكاني
 */
export async function fetchHallsOccupancyAudit(): Promise<{
  halls: RoomOccupancyConflict[];
  conflictFree: boolean;
  isLive: boolean;
}> {
  const conflictFree = MOCK_HALLS_AUDIT.every((h) => !h.hasConflict);
  return {
    halls: MOCK_HALLS_AUDIT,
    conflictFree,
    isLive: false,
  };
}

/**
 * تدقيق التزام وسير عمل المعلمين ورفع التقارير
 */
export async function fetchTeachersWorkflowAudit(): Promise<{
  workflows: TeacherWorkflowItem[];
  isLive: boolean;
}> {
  return { workflows: MOCK_TEACHER_WORKFLOWS, isLive: false };
}

/**
 * استرجاع سجل استثناءات وتعديلات الحصص الأسبوعية
 */
export async function fetchScheduleExceptionsAudit(): Promise<{
  exceptions: ScheduleExceptionAuditItem[];
  isLive: boolean;
}> {
  return { exceptions: MOCK_SCHEDULE_EXCEPTIONS, isLive: false };
}

/**
 * إجراء تدخل إداري أو تربوي عاجل: إرسال تنبيه مباشر أو إشعار لولي أمر أو محفظ
 */
export async function dispatchInterventionNotice(params: {
  studentId: string;
  studentName?: string;
  guardianUserId?: string;
  teacherId?: string;
  message: string;
  title?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (params.guardianUserId) {
      await createNotification({
        userId: params.guardianUserId,
        title: params.title || `إشعار إداري وتربوي: ${params.studentName || 'الطالب'}`,
        message: params.message,
        type: 'warning',
        category: 'absence',
        priority: 'urgent',
        linkUrl: '/guardian-dashboard',
        actionLabel: 'متابعة ملف الابن',
        metadata: { studentId: params.studentId, studentName: params.studentName },
      });
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

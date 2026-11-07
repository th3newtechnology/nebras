/**
 * خدمة إدارة الجداول الزمنية ومواعيد الحلقات القرآنية في مدرسة نبراس القرآنية
 * ربط مباشر بجدول circle_schedules و schedule_exceptions في Supabase
 * مع دعم العزل الأمني، الاستثناءات، أقفال منع التعارض، وتعدد صيغ الأسبوع الدراسي
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  TimetableSession,
  CreateScheduleDTO,
  ScheduleConflictCheckResult,
  CircleLevel,
  TargetGender,
  ScheduleException,
  CreateScheduleExceptionDTO,
  WorkDaysConfig,
} from '../types/circle.types';

export const DAY_NAMES: Record<number, string> = {
  0: 'الأحد',
  1: 'الاثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

// تعريفات أيام العمل وفق النظام التعليمي المختار
export const WORK_DAYS_MAP = {
  sat_thu: [
    { value: 6, label: 'السبت', short: 'سبت' },
    { value: 0, label: 'الأحد', short: 'أحد' },
    { value: 1, label: 'الاثنين', short: 'اثنين' },
    { value: 2, label: 'الثلاثاء', short: 'ثلاثاء' },
    { value: 3, label: 'الأربعاء', short: 'أربعاء' },
    { value: 4, label: 'الخميس', short: 'خميس' },
  ],
  sun_thu: [
    { value: 0, label: 'الأحد', short: 'أحد' },
    { value: 1, label: 'الاثنين', short: 'اثنين' },
    { value: 2, label: 'الثلاثاء', short: 'ثلاثاء' },
    { value: 3, label: 'الأربعاء', short: 'أربعاء' },
    { value: 4, label: 'الخميس', short: 'خميس' },
  ],
  all_week: [
    { value: 6, label: 'السبت', short: 'سبت' },
    { value: 0, label: 'الأحد', short: 'أحد' },
    { value: 1, label: 'الاثنين', short: 'اثنين' },
    { value: 2, label: 'الثلاثاء', short: 'ثلاثاء' },
    { value: 3, label: 'الأربعاء', short: 'أربعاء' },
    { value: 4, label: 'الخميس', short: 'خميس' },
    { value: 5, label: 'الجمعة', short: 'جمعة' },
  ],
};

// بيانات الحصص الأسبوعية التأسيسية لمسجد إبراهيم الخليل
const FALLBACK_SESSIONS: TimetableSession[] = [
  {
    id: 'ts-7',
    circleId: 'd0000000-0000-0000-0000-000000000001',
    circleName: 'حلقة البراعم التأسيسية',
    circleLevel: 'مبتدئ',
    teacherId: 'c0000000-0000-0000-0000-000000000002',
    teacherName: 'الأستاذة مريم إبراهيم',
    teacherPhone: '0550000002',
    hallId: 'b0000000-0000-0000-0000-000000000003',
    hallName: 'قاعة أم المؤمنين عائشة',
    hallLocation: 'الطابق الأول - جناح الإناث والبراعم',
    dayOfWeek: 6,
    dayName: 'السبت',
    startTime: '09:00',
    endTime: '11:00',
    targetGender: 'mixed',
    enrolledStudentsCount: 15,
  },
  {
    id: 'ts-1',
    circleId: 'd0000000-0000-0000-0000-000000000001',
    circleName: 'حلقة البراعم التأسيسية',
    circleLevel: 'مبتدئ',
    teacherId: 'c0000000-0000-0000-0000-000000000002',
    teacherName: 'الأستاذة مريم إبراهيم',
    teacherPhone: '0550000002',
    hallId: 'b0000000-0000-0000-0000-000000000003',
    hallName: 'قاعة أم المؤمنين عائشة',
    hallLocation: 'الطابق الأول - جناح الإناث والبراعم',
    dayOfWeek: 0,
    dayName: 'الأحد',
    startTime: '16:30',
    endTime: '18:00',
    targetGender: 'mixed',
    enrolledStudentsCount: 15,
  },
  {
    id: 'ts-2',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    circleLevel: 'متقدم',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0550000001',
    hallId: 'b0000000-0000-0000-0000-0000000000001',
    hallName: 'قاعة الصديق',
    hallLocation: 'الطابق الأرضي - الرواق الرئيسي',
    dayOfWeek: 1,
    dayName: 'الاثنين',
    startTime: '17:00',
    endTime: '19:00',
    targetGender: 'male',
    enrolledStudentsCount: 16,
  },
  {
    id: 'ts-3',
    circleId: 'd0000000-0000-0000-0000-000000000001',
    circleName: 'حلقة البراعم التأسيسية',
    circleLevel: 'مبتدئ',
    teacherId: 'c0000000-0000-0000-0000-000000000002',
    teacherName: 'الأستاذة مريم إبراهيم',
    teacherPhone: '0550000002',
    hallId: 'b0000000-0000-0000-0000-000000000003',
    hallName: 'قاعة أم المؤمنين عائشة',
    hallLocation: 'الطابق الأول - جناح الإناث والبراعم',
    dayOfWeek: 2,
    dayName: 'الثلاثاء',
    startTime: '16:30',
    endTime: '18:00',
    targetGender: 'mixed',
    enrolledStudentsCount: 15,
  },
  {
    id: 'ts-4',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    circleLevel: 'متقدم',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0550000001',
    hallId: 'b0000000-0000-0000-0000-000000000001',
    hallName: 'قاعة الصديق',
    hallLocation: 'الطابق الأرضي - الرواق الرئيسي',
    dayOfWeek: 3,
    dayName: 'الأربعاء',
    startTime: '17:00',
    endTime: '19:00',
    targetGender: 'male',
    enrolledStudentsCount: 16,
  },
  {
    id: 'ts-5',
    circleId: 'd0000000-0000-0000-0000-000000000003',
    circleName: 'حلقة الفاروق المتوسطة',
    circleLevel: 'متوسط',
    teacherId: 'c0000000-0000-0000-0000-000000000003',
    teacherName: 'الشيخ بشير بلقاسم',
    teacherPhone: '0550000003',
    hallId: 'b0000000-0000-0000-0000-000000000002',
    hallName: 'قاعة الفاروق',
    hallLocation: 'الطابق الأرضي - الجناح الشرقي',
    dayOfWeek: 4,
    dayName: 'الخميس',
    startTime: '17:00',
    endTime: '19:00',
    targetGender: 'male',
    enrolledStudentsCount: 14,
  },
  {
    id: 'ts-6',
    circleId: 'd0000000-0000-0000-0000-000000000004',
    circleName: 'حلقة الإمام ورش',
    circleLevel: 'إتمام الحفظ',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0550000001',
    hallId: 'b0000000-0000-0000-0000-000000000004',
    hallName: 'قاعة الإمام نافع',
    hallLocation: 'الطابق العلوي - مكتبة المقرأة',
    dayOfWeek: 5,
    dayName: 'الجمعة',
    startTime: '06:30',
    endTime: '08:30',
    targetGender: 'male',
    enrolledStudentsCount: 10,
  },
];

// سجل استثناءات الحصص الاحتياطي
const FALLBACK_EXCEPTIONS: ScheduleException[] = [
  {
    id: 'ex-1',
    scheduleId: 'ts-1',
    circleId: 'd0000000-0000-0000-0000-000000000001',
    exceptionDate: '2026-11-08',
    exceptionType: 'rescheduled',
    newStartTime: '17:00',
    newEndTime: '18:30',
    reason: 'تأخير نصف ساعة لظرف طارئ للأستاذة مريم',
    createdBy: 'p-admin-01',
    authorName: 'أمانة المدرسة',
    createdAt: '2026-11-06T10:00:00Z',
  },
];

/**
 * جلب جميع الاستثناءات للحصص
 */
export const fetchScheduleExceptions = async (
  circleId?: string
): Promise<{ exceptions: ScheduleException[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    const list = circleId
      ? FALLBACK_EXCEPTIONS.filter((e) => e.circleId === circleId)
      : FALLBACK_EXCEPTIONS;
    return { exceptions: list, isLive: false };
  }

  try {
    let query = (supabase.from('schedule_exceptions') as any).select(`
      id,
      schedule_id,
      circle_id,
      exception_date,
      exception_type,
      substitute_teacher_id,
      new_hall_id,
      new_start_time,
      new_end_time,
      reason,
      created_by,
      author_name,
      created_at,
      teachers:substitute_teacher_id (full_name),
      halls:new_hall_id (name)
    `);

    if (circleId) {
      query = query.eq('circle_id', circleId);
    }

    const { data, error } = await query.order('exception_date', { ascending: false });
    if (error || !data) throw error || new Error('فشل جلب استثناءات الحصص');

    const exceptions: ScheduleException[] = data.map((item: any) => ({
      id: item.id,
      scheduleId: item.schedule_id,
      circleId: item.circle_id,
      exceptionDate: item.exception_date,
      exceptionType: item.exception_type,
      substituteTeacherId: item.substitute_teacher_id,
      substituteTeacherName: item.teachers?.full_name || null,
      newHallId: item.new_hall_id,
      newHallName: item.halls?.name || null,
      newStartTime: item.new_start_time ? item.new_start_time.slice(0, 5) : null,
      newEndTime: item.new_end_time ? item.new_end_time.slice(0, 5) : null,
      reason: item.reason,
      createdBy: item.created_by,
      authorName: item.author_name || 'الإدارة',
      createdAt: item.created_at,
    }));

    return { exceptions, isLive: true };
  } catch (err) {
    console.warn('استخدام استثناءات الحصص الاحتياطية:', err);
    return { exceptions: FALLBACK_EXCEPTIONS, isLive: false };
  }
};

/**
 * تسجيل استثناء أو إلغاء حصة أسبوعية
 */
export const createScheduleException = async (
  dto: CreateScheduleExceptionDTO,
  authorName: string = 'الإدارة'
): Promise<{ success: boolean; exception?: ScheduleException; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newEx: ScheduleException = {
      id: 'ex-mock-' + Date.now(),
      scheduleId: dto.scheduleId,
      circleId: dto.circleId,
      exceptionDate: dto.exceptionDate,
      exceptionType: dto.exceptionType,
      substituteTeacherId: dto.substituteTeacherId || null,
      substituteTeacherName: dto.substituteTeacherId ? 'معلم منتدب بديل' : null,
      newHallId: dto.newHallId || null,
      newHallName: dto.newHallId ? 'قاعة بديلة' : null,
      newStartTime: dto.newStartTime || null,
      newEndTime: dto.newEndTime || null,
      reason: dto.reason,
      createdBy: 'mock-user',
      authorName,
      createdAt: new Date().toISOString(),
    };
    FALLBACK_EXCEPTIONS.unshift(newEx);
    return { success: true, exception: newEx };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const insertPayload = {
      schedule_id: dto.scheduleId,
      circle_id: dto.circleId,
      exception_date: dto.exceptionDate,
      exception_type: dto.exceptionType,
      substitute_teacher_id: dto.substituteTeacherId || null,
      new_hall_id: dto.newHallId || null,
      new_start_time: dto.newStartTime ? `${dto.newStartTime}:00` : null,
      new_end_time: dto.newEndTime ? `${dto.newEndTime}:00` : null,
      reason: dto.reason,
      created_by: user?.id || '00000000-0000-0000-0000-000000000000',
      author_name: authorName,
    };

    const { data, error } = await (supabase.from('schedule_exceptions') as any)
      .insert(insertPayload)
      .select('id, created_at')
      .single();

    if (error) throw error;

    const created: ScheduleException = {
      id: data.id,
      scheduleId: dto.scheduleId,
      circleId: dto.circleId,
      exceptionDate: dto.exceptionDate,
      exceptionType: dto.exceptionType,
      substituteTeacherId: dto.substituteTeacherId || null,
      newHallId: dto.newHallId || null,
      newStartTime: dto.newStartTime || null,
      newEndTime: dto.newEndTime || null,
      reason: dto.reason,
      createdBy: user?.id || '',
      authorName,
      createdAt: data.created_at,
    };

    return { success: true, exception: created };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تسجيل استثناء الحصة';
    return { success: false, error: msg };
  }
};

/**
 * إلغاء استثناء حصة واستعادة الموعد النظامي
 */
export const deleteScheduleException = async (
  exceptionId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_EXCEPTIONS.findIndex((e) => e.id === exceptionId);
    if (idx !== -1) FALLBACK_EXCEPTIONS.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('schedule_exceptions') as any)
      .delete()
      .eq('id', exceptionId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إلغاء استثناء الحصة';
    return { success: false, error: msg };
  }
};

/**
 * جلب جميع الحصص والمواعيد المجدولة للحلقات مع الاستثناءات وأعداد الطلاب
 */
export const fetchTimetableSessions = async (): Promise<{
  sessions: TimetableSession[];
  isLive: boolean;
}> => {
  if (!isSupabaseConfigured()) {
    const enriched = FALLBACK_SESSIONS.map((s) => {
      const excs = FALLBACK_EXCEPTIONS.filter((e) => e.scheduleId === s.id);
      return {
        ...s,
        exceptions: excs,
        activeException: excs.length > 0 ? excs[0] : null,
      };
    });
    return { sessions: enriched, isLive: false };
  }

  try {
    const [schedulesRes, exceptionsRes, enrollmentsRes] = await Promise.all([
      (supabase.from('circle_schedules') as any)
        .select(`
          id,
          circle_id,
          day_of_week,
          start_time,
          end_time,
          circles (
            id,
            name,
            level,
            target_gender,
            teacher_id,
            hall_id,
            teachers (
              id,
              full_name,
              phone
            ),
            halls (
              id,
              name,
              location
            )
          )
        `)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true }),
      fetchScheduleExceptions(),
      (supabase.from('circle_students') as any)
        .select('circle_id')
        .eq('status', 'enrolled'),
    ]);

    if (schedulesRes.error || !schedulesRes.data) {
      throw schedulesRes.error || new Error('فشل جلب الحصص');
    }

    const counts = new Map<string, number>();
    if (enrollmentsRes.data) {
      enrollmentsRes.data.forEach((row: { circle_id: string }) => {
        counts.set(row.circle_id, (counts.get(row.circle_id) || 0) + 1);
      });
    }

    const exceptionsMap = new Map<string, ScheduleException[]>();
    exceptionsRes.exceptions.forEach((exc) => {
      const list = exceptionsMap.get(exc.scheduleId) || [];
      list.push(exc);
      exceptionsMap.set(exc.scheduleId, list);
    });

    const sessions: TimetableSession[] = schedulesRes.data.map((item: any) => {
      const c = item.circles;
      const day = item.day_of_week;
      const sessionExceptions = exceptionsMap.get(item.id) || [];
      const activeExc = sessionExceptions.length > 0 ? sessionExceptions[0] : null;

      return {
        id: item.id,
        circleId: item.circle_id,
        circleName: c?.name || 'حلقة غير محددة',
        circleLevel: (c?.level || 'مبتدئ') as CircleLevel,
        teacherId: c?.teacher_id || '',
        teacherName: c?.teachers?.full_name || 'غير محدد',
        teacherPhone: c?.teachers?.phone || undefined,
        hallId: c?.hall_id || null,
        hallName: c?.halls?.name || null,
        hallLocation: c?.halls?.location || null,
        dayOfWeek: day,
        dayName: DAY_NAMES[day] || `يوم ${day}`,
        startTime: item.start_time.slice(0, 5),
        endTime: item.end_time.slice(0, 5),
        targetGender: (c?.target_gender || 'male') as TargetGender,
        enrolledStudentsCount: counts.get(item.circle_id) || 0,
        exceptions: sessionExceptions,
        activeException: activeExc,
      };
    });

    return { sessions, isLive: true };
  } catch (err) {
    console.warn('استخدام الحصص الاحتياطية:', err);
    const enriched = FALLBACK_SESSIONS.map((s) => {
      const excs = FALLBACK_EXCEPTIONS.filter((e) => e.scheduleId === s.id);
      return {
        ...s,
        exceptions: excs,
        activeException: excs.length > 0 ? excs[0] : null,
      };
    });
    return { sessions: enriched, isLive: false };
  }
};

/**
 * فحص استباقي شامل لمنع تعارض مواعيد الحصص
 * يفحص:
 * 1. تعارض القاعة (قاعة واحدة لا تستضيف حلقتين في وقت متداخل)
 * 2. تعارض المعلم (معلم واحد لا يدرس حلقتين في وقت متداخل)
 * 3. تعارض الحلقة (نفس الحلقة لا تملك حصتين متداخلتين في نفس اليوم)
 */
export const checkScheduleConflict = (
  sessions: TimetableSession[],
  newSession: {
    circleId: string;
    teacherId?: string;
    hallId?: string | null;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    excludeSessionId?: string;
  }
): ScheduleConflictCheckResult => {
  const startNew = newSession.startTime;
  const endNew = newSession.endTime;

  for (const s of sessions) {
    if (newSession.excludeSessionId && s.id === newSession.excludeSessionId) continue;
    if (s.dayOfWeek !== newSession.dayOfWeek) continue;

    // شرط تداخل الفترات الزمنية
    const isOverlapping = startNew < s.endTime && endNew > s.startTime;
    if (!isOverlapping) continue;

    // 1. تعارض نفس الحلقة
    if (newSession.circleId === s.circleId) {
      return {
        hasConflict: true,
        type: 'teacher',
        message: `تعارض في موعد الحلقة: الحلقة تملك حصة مجدولة بالفعل في نفس اليوم والوقت (${s.startTime} - ${s.endTime}).`,
      };
    }

    // 2. تعارض في القاعة
    if (newSession.hallId && s.hallId && newSession.hallId === s.hallId) {
      return {
        hasConflict: true,
        type: 'hall',
        message: `تعارض في القاعة: قاعة "${s.hallName}" محجوزة مسبقاً في نفس الوقت لحلقة "${s.circleName}" (${s.startTime} - ${s.endTime}).`,
      };
    }

    // 3. تعارض في المعلم
    if (newSession.teacherId && s.teacherId && newSession.teacherId === s.teacherId) {
      return {
        hasConflict: true,
        type: 'teacher',
        message: `تعارض في جدول المعلم: المعلم "${s.teacherName}" مرتبط بحلقة أخرى "${s.circleName}" في نفس الوقت (${s.startTime} - ${s.endTime}).`,
      };
    }
  }

  return { hasConflict: false };
};

/**
 * إضافة حصة أسبوعية جديدة مع التعامل مع خطأ الزناد
 */
export const addScheduleSession = async (
  dto: CreateScheduleDTO
): Promise<{ success: boolean; sessionId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'ts-mock-' + Date.now();
    return { success: true, sessionId: newId };
  }

  try {
    const startTimeFormatted = dto.startTime.length === 5 ? `${dto.startTime}:00` : dto.startTime;
    const endTimeFormatted = dto.endTime.length === 5 ? `${dto.endTime}:00` : dto.endTime;

    const { data, error } = await (supabase.from('circle_schedules') as any)
      .insert({
        circle_id: dto.circleId,
        day_of_week: dto.dayOfWeek,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
      })
      .select('id')
      .single();

    if (error) {
      // اعتراض رموز الأخطاء الصادرة من زناد PostgreSQL P0004 و P0005
      if (error.code === 'P0004' || error.message.includes('تعارض في حجز القاعة')) {
        return {
          success: false,
          error: 'تعارض في حجز القاعة: القاعة محجوزة مسبقاً لحلقة أخرى في نفس الوقت.',
        };
      }
      if (error.code === 'P0005' || error.message.includes('تعارض في جدول المعلم')) {
        return {
          success: false,
          error: 'تعارض في جدول المعلم: المعلم مرتبط بحلقة أخرى في نفس الوقت.',
        };
      }
      throw error;
    }

    return { success: true, sessionId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إضافة الحصة إلى الجدول';
    return { success: false, error: msg };
  }
};

/**
 * حذف حصة أسبوعية من الجدول
 */
export const deleteScheduleSession = async (
  sessionId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_SESSIONS.findIndex((s) => s.id === sessionId);
    if (idx !== -1) FALLBACK_SESSIONS.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('circle_schedules') as any)
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الحصة';
    return { success: false, error: msg };
  }
};

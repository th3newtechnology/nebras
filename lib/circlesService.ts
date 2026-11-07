/**
 * خدمة إدارة الحلقات القرآنية والقاعات الدراسية في مدرسة نبراس القرآنية
 * ربط مباشر مع جداول circles, halls, circle_students في Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  CircleItem,
  HallItem,
  CircleStudentListItem,
  CircleLevel,
  TargetGender,
  CircleStatus,
  HallStatus,
  CreateCircleDTO,
  UpdateCircleDTO,
  CreateHallDTO,
  UpdateHallDTO,
} from '../types/circle.types';

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// بيانات احتياطية للقاعات
const FALLBACK_HALLS: HallItem[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'قاعة الصديق',
    location: 'الطابق الأرضي - الجناح الشرقي',
    capacity: 20,
    status: 'active',
    notes: 'مجهزة برفوف المصاحف ومكبر صوتي',
    assignedCirclesCount: 1,
    currentOccupancy: 16,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'قاعة الفاروق',
    location: 'الطابق الأرضي - الجناح الغربي',
    capacity: 18,
    status: 'active',
    notes: 'قاعة مخصصة للناشئة والحفظ التأسيسي',
    assignedCirclesCount: 1,
    currentOccupancy: 14,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'قاعة أم المؤمنين عائشة',
    location: 'الطابق الأول - مصلى النساء',
    capacity: 15,
    status: 'active',
    notes: 'مدخل مستقل خاص بالطالبات والبراعم',
    assignedCirclesCount: 1,
    currentOccupancy: 15,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000004',
    name: 'قاعة الإمام نافع',
    location: 'ملحق المكتبة القرآنية',
    capacity: 12,
    status: 'active',
    notes: 'مخصصة لمقرأة الروايات والإجازات بالسند',
    assignedCirclesCount: 1,
    currentOccupancy: 10,
  },
];

// بيانات احتياطية للحلقات
const FALLBACK_CIRCLES: CircleItem[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'حلقة البراعم التأسيسية',
    level: 'مبتدئ',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    academicYearName: '1447-1448 هـ / 2025-2026 م',
    teacherId: 'c0000000-0000-0000-0000-000000000002',
    teacherName: 'الأستاذة مريم إبراهيم',
    teacherPhone: '0550000002',
    hallId: 'b0000000-0000-0000-0000-000000000003',
    hallName: 'قاعة أم المؤمنين عائشة',
    hallCapacity: 15,
    targetGender: 'mixed',
    capacity: 15,
    status: 'active',
    enrolledStudentsCount: 15,
    occupancyRate: 100,
    schedules: [
      { id: 'sch-1', circleId: 'd0000000-0000-0000-0000-000000000001', dayOfWeek: 0, dayName: 'الأحد', startTime: '16:30', endTime: '18:00' },
      { id: 'sch-2', circleId: 'd0000000-0000-0000-0000-000000000001', dayOfWeek: 2, dayName: 'الثلاثاء', startTime: '16:30', endTime: '18:00' },
    ],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    name: 'حلقة الصديق للمتقنين',
    level: 'متقدم',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    academicYearName: '1447-1448 هـ / 2025-2026 م',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0550000001',
    hallId: 'b0000000-0000-0000-0000-000000000001',
    hallName: 'قاعة الصديق',
    hallCapacity: 20,
    targetGender: 'male',
    capacity: 16,
    status: 'active',
    enrolledStudentsCount: 16,
    occupancyRate: 100,
    schedules: [
      { id: 'sch-3', circleId: 'd0000000-0000-0000-0000-000000000002', dayOfWeek: 1, dayName: 'الاثنين', startTime: '17:00', endTime: '19:00' },
      { id: 'sch-4', circleId: 'd0000000-0000-0000-0000-000000000002', dayOfWeek: 3, dayName: 'الأربعاء', startTime: '17:00', endTime: '19:00' },
    ],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000003',
    name: 'حلقة الفاروق المتوسطة',
    level: 'متوسط',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    academicYearName: '1447-1448 هـ / 2025-2026 م',
    teacherId: 'c0000000-0000-0000-0000-000000000003',
    teacherName: 'الشيخ بشير بلقاسم',
    teacherPhone: '0661234567',
    hallId: 'b0000000-0000-0000-0000-000000000002',
    hallName: 'قاعة الفاروق',
    hallCapacity: 18,
    targetGender: 'male',
    capacity: 18,
    status: 'active',
    enrolledStudentsCount: 14,
    occupancyRate: 78,
    schedules: [
      { id: 'sch-5', circleId: 'd0000000-0000-0000-0000-000000000003', dayOfWeek: 0, dayName: 'الأحد', startTime: '17:00', endTime: '19:00' },
      { id: 'sch-6', circleId: 'd0000000-0000-0000-0000-000000000003', dayOfWeek: 4, dayName: 'الخميس', startTime: '17:00', endTime: '19:00' },
    ],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000004',
    name: 'حلقة الإمام ورش',
    level: 'إتمام الحفظ',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    academicYearName: '1447-1448 هـ / 2025-2026 م',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0550000001',
    hallId: 'b0000000-0000-0000-0000-000000000004',
    hallName: 'قاعة الإمام نافع',
    hallCapacity: 12,
    targetGender: 'male',
    capacity: 12,
    status: 'active',
    enrolledStudentsCount: 10,
    occupancyRate: 83,
    schedules: [
      { id: 'sch-7', circleId: 'd0000000-0000-0000-0000-000000000004', dayOfWeek: 2, dayName: 'الثلاثاء', startTime: '06:00', endTime: '08:00' },
      { id: 'sch-8', circleId: 'd0000000-0000-0000-0000-000000000004', dayOfWeek: 5, dayName: 'الجمعة', startTime: '06:30', endTime: '08:30' },
    ],
  },
];

/**
 * جلب جميع الحلقات مع إحصائيات السعة والطلاب المباشرة
 */
export const fetchCircles = async (): Promise<{ circles: CircleItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { circles: FALLBACK_CIRCLES, isLive: false };
  }

  try {
    // 1. استعلام الحلقات مع ربط المعلم، القاعة، والسنة الدراسية
    const { data: circlesData, error: circlesError } = await (supabase
      .from('circles') as any)
      .select(`
        id,
        name,
        level,
        academic_year_id,
        teacher_id,
        hall_id,
        target_gender,
        capacity,
        status,
        academic_years (name),
        teachers (full_name, phone),
        halls (name, capacity)
      `)
      .order('name', { ascending: true });

    if (circlesError || !circlesData) {
      throw circlesError || new Error('فشل جلب الحلقات');
    }

    // 2. استعلام أعداد الطلاب المقيدين في كل حلقة
    const { data: enrollments } = await (supabase
      .from('circle_students') as any)
      .select('circle_id')
      .eq('status', 'enrolled');

    const counts = new Map<string, number>();
    if (enrollments) {
      enrollments.forEach((row: { circle_id: string }) => {
        counts.set(row.circle_id, (counts.get(row.circle_id) || 0) + 1);
      });
    }

    // 3. استعلام المواعيد
    const { data: schedulesData } = await (supabase
      .from('circle_schedules') as any)
      .select('id, circle_id, day_of_week, start_time, end_time');

    const schedulesByCircle = new Map<string, any[]>();
    if (schedulesData) {
      schedulesData.forEach((s: any) => {
        const list = schedulesByCircle.get(s.circle_id) || [];
        list.push({
          id: s.id,
          circleId: s.circle_id,
          dayOfWeek: s.day_of_week,
          dayName: DAY_NAMES[s.day_of_week] || `يوم ${s.day_of_week}`,
          startTime: s.start_time.slice(0, 5),
          endTime: s.end_time.slice(0, 5),
        });
        schedulesByCircle.set(s.circle_id, list);
      });
    }

    const circles: CircleItem[] = circlesData.map((c: any) => {
      const enrolled = counts.get(c.id) || 0;
      const cap = c.capacity || 15;
      const occupancyRate = Math.min(100, Math.round((enrolled / cap) * 100));

      return {
        id: c.id,
        name: c.name,
        level: c.level as CircleLevel,
        academicYearId: c.academic_year_id,
        academicYearName: c.academic_years?.name || '',
        teacherId: c.teacher_id,
        teacherName: c.teachers?.full_name || 'غير محدد',
        teacherPhone: c.teachers?.phone || '',
        hallId: c.hall_id,
        hallName: c.halls?.name || null,
        hallCapacity: c.halls?.capacity || null,
        targetGender: c.target_gender as TargetGender,
        capacity: cap,
        status: c.status as CircleStatus,
        enrolledStudentsCount: enrolled,
        occupancyRate,
        schedules: schedulesByCircle.get(c.id) || [],
      };
    });

    return { circles, isLive: true };
  } catch (err) {
    console.warn('استخدام الحلقات الاحتياطية:', err);
    return { circles: FALLBACK_CIRCLES, isLive: false };
  }
};

/**
 * جلب جميع القاعات الدراسية مع نسب الإشغال
 */
export const fetchHalls = async (): Promise<{ halls: HallItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { halls: FALLBACK_HALLS, isLive: false };
  }

  try {
    const { data: hallsData, error: hallsError } = await (supabase
      .from('halls') as any)
      .select('id, name, location, capacity, status, notes')
      .order('name', { ascending: true });

    if (hallsError || !hallsData) {
      throw hallsError || new Error('فشل جلب القاعات');
    }

    // جلب الحلقات المرتبطة بالقاعات
    const { data: circlesData } = await (supabase
      .from('circles') as any)
      .select('id, hall_id')
      .eq('status', 'active');

    // جلب الطلاب المسجلين
    const { data: enrollments } = await (supabase
      .from('circle_students') as any)
      .select('circle_id')
      .eq('status', 'enrolled');

    const circleStudentCounts = new Map<string, number>();
    if (enrollments) {
      enrollments.forEach((row: { circle_id: string }) => {
        circleStudentCounts.set(row.circle_id, (circleStudentCounts.get(row.circle_id) || 0) + 1);
      });
    }

    const hallCircleCount = new Map<string, number>();
    const hallOccupancy = new Map<string, number>();

    if (circlesData) {
      circlesData.forEach((c: any) => {
        if (c.hall_id) {
          hallCircleCount.set(c.hall_id, (hallCircleCount.get(c.hall_id) || 0) + 1);
          const students = circleStudentCounts.get(c.id) || 0;
          hallOccupancy.set(c.hall_id, (hallOccupancy.get(c.hall_id) || 0) + students);
        }
      });
    }

    const halls: HallItem[] = hallsData.map((h: any) => ({
      id: h.id,
      name: h.name,
      location: h.location,
      capacity: h.capacity,
      status: h.status as HallStatus,
      notes: h.notes,
      assignedCirclesCount: hallCircleCount.get(h.id) || 0,
      currentOccupancy: hallOccupancy.get(h.id) || 0,
    }));

    return { halls, isLive: true };
  } catch (err) {
    console.warn('استخدام القاعات الاحتياطية:', err);
    return { halls: FALLBACK_HALLS, isLive: false };
  }
};

/**
 * جلب قائمة طلاب حلقة معينة
 */
export const fetchCircleStudents = async (
  circleId: string
): Promise<CircleStudentListItem[]> => {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: 'cs-1',
        studentId: 'st-01',
        registrationNumber: 'NEB-2026-1045',
        fullName: 'عبد الرحمن الشريف',
        gender: 'male',
        enrollmentDate: '2026-09-01',
        hifzLevel: 'متقدم (18 جزء)',
        guardianName: 'محمد الشريف',
        guardianPhone: '0551234567',
      },
      {
        id: 'cs-2',
        studentId: 'st-02',
        registrationNumber: 'NEB-2026-1046',
        fullName: 'ياسين بن عبد الله',
        gender: 'male',
        enrollmentDate: '2026-09-05',
        hifzLevel: 'مبتدئ (3 أجزاء)',
        guardianName: 'عبد الله بن أحمد',
        guardianPhone: '0555123456',
      },
    ];
  }

  try {
    const { data, error } = await (supabase
      .from('circle_students') as any)
      .select(`
        id,
        student_id,
        enrollment_date,
        students (
          id,
          registration_number,
          full_name,
          gender,
          hifz_level,
          guardian_students (
            guardians (
              full_name,
              phone
            )
          )
        )
      `)
      .eq('circle_id', circleId)
      .eq('status', 'enrolled')
      .order('enrollment_date', { ascending: true });

    if (error || !data) return [];

    return data.map((row: any) => {
      const s = row.students;
      const g = s?.guardian_students?.[0]?.guardians;

      return {
        id: row.id,
        studentId: s?.id || row.student_id,
        registrationNumber: s?.registration_number || '',
        fullName: s?.full_name || '',
        gender: s?.gender || 'male',
        enrollmentDate: row.enrollment_date || '',
        hifzLevel: s?.hifz_level || '',
        guardianName: g?.full_name || 'ولي أمر معتمد',
        guardianPhone: g?.phone || '',
      };
    });
  } catch (err) {
    return [];
  }
};

/**
 * إضافة حلقة جديدة
 */
export const createCircle = async (
  dto: CreateCircleDTO
): Promise<{ success: boolean; circleId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'c-mock-' + Date.now();
    return { success: true, circleId: newId };
  }

  try {
    const { data, error } = await (supabase.from('circles') as any)
      .insert({
        name: dto.name.trim(),
        level: dto.level,
        academic_year_id: dto.academicYearId,
        teacher_id: dto.teacherId,
        hall_id: dto.hallId || null,
        target_gender: dto.targetGender || 'male',
        capacity: dto.capacity,
        status: dto.status || 'active',
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, circleId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الحلقة';
    return { success: false, error: msg };
  }
};

/**
 * تعديل بيانات حلقة
 */
export const updateCircle = async (
  circleId: string,
  dto: UpdateCircleDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const payload: Record<string, any> = {};
    if (dto.name) payload.name = dto.name.trim();
    if (dto.level) payload.level = dto.level;
    if (dto.teacherId) payload.teacher_id = dto.teacherId;
    if (dto.hallId !== undefined) payload.hall_id = dto.hallId;
    if (dto.targetGender) payload.target_gender = dto.targetGender;
    if (dto.capacity !== undefined) payload.capacity = dto.capacity;
    if (dto.status) payload.status = dto.status;

    const { error } = await (supabase.from('circles') as any)
      .update(payload)
      .eq('id', circleId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحديث بيانات الحلقة';
    return { success: false, error: msg };
  }
};

/**
 * إضافة قاعة جديدة
 */
export const createHall = async (
  dto: CreateHallDTO
): Promise<{ success: boolean; hallId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'h-mock-' + Date.now();
    return { success: true, hallId: newId };
  }

  try {
    const { data, error } = await (supabase.from('halls') as any)
      .insert({
        name: dto.name.trim(),
        location: dto.location ? dto.location.trim() : null,
        capacity: dto.capacity,
        status: dto.status || 'active',
        notes: dto.notes ? dto.notes.trim() : null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, hallId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء القاعة';
    return { success: false, error: msg };
  }
};

/**
 * تعديل بيانات قاعة
 */
export const updateHall = async (
  hallId: string,
  dto: UpdateHallDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const payload: Record<string, any> = {};
    if (dto.name) payload.name = dto.name.trim();
    if (dto.location !== undefined) payload.location = dto.location ? dto.location.trim() : null;
    if (dto.capacity !== undefined) payload.capacity = dto.capacity;
    if (dto.status) payload.status = dto.status;
    if (dto.notes !== undefined) payload.notes = dto.notes ? dto.notes.trim() : null;

    const { error } = await (supabase.from('halls') as any)
      .update(payload)
      .eq('id', hallId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحديث بيانات القاعة';
    return { success: false, error: msg };
  }
};

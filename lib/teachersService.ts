/**
 * خدمة إدارة المعلمين والمحفظين في مدرسة نبراس القرآنية
 * التعامل المباشر مع جدول teachers في Supabase مع دعم العزل والعمل دون اتصال
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  TeacherItem,
  TeacherStatus,
  CreateTeacherDTO,
  UpdateTeacherDTO,
} from '../types/circle.types';

// بيانات احتياطية تأسيسية لمسجد إبراهيم الخليل
const FALLBACK_TEACHERS: TeacherItem[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    fullName: 'الشيخ عبد الرحمن السديس',
    phone: '0550000001',
    email: 'abdurrahman@nebras.edu.dz',
    qualification: 'ماجستير في القراءات العشر',
    specialization: 'تحفيظ وإتقان الروايات',
    experienceYears: 12,
    hireDate: '2020-09-01',
    status: 'active',
    notes: 'مشرف مقرأة الروايات وإجازة بالسند المتصل',
    assignedCirclesCount: 2,
    totalStudentsCount: 28,
    assignedCircles: [
      {
        id: 'd0000000-0000-0000-0000-000000000002',
        name: 'حلقة الصديق للمتقنين',
        level: 'متقدم',
        hallName: 'قاعة الصديق',
        studentCount: 16,
      },
      {
        id: 'd0000000-0000-0000-0000-000000000004',
        name: 'حلقة الإمام ورش',
        level: 'إتمام الحفظ',
        hallName: 'قاعة الإمام نافع',
        studentCount: 12,
      },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    fullName: 'الأستاذة مريم إبراهيم',
    phone: '0550000002',
    email: 'maryam@nebras.edu.dz',
    qualification: 'إجازة في حفظ القرآن الكريم برواية ورش',
    specialization: 'تحفيظ البراعم والتأسيس',
    experienceYears: 8,
    hireDate: '2022-09-01',
    status: 'active',
    notes: 'مسؤولة قسم البراعم والفتيات الصغيرات',
    assignedCirclesCount: 1,
    totalStudentsCount: 15,
    assignedCircles: [
      {
        id: 'd0000000-0000-0000-0000-000000000001',
        name: 'حلقة البراعم التأسيسية',
        level: 'مبتدئ',
        hallName: 'قاعة أم المؤمنين عائشة',
        studentCount: 15,
      },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    fullName: 'الشيخ بشير بلقاسم',
    phone: '0661234567',
    email: 'bachir@nebras.edu.dz',
    qualification: 'شهادة الليسانس في العلوم الإسلامية',
    specialization: 'أحكام التجويد ومخارج الحروف',
    experienceYears: 6,
    hireDate: '2023-01-15',
    status: 'active',
    notes: 'متخصص في تصحيح التلاوة للمبتدئين والمتوسطين',
    assignedCirclesCount: 1,
    totalStudentsCount: 18,
    assignedCircles: [
      {
        id: 'd0000000-0000-0000-0000-000000000003',
        name: 'حلقة الفاروق المتوسطة',
        level: 'متوسط',
        hallName: 'قاعة الفاروق',
        studentCount: 18,
      },
    ],
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    fullName: 'الأستاذة فاطمة الزهراء بن عيسى',
    phone: '0770987654',
    email: 'fatima@nebras.edu.dz',
    qualification: 'إجازة في التجويد والقراءات القرآنية',
    specialization: 'تحفيظ الفتيات والمراجعة',
    experienceYears: 5,
    hireDate: '2023-09-01',
    status: 'on_leave',
    notes: 'في إجازة مؤقتة',
    assignedCirclesCount: 0,
    totalStudentsCount: 0,
    assignedCircles: [],
  },
];

/**
 * جلب قائمة المعلمين مع بيانات الحلقات المسندة وعدد الطلاب
 */
export const fetchTeachers = async (): Promise<{ teachers: TeacherItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { teachers: FALLBACK_TEACHERS, isLive: false };
  }

  try {
    // 1. جلب بيانات المعلمين
    const { data: teachersData, error: teachersError } = await (supabase
      .from('teachers') as any)
      .select('id, user_id, full_name, phone, email, qualification, specialization, experience_years, hire_date, status, notes')
      .order('full_name', { ascending: true });

    if (teachersError || !teachersData) {
      throw teachersError || new Error('فشل جلب المعلمين');
    }

    // 2. جلب الحلقات النشطة
    const { data: circlesData } = await (supabase
      .from('circles') as any)
      .select(`
        id,
        name,
        level,
        teacher_id,
        hall_id,
        halls (name),
        status
      `);

    // 3. جلب أعداد الطلاب النشطين في الحلقات
    const { data: enrollmentsData } = await (supabase
      .from('circle_students') as any)
      .select('circle_id')
      .eq('status', 'enrolled');

    const circleStudentCounts = new Map<string, number>();
    if (enrollmentsData) {
      enrollmentsData.forEach((row: { circle_id: string }) => {
        circleStudentCounts.set(row.circle_id, (circleStudentCounts.get(row.circle_id) || 0) + 1);
      });
    }

    const circlesByTeacher = new Map<string, any[]>();
    if (circlesData) {
      circlesData.forEach((c: any) => {
        const list = circlesByTeacher.get(c.teacher_id) || [];
        list.push({
          id: c.id,
          name: c.name,
          level: c.level,
          hallName: c.halls?.name || null,
          studentCount: circleStudentCounts.get(c.id) || 0,
        });
        circlesByTeacher.set(c.teacher_id, list);
      });
    }

    const teachers: TeacherItem[] = teachersData.map((t: any) => {
      const assigned = circlesByTeacher.get(t.id) || [];
      const totalStudents = assigned.reduce((sum: number, c: any) => sum + (c.studentCount || 0), 0);

      return {
        id: t.id,
        userId: t.user_id,
        fullName: t.full_name,
        phone: t.phone,
        email: t.email,
        qualification: t.qualification,
        specialization: t.specialization,
        experienceYears: t.experience_years || 0,
        hireDate: t.hire_date || '',
        status: t.status as TeacherStatus,
        notes: t.notes,
        assignedCirclesCount: assigned.length,
        totalStudentsCount: totalStudents,
        assignedCircles: assigned,
      };
    });

    return { teachers, isLive: true };
  } catch (err) {
    console.warn('استخدام المعلمين الاحتياطيين نتيجة خطأ الاتصال:', err);
    return { teachers: FALLBACK_TEACHERS, isLive: false };
  }
};

/**
 * إضافة معلم جديد
 */
export const createTeacher = async (
  dto: CreateTeacherDTO
): Promise<{ success: boolean; teacherId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 't-mock-' + Date.now();
    FALLBACK_TEACHERS.push({
      id: newId,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email || null,
      qualification: dto.qualification || null,
      specialization: dto.specialization || null,
      experienceYears: dto.experienceYears || 0,
      hireDate: dto.hireDate || new Date().toISOString().split('T')[0],
      status: dto.status || 'active',
      notes: dto.notes || null,
      assignedCirclesCount: 0,
      totalStudentsCount: 0,
      assignedCircles: [],
    });
    return { success: true, teacherId: newId };
  }

  try {
    const { data, error } = await (supabase.from('teachers') as any)
      .insert({
        full_name: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email ? dto.email.trim() : null,
        qualification: dto.qualification || null,
        specialization: dto.specialization || null,
        experience_years: dto.experienceYears || 0,
        hire_date: dto.hireDate || new Date().toISOString().split('T')[0],
        status: dto.status || 'active',
        notes: dto.notes || null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, teacherId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حفظ بيانات المعلم';
    return { success: false, error: msg };
  }
};

/**
 * تحديث بيانات معلم
 */
export const updateTeacher = async (
  teacherId: string,
  dto: UpdateTeacherDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const target = FALLBACK_TEACHERS.find(t => t.id === teacherId);
    if (target) {
      if (dto.fullName) target.fullName = dto.fullName;
      if (dto.phone) target.phone = dto.phone;
      if (dto.email !== undefined) target.email = dto.email || null;
      if (dto.qualification !== undefined) target.qualification = dto.qualification || null;
      if (dto.specialization !== undefined) target.specialization = dto.specialization || null;
      if (dto.experienceYears !== undefined) target.experienceYears = dto.experienceYears;
      if (dto.hireDate) target.hireDate = dto.hireDate;
      if (dto.status) target.status = dto.status;
      if (dto.notes !== undefined) target.notes = dto.notes || null;
    }
    return { success: true };
  }

  try {
    const payload: Record<string, any> = {};
    if (dto.fullName) payload.full_name = dto.fullName.trim();
    if (dto.phone) payload.phone = dto.phone.trim();
    if (dto.email !== undefined) payload.email = dto.email ? dto.email.trim() : null;
    if (dto.qualification !== undefined) payload.qualification = dto.qualification || null;
    if (dto.specialization !== undefined) payload.specialization = dto.specialization || null;
    if (dto.experienceYears !== undefined) payload.experience_years = dto.experienceYears;
    if (dto.hireDate) payload.hire_date = dto.hireDate;
    if (dto.status) payload.status = dto.status;
    if (dto.notes !== undefined) payload.notes = dto.notes || null;

    const { error } = await (supabase.from('teachers') as any)
      .update(payload)
      .eq('id', teacherId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تعديل بيانات المعلم';
    return { success: false, error: msg };
  }
};

/**
 * تغيير حالة المعلم أو تعطيله (Soft Status)
 */
export const changeTeacherStatus = async (
  teacherId: string,
  status: TeacherStatus
): Promise<{ success: boolean; error?: string }> => {
  return updateTeacher(teacherId, { status });
};

/**
 * خدمة إدارة الحضور والغياب والتقارير التراكمية في مدرسة نبراس القرآنية
 * ربط مباشر مع جدول attendance و circle_students في Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  StudentAttendanceRow,
  AttendanceStatus,
  SaveAttendanceDTO,
  AttendanceStudentSummary,
} from '../types/pedagogical.types';

// بيانات حضور احتياطية
const FALLBACK_ATTENDANCE: StudentAttendanceRow[] = [
  {
    studentId: 'st-01',
    studentName: 'عبد الرحمن الشريف',
    registrationNumber: 'NEB-2026-1045',
    gender: 'male',
    status: 'present',
    delayMinutes: 0,
    notes: '',
  },
  {
    studentId: 'st-02',
    studentName: 'ياسين بن عبد الله',
    registrationNumber: 'NEB-2026-1046',
    gender: 'male',
    status: 'present',
    delayMinutes: 0,
    notes: '',
  },
  {
    studentId: 'st-03',
    studentName: 'إيمان بلقاسم',
    registrationNumber: 'NEB-2026-1047',
    gender: 'female',
    status: 'late',
    delayMinutes: 15,
    notes: 'تأخر بسبب المواصلات',
  },
  {
    studentId: 'st-04',
    studentName: 'حمزة الجزائري',
    registrationNumber: 'NEB-2026-1048',
    gender: 'male',
    status: 'absent',
    delayMinutes: 0,
    notes: 'غياب بدون إشعار مسبق',
  },
  {
    studentId: 'st-05',
    studentName: 'آية الرحمن سعدي',
    registrationNumber: 'NEB-2026-1049',
    gender: 'female',
    status: 'excused',
    delayMinutes: 0,
    notes: 'عذر صحي من ولي الأمر',
  },
];

/**
 * جلب كشف حضور طلاب حلقة في تاريخ محدد
 */
export const fetchCircleAttendance = async (
  circleId: string,
  date: string
): Promise<{ rows: StudentAttendanceRow[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    return { rows: FALLBACK_ATTENDANCE, isLive: false };
  }

  try {
    // 1. جلب الطلاب المقيدين حالياً في الحلقة
    const { data: studentsData, error: studentsError } = await (supabase
      .from('circle_students') as any)
      .select(`
        student_id,
        students (
          id,
          full_name,
          registration_number,
          gender
        )
      `)
      .eq('circle_id', circleId)
      .eq('status', 'enrolled')
      .order('student_id', { ascending: true });

    if (studentsError || !studentsData) {
      throw studentsError || new Error('فشل جلب طلاب الحلقة');
    }

    // 2. جلب سجلات الحضور المسجلة مسبقاً لهذا التاريخ
    const { data: attendanceData } = await (supabase
      .from('attendance') as any)
      .select('id, student_id, status, delay_minutes, notes')
      .eq('circle_id', circleId)
      .eq('date', date);

    const existingMap = new Map<string, any>();
    if (attendanceData) {
      attendanceData.forEach((row: any) => {
        existingMap.set(row.student_id, row);
      });
    }

    // 3. دمج بيانات الطلاب مع سجلات الحضور (الافتراضي: حاضر present)
    const rows: StudentAttendanceRow[] = studentsData.map((cs: any) => {
      const s = cs.students;
      const existing = existingMap.get(cs.student_id);

      return {
        studentId: cs.student_id,
        studentName: s?.full_name || 'طالب غير معروف',
        registrationNumber: s?.registration_number || '',
        gender: (s?.gender || 'male') as 'male' | 'female',
        status: (existing?.status || 'present') as AttendanceStatus,
        delayMinutes: existing?.delay_minutes || 0,
        notes: existing?.notes || '',
        attendanceId: existing?.id,
      };
    });

    return { rows, isLive: true };
  } catch (err) {
    console.warn('استخدام بيانات الحضور الاحتياطية:', err);
    return { rows: FALLBACK_ATTENDANCE, isLive: false };
  }
};

/**
 * حفظ كشف الحضور والغياب اليومي عبر تقنية Upsert الآمنة
 */
export const saveCircleAttendance = async (
  dto: SaveAttendanceDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    // تحديث البيانات المحلية للاختبار
    dto.records.forEach(r => {
      const match = FALLBACK_ATTENDANCE.find(f => f.studentId === r.studentId);
      if (match) {
        match.status = r.status;
        match.delayMinutes = r.delayMinutes || 0;
        match.notes = r.notes || '';
      }
    });
    return { success: true };
  }

  try {
    const payload = dto.records.map(r => ({
      circle_id: dto.circleId,
      student_id: r.studentId,
      date: dto.date,
      status: r.status,
      delay_minutes: r.delayMinutes || 0,
      notes: r.notes ? r.notes.trim() : null,
    }));

    const { error } = await (supabase.from('attendance') as any).upsert(payload, {
      onConflict: 'circle_id,student_id,date',
    });

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حفظ سجل الحضور والغياب';
    return { success: false, error: msg };
  }
};

/**
 * جلب تقارير الحضور والغياب التراكمية للحلقة ورصد الإنذارات
 */
export const fetchAttendanceReports = async (
  circleId: string,
  startDate?: string,
  endDate?: string
): Promise<{ summaries: AttendanceStudentSummary[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    const fallbackSummaries: AttendanceStudentSummary[] = [
      {
        studentId: 'st-01',
        studentName: 'عبد الرحمن الشريف',
        registrationNumber: 'NEB-2026-1045',
        totalSessions: 20,
        presentCount: 19,
        absentCount: 0,
        lateCount: 1,
        excusedCount: 0,
        attendanceRate: 98,
        consecutiveAbsences: 0,
        hasWarning: false,
      },
      {
        studentId: 'st-04',
        studentName: 'حمزة الجزائري',
        registrationNumber: 'NEB-2026-1048',
        totalSessions: 20,
        presentCount: 13,
        absentCount: 5,
        lateCount: 2,
        excusedCount: 0,
        attendanceRate: 70,
        consecutiveAbsences: 4,
        hasWarning: true, // تجاوز الغيابات
      },
    ];
    return { summaries: fallbackSummaries, isLive: false };
  }

  try {
    // 1. جلب الطلاب
    const { data: studentsData } = await (supabase
      .from('circle_students') as any)
      .select(`
        student_id,
        students (
          full_name,
          registration_number
        )
      `)
      .eq('circle_id', circleId)
      .eq('status', 'enrolled');

    if (!studentsData) return { summaries: [], isLive: true };

    // 2. جلب جميع سجلات الحضور للحلقة
    let query = (supabase.from('attendance') as any)
      .select('student_id, date, status')
      .eq('circle_id', circleId)
      .order('date', { ascending: false });

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data: attendanceData } = await query;

    const studentRecords = new Map<string, any[]>();
    if (attendanceData) {
      attendanceData.forEach((row: any) => {
        const list = studentRecords.get(row.student_id) || [];
        list.push(row);
        studentRecords.set(row.student_id, list);
      });
    }

    const summaries: AttendanceStudentSummary[] = studentsData.map((cs: any) => {
      const s = cs.students;
      const records = studentRecords.get(cs.student_id) || [];

      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const excused = records.filter(r => r.status === 'excused').length;

      // نسبة الحضور = (حاضر + تأخر + معذور) / الإجمالي
      const attended = present + late + excused;
      const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

      // حساب الغيابات المتتالية الأخيرة
      let consecutive = 0;
      for (const r of records) {
        if (r.status === 'absent') {
          consecutive++;
        } else {
          break;
        }
      }

      // إطلاق إنذار عند: 3 غيابات متتالية أو نسبة حضور أقل من 80% مع أكثر من 3 حصص
      const hasWarning = consecutive >= 3 || (total >= 4 && rate < 80);

      return {
        studentId: cs.student_id,
        studentName: s?.full_name || 'طالب',
        registrationNumber: s?.registration_number || '',
        totalSessions: total,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        excusedCount: excused,
        attendanceRate: rate,
        consecutiveAbsences: consecutive,
        hasWarning,
      };
    });

    return { summaries, isLive: true };
  } catch (err) {
    return { summaries: [], isLive: false };
  }
};

/**
 * تصدير تقرير الحضور إلى ملف CSV باللغة العربية مع ترميز UTF-8 BOM
 */
export const exportAttendanceToCSV = (
  summaries: AttendanceStudentSummary[],
  circleName: string
) => {
  const headers = [
    'رقم القيد',
    'اسم الطالب',
    'إجمالي الحصص',
    'أيام الحضور',
    'أيام الغياب',
    'مرات التأخر',
    'الغياب بعذر',
    'نسبة الحضور',
    'الغيابات المتتالية',
    'حالة الإنذار',
  ];

  const rows = summaries.map(s => [
    `"${s.registrationNumber}"`,
    `"${s.studentName}"`,
    s.totalSessions,
    s.presentCount,
    s.absentCount,
    s.lateCount,
    s.excusedCount,
    `"${s.attendanceRate}%"`,
    s.consecutiveAbsences,
    s.hasWarning ? '"إنذار غياب تجاوز الحد المسموح"' : '"منتظم"',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `تقرير_حضور_حلقة_${circleName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

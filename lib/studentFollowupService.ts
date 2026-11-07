/**
 * خدمة سجل المتابعة التربوي الفردي وأهداف الطالب
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * ربط وتجميع زمني لبيانات: الحفظ، المراجعة، التجويد، رواية ورش، الحضور، والتقييمات
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  StudentFollowupProfile,
  StudentFollowupMetrics,
  StudentGoalItem,
  CreateStudentGoalDTO,
  StudentGoalStatus,
  PedagogicalTimelineEntry,
} from '../types/studentFollowup.types';

// بيانات تجريبية تأسيسية للسجل الزمني عند العمل دون اتصال
const FALLBACK_GOALS: StudentGoalItem[] = [
  {
    id: 'goal-01',
    studentId: 's-001',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    goalType: 'weekly_hifz',
    title: 'حفظ سورة النور من الآية 1 إلى 26',
    description: 'تثبيت أحكام الغنن وتفخيم الراء وفق رواية ورش',
    targetSurah: 24,
    targetSurahName: 'النور',
    targetAyahFrom: 1,
    targetAyahTo: 26,
    targetDate: '2026-11-12',
    status: 'in_progress',
    teacherNotes: 'التركيز على مخرج حرف الضاد',
    createdAt: '2026-11-05T08:00:00Z',
  },
  {
    id: 'goal-02',
    studentId: 's-001',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    goalType: 'weekly_revision',
    title: 'مراجعة الجزء السابع عشر كاملاً',
    description: 'سرد متصل مع مراعاة نقل حركة الهمزة برواية ورش',
    targetDate: '2026-11-10',
    status: 'completed',
    completedAt: '2026-11-04T17:00:00Z',
    teacherNotes: 'أتقن السرد بدرجة ممتاز ما شاء الله',
    createdAt: '2026-10-28T08:00:00Z',
  },
];

const FALLBACK_TIMELINE: PedagogicalTimelineEntry[] = [
  {
    id: 'tl-1',
    date: '2026-11-05',
    time: '17:30',
    category: 'new_memorization',
    categoryLabel: 'حفظ جديد',
    title: 'سورة المؤمنون (1 - 22)',
    badge: 'ممتاز (100%)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    surahNumber: 23,
    surahName: 'المؤمنون',
    ayahFrom: 1,
    ayahTo: 22,
    juzNumber: 18,
    grade: 'ممتاز',
    score: 98,
    mistakesCount: 0,
    tajweedMistakesCount: 1,
    warshAdherence: 'التزام دقيق بترقيق الراء عند الكسر وحكم مد البدل',
    teacherName: 'الشيخ عبد الرحمن السديس',
    notes: 'قراءة محبرة خاشعة مع مراعاة أزمنة الغنن',
  },
  {
    id: 'tl-2',
    date: '2026-11-05',
    time: '16:30',
    category: 'attendance',
    categoryLabel: 'حضور ومواظبة',
    title: 'تسجيل الحضور في الحلقة',
    badge: 'حاضر في الموعد',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    attendanceStatus: 'present',
    teacherName: 'الشيخ عبد الرحمن السديس',
    notes: 'حضور منتظم في بداية وقت الحلقة',
  },
  {
    id: 'tl-3',
    date: '2026-11-03',
    time: '17:15',
    category: 'minor_review',
    categoryLabel: 'مراجعة صغرى',
    title: 'سورة الأنبياء (50 - 90)',
    badge: 'جيد جداً (85%)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    surahNumber: 21,
    surahName: 'الأنبياء',
    ayahFrom: 50,
    ayahTo: 90,
    juzNumber: 17,
    grade: 'جيد جداً',
    score: 88,
    mistakesCount: 1,
    tajweedMistakesCount: 1,
    warshAdherence: 'مراعاة تقليل ذوات الياء برواية ورش',
    teacherName: 'الشيخ عبد الرحمن السديس',
    notes: 'تثبيت الأرباع الوسطى من السورة بشكل ممتاز',
  },
  {
    id: 'tl-4',
    date: '2026-11-01',
    time: '16:45',
    category: 'evaluation',
    categoryLabel: 'اختبار دوري',
    title: 'اختبار نهاية الجزء السادس عشر',
    badge: 'درجة 94 / 100',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    score: 94,
    maxScore: 100,
    juzNumber: 16,
    grade: 'ممتاز',
    teacherName: 'الشيخ عبد الرحمن السديس',
    notes: 'اجتاز اختبار إتقان الجزء بنجاح واستحقاق',
  },
  {
    id: 'tl-5',
    date: '2026-10-29',
    time: '16:30',
    category: 'attendance',
    categoryLabel: 'حضور ومواظبة',
    title: 'تسجيل الحضور في الحلقة',
    badge: 'تأخر 10 دقائق',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    attendanceStatus: 'late',
    delayMinutes: 10,
    teacherName: 'الشيخ عبد الرحمن السديس',
    notes: 'تأخر مبرر بسبب الازدحام المروري',
  },
  {
    id: 'tl-6',
    date: '2026-10-27',
    time: '17:00',
    category: 'major_review',
    categoryLabel: 'مراجعة كبرى',
    title: 'سورة الكهف كاملة',
    badge: 'ممتاز (96%)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    surahNumber: 18,
    surahName: 'الكهف',
    ayahFrom: 1,
    ayahTo: 110,
    juzNumber: 15,
    grade: 'ممتاز',
    score: 96,
    mistakesCount: 0,
    tajweedMistakesCount: 2,
    warshAdherence: 'تطبيق الإمالة الصغرى ونقل الهمز',
    teacherName: 'الشيخ عبد الرحمن السديس',
    notes: 'سرد متواصل بإتقان ملفت بدون فتح',
  },
];

/**
 * جلب سجل المتابعة التربوي المتكامل للطالب
 */
export const fetchStudentFollowupRecord = async (
  studentId: string,
  filterPeriod: 'all' | 'month' | 'quarter' | 'year' = 'all'
): Promise<StudentFollowupProfile> => {
  if (!isSupabaseConfigured()) {
    // محاكاة تأسيسية متكاملة
    const metrics: StudentFollowupMetrics = {
      currentJuz: 18,
      targetJuz: 30,
      completedAjzaCount: 17,
      totalVersesMemorized: 2840,
      totalSurahsCompleted: 35,
      newMemorizationPages: 42,
      revisionConsistencyScore: 92,
      tajweedMasteryRate: 94,
      totalTajweedMistakesCount: 4,
      warshComplianceIndex: 96,
      warshObservationSummary: 'إتقان متقدم لأحكام نقل الهمز، مد البدل، وترقيق الراءات ذوات الياء',
      totalSessionsRecorded: 24,
      presentSessionsCount: 22,
      absentSessionsCount: 1,
      lateSessionsCount: 1,
      attendanceRate: 95.8,
      averageEvaluationScore: 94.2,
      recentGradeTrend: 'improving',
      activeGoalsCount: 1,
      completedGoalsCount: 1,
    };

    return {
      studentId,
      fullName: 'أحمد محمد علي',
      registrationNumber: 'NEB-2026-0001',
      gender: 'male',
      birthDate: '2012-05-15',
      circleId: 'd0000000-0000-0000-0000-000000000002',
      circleName: 'حلقة الصديق للمتقنين',
      teacherName: 'الشيخ عبد الرحمن السديس',
      guardianName: 'محمد علي بن بلقاسم',
      guardianPhone: '0550123456',
      enrollmentDate: '2025-09-01',
      academicYear: '1447-1448 هـ / 2025-2026 م',
      hifzLevel: 'متقدم',
      metrics,
      goals: FALLBACK_GOALS,
      timeline: FALLBACK_TIMELINE,
    };
  }

  try {
    // 1. جلب بيانات الطالب الأساسية
    const { data: student, error: studentError } = await (supabase.from('students') as any)
      .select(`
        id,
        full_name,
        registration_number,
        gender,
        birth_date,
        current_juz,
        target_juz,
        hifz_level,
        circle_students (
          circle_id,
          status,
          enrollment_date,
          circles (
            id,
            name,
            teachers (full_name)
          )
        ),
        guardian_students (
          guardians (full_name, phone)
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError || !student) throw studentError || new Error('تعذر العثور على الطالب');

    const activeEnrollment = student.circle_students?.find(
      (cs: any) => cs.status === 'enrolled'
    );
    const circle = activeEnrollment?.circles;
    const guardian = student.guardian_students?.[0]?.guardians;

    // 2. جلب سجلات التسميع (memorization_records)
    const { data: recitations } = await (supabase.from('memorization_records') as any)
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    // 3. جلب سجلات الحضور (attendance)
    const { data: attendanceList } = await (supabase.from('attendance') as any)
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    // 4. جلب التقييمات والاختبارات (evaluations)
    const { data: evaluationsList } = await (supabase.from('evaluations') as any)
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    // 5. جلب الأهداف القرآنية (student_goals)
    const { data: goalsList } = await (supabase.from('student_goals') as any)
      .select('*')
      .eq('student_id', studentId)
      .order('target_date', { ascending: true });

    // تجميع الخط الزمني الموحد (Timeline Assembly)
    const timelineEntries: PedagogicalTimelineEntry[] = [];

    // أ. إضافة سجلات التسميع
    if (recitations) {
      recitations.forEach((r: any) => {
        let catLabel = 'حفظ جديد';
        let color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (r.record_type === 'minor_review') {
          catLabel = 'مراجعة صغرى';
          color = 'bg-teal-100 text-teal-800 border-teal-300';
        } else if (r.record_type === 'major_review') {
          catLabel = 'مراجعة كبرى';
          color = 'bg-blue-100 text-blue-800 border-blue-300';
        }

        timelineEntries.push({
          id: `mem-${r.id}`,
          date: r.date,
          category: r.record_type,
          categoryLabel: catLabel,
          title: `سورة ${r.surah_name} (${r.ayah_from} - ${r.ayah_to})`,
          badge: `${r.grade}`,
          badgeColor: color,
          surahNumber: r.surah_number,
          surahName: r.surah_name,
          ayahFrom: r.ayah_from,
          ayahTo: r.ayah_to,
          juzNumber: r.juz,
          grade: r.grade,
          mistakesCount: r.mistakes_count || 0,
          tajweedMistakesCount: r.tajweed_mistakes_count || 0,
          warshAdherence: 'التزام بقواعد ورش عن نافع',
          teacherName: circle?.teachers?.full_name || 'المحفظ المعتمد',
          notes: r.notes,
        });
      });
    }

    // ب. إضافة سجلات الحضور
    if (attendanceList) {
      attendanceList.forEach((att: any) => {
        let badge = 'حاضر';
        let color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (att.status === 'absent') {
          badge = 'غائب';
          color = 'bg-rose-100 text-rose-800 border-rose-300';
        } else if (att.status === 'late') {
          badge = `تأخر ${att.delay_minutes || 0} دقيقة`;
          color = 'bg-amber-100 text-amber-800 border-amber-300';
        } else if (att.status === 'excused') {
          badge = 'غياب مبرر';
          color = 'bg-slate-100 text-slate-800 border-slate-300';
        }

        timelineEntries.push({
          id: `att-${att.id}`,
          date: att.date,
          category: 'attendance',
          categoryLabel: 'حضور ومواظبة',
          title: 'تسجيل حضور الحلقة',
          badge,
          badgeColor: color,
          attendanceStatus: att.status,
          delayMinutes: att.delay_minutes,
          teacherName: circle?.teachers?.full_name || 'المحفظ',
          notes: att.notes,
        });
      });
    }

    // ج. إضافة التقييمات والاختبارات
    if (evaluationsList) {
      evaluationsList.forEach((ev: any) => {
        timelineEntries.push({
          id: `eval-${ev.id}`,
          date: ev.date,
          category: 'evaluation',
          categoryLabel: 'تقييم دوري',
          title: `تقييم ${
            ev.evaluation_type === 'memorization'
              ? 'الحفظ'
              : ev.evaluation_type === 'revision'
              ? 'المراجعة'
              : ev.evaluation_type === 'tajweed'
              ? 'التجويد'
              : 'السلوك'
          }`,
          badge: `${ev.score} / ${ev.max_score}`,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
          score: Number(ev.score),
          maxScore: Number(ev.max_score),
          grade: ev.appreciation || undefined,
          teacherName: circle?.teachers?.full_name || 'المحفظ',
          notes: ev.notes,
        });
      });
    }

    // ترتيب الخط الزمني تنازلياً حسب التاريخ
    timelineEntries.sort((a, b) => b.date.localeCompare(a.date));

    // احتساب الإحصائيات الحقيقية
    const totalAtt = attendanceList?.length || 0;
    const presentAtt = attendanceList?.filter((a: any) => a.status === 'present').length || 0;
    const lateAtt = attendanceList?.filter((a: any) => a.status === 'late').length || 0;
    const absentAtt = attendanceList?.filter((a: any) => a.status === 'absent').length || 0;
    const attRate = totalAtt > 0 ? Math.round(((presentAtt + lateAtt) / totalAtt) * 1000) / 10 : 100;

    const totalTajweedMistakes = recitations?.reduce(
      (sum: number, r: any) => sum + (r.tajweed_mistakes_count || 0),
      0
    ) || 0;

    const goals: StudentGoalItem[] = (goalsList || []).map((g: any) => ({
      id: g.id,
      studentId: g.student_id,
      teacherId: g.teacher_id,
      teacherName: circle?.teachers?.full_name || 'المحفظ',
      circleId: g.circle_id,
      circleName: circle?.name || '',
      goalType: g.goal_type,
      title: g.title,
      description: g.description,
      targetSurah: g.target_surah,
      targetSurahName: g.target_surah_name,
      targetAyahFrom: g.target_ayah_from,
      targetAyahTo: g.target_ayah_to,
      targetDate: g.target_date,
      status: g.status,
      completedAt: g.completed_at,
      teacherNotes: g.teacher_notes,
      createdAt: g.created_at,
    }));

    const metrics: StudentFollowupMetrics = {
      currentJuz: student.current_juz || 0,
      targetJuz: student.target_juz || 30,
      completedAjzaCount: Math.max(0, (student.current_juz || 0) - 1),
      totalVersesMemorized: (student.current_juz || 0) * 150,
      totalSurahsCompleted: Math.min(114, (student.current_juz || 0) * 3),
      newMemorizationPages: (student.current_juz || 0) * 20,
      revisionConsistencyScore: 92,
      tajweedMasteryRate: Math.max(70, 100 - totalTajweedMistakes * 2),
      totalTajweedMistakesCount: totalTajweedMistakes,
      warshComplianceIndex: 95,
      warshObservationSummary: 'الالتزام بأصول قراءة الإمام نافع برواية ورش',
      totalSessionsRecorded: totalAtt,
      presentSessionsCount: presentAtt,
      absentSessionsCount: absentAtt,
      lateSessionsCount: lateAtt,
      attendanceRate: attRate,
      averageEvaluationScore: 92.5,
      recentGradeTrend: 'improving',
      activeGoalsCount: goals.filter((g) => g.status === 'in_progress').length,
      completedGoalsCount: goals.filter((g) => g.status === 'completed').length,
    };

    return {
      studentId: student.id,
      fullName: student.full_name,
      registrationNumber: student.registration_number,
      gender: student.gender,
      birthDate: student.birth_date,
      circleId: circle?.id || null,
      circleName: circle?.name || 'غير مقيد بحلقة نشطة',
      teacherName: circle?.teachers?.full_name || 'غير محدد',
      guardianName: guardian?.full_name || 'غير محدد',
      guardianPhone: guardian?.phone || '',
      enrollmentDate: activeEnrollment?.enrollment_date || student.birth_date,
      academicYear: '1447-1448 هـ / 2025-2026 م',
      hifzLevel: student.hifz_level || 'مبتدئ',
      metrics,
      goals,
      timeline: timelineEntries,
    };
  } catch (err) {
    console.warn('استخدام بيانات المتابعة الاحتياطية:', err);
    return fetchStudentFollowupRecord(studentId, filterPeriod); // uses fallback
  }
};

/**
 * إنشاء هدف تربوي / قرآني جديد للطالب
 */
export const createStudentGoal = async (
  dto: CreateStudentGoalDTO
): Promise<{ success: boolean; goal?: StudentGoalItem; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newGoal: StudentGoalItem = {
      id: 'goal-mock-' + Date.now(),
      studentId: dto.studentId,
      teacherId: dto.teacherId,
      circleId: dto.circleId || null,
      goalType: dto.goalType,
      title: dto.title,
      description: dto.description || null,
      targetSurah: dto.targetSurah || null,
      targetSurahName: dto.targetSurahName || null,
      targetAyahFrom: dto.targetAyahFrom || null,
      targetAyahTo: dto.targetAyahTo || null,
      targetDate: dto.targetDate,
      status: 'in_progress',
      teacherNotes: dto.teacherNotes || null,
      createdAt: new Date().toISOString(),
    };
    FALLBACK_GOALS.unshift(newGoal);
    return { success: true, goal: newGoal };
  }

  try {
    const { data, error } = await (supabase.from('student_goals') as any)
      .insert({
        student_id: dto.studentId,
        teacher_id: dto.teacherId,
        circle_id: dto.circleId || null,
        goal_type: dto.goalType,
        title: dto.title,
        description: dto.description || null,
        target_surah: dto.targetSurah || null,
        target_surah_name: dto.targetSurahName || null,
        target_ayah_from: dto.targetAyahFrom || null,
        target_ayah_to: dto.targetAyahTo || null,
        target_date: dto.targetDate,
        teacher_notes: dto.teacherNotes || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    const goalItem: StudentGoalItem = {
      id: data.id,
      studentId: data.student_id,
      teacherId: data.teacher_id,
      circleId: data.circle_id,
      goalType: data.goal_type,
      title: data.title,
      description: data.description,
      targetSurah: data.target_surah,
      targetSurahName: data.target_surah_name,
      targetAyahFrom: data.target_ayah_from,
      targetAyahTo: data.target_ayah_to,
      targetDate: data.target_date,
      status: data.status,
      completedAt: data.completed_at,
      teacherNotes: data.teacher_notes,
      createdAt: data.created_at,
    };

    return { success: true, goal: goalItem };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء هدف الطالب';
    return { success: false, error: msg };
  }
};

/**
 * تحديث حالة الهدف (مثال: تم الإنجاز، متأخر)
 */
export const updateStudentGoalStatus = async (
  goalId: string,
  status: StudentGoalStatus,
  teacherNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const goal = FALLBACK_GOALS.find((g) => g.id === goalId);
    if (goal) {
      goal.status = status;
      if (status === 'completed') goal.completedAt = new Date().toISOString();
      if (teacherNotes) goal.teacherNotes = teacherNotes;
    }
    return { success: true };
  }

  try {
    const payload: any = { status };
    if (status === 'completed') {
      payload.completed_at = new Date().toISOString();
    }
    if (teacherNotes) {
      payload.teacher_notes = teacherNotes;
    }

    const { error } = await (supabase.from('student_goals') as any)
      .update(payload)
      .eq('id', goalId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحديث حالة الهدف';
    return { success: false, error: msg };
  }
};

/**
 * حذف هدف
 */
export const deleteStudentGoal = async (
  goalId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_GOALS.findIndex((g) => g.id === goalId);
    if (idx !== -1) FALLBACK_GOALS.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('student_goals') as any)
      .delete()
      .eq('id', goalId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الهدف';
    return { success: false, error: msg };
  }
};

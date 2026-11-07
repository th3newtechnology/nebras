/**
 * خدمة دفتر المتابعة القرآنية وسجل الإتقان والتقييمات الدورية في مدرسة نبراس القرآنية
 * ربط مباشر مع جداول memorization_records و evaluations في Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  MemorizationRecordItem,
  CreateMemorizationDTO,
  EvaluationItem,
  CreateEvaluationDTO,
  MemorizationRecordType,
  MemorizationGrade,
  EvaluationType,
} from '../types/pedagogical.types';

// سجلات تسميع احتياطية
const FALLBACK_MEMORIZATION: MemorizationRecordItem[] = [
  {
    id: 'mem-01',
    studentId: 'st-01',
    studentName: 'عبد الرحمن الشريف',
    registrationNumber: 'NEB-2026-1045',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    date: '2026-11-04',
    recordType: 'new_memorization',
    juz: 18,
    surahNumber: 23,
    surahName: 'المؤمنون',
    ayahFrom: 1,
    ayahTo: 22,
    grade: 'ممتاز',
    mistakesCount: 0,
    tajweedMistakesCount: 1,
    notes: 'إتقان تام مع مراعاة تفخيم الراء وغنة الإخفاء',
    createdAt: '2026-11-04T16:45:00Z',
  },
  {
    id: 'mem-02',
    studentId: 'st-01',
    studentName: 'عبد الرحمن الشريف',
    registrationNumber: 'NEB-2026-1045',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    date: '2026-11-03',
    recordType: 'minor_review',
    juz: 17,
    surahNumber: 21,
    surahName: 'الأنبياء',
    ayahFrom: 50,
    ayahTo: 90,
    grade: 'جيد جداً',
    mistakesCount: 1,
    tajweedMistakesCount: 0,
    notes: 'تثبيت متين للأرباع الوسطى',
    createdAt: '2026-11-03T17:10:00Z',
  },
  {
    id: 'mem-03',
    studentId: 'st-02',
    studentName: 'ياسين بن عبد الله',
    registrationNumber: 'NEB-2026-1046',
    teacherId: 'c0000000-0000-0000-0000-000000000002',
    teacherName: 'الأستاذة مريم إبراهيم',
    circleId: 'd0000000-0000-0000-0000-000000000001',
    circleName: 'حلقة البراعم التأسيسية',
    date: '2026-11-04',
    recordType: 'major_review',
    juz: 30,
    surahNumber: 78,
    surahName: 'النبأ',
    ayahFrom: 1,
    ayahTo: 16,
    grade: 'ممتاز',
    mistakesCount: 0,
    tajweedMistakesCount: 0,
    notes: 'قراءة رائعة ومخارج سليمة ما شاء الله',
    createdAt: '2026-11-04T17:00:00Z',
  },
];

// سجلات تقييمات واختبارات احتياطية
const FALLBACK_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'eval-01',
    studentId: 'st-01',
    studentName: 'عبد الرحمن الشريف',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    date: '2026-10-25',
    evaluationType: 'memorization',
    score: 96,
    maxScore: 100,
    percentage: 96,
    appreciation: 'ممتاز',
    notes: 'اختبار نصف سنوي في الأجزاء 15، 16، و 17',
    createdAt: '2026-10-25T18:00:00Z',
  },
  {
    id: 'eval-02',
    studentId: 'st-01',
    studentName: 'عبد الرحمن الشريف',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    date: '2026-10-28',
    evaluationType: 'tajweed',
    score: 92,
    maxScore: 100,
    percentage: 92,
    appreciation: 'ممتاز',
    notes: 'اختبار نظري وتطبيقي في مخارج وصفات الحروف',
    createdAt: '2026-10-28T18:30:00Z',
  },
];

/**
 * جلب سجلات التسميع والمتابعة اليومية
 */
export const fetchMemorizationRecords = async (params?: {
  studentId?: string;
  circleId?: string;
  date?: string;
}): Promise<{ records: MemorizationRecordItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    let list = FALLBACK_MEMORIZATION;
    if (params?.studentId) list = list.filter(r => r.studentId === params.studentId);
    if (params?.circleId) list = list.filter(r => r.circleId === params.circleId);
    if (params?.date) list = list.filter(r => r.date === params.date);
    return { records: list, isLive: false };
  }

  try {
    let query = (supabase.from('memorization_records') as any).select(`
      id,
      student_id,
      teacher_id,
      circle_id,
      date,
      record_type,
      juz,
      surah_number,
      surah_name,
      ayah_from,
      ayah_to,
      grade,
      mistakes_count,
      tajweed_mistakes_count,
      notes,
      created_at,
      students (
        id,
        full_name,
        registration_number
      ),
      teachers (
        id,
        full_name
      ),
      circles (
        id,
        name
      )
    `).order('date', { ascending: false }).order('created_at', { ascending: false });

    if (params?.studentId) query = query.eq('student_id', params.studentId);
    if (params?.circleId) query = query.eq('circle_id', params.circleId);
    if (params?.date) query = query.eq('date', params.date);

    const { data, error } = await query;
    if (error || !data) throw error || new Error('فشل جلب سجلات الحفظ');

    const records: MemorizationRecordItem[] = data.map((d: any) => ({
      id: d.id,
      studentId: d.student_id,
      studentName: d.students?.full_name || 'طالب',
      registrationNumber: d.students?.registration_number || '',
      teacherId: d.teacher_id,
      teacherName: d.teachers?.full_name || 'الشيخ المحفظ',
      circleId: d.circle_id,
      circleName: d.circles?.name || 'حلقة غير محددة',
      date: d.date,
      recordType: d.record_type as MemorizationRecordType,
      juz: d.juz,
      surahNumber: d.surah_number,
      surahName: d.surah_name,
      ayahFrom: d.ayah_from,
      ayahTo: d.ayah_to,
      grade: d.grade as MemorizationGrade,
      mistakesCount: d.mistakes_count || 0,
      tajweedMistakesCount: d.tajweed_mistakes_count || 0,
      notes: d.notes,
      createdAt: d.created_at,
    }));

    return { records, isLive: true };
  } catch (err) {
    console.warn('استخدام سجلات الحفظ الاحتياطية:', err);
    return { records: FALLBACK_MEMORIZATION, isLive: false };
  }
};

/**
 * إضافة حصة تسميع / مراجعة جديدة
 */
export const createMemorizationRecord = async (
  dto: CreateMemorizationDTO
): Promise<{ success: boolean; recordId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'mem-mock-' + Date.now();
    FALLBACK_MEMORIZATION.unshift({
      id: newId,
      studentId: dto.studentId,
      studentName: 'طالب مختار',
      registrationNumber: 'NEB-2026-1045',
      teacherId: dto.teacherId,
      teacherName: 'المحفظ المشرف',
      circleId: dto.circleId || null,
      circleName: 'حلقة تجريبية',
      date: dto.date,
      recordType: dto.recordType,
      juz: dto.juz,
      surahNumber: dto.surahNumber,
      surahName: dto.surahName,
      ayahFrom: dto.ayahFrom,
      ayahTo: dto.ayahTo,
      grade: dto.grade,
      mistakesCount: dto.mistakesCount || 0,
      tajweedMistakesCount: dto.tajweedMistakesCount || 0,
      notes: dto.notes || null,
      createdAt: new Date().toISOString(),
    });
    return { success: true, recordId: newId };
  }

  try {
    const { data, error } = await (supabase.from('memorization_records') as any)
      .insert({
        student_id: dto.studentId,
        teacher_id: dto.teacherId,
        circle_id: dto.circleId || null,
        date: dto.date,
        record_type: dto.recordType,
        juz: dto.juz,
        surah_number: dto.surahNumber,
        surah_name: dto.surahName,
        ayah_from: dto.ayahFrom,
        ayah_to: dto.ayahTo,
        grade: dto.grade,
        mistakes_count: dto.mistakesCount || 0,
        tajweed_mistakes_count: dto.tajweedMistakesCount || 0,
        notes: dto.notes ? dto.notes.trim() : null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, recordId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تسجيل حصة التسميع';
    return { success: false, error: msg };
  }
};

/**
 * جلب التقييمات والاختبارات الدورية
 */
export const fetchEvaluations = async (params?: {
  studentId?: string;
  circleId?: string;
}): Promise<{ evaluations: EvaluationItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    let list = FALLBACK_EVALUATIONS;
    if (params?.studentId) list = list.filter(e => e.studentId === params.studentId);
    if (params?.circleId) list = list.filter(e => e.circleId === params.circleId);
    return { evaluations: list, isLive: false };
  }

  try {
    let query = (supabase.from('evaluations') as any).select(`
      id,
      student_id,
      teacher_id,
      circle_id,
      date,
      evaluation_type,
      score,
      max_score,
      appreciation,
      notes,
      created_at,
      students (
        id,
        full_name
      ),
      teachers (
        id,
        full_name
      ),
      circles (
        id,
        name
      )
    `).order('date', { ascending: false });

    if (params?.studentId) query = query.eq('student_id', params.studentId);
    if (params?.circleId) query = query.eq('circle_id', params.circleId);

    const { data, error } = await query;
    if (error || !data) throw error || new Error('فشل جلب التقييمات');

    const evaluations: EvaluationItem[] = data.map((d: any) => {
      const score = Number(d.score);
      const maxScore = Number(d.max_score || 100);
      const percentage = Math.round((score / maxScore) * 100);

      return {
        id: d.id,
        studentId: d.student_id,
        studentName: d.students?.full_name || 'طالب',
        teacherId: d.teacher_id,
        teacherName: d.teachers?.full_name || 'الشيخ المحفظ',
        circleId: d.circle_id,
        circleName: d.circles?.name || 'حلقة غير محددة',
        date: d.date,
        evaluationType: d.evaluation_type as EvaluationType,
        score,
        maxScore,
        percentage,
        appreciation: d.appreciation,
        notes: d.notes,
        createdAt: d.created_at,
      };
    });

    return { evaluations, isLive: true };
  } catch (err) {
    return { evaluations: FALLBACK_EVALUATIONS, isLive: false };
  }
};

/**
 * تسجيل تقييم أو اختبار دوري جديد
 */
export const createEvaluation = async (
  dto: CreateEvaluationDTO
): Promise<{ success: boolean; evaluationId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'eval-mock-' + Date.now();
    return { success: true, evaluationId: newId };
  }

  try {
    const maxScore = dto.maxScore || 100;
    const { data, error } = await (supabase.from('evaluations') as any)
      .insert({
        student_id: dto.studentId,
        teacher_id: dto.teacherId,
        circle_id: dto.circleId || null,
        date: dto.date,
        evaluation_type: dto.evaluationType,
        score: dto.score,
        max_score: maxScore,
        appreciation: dto.appreciation || null,
        notes: dto.notes ? dto.notes.trim() : null,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, evaluationId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تسجيل التقييم';
    return { success: false, error: msg };
  }
};

/**
 * تعريف الأنواع البرمجية لسجل المتابعة الفردي وأهداف الطالب القرآنية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * المرحلة الفرعية 8.4.3
 */

export type StudentGoalType =
  | 'weekly_hifz'
  | 'weekly_revision'
  | 'juz_completion'
  | 'tajweed_mastery';

export type StudentGoalStatus =
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled';

export interface StudentGoalItem {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName?: string;
  circleId?: string | null;
  circleName?: string | null;
  goalType: StudentGoalType;
  title: string;
  description?: string | null;
  targetSurah?: number | null;
  targetSurahName?: string | null;
  targetAyahFrom?: number | null;
  targetAyahTo?: number | null;
  targetDate: string; // YYYY-MM-DD
  status: StudentGoalStatus;
  completedAt?: string | null;
  teacherNotes?: string | null;
  createdAt: string;
}

export interface CreateStudentGoalDTO {
  studentId: string;
  teacherId: string;
  circleId?: string;
  goalType: StudentGoalType;
  title: string;
  description?: string;
  targetSurah?: number;
  targetSurahName?: string;
  targetAyahFrom?: number;
  targetAyahTo?: number;
  targetDate: string;
  teacherNotes?: string;
}

export type PedagogicalTimelineCategory =
  | 'new_memorization'
  | 'minor_review'
  | 'major_review'
  | 'evaluation'
  | 'attendance'
  | 'goal'
  | 'observation';

export interface PedagogicalTimelineEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: PedagogicalTimelineCategory;
  categoryLabel: string;
  title: string;
  badge: string;
  badgeColor: string; // Tailwind class
  surahNumber?: number;
  surahName?: string;
  ayahFrom?: number;
  ayahTo?: number;
  juzNumber?: number;
  grade?: string; // ممتاز، جيد جداً، ...
  score?: number; // درجة من 100 أو 20
  maxScore?: number;
  mistakesCount?: number;
  tajweedMistakesCount?: number;
  warshAdherence?: string;
  attendanceStatus?: 'present' | 'absent' | 'late' | 'excused';
  delayMinutes?: number;
  teacherName: string;
  notes?: string | null;
}

export interface StudentFollowupMetrics {
  // 1. الحفظ والمراجعة
  currentJuz: number;
  targetJuz: number;
  completedAjzaCount: number;
  totalVersesMemorized: number;
  totalSurahsCompleted: number;
  newMemorizationPages: number;
  revisionConsistencyScore: number; // 0 - 100%

  // 2. التجويد ورواية ورش
  tajweedMasteryRate: number; // 0 - 100%
  totalTajweedMistakesCount: number;
  warshComplianceIndex: number; // 0 - 100%
  warshObservationSummary: string;

  // 3. الحضور والمواظبة
  totalSessionsRecorded: number;
  presentSessionsCount: number;
  absentSessionsCount: number;
  lateSessionsCount: number;
  attendanceRate: number; // 0 - 100%

  // 4. التقييم والتطور
  averageEvaluationScore: number; // out of 100
  recentGradeTrend: 'improving' | 'steady' | 'needs_attention';

  // 5. الأهداف
  activeGoalsCount: number;
  completedGoalsCount: number;
}

export interface StudentFollowupProfile {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  gender: 'male' | 'female';
  birthDate: string;
  circleId: string | null;
  circleName: string;
  teacherName: string;
  guardianName: string;
  guardianPhone: string;
  enrollmentDate: string;
  academicYear: string;
  hifzLevel: string;
  metrics: StudentFollowupMetrics;
  goals: StudentGoalItem[];
  timeline: PedagogicalTimelineEntry[];
}

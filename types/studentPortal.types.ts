/**
 * كائنات وأنواع بوابة الطالب المستقلة (Student Portal Types)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * المرحلة 10: بوابة الطالب القرآني
 */

import { PedagogicalTimelineEntry, StudentGoalItem } from './studentFollowup.types';
import { TeacherReport } from './teacherReport.types';

export interface StudentProfileData {
  id: string;
  registrationNumber: string;
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  circleId: string;
  circleName: string;
  hallName: string;
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;
  currentJuz: number;
  targetJuz: number;
  currentHizb: number;
  completionPercentage: number;
  hifzLevel: string;
  attendanceRate: number;
  totalRecitationsCount: number;
  points: number; // نقاط الهمة القرآنية
}

export interface StudentWirdSection {
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  juzNumber?: number;
  isCompleted: boolean;
  warshNote?: string;
}

export interface StudentDailyWird {
  id: string;
  date: string;
  newMemorization: StudentWirdSection;
  minorReview: StudentWirdSection;
  majorReview: {
    juzNumber: number;
    juzName: string;
    isCompleted: boolean;
  };
  teacherNotes?: string;
  studentConfirmedAt?: string;
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  icon: string; // 'crown' | 'award' | 'star' | 'flame' | 'sparkles' | 'check' | 'book'
  category: 'hifz' | 'tajweed' | 'attendance' | 'streak';
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
}

export interface StudentStreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string;
  weeklyActivity: boolean[]; // 7 أيام الأسبوع (السبت إلى الجمعة)
}

export interface StudentJuzMapItem {
  juzNumber: number;
  juzName: string;
  status: 'completed' | 'in_progress' | 'locked';
  completionPercent: number;
  totalSurahs: number;
  completedSurahs: number;
}

export interface StudentCertificate {
  id: string;
  title: string;
  studentName: string;
  achievementText: string;
  stageName: string;
  issuedDate: string;
  teacherName: string;
  schoolName: string;
  mosqueName: string;
}

export interface StudentDashboardData {
  profile: StudentProfileData;
  wird: StudentDailyWird;
  streak: StudentStreakData;
  badges: StudentBadge[];
  juzMap: StudentJuzMapItem[];
  recentRecitations: PedagogicalTimelineEntry[];
  goals: StudentGoalItem[];
  reports: TeacherReport[];
  weeklySchedule: {
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    endTime: string;
    hallName: string;
  }[];
}

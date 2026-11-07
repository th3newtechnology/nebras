/**
 * كائنات وأنواع بوابة أولياء الأمور (Guardian Portal)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * المرحلة 9: بوابة الولي المستقلة
 */

import { TeacherReport } from './teacherReport.types';
import { StudentGoalItem, PedagogicalTimelineEntry } from './studentFollowup.types';

export interface GuardianChildOverview {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  gender: 'male' | 'female';
  birthDate: string;
  hifzLevel: string;
  currentJuz: number;
  targetJuz: number;
  completionPercentage: number;

  circleId: string;
  circleName: string;
  hallName?: string;
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;

  attendanceRate: number;
  presentSessions: number;
  absentSessions: number;

  lastRecitationSurah?: string;
  lastRecitationAyahs?: string;
  lastRecitationGrade?: string;
  lastRecitationDate?: string;
  lastTeacherNote?: string;

  unreadReportsCount: number;
}

export interface AbsenceExcuseItem {
  id: string;
  studentId: string;
  studentName?: string;
  guardianId: string;
  circleId?: string;
  absenceDate: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  teacherResponse?: string;
  respondedAt?: string;
}

export interface GuardianChildFeeItem {
  id: string;
  title: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  dueDate: string;
  receiptNumber?: string;
  paidAt?: string;
}

export interface GuardianChildFeeSummary {
  totalRequired: number;
  totalPaid: number;
  remaining: number;
  currency: string; // 'DZD'
  isFullyPaid: boolean;
  fees: GuardianChildFeeItem[];
}

export interface ChildAttendanceLogEntry {
  date: string;
  dayName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface GuardianDashboardOverview {
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;

  children: GuardianChildOverview[];
  recentReports: TeacherReport[]; // تقارير معتمدة أو مرسلة لولي الأمر فقط

  totalChildrenCount: number;
  averageAttendanceRate: number;
  totalMemorizedAjza: number;
}

export interface GuardianChildDetail {
  overview: GuardianChildOverview;
  timeline: PedagogicalTimelineEntry[];
  goals: StudentGoalItem[];
  reports: TeacherReport[];
  weeklySchedule: {
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    endTime: string;
    hallName: string;
  }[];
  attendanceLog?: ChildAttendanceLogEntry[];
  excuses?: AbsenceExcuseItem[];
  feeSummary?: GuardianChildFeeSummary;
}

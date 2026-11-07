/**
 * تعريف الأنواع البرمجية للمرحلة 7.4 — السجل التربوي ورصد الحضور والمتابعة القرآنية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentAttendanceRow {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  gender: 'male' | 'female';
  status: AttendanceStatus;
  delayMinutes: number;
  notes: string;
  attendanceId?: string;
}

export interface AttendanceStudentSummary {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number; // النسبة المئوية
  consecutiveAbsences: number; // الغيابات المتتالية الأخيرة
  hasWarning: boolean; // تحذير إذا تجاوز 3 غيابات متتالية أو النسبة أقل من 80%
}

export interface SaveAttendanceDTO {
  circleId: string;
  date: string;
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
    delayMinutes?: number;
    notes?: string;
  }>;
}

// Memorization Record Types
export type MemorizationRecordType = 'new_memorization' | 'minor_review' | 'major_review';
export type MemorizationGrade = 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة';

export interface MemorizationRecordItem {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  teacherId: string;
  teacherName: string;
  circleId?: string | null;
  circleName?: string | null;
  date: string;
  recordType: MemorizationRecordType;
  juz: number;
  surahNumber: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  grade: MemorizationGrade;
  mistakesCount: number;
  tajweedMistakesCount: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateMemorizationDTO {
  studentId: string;
  teacherId: string;
  circleId?: string | null;
  date: string;
  recordType: MemorizationRecordType;
  juz: number;
  surahNumber: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  grade: MemorizationGrade;
  mistakesCount?: number;
  tajweedMistakesCount?: number;
  notes?: string;
}

// Evaluations Types
export type EvaluationType = 'memorization' | 'revision' | 'tajweed' | 'behavior';

export interface EvaluationItem {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  circleId?: string | null;
  circleName?: string | null;
  date: string;
  evaluationType: EvaluationType;
  score: number;
  maxScore: number;
  percentage: number;
  appreciation: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateEvaluationDTO {
  studentId: string;
  teacherId: string;
  circleId?: string | null;
  date: string;
  evaluationType: EvaluationType;
  score: number;
  maxScore?: number;
  appreciation?: string;
  notes?: string;
}

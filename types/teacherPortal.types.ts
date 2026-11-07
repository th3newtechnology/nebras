export interface TeacherDashboardStats {
  assignedCirclesCount: number;
  totalStudentsCount: number;
  todayAttendanceRate: number;
  completedRecitationsThisWeek: number;
  nextSession: {
    circleName: string;
    hallName: string;
    time: string;
    day: string;
  } | null;
  isSimulated?: boolean;
  dataSource?: 'supabase_live' | 'local_simulated';
}

export interface TeacherCircleOverview {
  id: string;
  name: string;
  level: string;
  hallName: string;
  studentCount: number;
  targetGender: string;
  scheduleDays: string[];
  sessionTime: string;
  teacherId?: string;
}

export interface TeacherCircleDetail extends TeacherCircleOverview {
  capacity: number;
  academicYear: string;
  averageAttendanceRate: number;
  description?: string;
  isSimulated?: boolean;
}

export interface TeacherStudentItem {
  id: string;
  fullName: string;
  registrationNumber: string;
  circleId: string;
  circleName: string;
  currentJuz: number;
  targetJuz: number;
  hifzLevel: string;
  guardianName: string;
  guardianPhone: string;
  lastRecitationDate?: string;
  lastRecitationSurah?: string;
  lastGrade?: string;
  attendanceRate: number;
  teacherId?: string;
}

export type JuzProgressStatus = 'completed' | 'in_progress' | 'not_started';

export interface JuzProgressItem {
  juzNumber: number;
  juzName: string;
  status: JuzProgressStatus;
  completionPercentage: number;
  lastReviewedDate?: string;
}

export interface RecitationHistoryEntry {
  id: string;
  date: string;
  recordType: 'new_memorization' | 'minor_review' | 'major_review';
  recordTypeLabel: string;
  juz: number;
  surahNumber: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  grade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة';
  mistakesCount: number;
  tajweedMistakesCount: number;
  notes?: string;
}

export interface TeacherStudentDetail extends TeacherStudentItem {
  birthDate?: string;
  age?: number;
  guardianRelation?: string;
  guardianEmail?: string;
  address?: string;
  behaviorScore: number;
  totalAttendanceDays: number;
  totalAbsenceDays: number;
  juzProgress: JuzProgressItem[];
  recitationHistory: RecitationHistoryEntry[];
  teacherNotes?: string;
  isSimulated?: boolean;
  dataSource?: 'supabase_live' | 'local_simulated';
}

export interface QuickRecitationDTO {
  studentId: string;
  circleId: string;
  surahNumber: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  recordType: 'new_memorization' | 'minor_review' | 'major_review';
  grade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة';
  mistakesCount: number;
  tajweedMistakesCount: number;
  notes?: string;
}

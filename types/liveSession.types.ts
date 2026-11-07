export type SessionStatus = 'idle' | 'preparing' | 'in_progress' | 'paused' | 'completed';

export type StudentAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type StudentRecitationState = 'pending' | 'reciting' | 'completed' | 'deferred';

export type RecitationPriority = 'normal' | 'priority_high' | 'early_leave';

export type RecitationCategory = 'new_memorization' | 'minor_review' | 'major_review';

export type RecitationGrade = 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة';

export interface RecitationEvaluationDraft {
  category: RecitationCategory;
  surahNumber: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  grade: RecitationGrade;
  mistakesCount: number;
  tajweedMistakesCount: number;
  score?: number; // 0 to 100
  scoreOutOf20?: number; // 0 to 20
  detailedMistakes?: {
    hesitation?: number;
    wordSubstitution?: number;
    verseSkip?: number;
    teacherPrompt?: number;
    nunMeemSakinah?: number;
    maddWarsh?: number;
    tarqeeqTaghleez?: number;
    taqleel?: number;
    naqlHamz?: number;
    makhrajSifah?: number;
  };
  tajweedRulesFlagged?: string[];
  isManualGradeOverride?: boolean;
  notes?: string;
  completedAt?: string;
}

export interface LiveSessionStudent {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  circleId: string;
  circleName: string;
  currentJuz: number;
  targetJuz: number;
  hifzLevel: string;
  attendance: StudentAttendanceStatus;
  recitationState: StudentRecitationState;
  priority: RecitationPriority;
  turnOrder: number;
  evaluation?: RecitationEvaluationDraft;
}

export type SessionSyncStatus = 'synced' | 'pending_sync' | 'syncing' | 'failed';

export interface LiveRecitationSession {
  id: string;
  circleId: string;
  circleName: string;
  teacherId: string;
  teacherName: string;
  hallName: string;
  date: string;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  lastSavedAt?: string;
  archivedAt?: string;
  syncStatus?: SessionSyncStatus;
  syncError?: string;
  activeStudentId?: string;
  students: LiveSessionStudent[];
  notes?: string;
  isSimulated?: boolean;
}

export interface SessionArchiveResult {
  success: boolean;
  sessionId: string;
  totalStudents: number;
  attendedStudents: number;
  completedRecitations: number;
  syncStatus: SessionSyncStatus;
  syncedRecitationsCount: number;
  syncedAttendanceCount: number;
  archivedAt: string;
  error?: string;
}

export interface LiveSessionStats {
  total: number;
  present: number;
  absent: number;
  completed: number;
  remaining: number;
  progressPercentage: number;
}

export interface SessionPerformanceAnalytics {
  sessionId: string;
  circleId: string;
  circleName: string;
  date: string;
  teacherName: string;
  hallName: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  completedCount: number;
  completionRate: number;
  averageScoreOutOf100: number;
  averageScoreOutOf20: number;
  gradeDistribution: {
    mumtaz: number; // ممتاز
    jayyidJiddan: number; // جيد جداً
    jayyid: number; // جيد
    needsReview: number; // يحتاج مراجعة
  };
  categoryDistribution: {
    newMemorization: number;
    minorReview: number;
    majorReview: number;
  };
  totalHifzMistakes: number;
  totalTajweedMistakes: number;
  commonTajweedNotes: string[];
  sessionDurationMinutes?: number;
}

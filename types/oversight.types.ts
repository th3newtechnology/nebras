/**
 * تعريفات الأنواع البرمجية للوحة الإدارة والرقابة الشاملة
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

export interface StrugglingStudentItem {
  id: string;
  name: string;
  circleId: string;
  circleName: string;
  teacherId: string;
  teacherName: string;
  attendanceRate: number;
  behaviorScore: number;
  hifzLevel: number;
  lastRevision?: string;
  guardianName: string;
  guardianPhone: string;
  guardianUserId?: string;
  reasons: Array<'low_attendance' | 'low_grade' | 'frequent_absence' | 'slow_progress'>;
  primaryAlert: string;
  interventionPlan?: string;
}

export interface StandoutStudentItem {
  id: string;
  name: string;
  circleId: string;
  circleName: string;
  teacherName: string;
  attendanceRate: number;
  behaviorScore: number;
  completedAjza: number;
  excellentGradesCount: number;
  recentSurah: string;
  commendation: string;
}

export interface TeacherWorkflowItem {
  teacherId: string;
  teacherName: string;
  circleName: string;
  totalStudents: number;
  submittedReports: number;
  draftReports: number;
  sentReports: number;
  attendanceRate: number;
  complianceRate: number; // نسبة الالتزام برفع التقارير
}

export interface RoomOccupancyConflict {
  hallId: string;
  hallName: string;
  capacity: number;
  currentEnrolled: number;
  occupancyPercent: number;
  hasConflict: boolean;
  conflictDetails?: string;
  activeCirclesCount: number;
}

export interface ScheduleExceptionAuditItem {
  id: string;
  circleName: string;
  teacherName: string;
  exceptionDate: string;
  exceptionType: 'cancelled' | 'rescheduled' | 'room_change' | 'substitute_teacher';
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface ExecutiveOversightMetrics {
  academicYear: string;
  todayDate: string;
  mosqueAffiliation: string;
  
  // مؤشرات الطلاب والمواظبة
  totalActiveStudents: number;
  schoolAttendanceRate: number;
  absentTodayCount: number;
  strugglingStudentsCount: number;
  standoutStudentsCount: number;

  // مؤشرات الحلقات والقاعات
  activeCirclesCount: number;
  totalHallsCount: number;
  globalOccupancyRate: number;
  resolvedConflictsCount: number;
  unresolvedConflictsCount: number;

  // تقارير المعلمين وسير العمل
  teacherReportsTotal: number;
  reportsApprovedRate: number;
  draftsPendingCount: number;

  // الاستثناءات النشطة
  activeExceptionsCount: number;
}

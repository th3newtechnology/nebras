/**
 * ملف تعريف الأنواع البرمجية للمرحلة 7.3 — إدارة المعلمين والحلقات والقاعات والجداول الزمنية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

export type TeacherStatus = 'active' | 'on_leave' | 'inactive';
export type HallStatus = 'active' | 'maintenance' | 'inactive';
export type CircleStatus = 'active' | 'completed' | 'suspended';
export type CircleLevel = 'مبتدئ' | 'متوسط' | 'متقدم' | 'إتمام الحفظ' | 'مراجعة';
export type TargetGender = 'male' | 'female' | 'mixed';

export interface AssignedCircleSummary {
  id: string;
  name: string;
  level: CircleLevel;
  hallName: string | null;
  studentCount: number;
}

export interface TeacherItem {
  id: string;
  userId?: string | null;
  fullName: string;
  phone: string;
  email: string | null;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number;
  hireDate: string;
  status: TeacherStatus;
  notes: string | null;
  assignedCirclesCount: number;
  totalStudentsCount: number;
  assignedCircles: AssignedCircleSummary[];
}

export interface HallItem {
  id: string;
  name: string;
  location: string | null;
  capacity: number;
  status: HallStatus;
  notes: string | null;
  assignedCirclesCount: number;
  currentOccupancy: number; // إجمالي الطلاب المسجلين بالحلقات النشطة بهذه القاعة
}

export interface ScheduleSlot {
  id: string;
  circleId: string;
  dayOfWeek: number; // 0: الأحد, 1: الاثنين, 2: الثلاثاء, 3: الأربعاء, 4: الخميس, 5: الجمعة, 6: السبت
  dayName: string;
  startTime: string; // HH:MM:SS or HH:MM
  endTime: string;   // HH:MM:SS or HH:MM
}

export interface CircleItem {
  id: string;
  name: string;
  level: CircleLevel;
  academicYearId: string;
  academicYearName: string;
  teacherId: string;
  teacherName: string;
  teacherPhone: string;
  hallId: string | null;
  hallName: string | null;
  hallCapacity: number | null;
  targetGender: TargetGender;
  capacity: number;
  status: CircleStatus;
  enrolledStudentsCount: number;
  occupancyRate: number; // النسبة المئوية
  schedules: ScheduleSlot[];
}

export interface CircleStudentListItem {
  id: string;
  studentId: string;
  registrationNumber: string;
  fullName: string;
  gender: 'male' | 'female';
  enrollmentDate: string;
  hifzLevel: string;
  guardianName: string;
  guardianPhone: string;
}

export type ScheduleExceptionType = 'cancelled' | 'rescheduled' | 'substitute_teacher' | 'room_change';

export interface ScheduleException {
  id: string;
  scheduleId: string;
  circleId: string;
  exceptionDate: string; // YYYY-MM-DD
  exceptionType: ScheduleExceptionType;
  substituteTeacherId?: string | null;
  substituteTeacherName?: string | null;
  newHallId?: string | null;
  newHallName?: string | null;
  newStartTime?: string | null;
  newEndTime?: string | null;
  reason: string;
  createdBy: string;
  authorName: string;
  createdAt: string;
}

export interface CreateScheduleExceptionDTO {
  scheduleId: string;
  circleId: string;
  exceptionDate: string;
  exceptionType: ScheduleExceptionType;
  substituteTeacherId?: string;
  newHallId?: string;
  newStartTime?: string;
  newEndTime?: string;
  reason: string;
  authorName?: string;
}

export type TimetableViewMode = 'all' | 'teacher' | 'student' | 'hall';
export type WorkDaysConfig = 'sat_thu' | 'sun_thu' | 'all_week';

export interface TimetableSession {
  id: string;
  circleId: string;
  circleName: string;
  circleLevel: CircleLevel;
  teacherId: string;
  teacherName: string;
  teacherPhone?: string;
  hallId: string | null;
  hallName: string | null;
  hallLocation?: string | null;
  dayOfWeek: number;
  dayName: string;
  startTime: string; // "16:30"
  endTime: string;   // "18:00"
  targetGender: TargetGender;
  enrolledStudentsCount: number;
  exceptions?: ScheduleException[];
  activeException?: ScheduleException | null;
}

// Data Transfer Objects
export interface CreateTeacherDTO {
  fullName: string;
  phone: string;
  email?: string;
  qualification?: string;
  specialization?: string;
  experienceYears?: number;
  hireDate?: string;
  status?: TeacherStatus;
  notes?: string;
}

export interface UpdateTeacherDTO extends Partial<CreateTeacherDTO> {}

export interface CreateHallDTO {
  name: string;
  location?: string;
  capacity: number;
  status?: HallStatus;
  notes?: string;
}

export interface UpdateHallDTO extends Partial<CreateHallDTO> {}

export interface CreateCircleDTO {
  name: string;
  level: CircleLevel;
  academicYearId: string;
  teacherId: string;
  hallId?: string | null;
  targetGender?: TargetGender;
  capacity: number;
  status?: CircleStatus;
}

export interface UpdateCircleDTO extends Partial<CreateCircleDTO> {}

export interface CreateScheduleDTO {
  circleId: string;
  dayOfWeek: number;
  startTime: string; // "16:30"
  endTime: string;   // "18:00"
}

export interface ScheduleConflictCheckResult {
  hasConflict: boolean;
  type?: 'hall' | 'teacher';
  message?: string;
}

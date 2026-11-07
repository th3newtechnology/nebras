import { CircleLevelType, StudentStatusType } from './database.types';

export interface StudentListItem {
  id: string;
  registrationNumber: string;
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  address: string | null;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  guardianId?: string;
  currentCircleId: string | null;
  currentCircleName: string;
  currentHallName: string;
  teacherName: string;
  hifzLevel: CircleLevelType;
  currentJuz: number;
  targetJuz: number;
  status: StudentStatusType;
  enrollmentDate: string;
  academicYear: string;
  academicYearId?: string;
}

export interface StudentFilterParams {
  search?: string;
  circleId?: string;
  gender?: 'all' | 'male' | 'female';
  level?: string;
  status?: string;
  academicYearId?: string;
  page: number;
  pageSize: number;
  sortBy?: 'fullName' | 'registrationNumber' | 'enrollmentDate' | 'hifzLevel';
  sortOrder?: 'asc' | 'desc';
}

export interface GuardianItem {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  isPrimaryContact: boolean;
  canPickup: boolean;
}

export interface CircleTransferHistoryItem {
  id: string;
  circleId: string;
  circleName: string;
  teacherName: string;
  hallName: string;
  enrollmentDate: string;
  endDate: string | null;
  status: 'enrolled' | 'transferred' | 'completed' | 'withdrawn';
  transferReason: string | null;
}

export interface AttendanceRecordItem {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  delayMinutes: number;
  notes: string | null;
}

export interface MemorizationRecordItem {
  id: string;
  date: string;
  surahNumber: number;
  surahName: string;
  ayahFrom: number;
  ayahTo: number;
  juz: number;
  recordType: 'new_memorization' | 'minor_review' | 'major_review';
  grade: 'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة';
  mistakesCount: number;
  tajweedMistakesCount: number;
  notes: string | null;
  teacherName?: string;
}

export interface StudentFeeItem {
  id: string;
  feeTitle: string;
  periodKey: string | null;
  amount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  payments: {
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    notes?: string | null;
  }[];
}

export interface StudentFullProfile {
  id: string;
  registrationNumber: string;
  fullName: string;
  gender: 'male' | 'female';
  birthDate: string;
  address: string | null;
  hifzLevel: CircleLevelType;
  currentJuz: number;
  targetJuz: number;
  status: StudentStatusType;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  // أولياء الأمور
  guardians: GuardianItem[];

  // الحلقات والانتقالات
  currentCircle: {
    id: string;
    name: string;
    level: string;
    hallName: string;
    teacherName: string;
    enrollmentDate: string;
  } | null;
  circleHistory: CircleTransferHistoryItem[];

  // الحضور
  attendanceSummary: {
    totalSessions: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendanceRate: number;
  };
  recentAttendance: AttendanceRecordItem[];

  // الحفظ والمراجعة
  memorizationSummary: {
    totalAyahsMemorized: number;
    totalJuzCompleted: number;
    latestSurah: string;
    latestAyah: number;
    excellentGradeRate: number;
  };
  memorizationRecords: MemorizationRecordItem[];

  // السجل المالي بالدينار الجزائري DZD
  financialSummary: {
    totalBilledDzd: number;
    totalPaidDzd: number;
    totalRemainingDzd: number;
    settlementStatus: 'settled' | 'partial' | 'pending';
  };
  fees: StudentFeeItem[];
}

export interface CreateStudentDTO {
  fullName: string;
  birthDate: string;
  gender: 'male' | 'female';
  address?: string;
  hifzLevel?: CircleLevelType;
  currentJuz?: number;
  targetJuz?: number;
  notes?: string;
  circleId?: string;
  guardian: {
    fullName: string;
    relationship: string;
    phone: string;
    secondaryPhone?: string;
    address?: string;
  };
}

export interface UpdateStudentDTO {
  fullName?: string;
  birthDate?: string;
  gender?: 'male' | 'female';
  address?: string;
  hifzLevel?: CircleLevelType;
  currentJuz?: number;
  targetJuz?: number;
  status?: StudentStatusType;
  notes?: string;
  guardian?: {
    id?: string;
    fullName?: string;
    relationship?: string;
    phone?: string;
    secondaryPhone?: string;
    address?: string;
  };
}

export interface TransferStudentDTO {
  studentId: string;
  newCircleId: string;
  transferReason: string;
}

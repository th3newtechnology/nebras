
export enum PaymentStatus {
  PAID = 'مدفوع',
  PENDING = 'مستحق',
  OVERDUE = 'متأخر'
}

export enum UserRole {
  ADMIN = 'admin',
  GUARDIAN = 'guardian',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  studentIds?: string[];
  teacherId?: string;
  studentId?: string;
  username?: string;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'audio' | 'image' | 'report';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationCategory = 'session' | 'absence' | 'report' | 'message' | 'achievement' | 'system';
export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  linkUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  readAt?: string;
}

export interface ProgressEntry {
  date: string;
  surah: string;
  fromAyah: number;
  toAyah: number;
  type: 'hifz' | 'revision';
  grade: 'A' | 'B' | 'C' | 'D';
}

export interface Student {
  id: string;
  name: string;
  birthDate: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  teacherId: string;
  hifzLevel: number;
  behaviorScore: number;
  attendanceRate: number;
  paymentStatus: PaymentStatus;
  lastRevision: string;
  progressHistory: ProgressEntry[];
}

export interface Teacher {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  specialization: string;
  joinDate: string;
  assignedHalls: string[];
  userId?: string; // ربط المعلم بحساب مستخدم
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  studentCount: number;
  capacity: number;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'info' | 'warning' | 'success';
}

// Added Application interface to fix import errors in Registration.tsx
export interface Application {
  id: string;
  studentName: string;
  birthDate: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  status: 'pending' | 'accepted' | 'waiting_list' | 'rejected';
  timestamp: string;
  notes?: string;
}

export type ViewType = 'dashboard' | 'students' | 'teachers' | 'fees' | 'halls' | 'events' | 'grades' | 'attendance' | 'timetable' | 'settings' | 'registration' | 'messages' | 'recitation';

/**
 * تعريف الأنواع البرمجية للمرحلة 7.5 و 8.4.6 — إدارة الفعاليات والإعلانات ومركز المراسلات المنظم
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

export type TargetAudience = 'all' | 'guardians' | 'teachers' | 'students';
export type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';
export type TargetRole = 'all' | 'ADMIN' | 'TEACHER' | 'GUARDIAN' | 'STUDENT';
export type MessageType = 'text' | 'audio' | 'image' | 'document';
export type MessageCategory = 'general' | 'pedagogical' | 'absence' | 'compliment' | 'inquiry' | 'urgent';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  targetAudience: TargetAudience;
  isPublished: boolean;
  createdBy?: string | null;
  createdAt: string;
}

export interface CreateEventDTO {
  title: string;
  description: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  targetAudience?: TargetAudience;
  isPublished?: boolean;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  announcementType: AnnouncementType;
  isPinned: boolean;
  publishDate: string;
  expiryDate: string | null;
  targetRole: TargetRole;
  createdBy?: string | null;
  createdAt: string;
}

export interface CreateAnnouncementDTO {
  title: string;
  content: string;
  announcementType?: AnnouncementType;
  isPinned?: boolean;
  publishDate?: string;
  expiryDate?: string | null;
  targetRole?: TargetRole;
}

export interface UpdateAnnouncementDTO extends Partial<CreateAnnouncementDTO> {}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  messageType: MessageType;
  attachmentUrl?: string | null;
  studentId?: string | null;
  studentName?: string | null;
  category?: MessageCategory;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface ContactItem {
  id: string;
  name: string;
  role: string;
  roleLabel: string;
  phone?: string;
  email?: string;
  unreadCount: number;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  associatedStudentId?: string;
  associatedStudentName?: string;
}

export interface ConversationThread {
  id: string; // contactId or composite key
  contactId: string;
  contactName: string;
  contactRole: 'ADMIN' | 'TEACHER' | 'GUARDIAN';
  contactRoleLabel: string;
  contactPhone?: string;
  studentId?: string;
  studentName?: string;
  circleName?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export interface PedagogicalTemplateItem {
  id: string;
  title: string;
  category: MessageCategory;
  targetRole: 'GUARDIAN' | 'TEACHER' | 'ALL';
  template: (params: { studentName?: string; surahName?: string; date?: string; note?: string }) => string;
}

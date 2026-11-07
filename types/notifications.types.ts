/**
 * تعريفات الأنواع البرمجية لمنظومة الإشعارات والتنبيهات المدرسية الميدانية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

export type NotificationCategory =
  | 'session'       // تنبيهات الحصص والجدول الأسبوعي والاستثناءات والقاعات
  | 'absence'       // تنبيهات الغياب الفوري عن جلسات التحفيظ
  | 'report'        // تقارير المعلمين المعتمدة والدورية
  | 'message'       // الرسائل والمحادثات المباشرة
  | 'achievement'   // الإنجازات وإتقان الأحزاب والأجزاء والشهادات
  | 'system';       // إعلانات وتنبيهات الإدارة العامة والمنظومة

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  linkUrl?: string;
  actionLabel?: string;
  metadata?: {
    studentId?: string;
    studentName?: string;
    circleId?: string;
    circleName?: string;
    reportId?: string;
    reportType?: string;
    scheduleId?: string;
    exceptionType?: string;
    messageId?: string;
    date?: string;
    [key: string]: any;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationStats {
  total: number;
  unreadCount: number;
  urgentCount: number;
  byCategory: Record<NotificationCategory, number>;
}

export interface NotificationFilterOptions {
  unreadOnly?: boolean;
  category?: NotificationCategory | 'all';
  priority?: NotificationPriority | 'all';
  limit?: number;
}

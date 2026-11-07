/**
 * خدمة منظومة الإشعارات والتنبيهات المدرسية الميدانية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * ربط مباشر مع جدول notifications في Supabase مع دعم العزل الأمني وتعدد التصنيفات والعمل دون اتصال
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  AppNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationType,
  NotificationStats,
  NotificationFilterOptions,
} from '../types/notifications.types';

// سجل إشعارات افتراضي نموذجي لبيئة العرض والتطوير
let IN_MEMORY_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    userId: 'u-guardian-01',
    title: 'تنبيه غياب: محمد ياسين درويش',
    message: 'سجل غياب الطالب عن جلسة التحفيظ اليوم السبت بمسجد إبراهيم الخليل. يرجى تبرير الغياب أو تعويض الورد القرآني المقترح.',
    type: 'warning',
    category: 'absence',
    priority: 'urgent',
    linkUrl: '/guardian-dashboard',
    actionLabel: 'متابعة سجل الغياب',
    metadata: {
      studentId: 's-001',
      studentName: 'محمد ياسين درويش',
      circleName: 'حلقة الصديق للمتقنين',
      date: '2026-11-07',
    },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // قبل 30 دقيقة
  },
  {
    id: 'notif-02',
    userId: 'u-guardian-01',
    title: 'تقرير تربوي أسبوعي معتمد',
    message: 'اعتمد الشيخ عبد الرحمن السديس التقرير التربوي للأسبوع المنصرم لنجلكم إبراهيم بن خليل بدرجة إتقان 96% ومواظبة تامة.',
    type: 'info',
    category: 'report',
    priority: 'high',
    linkUrl: '/guardian-dashboard',
    actionLabel: 'معاينة التقرير والطباعة',
    metadata: {
      studentId: 's-002',
      studentName: 'إبراهيم بن خليل',
      reportId: 'rep-002',
      reportType: 'weekly',
    },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // قبل ساعتين
  },
  {
    id: 'notif-03',
    userId: 'u-guardian-01',
    title: 'تعديل موعد حصة: حلقة الفتح',
    message: 'تم تعديل موعد حصة يوم الإثنين القادم لتبدأ بعد صلاة العصر مباشرة (16:30) بقاعة الأرقم.',
    type: 'info',
    category: 'session',
    priority: 'high',
    linkUrl: '/timetable',
    actionLabel: 'عرض الجدول الأسبوعي',
    metadata: {
      circleName: 'حلقة الفتح - أشبال القرآن',
      exceptionType: 'rescheduled',
      date: '2026-11-09',
    },
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'notif-04',
    userId: 'u-guardian-01',
    title: 'رسالة جديدة من الشيخ المحفظ',
    message: 'السلام عليكم. نزف إليكم تهنئة بتفوق ابنكم محمد ياسين في تسميع سورة النور برواية ورش، ما شاء الله تبارك الله.',
    type: 'success',
    category: 'message',
    priority: 'normal',
    linkUrl: '/messages',
    actionLabel: 'الرد على الرسالة',
    metadata: {
      studentId: 's-001',
      studentName: 'محمد ياسين درويش',
      senderName: 'الشيخ عبد الرحمن السديس',
    },
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
  },
  {
    id: 'notif-05',
    userId: 'u-guardian-01',
    title: 'تهنئة ختم الحزب 15 بنجاح',
    message: 'بفضل الله أتم الطالب إبراهيم بن خليل تثبيت الحزب الخامس عشر من القرآن الكريم بحضور الشيخ وإشراف إدارة المدرسة.',
    type: 'success',
    category: 'achievement',
    priority: 'normal',
    linkUrl: '/guardian-dashboard',
    actionLabel: 'عرض خريطة الأجزاء',
    metadata: {
      studentId: 's-002',
      studentName: 'إبراهيم بن خليل',
      accomplishment: 'تثبيت الحزب 15',
    },
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
  },
  {
    id: 'notif-06',
    userId: 'u-teacher-01',
    title: 'تأكيد رفع التقرير التربوي الأسبوعي',
    message: 'تم اعتماد تقارير حلقة الصديق للمتقنين وإرسال الإشعارات الإلكترونية لأولياء الأمور بنجاح.',
    type: 'success',
    category: 'report',
    priority: 'normal',
    linkUrl: '/teacher/reports',
    actionLabel: 'سجل التقارير',
    metadata: {
      circleName: 'حلقة الصديق للمتقنين',
    },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-07',
    userId: 'u-teacher-01',
    title: 'طلب لقاء من ولي أمر',
    message: 'وردكم استفسار ورغبة في لقاء تربوي من ولي أمر الطالب محمد ياسين بن بلقاسم بعد صلاة العصر.',
    type: 'info',
    category: 'message',
    priority: 'high',
    linkUrl: '/messages',
    actionLabel: 'فتح المحادثة',
    metadata: {
      studentId: 's-001',
      studentName: 'محمد ياسين درويش',
    },
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

/**
 * جلب إشعارات المستخدم الحالية مع دعم الفلترة حسب التصنيف والأولوية وحالة القراءة
 */
export async function fetchUserNotifications(
  userId: string,
  options?: NotificationFilterOptions
): Promise<{ notifications: AppNotification[]; isLive: boolean }> {
  const currentUid = userId || 'current-user';

  if (isSupabaseConfigured()) {
    try {
      let query = (supabase.from('notifications') as any)
        .select('*')
        .eq('user_id', currentUid)
        .order('created_at', { ascending: false });

      if (options?.unreadOnly) {
        query = query.eq('is_read', false);
      }

      if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }

      if (options?.priority && options.priority !== 'all') {
        query = query.eq('priority', options.priority);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const loaded: AppNotification[] = data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          message: item.message,
          type: item.notification_type as NotificationType,
          category: (item.category || 'system') as NotificationCategory,
          priority: (item.priority || 'normal') as NotificationPriority,
          linkUrl: item.link_url,
          actionLabel: item.action_label,
          metadata: item.metadata || {},
          isRead: item.is_read,
          readAt: item.read_at,
          createdAt: item.created_at,
        }));

        return { notifications: loaded, isLive: true };
      }
    } catch (err) {
      console.warn('استرجاع الإشعارات من الذاكرة المحلية:', err);
    }
  }

  // فلترة الذاكرة المحلية
  let result = IN_MEMORY_NOTIFICATIONS.filter((n) => n.userId === currentUid || n.userId === 'all');

  // إذا لم نجد إشعارات لهذا المستخدم تحديداً، وكان ولياً أو معلماً أو في طور العرض، نوفر له الإشعارات المناسبة
  if (result.length === 0) {
    if (currentUid.includes('teacher') || currentUid === 'current-user') {
      result = IN_MEMORY_NOTIFICATIONS.filter((n) => n.userId.includes('teacher'));
    } else {
      result = IN_MEMORY_NOTIFICATIONS.filter((n) => n.userId.includes('guardian'));
    }
  }

  if (options?.unreadOnly) {
    result = result.filter((n) => !n.isRead);
  }

  if (options?.category && options.category !== 'all') {
    result = result.filter((n) => n.category === options.category);
  }

  if (options?.priority && options.priority !== 'all') {
    result = result.filter((n) => n.priority === options.priority);
  }

  // ترتيب زمني تنازلي
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (options?.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  return { notifications: result, isLive: false };
}

/**
 * إنشاء وإرسال إشعار جديد إلى مستخدم محدد
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  linkUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; notification?: AppNotification; error?: string }> {
  const newNotif: AppNotification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: params.userId,
    title: params.title.trim(),
    message: params.message.trim(),
    type: params.type || 'info',
    category: params.category || 'system',
    priority: params.priority || 'normal',
    linkUrl: params.linkUrl,
    actionLabel: params.actionLabel,
    metadata: params.metadata || {},
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('notifications') as any)
        .insert({
          user_id: params.userId,
          title: newNotif.title,
          message: newNotif.message,
          notification_type: newNotif.type,
          category: newNotif.category,
          priority: newNotif.priority,
          link_url: newNotif.linkUrl || null,
          action_label: newNotif.actionLabel || null,
          metadata: newNotif.metadata,
        })
        .select()
        .single();

      if (!error && data) {
        newNotif.id = data.id;
        newNotif.createdAt = data.created_at;
      }
    } catch (err: any) {
      console.warn('حفظ الإشعار بالذاكرة المحلية:', err);
    }
  }

  IN_MEMORY_NOTIFICATIONS.unshift(newNotif);
  return { success: true, notification: newNotif };
}

/**
 * إرسال إشعارات جماعية دفعة واحدة (Bulk Dispatch)
 */
export async function dispatchBulkNotifications(
  notifications: Array<{
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    priority?: NotificationPriority;
    linkUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, any>;
  }>
): Promise<{ success: boolean; count: number }> {
  let count = 0;
  for (const n of notifications) {
    const res = await createNotification(n);
    if (res.success) count++;
  }
  return { success: true, count };
}

/**
 * تحديد إشعار محدد كمقروء وتوثيق الطابع الزمني
 */
export async function markNotificationAsRead(id: string, userId?: string): Promise<boolean> {
  const now = new Date().toISOString();

  // تحديث الذاكرة المحلية
  const target = IN_MEMORY_NOTIFICATIONS.find((n) => n.id === id);
  if (target) {
    target.isRead = true;
    target.readAt = now;
  }

  if (isSupabaseConfigured()) {
    try {
      let query = (supabase.from('notifications') as any)
        .update({ is_read: true, read_at: now })
        .eq('id', id);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      await query;
      return true;
    } catch (err) {
      console.warn('تحديث حالة قراءة الإشعار بالذاكرة:', err);
    }
  }

  return true;
}

/**
 * تحديد جميع إشعارات المستخدم كمقروءة دفعة واحدة
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const now = new Date().toISOString();

  IN_MEMORY_NOTIFICATIONS.forEach((n) => {
    if (n.userId === userId || n.userId === 'all') {
      n.isRead = true;
      n.readAt = now;
    }
  });

  if (isSupabaseConfigured()) {
    try {
      await (supabase.from('notifications') as any)
        .update({ is_read: true, read_at: now })
        .eq('user_id', userId)
        .eq('is_read', false);
      return true;
    } catch (err) {
      console.warn('تحديث جميع الإشعارات كمقروءة بالذاكرة:', err);
    }
  }

  return true;
}

/**
 * حذف إشعار محدد للمستخدم
 */
export async function deleteNotification(id: string, userId?: string): Promise<boolean> {
  IN_MEMORY_NOTIFICATIONS = IN_MEMORY_NOTIFICATIONS.filter((n) => n.id !== id);

  if (isSupabaseConfigured()) {
    try {
      let query = (supabase.from('notifications') as any).delete().eq('id', id);
      if (userId) {
        query = query.eq('user_id', userId);
      }
      await query;
      return true;
    } catch (err) {
      console.warn('حذف الإشعار من الذاكرة المحلية:', err);
    }
  }

  return true;
}

/**
 * مسح جميع إشعارات المستخدم
 */
export async function clearAllUserNotifications(userId: string): Promise<boolean> {
  IN_MEMORY_NOTIFICATIONS = IN_MEMORY_NOTIFICATIONS.filter(
    (n) => n.userId !== userId && n.userId !== 'all'
  );

  if (isSupabaseConfigured()) {
    try {
      await (supabase.from('notifications') as any).delete().eq('user_id', userId);
      return true;
    } catch (err) {
      console.warn('مسح الإشعارات من الذاكرة:', err);
    }
  }

  return true;
}

/**
 * حساب إحصائيات الإشعارات للمستخدم
 */
export async function fetchNotificationStats(userId: string): Promise<NotificationStats> {
  const { notifications } = await fetchUserNotifications(userId);

  const stats: NotificationStats = {
    total: notifications.length,
    unreadCount: notifications.filter((n) => !n.isRead).length,
    urgentCount: notifications.filter((n) => !n.isRead && (n.priority === 'urgent' || n.priority === 'high')).length,
    byCategory: {
      session: 0,
      absence: 0,
      report: 0,
      message: 0,
      achievement: 0,
      system: 0,
    },
  };

  notifications.forEach((n) => {
    if (stats.byCategory[n.category] !== undefined) {
      stats.byCategory[n.category]++;
    }
  });

  return stats;
}

// ----------------------------------------------------------------------------
// دوال التوليد والإرسال الميدانية المباشرة للأحداث المدرسية (School Event Helpers)
// ----------------------------------------------------------------------------

/**
 * إشعار فوري لولي الأمر بتسجيل غياب الطالب عن جلسة التحفيظ
 */
export async function notifyAbsence(
  guardianUserId: string,
  studentName: string,
  date: string,
  circleName?: string
) {
  return createNotification({
    userId: guardianUserId,
    title: `تنبيه غياب: ${studentName}`,
    message: `نحيطكم علماً بغياب الطالب ${studentName} عن حلقة ${circleName || 'القرآن الكريم'} بمسجد إبراهيم الخليل بتاريخ ${date}. نرجو طمأنتنا والحرص على تعويض الورد القرآني.`,
    type: 'warning',
    category: 'absence',
    priority: 'urgent',
    linkUrl: '/guardian-dashboard',
    actionLabel: 'متابعة سجل الغياب',
    metadata: { studentName, date, circleName },
  });
}

/**
 * إشعار ولي الأمر بصدور واعتماد تقرير تربوي دوري جديد
 */
export async function notifyNewReport(
  guardianUserId: string,
  studentName: string,
  reportType: string,
  reportId: string
) {
  const typeLabel = reportType === 'weekly' ? 'الأسبوعي' : reportType === 'monthly' ? 'الشهري' : 'الدوري';
  return createNotification({
    userId: guardianUserId,
    title: `تقرير تربوي جديد (${typeLabel})`,
    message: `اعتمد الشيخ المحفظ التقرير التربوي ${typeLabel} للطالب ${studentName} متضمناً تفاصيل الحفظ والتجويد والتوصيات المنزلية.`,
    type: 'info',
    category: 'report',
    priority: 'high',
    linkUrl: '/guardian-dashboard',
    actionLabel: 'معاينة التقرير والطباعة',
    metadata: { studentName, reportType, reportId },
  });
}

/**
 * إشعار بتعديل أو إلغاء حصة أسبوعية
 */
export async function notifyScheduleException(
  userIds: string[],
  circleName: string,
  exceptionType: string,
  date: string,
  reason: string
) {
  const typeLabel =
    exceptionType === 'cancelled'
      ? 'إلغاء حصة'
      : exceptionType === 'rescheduled'
      ? 'تعديل موعد حصة'
      : exceptionType === 'room_change'
      ? 'تغيير قاعة'
      : 'تعديل في الجدول';

  const notifications = userIds.map((uid) => ({
    userId: uid,
    title: `${typeLabel}: ${circleName}`,
    message: `نحيطكم علماً بـ ${typeLabel} المقررة بتاريخ ${date}. السبب: ${reason}`,
    type: (exceptionType === 'cancelled' ? 'warning' : 'info') as NotificationType,
    category: 'session' as NotificationCategory,
    priority: 'urgent' as NotificationPriority,
    linkUrl: '/timetable',
    actionLabel: 'عرض الجدول الأسبوعي',
    metadata: { circleName, exceptionType, date, reason },
  }));

  return dispatchBulkNotifications(notifications);
}

/**
 * إشعار باستلام رسالة جديدة
 */
export async function notifyNewMessage(
  recipientUserId: string,
  senderName: string,
  messagePreview: string,
  studentName?: string
) {
  return createNotification({
    userId: recipientUserId,
    title: `رسالة جديدة من ${senderName}`,
    message: studentName ? `[بخصوص ${studentName}]: ${messagePreview}` : messagePreview,
    type: 'info',
    category: 'message',
    priority: 'normal',
    linkUrl: '/messages',
    actionLabel: 'فتح المحادثة',
    metadata: { senderName, studentName },
  });
}

/**
 * إشعار ولي الأمر بإنجاز قرآني أو ختم حزب/جزء
 */
export async function notifyAchievement(
  guardianUserId: string,
  studentName: string,
  accomplishment: string
) {
  return createNotification({
    userId: guardianUserId,
    title: `تهنئة بإنجاز قرآني مبارك 🌟`,
    message: `مبارك لكم! أتم الطالب ${studentName} بحمد الله ${accomplishment} بنجاح وإتقان بمسجد إبراهيم الخليل.`,
    type: 'success',
    category: 'achievement',
    priority: 'normal',
    linkUrl: '/guardian-dashboard',
    actionLabel: 'عرض خريطة الأجزاء',
    metadata: { studentName, accomplishment },
  });
}

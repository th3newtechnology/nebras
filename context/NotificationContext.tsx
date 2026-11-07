import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Notification, NotificationType, NotificationCategory, NotificationPriority } from '../types';
import { AppNotification, NotificationStats } from '../types/notifications.types';
import {
  fetchUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllUserNotifications,
  fetchNotificationStats,
} from '../lib/notificationsService';
import { useAuth } from './AuthContext';

interface AddNotificationOptions {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  linkUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

interface NotificationContextType {
  notifications: Notification[];
  appNotifications: AppNotification[];
  activeCategory: NotificationCategory | 'all';
  setActiveCategory: (cat: NotificationCategory | 'all') => void;
  addNotification: (
    title: string,
    message: string,
    type: NotificationType,
    options?: AddNotificationOptions
  ) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  unreadCount: number;
  urgentCount: number;
  stats: NotificationStats | null;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// تحويل AppNotification إلى النموذج المتوافق Notification
function mapToLegacyNotification(n: AppNotification): Notification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    timestamp: new Date(n.createdAt),
    read: n.isRead,
    category: n.category,
    priority: n.priority,
    linkUrl: n.linkUrl,
    actionLabel: n.actionLabel,
    metadata: n.metadata,
    readAt: n.readAt,
  };
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [appNotifications, setAppNotifications] = useState<AppNotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentUserId = user?.id || 'current-user';

  // جلب الإشعارات من السيرفيس
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { notifications: loaded } = await fetchUserNotifications(currentUserId);
      setAppNotifications(loaded);

      const computedStats = await fetchNotificationStats(currentUserId);
      setStats(computedStats);
    } catch (err) {
      console.error('خطأ في تحميل الإشعارات:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // إضافة إشعار جديد
  const addNotification = useCallback(
    async (
      title: string,
      message: string,
      type: NotificationType,
      options?: AddNotificationOptions
    ) => {
      try {
        const res = await createNotification({
          userId: currentUserId,
          title,
          message,
          type,
          category: options?.category || 'system',
          priority: options?.priority || 'normal',
          linkUrl: options?.linkUrl,
          actionLabel: options?.actionLabel,
          metadata: options?.metadata,
        });

        if (res.success && res.notification) {
          setAppNotifications((prev) => [res.notification!, ...prev]);
        }
      } catch (err) {
        console.error('خطأ في إضافة الإشعار:', err);
      }
    },
    [currentUserId]
  );

  // تحديد إشعار محدد كمقروء
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationAsRead(id, currentUserId);
        setAppNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
      } catch (err) {
        console.error('خطأ في تحديد الإشعار كمقروء:', err);
      }
    },
    [currentUserId]
  );

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead(currentUserId);
      setAppNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error('خطأ في تحديد الكل كمقروء:', err);
    }
  }, [currentUserId]);

  // مسح جميع الإشعارات
  const clearAll = useCallback(async () => {
    try {
      await clearAllUserNotifications(currentUserId);
      setAppNotifications([]);
    } catch (err) {
      console.error('خطأ في مسح الإشعارات:', err);
    }
  }, [currentUserId]);

  // قائمة الإشعارات المتوافقة مع الكود القديم
  const notifications: Notification[] = appNotifications.map(mapToLegacyNotification);

  // الحسابات السريعة
  const unreadCount = appNotifications.filter((n) => !n.isRead).length;
  const urgentCount = appNotifications.filter(
    (n) => !n.isRead && (n.priority === 'urgent' || n.priority === 'high')
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        appNotifications,
        activeCategory,
        setActiveCategory,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        refreshNotifications,
        unreadCount,
        urgentCount,
        stats,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};

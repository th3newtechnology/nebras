import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Trash2, 
  Check, 
  CheckCheck, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  MessageSquare, 
  Award, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationCategory, NotificationPriority } from '../types/notifications.types';
import { ViewType } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: ViewType) => void;
}

const CATEGORY_TABS: Array<{ id: NotificationCategory | 'all'; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'absence', label: 'الغياب' },
  { id: 'report', label: 'التقارير' },
  { id: 'session', label: 'الحصص' },
  { id: 'message', label: 'الرسائل' },
  { id: 'achievement', label: 'الإنجازات' },
];

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  isOpen, 
  onClose,
  onNavigate 
}) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    unreadCount,
    urgentCount 
  } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | 'all'>('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  // تصفية الإشعارات
  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (selectedCategory !== 'all') {
      list = list.filter((n) => n.category === selectedCategory);
    }
    if (filterUnreadOnly) {
      list = list.filter((n) => !n.read);
    }
    return list;
  }, [notifications, selectedCategory, filterUnreadOnly]);

  if (!isOpen) return null;

  // أيقونة التصنيف
  const getCategoryIcon = (category?: NotificationCategory) => {
    switch (category) {
      case 'absence':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'report':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'session':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  // لون وخلفية أيقونة التصنيف
  const getCategoryBadgeClass = (category?: NotificationCategory) => {
    switch (category) {
      case 'absence':
        return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'report':
        return 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'session':
        return 'bg-blue-50 border-blue-100 text-blue-700';
      case 'message':
        return 'bg-indigo-50 border-indigo-100 text-indigo-700';
      case 'achievement':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      default:
        return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  // التعامل مع النقر على الإشعار أو زر الإجراء
  const handleActionClick = (n: any) => {
    if (!n.read) {
      markAsRead(n.id);
    }
    if (n.linkUrl && onNavigate) {
      const viewMap: Record<string, string> = {
        '/guardian-dashboard': 'dashboard',
        '/timetable': 'timetable',
        '/messages': 'messages',
        '/teacher/reports': 'grades',
      };
      const targetView = (viewMap[n.linkUrl] || 'dashboard') as ViewType;
      onNavigate(targetView);
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute top-full left-0 mt-2 w-96 max-w-[95vw] bg-white rounded-3xl shadow-2xl border border-emerald-100/80 z-50 overflow-hidden animate-in zoom-in-95 origin-top-left duration-200">
        
        {/* الترويسة الرئيسية */}
        <div className="p-4 border-b border-slate-100 bg-linear-to-r from-emerald-50/70 via-white to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-800 text-sm">التنبيهات المدرسية</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {unreadCount} جديد
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black animate-pulse">
                    {urgentCount} عاجل
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium">مسجد إبراهيم الخليل — مدرسة نبراس</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="تحديد الكل كمقروء"
                className="p-1.5 text-emerald-700 hover:bg-emerald-100/60 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="text-[10px]">قراءة الكل</span>
              </button>
            )}
            <button
              onClick={clearAll}
              title="مسح الكل"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* أشرطة التصفية والتصنيفات */}
        <div className="px-3 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            const categoryCount =
              tab.id === 'all'
                ? notifications.length
                : notifications.filter((n) => n.category === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
                {categoryCount > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {categoryCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* زر التصفية: غير المقروء فقط */}
        <div className="px-4 py-1.5 bg-white border-b border-slate-50 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">
            عرض {filteredNotifications.length} تنبيه
          </span>
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${
              filterUnreadOnly ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>{filterUnreadOnly ? 'إظهار الكل' : 'غير المقروء فقط'}</span>
          </button>
        </div>

        {/* قائمة التنبيهات */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100/80 custom-scrollbar">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => {
              const isUrgent = n.priority === 'urgent';
              const isHigh = n.priority === 'high';

              return (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors relative group hover:bg-slate-50/80 cursor-pointer ${
                    !n.read
                      ? isUrgent
                        ? 'bg-rose-50/40'
                        : isHigh
                        ? 'bg-amber-50/30'
                        : 'bg-emerald-50/30'
                      : 'bg-white'
                  }`}
                  onClick={() => handleActionClick(n)}
                >
                  <div className="flex gap-3">
                    
                    {/* أيقونة التصنيف مع نقطة الأولوية */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center border shadow-2xs ${getCategoryBadgeClass(
                          n.category
                        )}`}
                      >
                        {getCategoryIcon(n.category)}
                      </div>
                      {!n.read && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white ${
                            isUrgent
                              ? 'bg-rose-500 animate-ping'
                              : isHigh
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </div>

                    {/* تفاصيل التنبيه */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-black text-slate-800 truncate">
                          {n.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                          <Clock className="w-3 h-3 opacity-70" />
                          <span>
                            {n.timestamp.toLocaleTimeString('ar-DZ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {/* شريط الإجراء وسياق التنبيه */}
                      <div className="mt-2 flex items-center justify-between">
                        {n.actionLabel ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(n);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-200/60 transition-colors"
                          >
                            <span>{n.actionLabel}</span>
                            <ChevronRight className="w-3 h-3 rotate-180" />
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold">
                            {n.category === 'session'
                              ? 'حلقة تحفيظ'
                              : n.category === 'report'
                              ? 'تقرير دوري'
                              : n.category === 'absence'
                              ? 'انضباط وحضور'
                              : 'تنبيه مدرسي'}
                          </span>
                        )}

                        {!n.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            title="تحديد كمقروء"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">لا توجد تنبيهات مطابقة</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {filterUnreadOnly
                  ? 'تمت قراءة جميع التنبيهات في هذا القسم'
                  : 'ستظهر هنا إشعارات الحصص والتقارير والغياب فور صدورها'}
              </p>
            </div>
          )}
        </div>

        {/* تذييل النافذة */}
        <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100 flex items-center justify-between px-4 text-[10px]">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-500" />
            نظام التنبيهات اللحظي الميداني
          </span>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('dashboard');
              onClose();
            }}
            className="text-emerald-700 font-black hover:underline"
          >
            عرض البوابة الكاملة
          </button>
        </div>

      </div>
    </>
  );
};

export default NotificationDropdown;

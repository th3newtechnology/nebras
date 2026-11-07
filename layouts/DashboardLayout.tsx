import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { ViewType, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useSupabaseStatus } from '../hooks/useSupabaseStatus';
import {
  Bell,
  Search,
  Settings,
  LogOut,
  Globe,
  Menu,
  Database as DatabaseIcon,
  RefreshCw,
  Calendar,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';
import { NotificationContainer } from '../components/NotificationToast';

interface DashboardLayoutProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onGoPublic?: () => void;
  children: React.ReactNode;
}

const VIEW_TITLES: Record<ViewType, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'لوحة المؤشرات والتحليلات الإدارية',
    subtitle: 'نظرة شاملة ومؤشرات أداء مدرسة نبراس القرآنية',
  },
  students: {
    title: 'إدارة الطلاب وسجل الحفظ',
    subtitle: 'بيانات الطلاب، ربط الأولياء، ومسارات الحفظ القرآني',
  },
  teachers: {
    title: 'إدارة المعلمين والمحفظين',
    subtitle: 'ملفات المشايخ والمحفظات، الإجازات القرآنية، وتوزيع الحلقات',
  },
  halls: {
    title: 'الحلقات والأفواج والقاعات',
    subtitle: 'قاعات مسجد إبراهيم الخليل وتوزيع الحلقات وسعات الاستيعاب',
  },
  attendance: {
    title: 'كشوف الحضور والغياب',
    subtitle: 'رصد الحضور اليومي، المتابعة اللحظية، وإحصائيات الانضباط',
  },
  grades: {
    title: 'دفتر المتابعة وسجل الإتقان',
    subtitle: 'رصد الحفظ الجديد، المراجعة الصغرى والكبرى، والتقييمات التجويدية',
  },
  timetable: {
    title: 'الجدول الزمني للحلقات',
    subtitle: 'مواعيد الحلقات القرآنية مع منع تعارض القاعات والمحفظين',
  },
  registration: {
    title: 'طلبات الالتحاق والقبول',
    subtitle: 'مراجعة طلبات التسجيل الجديدة واعتمادها وتحويلها إلى مقيدين',
  },
  fees: {
    title: 'الرسوم والاشتراكات المدرسية',
    subtitle: 'المحرك المالي، سندات القبض، ومتابعة السداد بالدينار الجزائري (DZD)',
  },
  events: {
    title: 'الأخبار والفعاليات المدرسية',
    subtitle: 'نشر وإدارة الفعاليات القرآنية والإعلانات الموجهة',
  },
  messages: {
    title: 'مركز الرسائل والتواصل',
    subtitle: 'التواصل المباشر بين الإدارة وهيئة التدريس وأولياء الأمور',
  },
  settings: {
    title: 'إعدادات المدرسة وسجل التدقيق',
    subtitle: 'العام الدراسي النشط، سياسات الأمان، وسجل العمليات الإدارية (Audit Logs)',
  },
  recitation: {
    title: 'محطة الإقراء والتسميع المباشر',
    subtitle: 'جلسة الحلقة الحية، رصد الحفظ والمراجعة اللحظي بمحراب مسجد إبراهيم الخليل',
  },
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentView,
  onViewChange,
  onGoPublic,
  children,
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { unreadCount, notifications } = useNotifications();
  const { isConnected, isConfigured, refresh: refreshConnection, isLoading: isCheckingConnection } = useSupabaseStatus();

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isGuardian = user?.role === UserRole.GUARDIAN;
  const currentViewMeta = isTeacher && currentView === 'dashboard'
    ? { title: 'بوابة المعلم والمحفظ', subtitle: 'متابعة حلقات الإقراء، رصد التسميع القرآني، وجدول المواعيد بمسجد إبراهيم الخليل' }
    : isTeacher && currentView === 'students'
    ? { title: 'حلقاتي وطلابي بمحراب المسجد', subtitle: 'إدارة الحلقات المسندة، متابعة تطور حفظ الطلاب بالأجزاء وسجل التسميع' }
    : isGuardian && currentView === 'dashboard'
    ? { title: 'بوابة أولياء الأمور', subtitle: 'متابعة مسار حفظ الأبناء، تقارير المشايخ، والجدول الأسبوعي بمحراب مسجد إبراهيم الخليل' }
    : isGuardian && currentView === 'messages'
    ? { title: 'مركز الرسائل والتواصل', subtitle: 'التواصل المباشر مع مشايخ الحلقات وإدارة مدرسة نبراس' }
    : VIEW_TITLES[currentView] || VIEW_TITLES.dashboard;

  return (
    <div className="flex min-h-screen bg-ivory-50/70 text-slate-800 font-sans antialiased" dir="rtl">
      {/* Sidebar with Mobile Drawer support */}
      <Sidebar
        currentView={currentView}
        onViewChange={onViewChange}
        onGoPublic={onGoPublic}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-xs">
          {/* Left section: Hamburger (mobile) + View Titles */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-islamic-900 hover:bg-slate-100 transition-colors"
              aria-label="فتح القائمة الرئيسية"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-islamic-950 truncate leading-tight font-amiri">
                  {currentViewMeta.title}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-50 text-gold-700 border border-gold-200/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>1447-1448 هـ</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate hidden md:block">
                {currentViewMeta.subtitle}
              </p>
            </div>
          </div>

          {/* Right section: System Status Pill + Actions & Profile */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Supabase Connection Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isConnected
                  ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200/70'
                  : 'bg-amber-50/80 text-amber-800 border-amber-200/70'
              }`}
              title={isConnected ? 'متصل بنجاح مع Supabase PostgreSQL' : 'يعمل بالوضع المباشر المحلي الاحتياطي'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <DatabaseIcon className="w-3.5 h-3.5 opacity-80" />
              <span className="text-[11px]">
                {isConnected ? 'Supabase متصل' : 'قاعدة البيانات محلية'}
              </span>
              <button
                onClick={() => refreshConnection()}
                disabled={isCheckingConnection}
                className="p-1 hover:bg-black/5 rounded-md transition-colors"
                title="تحديث فحص الاتصال"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingConnection ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick Public Site Button */}
            {onGoPublic && (
              <button
                onClick={onGoPublic}
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-islamic-900 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                title="عرض الموقع العام التعريفي للمدرسة"
              >
                <Globe className="w-4 h-4 text-gold-600" />
                <span>الموقع العام</span>
              </button>
            )}

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2.5 rounded-xl relative transition-all ${
                  isNotificationOpen
                    ? 'bg-islamic-50 text-islamic-900 ring-2 ring-islamic-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
                aria-label="التنبيهات الإدارية"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onNavigate={onViewChange}
              />
            </div>

            {/* Settings shortcut for admin */}
            {isAdmin && (
              <button
                onClick={() => onViewChange('settings')}
                className={`p-2.5 text-slate-500 hover:bg-slate-100 hover:text-islamic-900 rounded-xl transition-colors ${
                  currentView === 'settings' ? 'bg-islamic-50 text-islamic-900 ring-1 ring-islamic-200' : ''
                }`}
                title="إعدادات المدرسة وسجل التدقيق"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
              title="تسجيل الخروج من البوابة"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-black text-gold-700 leading-tight">
                  {isAdmin
                    ? 'إدارة المدرسة'
                    : user?.role === UserRole.TEACHER
                    ? 'هيئة التدريس'
                    : user?.role === UserRole.STUDENT
                    ? 'بوابة الطالب'
                    : 'بوابة الولي'}
                </p>
                <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {user?.displayName || 'المسؤول'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-islamic-800 to-islamic-900 text-gold-300 flex items-center justify-center font-bold text-sm shadow-sm border border-gold-500/30">
                {user?.displayName?.[0]?.toUpperCase() || 'م'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-16">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications Toast Container */}
      <NotificationContainer
        notifications={notifications.slice(0, 3)}
        onRemove={() => {}}
      />
    </div>
  );
};
export default DashboardLayout;

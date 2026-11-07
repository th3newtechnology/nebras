import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  CreditCard,
  DoorOpen,
  Megaphone,
  GraduationCap,
  ClipboardCheck,
  CheckSquare,
  CalendarDays,
  Settings,
  UserPlus2,
  Heart,
  MessageCircle,
  BookOpen,
  Globe,
  X,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ViewType, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { SCHOOL_INFO } from '../constants';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onGoPublic?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  onGoPublic,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isStudent = user?.role === UserRole.STUDENT;

  const adminMenu = [
    { id: 'dashboard', label: 'لوحة المؤشرات والتحليلات', icon: LayoutDashboard },
    { id: 'students', label: 'إدارة الطلاب وسجل الحفظ', icon: Users },
    { id: 'teachers', label: 'إدارة المعلمين والمحفظين', icon: UserSquare2 },
    { id: 'halls', label: 'الحلقات والأفواج والقاعات', icon: DoorOpen },
    { id: 'attendance', label: 'كشوف الحضور والغياب', icon: CheckSquare },
    { id: 'grades', label: 'دفتر المتابعة وسجل الإتقان', icon: ClipboardCheck },
    { id: 'timetable', label: 'الجدول الزمني للحلقات', icon: CalendarDays },
    { id: 'registration', label: 'طلبات الالتحاق والقبول', icon: UserPlus2 },
    { id: 'fees', label: 'الرسوم والاشتراكات (DZD)', icon: CreditCard },
    { id: 'events', label: 'الأخبار والفعاليات', icon: Megaphone },
    { id: 'messages', label: 'مركز الرسائل والتواصل', icon: MessageCircle },
    { id: 'settings', label: 'إعدادات المدرسة وسجل التدقيق', icon: Settings },
  ];

  const teacherMenu = [
    { id: 'dashboard', label: 'لوحة تحكم المعلم', icon: LayoutDashboard },
    { id: 'recitation', label: 'محطة الإقراء المباشر', icon: BookOpen },
    { id: 'students', label: 'حلقاتي وطلابي', icon: Users },
    { id: 'attendance', label: 'تسجيل الحضور والغياب', icon: CheckSquare },
    { id: 'grades', label: 'رصد الحفظ والمراجعة', icon: ClipboardCheck },
    { id: 'timetable', label: 'جدول الحلقات المسندة', icon: CalendarDays },
    { id: 'messages', label: 'التواصل مع الإدارة والأولياء', icon: MessageCircle },
  ];

  const guardianMenu = [
    { id: 'dashboard', label: 'متابعة الأبناء القرآنية', icon: Heart },
    { id: 'events', label: 'الفعاليات والأخبار', icon: Sparkles },
    { id: 'messages', label: 'التواصل مع معلم الحلقة', icon: MessageCircle },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'ملف الطالب ومحفوظاتي', icon: GraduationCap },
    { id: 'messages', label: 'التواصل مع المحفظ', icon: MessageCircle },
  ];

  const menuItems = isAdmin ? adminMenu : isTeacher ? teacherMenu : isStudent ? studentMenu : guardianMenu;

  const roleTitle = isAdmin
    ? 'بوابة الإدارة المركزية'
    : isTeacher
    ? 'بوابة المعلم والمحفظ'
    : isStudent
    ? 'بوابة الطالب'
    : 'بوابة الولي';

  const roleBadge = isAdmin
    ? 'مدير النظام (صلاحيات كاملة)'
    : isTeacher
    ? 'هيئة التدريس والتحفيظ'
    : isStudent
    ? 'طالب مسجل'
    : 'ولي أمر معتمد';

  const handleItemClick = (id: ViewType) => {
    onViewChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 h-screen w-72 bg-white border-l border-slate-200/80 flex flex-col shadow-2xl lg:shadow-none shrink-0 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        aria-label="القائمة الجانبية للنظام"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-ivory-100/90 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-islamic-800 flex items-center justify-center text-gold-400 shadow-md shadow-islamic-900/20 shrink-0 border border-gold-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black text-islamic-950 truncate leading-tight font-amiri">
                    {SCHOOL_INFO.name}
                  </h1>
                  <Sparkles className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-gold-700 truncate mt-0.5">
                  {roleTitle}
                </p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Role Badge */}
          <div className="mt-3.5 px-3 py-1.5 rounded-xl bg-islamic-50/80 border border-islamic-100 text-[10px] font-bold text-islamic-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span>{roleBadge}</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id as ViewType)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-right group ${
                  isActive
                    ? 'bg-gradient-to-r from-islamic-900 to-islamic-800 text-white font-bold shadow-md shadow-islamic-950/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-islamic-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/10 text-gold-300'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-islamic-100 group-hover:text-islamic-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs truncate">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-4 rounded-full bg-gold-400 shrink-0"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-2.5">
          {onGoPublic && (
            <button
              onClick={() => {
                onGoPublic();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-islamic-900 bg-white hover:bg-islamic-50 transition-colors border border-slate-200 hover:border-islamic-300 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-gold-600" />
              <span>معاينة الموقع العام للمدرسة</span>
            </button>
          )}

          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/70 flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-islamic-800 to-islamic-900 text-gold-300 flex items-center justify-center font-bold text-sm shrink-0 border border-gold-500/30">
              {user?.displayName?.[0] || 'م'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName || 'المسؤول'}</p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email || 'admin@nebras-quran.edu'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

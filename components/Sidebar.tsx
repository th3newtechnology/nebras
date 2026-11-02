
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
  MessageCircle
} from 'lucide-react';
import { ViewType, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isStudent = user?.role === UserRole.STUDENT;

  const adminMenu = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'registration', label: 'التسجيل والقبول', icon: UserPlus2 },
    { id: 'students', label: 'إدارة الطلاب', icon: Users },
    { id: 'messages', label: 'مركز الرسائل', icon: MessageCircle },
    { id: 'attendance', label: 'تحضير الحضور', icon: CheckSquare },
    { id: 'grades', label: 'التقييم والدرجات', icon: ClipboardCheck },
    { id: 'timetable', label: 'الجداول الدراسية', icon: CalendarDays },
    { id: 'teachers', label: 'إدارة المعلمين', icon: UserSquare2 },
    { id: 'halls', label: 'القاعات الدراسية', icon: DoorOpen },
    { id: 'fees', label: 'متابعة الرسوم', icon: CreditCard },
    { id: 'events', label: 'الأحداث والإعلانات', icon: Megaphone },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  const teacherMenu = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'attendance', label: 'تحضير الحضور', icon: CheckSquare },
    { id: 'grades', label: 'التقييم والدرجات', icon: ClipboardCheck },
    { id: 'timetable', label: 'الجداول الدراسية', icon: CalendarDays },
    { id: 'messages', label: 'مركز الرسائل', icon: MessageCircle },
  ];

  const guardianMenu = [
    { id: 'dashboard', label: 'بوابة الأبناء', icon: Heart },
    { id: 'messages', label: 'تواصل مع المعلم', icon: MessageCircle },
  ];

  const studentMenu = [
    { id: 'dashboard', label: 'بوابة الطالب', icon: GraduationCap },
    { id: 'messages', label: 'تواصل مع معلمي', icon: MessageCircle },
  ];

  const menuItems = isAdmin ? adminMenu : isTeacher ? teacherMenu : isStudent ? studentMenu : guardianMenu;

  const bgGradientClass = isAdmin ? 'bg-cyan-600 shadow-cyan-600/20' : isTeacher ? 'bg-emerald-600 shadow-emerald-600/20' : isStudent ? 'bg-teal-600 shadow-teal-600/20' : 'bg-indigo-600 shadow-indigo-600/20';
  const textRoleClass = isAdmin ? 'التعليمي' : isTeacher ? 'للمعلمين' : isStudent ? 'للطلاب' : 'للآباء';

  return (
    <aside className={`w-64 h-screen bg-white border-l border-slate-200 sticky top-0 flex flex-col shadow-sm shrink-0 transition-all ${!isAdmin ? 'border-l-indigo-100' : ''}`}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className={`${bgGradientClass} p-2 rounded-lg shadow-lg`}>
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">نبراس {textRoleClass}</h1>
      </div>

      <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const activeClass = isAdmin ? 'bg-cyan-50 text-cyan-700' : isTeacher ? 'bg-emerald-50 text-emerald-700' : isStudent ? 'bg-teal-50 text-teal-700' : 'bg-indigo-50 text-indigo-700';
          const iconActiveColor = isAdmin ? 'text-cyan-600' : isTeacher ? 'text-emerald-600' : isStudent ? 'text-teal-600' : 'text-indigo-600';

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                  ? `${activeClass} font-bold shadow-sm`
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? iconActiveColor : 'text-slate-400'}`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className={`${isAdmin ? 'bg-slate-50' : isTeacher ? 'bg-emerald-50/30' : isStudent ? 'bg-teal-50/30' : 'bg-indigo-50/30'} rounded-xl p-4 flex items-center gap-3`}>
          <div className={`w-10 h-10 rounded-full ${isAdmin ? 'bg-cyan-100 text-cyan-700' : isTeacher ? 'bg-emerald-100 text-emerald-700' : isStudent ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
            {user?.displayName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.displayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{isAdmin ? 'إدارة النظام' : isTeacher ? 'معلم / محفظ' : isStudent ? 'طالب' : 'ولي أمر'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

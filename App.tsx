
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Halls from './pages/Halls';
import Teachers from './pages/Teachers';
import Fees from './pages/Fees';
import Events from './pages/Events';
import Grades from './pages/Grades';
import Attendance from './pages/Attendance';
import Timetable from './pages/Timetable';
import Registration from './pages/Registration';
import SettingsPage from './pages/Settings';
import Messages from './pages/Messages';
import Login from './pages/Login';
import { ViewType, UserRole } from './types';
import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationContainer } from './components/NotificationToast';
import NotificationDropdown from './components/NotificationDropdown';

const AppContent: React.FC = () => {
  const { user, setDemoUser } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [feesSearchTerm, setFeesSearchTerm] = useState('');
  const { unreadCount, notifications } = useNotifications();

  if (!user) {
    return <Login />;
  }

  const isAdmin = user.role === UserRole.ADMIN;

  const handleLogout = () => {
    setDemoUser(false);
  };

  const navigateToFees = (studentName: string) => {
    setFeesSearchTerm(studentName);
    setCurrentView('fees');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'registration': return <Registration />;
      case 'students': return <Students onNavigateToFees={navigateToFees} />;
      case 'halls': return <Halls />;
      case 'teachers': return <Teachers />;
      case 'fees': return <Fees initialSearch={feesSearchTerm} onSearchClear={() => setFeesSearchTerm('')} />;
      case 'events': return <Events />;
      case 'grades': return <Grades />;
      case 'attendance': return <Attendance />;
      case 'timetable': return <Timetable />;
      case 'settings': return isAdmin ? <SettingsPage /> : <Dashboard />;
      case 'messages': return <Messages />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-4 text-slate-400">
            <Search className="w-5 h-5" />
            <input 
              type="text" 
              placeholder="ابحث عن أي شيء..." 
              className="bg-transparent border-none focus:outline-none text-slate-700 text-sm w-64"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 hover:bg-slate-50 rounded-lg relative transition-colors ${isNotificationOpen ? 'bg-slate-100 text-cyan-600' : 'text-slate-500'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
            </div>
            
            {isAdmin && (
              <button onClick={() => setCurrentView('settings')} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            )}
            
            <button 
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors group"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 leading-none">
                  {isAdmin ? 'إدارة المدرسة' : user.role === UserRole.STUDENT ? 'بوابة الطالب' : 'بوابة الأبناء'}
                </p>
                <p className="text-xs font-bold text-slate-600">{user.displayName}</p>
              </div>
              <div className={`w-8 h-8 rounded-full ${isAdmin ? 'bg-cyan-100 text-cyan-700' : user.role === UserRole.STUDENT ? 'bg-teal-100 text-teal-700' : 'bg-indigo-100 text-indigo-700'} flex items-center justify-center font-bold text-xs`}>
                {user.displayName?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            {renderView()}
          </div>
        </div>
      </main>

      <NotificationContainer notifications={notifications.slice(0, 3)} onRemove={() => {}} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

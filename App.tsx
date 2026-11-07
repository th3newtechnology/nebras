import React, { useState, Suspense, lazy } from 'react';
import Login from './pages/Login';
import { PublicHome } from './pages/PublicHome';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ViewType, UserRole } from './types';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Loader2 } from 'lucide-react';

// تقسيم الحزم والتحميل الكسول لشاشات وبوابات النظام
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const GuardianDashboard = lazy(() => import('./pages/GuardianDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const TeacherCirclesStudents = lazy(() => import('./pages/TeacherCirclesStudents'));
const LiveRecitationStation = lazy(() => import('./pages/LiveRecitationStation'));
const Students = lazy(() => import('./pages/Students'));
const Halls = lazy(() => import('./pages/Halls'));
const Teachers = lazy(() => import('./pages/Teachers'));
const Fees = lazy(() => import('./pages/Fees'));
const Events = lazy(() => import('./pages/Events'));
const Grades = lazy(() => import('./pages/Grades'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Registration = lazy(() => import('./pages/Registration'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const Messages = lazy(() => import('./pages/Messages'));

const PortalLoadingFallback: React.FC = () => (
  <div className="py-24 flex flex-col items-center justify-center space-y-3 animate-in fade-in" dir="rtl">
    <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-emerald-800 flex items-center justify-center shadow-xs">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
    </div>
    <p className="text-xs font-bold text-slate-500 font-amiri text-lg">
      جاري تحميل الشاشة المباركة...
    </p>
  </div>
);

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [appMode, setAppMode] = useState<'public' | 'login' | 'dashboard'>(user ? 'dashboard' : 'public');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [feesSearchTerm, setFeesSearchTerm] = useState('');

  // إذا قام المستخدم بتسجيل الدخول ولم يكن في وضع لوحة التحكم، انقله للوحة التحكم
  React.useEffect(() => {
    if (user && appMode === 'login') {
      setAppMode('dashboard');
    }
  }, [user, appMode]);

  const navigateToFees = (studentName: string) => {
    setFeesSearchTerm(studentName);
    setCurrentView('fees');
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;
  const isGuardian = user?.role === UserRole.GUARDIAN;
  const isStudent = user?.role === UserRole.STUDENT;

  const renderDashboardView = () => {
    switch (currentView) {
      case 'dashboard':
        if (isTeacher) {
          return <TeacherDashboard onNavigateView={setCurrentView} />;
        }
        if (isGuardian) {
          return <GuardianDashboard onNavigateView={setCurrentView} />;
        }
        if (isStudent) {
          return <StudentDashboard onNavigateView={setCurrentView} />;
        }
        return (
          <Dashboard
            onNavigateView={(view, param) => {
              if (view === 'fees' && param) {
                setFeesSearchTerm(param);
              }
              setCurrentView(view);
            }}
          />
        );
      case 'registration':
        return isAdmin ? <Registration /> : <Dashboard />;
      case 'students':
        if (isTeacher) {
          return <TeacherCirclesStudents onNavigateView={setCurrentView} />;
        }
        return isAdmin ? <Students onNavigateToFees={navigateToFees} /> : <Dashboard />;
      case 'halls':
        return isAdmin ? <Halls /> : <Dashboard />;
      case 'teachers':
        return isAdmin ? <Teachers /> : <Dashboard />;
      case 'fees':
        return isAdmin ? <Fees initialSearch={feesSearchTerm} onSearchClear={() => setFeesSearchTerm('')} /> : <Dashboard />;
      case 'events':
        return <Events />;
      case 'grades':
        return <Grades />;
      case 'attendance':
        return <Attendance />;
      case 'timetable':
        return <Timetable />;
      case 'settings':
        return isAdmin ? <SettingsPage /> : <Dashboard />;
      case 'messages':
        return <Messages />;
      case 'recitation':
        return isTeacher ? <LiveRecitationStation onNavigateView={setCurrentView} /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  // الحالة 1: غير مسجل دخول وفي وضع تسجيل الدخول
  if (!user && appMode === 'login') {
    return <Login onBackToPublic={() => setAppMode('public')} />;
  }

  // الحالة 2: وضع تصفح الموقع العام (سواء زائر أو مستخدم مسجل يريد تفقد الموقع)
  if (appMode === 'public') {
    return (
      <PublicLayout
        onNavigateLogin={() => setAppMode(user ? 'dashboard' : 'login')}
        onNavigateSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        {user && (
          <div className="bg-islamic-900 text-ivory-100 py-2.5 px-4 text-xs font-bold flex items-center justify-between border-b border-islamic-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>أنت مسجل الدخول حالياً بصفتك: {user.displayName}</span>
            </div>
            <button
              onClick={() => setAppMode('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gold-500 text-white hover:bg-gold-600 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>العودة للبوابة الداخلية</span>
            </button>
          </div>
        )}
        <PublicHome
          onEnterPortal={() => setAppMode(user ? 'dashboard' : 'login')}
        />
      </PublicLayout>
    );
  }

  // الحالة 3: مسجل الدخول وفي النظام الداخلي
  if (user) {
    return (
      <DashboardLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        onGoPublic={() => setAppMode('public')}
      >
        <Suspense fallback={<PortalLoadingFallback />}>
          {renderDashboardView()}
        </Suspense>
      </DashboardLayout>
    );
  }

  // Fallback
  return <Login onBackToPublic={() => setAppMode('public')} />;
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

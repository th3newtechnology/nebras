import React, { useState, useMemo } from 'react';
import {
  Users,
  DoorOpen,
  CheckCircle2,
  Wallet,
  UserPlus,
  TrendingUp,
  Award,
  Clock,
  BookOpen,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
  Heart,
  Activity,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Phone,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useAdminDashboardData, DashboardApplicationItem } from '../hooks/useAdminDashboardData';
import { ViewType, UserRole, PaymentStatus } from '../types';
import { useLocalCollection } from '../hooks/useLocalDB';
import Modal from '../components/Modal';
import { StudentDetailsContent } from './Students';
import { ExecutiveOversightSection } from '../components/oversight/ExecutiveOversightSection';

interface DashboardProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateView }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  // استدعاء بيانات لوحة المؤشرات المتكاملة
  const dashboardData = useAdminDashboardData();
  const {
    academicYear,
    students,
    circlesAndHalls,
    attendance,
    financials,
    applications,
    memorization,
    isLoading,
    isLiveSupabase,
    lastUpdated,
    refetch,
  } = dashboardData;

  // للمستخدمين غير الإداريين (الأولياء والطلاب)
  const { data: localStudents } = useLocalCollection('students');
  const { data: localTeachers } = useLocalCollection('teachers');
  const { data: localHalls } = useLocalCollection('halls');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // تبويب الرسوم البيانية النشط
  const [activeChartTab, setActiveChartTab] = useState<'hifz' | 'attendance' | 'levels' | 'financial'>('hifz');

  // مصفاة الأبناء لغير الإداريين
  const myChildren = useMemo(() => {
    if (user?.role === UserRole.STUDENT) {
      return localStudents.filter(s => s.id === user.studentId);
    }
    return localStudents.filter(s => user?.studentIds?.includes(s.id));
  }, [localStudents, user]);

  // =========================================================================
  // 1. واجهة غير الإداريين (ولي الأمر أو الطالب)
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="bg-gradient-to-r from-islamic-900 to-islamic-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-gold-500/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-gold-300 border border-white/20 shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gold-400 bg-gold-950/40 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                  {academicYear}
                </span>
                <span className="text-xs text-ivory-200">مسجد إبراهيم الخليل</span>
              </div>
              <h2 className="text-2xl font-black mt-1 font-amiri">
                {user?.role === UserRole.STUDENT
                  ? `أهلاً بك يا بطل القرآن: ${user?.displayName}`
                  : `أهلاً بك ولي الأمر الفاضل: ${user?.displayName}`}
              </h2>
              <p className="text-xs text-ivory-200/80 mt-0.5">
                سجل المتابعة اليومية وإتقان الحفظ القرآني والتواصل مع محفظ الحلقة
              </p>
            </div>
          </div>
        </header>

        {myChildren.length === 0 ? (
          <div className="py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Heart className="w-16 h-16 opacity-20 text-islamic-400" />
            <p className="font-bold text-base text-slate-700">لم يتم ربط أي طالب بحسابك حتى الآن</p>
            <p className="text-xs">يرجى التواصل مع إدارة مدرسة نبراس بمسجد إبراهيم الخليل لربط الحساب</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-islamic-900 to-islamic-800 p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 text-gold-300 font-black text-2xl flex items-center justify-center border border-white/20">
                      {child.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{child.name}</h3>
                      <p className="text-xs text-gold-300 font-bold mt-0.5">
                        المستوى القرآني: جزء {child.hifzLevel} • الانضباط: {child.attendanceRate}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedChildId(child.id)}
                    className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span>سجل الدرجات والمتابعة التفصيلي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">نسبة الانضباط</span>
                    <p className="text-xl font-black text-emerald-600 mt-1">{child.attendanceRate}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">الدرجة السلوكية</span>
                    <p className="text-xl font-black text-gold-600 mt-1">{child.behaviorScore} / 100</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">آخر مراجعة</span>
                    <p className="text-xs font-bold text-slate-700 mt-2 truncate">{child.lastRevision || 'سورة البقرة'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">الاشتراك الشهري</span>
                    <p className="text-xs font-bold text-emerald-700 mt-2">
                      {child.paymentStatus === PaymentStatus.PAID ? 'مسدد (DZD)' : 'مستحق السداد'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={!!selectedChildId}
          onClose={() => setSelectedChildId(null)}
          title="سجل المتابعة القرآني للطالب"
          size="xl"
        >
          {selectedChildId && (
            <div className="p-2">
              <StudentDetailsContent
                student={localStudents.find(s => s.id === selectedChildId)!}
                teachers={localTeachers}
                halls={localHalls}
                onRefresh={() => {}}
                readOnly={true}
              />
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // =========================================================================
  // 2. الواجهة الإدارية المتكاملة (ADMIN DASHBOARD — المرحلة 7.1)
  // =========================================================================
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Welcome & Actions Header */}
      <section className="bg-gradient-to-l from-islamic-950 via-islamic-900 to-islamic-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-gold-500/25">
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>العام الدراسي: {academicYear}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isLiveSupabase
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLiveSupabase ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isLiveSupabase ? 'قاعدة بيانات Supabase حية' : 'مؤشرات المحاكاة التأسيسية'}</span>
              </span>

              {lastUpdated && (
                <span className="text-[11px] text-ivory-300/70">
                  آخر تحديث: {lastUpdated}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-ivory-50 tracking-tight font-amiri">
              مرحباً بك مجدداً، {user?.displayName || 'مدير المدرسة'} 👋
            </h2>
            <p className="text-xs md:text-sm text-ivory-200/90 max-w-2xl leading-relaxed">
              لوحة التحكم المركزية لمدرسة نبراس القرآن بمسجد إبراهيم الخليل — مراقبة لحظية لمؤشرات التحفيظ، الحضور، الإشغال، والتحصيل المالي بالدينار الجزائري.
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 backdrop-blur-sm"
              title="تحديث مؤشرات لوحة التحكم"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            {onNavigateView && (
              <>
                <button
                  onClick={() => onNavigateView('students')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>إدارة الطلاب</span>
                </button>

                <button
                  onClick={() => onNavigateView('registration')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-gold-900/30 relative"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>طلبات القبول</span>
                  {applications.pendingCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center -mr-1">
                      {applications.pendingCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 5 Core Metrics Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
        {/* Card 1: Students */}
        <div
          onClick={() => onNavigateView?.('students')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-islamic-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">الطلاب المقيدون</span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform border border-cyan-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-amiri">{students.active}</span>
              <span className="text-xs font-bold text-slate-500">طالب نشط</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>{students.male} ذكور • {students.female} إناث</span>
              <span className="text-cyan-700 font-bold">{students.total} كلي</span>
            </div>
          </div>
        </div>

        {/* Card 2: Circles & Halls */}
        <div
          onClick={() => onNavigateView?.('halls')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-islamic-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">الحلقات والقاعات</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-100">
              <DoorOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-amiri">{circlesAndHalls.activeCircles}</span>
              <span className="text-xs font-bold text-slate-500">حلقات عاملة</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>الإشغال: <strong className="text-amber-700">{circlesAndHalls.occupancyRate}%</strong></span>
              <span>{circlesAndHalls.totalHalls} قاعات</span>
            </div>
          </div>
        </div>

        {/* Card 3: Attendance */}
        <div
          onClick={() => onNavigateView?.('attendance')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-islamic-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">الحضور اليومي</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-amiri">{attendance.todayRate}%</span>
              <span className="text-xs font-bold text-emerald-600">نسبة ممتازة</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>{attendance.presentCount} حاضر • {attendance.lateCount} متأخر</span>
              <span className="text-rose-600 font-bold">{attendance.absentCount} غائب</span>
            </div>
          </div>
        </div>

        {/* Card 4: Financial Engine (DZD) */}
        <div
          onClick={() => onNavigateView?.('fees')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-islamic-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">تحصيل الاشتراكات</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform border border-indigo-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 font-amiri">
                {financials.totalCollectedDzd.toLocaleString('ar-DZ')}
              </span>
              <span className="text-[11px] font-bold text-slate-500">د.ج</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>التحصيل: <strong className="text-indigo-700">{financials.collectionRate}%</strong></span>
              <span className="text-amber-700 font-bold">باقٍ: {financials.totalRemainingDzd.toLocaleString('ar-DZ')} د.ج</span>
            </div>
          </div>
        </div>

        {/* Card 5: Registration Applications */}
        <div
          onClick={() => onNavigateView?.('registration')}
          className="bg-gradient-to-br from-gold-50/80 to-white p-5 rounded-3xl border border-gold-200/90 shadow-xs hover:shadow-md hover:border-gold-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gold-900">طلبات جديدة</span>
            <div className="w-10 h-10 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center group-hover:scale-110 transition-transform border border-gold-200">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-gold-900 font-amiri">{applications.pendingCount}</span>
              <span className="text-xs font-bold text-gold-700">طلب قيد المراجعة</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-gold-800/90 pt-2 border-t border-gold-200/50">
              <span>{applications.approvedCount} معتمد</span>
              <span className="text-xs font-black text-islamic-900 flex items-center gap-0.5">
                فحص <ChevronLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* لوحة الرقابة الإدارية الشاملة وجودة التحفيظ (المرحلة 8.4.8) */}
      <ExecutiveOversightSection onNavigateView={onNavigateView} />

      {/* Main Interactive Charts & Analytics Section */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
        {/* Chart Header & Tab Switches */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 font-amiri flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-islamic-800" />
              <span>تحليلات الأداء القرآني والتربوي</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              رسوم بيانية تفاعلية تعكس وتيرة الحفظ الفعلي، معدلات الإنجاز، والانضباط
            </p>
          </div>

          {/* Chart Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setActiveChartTab('hifz')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeChartTab === 'hifz'
                  ? 'bg-white text-islamic-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              وتيرة الحفظ التراكمي
            </button>
            <button
              onClick={() => setActiveChartTab('attendance')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeChartTab === 'attendance'
                  ? 'bg-white text-islamic-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الحضور الأسبوعي
            </button>
            <button
              onClick={() => setActiveChartTab('levels')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeChartTab === 'levels'
                  ? 'bg-white text-islamic-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المستويات القرآنية
            </button>
            <button
              onClick={() => setActiveChartTab('financial')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeChartTab === 'financial'
                  ? 'bg-white text-islamic-900 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حالة الاشتراكات
            </button>
          </div>
        </div>

        {/* Chart View Content */}
        <div className="h-80 w-full pt-2">
          {activeChartTab === 'hifz' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memorization.monthlyHifzProgress} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAyahs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorJuz" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#064e3b',
                    borderRadius: '1rem',
                    border: '1px solid #059669',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                  }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Area
                  type="monotone"
                  name="الآيات المحفوظة الجديدة"
                  dataKey="newMemorizationAyahs"
                  stroke="#059669"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAyahs)"
                />
                <Area
                  type="monotone"
                  name="الأجزاء المراجعة"
                  dataKey="reviewedJuz"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorJuz)"
                />
                <Legend
                  wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontWeight: 'bold' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'attendance' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance.weeklyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 'bold',
                  }}
                />
                <Bar name="نسبة الحضور %" dataKey="rate" fill="#059669" radius={[8, 8, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'levels' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={students.levelDistribution} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis dataKey="level" type="category" width={140} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#064e3b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                />
                <Bar name="عدد الطلاب" dataKey="count" fill="#d97706" radius={[0, 8, 8, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'financial' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financials.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={4}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {financials.statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '1rem',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} اشتراك (${(item?.payload?.amount || 0).toLocaleString('ar-DZ')} د.ج)`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Two Column Operational Grid: Pending Applications & Pedagogical Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column (7 cols): Pending Registration Applications */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 font-amiri flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold-600" />
                  <span>طلبات الالتحاق الجديدة الواردة من الموقع العام</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  الطلبات التي قدمها الأولياء عبر الموقع العام وتنتظر التحويل إلى طلاب رسميين
                </p>
              </div>

              {onNavigateView && (
                <button
                  onClick={() => onNavigateView('registration')}
                  className="text-xs font-bold text-islamic-800 hover:text-islamic-950 flex items-center gap-1 transition-colors"
                >
                  <span>عرض الكل ({applications.pendingCount})</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {applications.recentPending.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
                <p className="text-xs font-bold text-slate-600">لا توجد طلبات التحاق معلقة حالياً</p>
                <p className="text-[11px]">كافة طلبات الموقع العام تمت مراجعتها واعتمادها بنجاح</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {applications.recentPending.map(app => (
                  <div
                    key={app.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-gold-50/50 border border-slate-200/60 hover:border-gold-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold text-sm shrink-0 border border-gold-200">
                        {app.studentName[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 truncate">{app.studentName}</h4>
                          {app.studentAge && (
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                              {app.studentAge} سنوات
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-gold-700 bg-gold-100/60 px-2 py-0.5 rounded-md">
                            {app.desiredTrack === 'MEMORIZATION' ? 'حفظ القرآن' : app.desiredTrack === 'BEGINNER' ? 'براعم وتأسيس' : app.desiredTrack === 'TAJWEED' ? 'تجويد وروايات' : 'إجازة'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-2">
                          <span>الولي: {app.guardianName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span dir="ltr">{app.guardianPhone}</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[10px] text-slate-400">{app.createdAt}</span>
                      {onNavigateView && (
                        <button
                          onClick={() => onNavigateView('registration')}
                          className="px-3 py-1.5 bg-islamic-800 hover:bg-islamic-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          فحص وقبول
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>إجمالي طلبات التسجيل الموثقة: <strong>{applications.totalCount}</strong></span>
            <span className="text-emerald-700 font-bold">تم قبول {applications.approvedCount} طالباً</span>
          </div>
        </div>

        {/* Right Column (5 cols): Recent Quranic Memorization Logs */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base md:text-lg font-black text-slate-900 font-amiri flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>أحدث جلسات التسميع والتقييم</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  رصد مباشر لجلسات الحفظ والمراجعة بالحلقات القرآنية
                </p>
              </div>

              {onNavigateView && (
                <button
                  onClick={() => onNavigateView('grades')}
                  className="text-xs font-bold text-islamic-800 hover:text-islamic-950 flex items-center gap-1 transition-colors"
                >
                  <span>دفتر الإتقان</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {memorization.recentLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      جـ {log.juz}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800 truncate">سورة {log.surahName}</span>
                        <span className="text-[10px] text-slate-500">الآيات {log.ayahFrom}-{log.ayahTo}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {log.studentName && (
                          <span className="text-[11px] font-bold text-slate-700 truncate">{log.studentName}</span>
                        )}
                        <span className="text-[10px] text-slate-400">• {log.recordType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        log.grade === 'ممتاز'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.grade === 'جيد جداً'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.grade}
                    </span>
                    <p className="text-[9px] text-slate-400 mt-1">{log.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>نسبة الإتقان الممتاز: <strong className="text-emerald-700">{memorization.excellentGradeRate}%</strong></span>
            <span>{memorization.totalSessionsThisMonth} جلسة تسميع هذا الشهر</span>
          </div>
        </div>
      </section>

      {/* Circles & Halls Capacity Distribution Overview */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 font-amiri flex items-center gap-2">
              <Layers className="w-5 h-5 text-islamic-800" />
              <span>معدلات إشغال الحلقات وقاعات مسجد إبراهيم الخليل</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              توزيع الطلاب المقيدين على الحلقات النشطة وسعات الاستيعاب المصرح بها
            </p>
          </div>

          {onNavigateView && (
            <button
              onClick={() => onNavigateView('halls')}
              className="text-xs font-bold text-islamic-800 hover:text-islamic-950 flex items-center gap-1 transition-colors self-start sm:self-center"
            >
              <span>إدارة الحلقات والجدول الزمني</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {circlesAndHalls.circlesOverview.map(circle => (
            <div
              key={circle.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-islamic-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 truncate">{circle.name}</span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {circle.gender}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>المستوى: <strong>{circle.level}</strong></span>
                <span>{circle.enrolledCount} / {circle.capacity} طالب</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    circle.occupancyPercent >= 95
                      ? 'bg-rose-500'
                      : circle.occupancyPercent >= 80
                      ? 'bg-emerald-600'
                      : 'bg-gold-500'
                  }`}
                  style={{ width: `${circle.occupancyPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>نسبة الإشغال</span>
                <span className="font-bold text-slate-700">{circle.occupancyPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

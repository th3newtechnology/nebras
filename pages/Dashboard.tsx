
import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  TrendingUp,
  Target,
  Award,
  CalendarDays,
  BookOpen,
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
  Star,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  // Fix: Import BarChart and Bar directly from recharts
  BarChart,
  Bar
} from 'recharts';
import { useLocalCollection } from '../hooks/useLocalDB';
import { PaymentStatus, UserRole, Student } from '../types';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { StudentDetailsContent } from './Students';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { data: students } = useLocalCollection('students');
  const { data: teachers } = useLocalCollection('teachers');
  const { data: halls } = useLocalCollection('halls');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // البيانات التجريبية للرسوم البيانية (سيتم استقاؤها من السجل الفعلي في النسخ المتقدمة)
  const hifzTrendData = [
    { month: 'يناير', juz: 2 },
    { month: 'فبراير', juz: 3.5 },
    { month: 'مارس', juz: 4.2 },
    { month: 'أبريل', juz: 6 },
    { month: 'مايو', juz: 7.8 },
  ];

  const behaviorData = [
    { subject: 'الحفظ', A: 90, full: 100 },
    { subject: 'التجويد', A: 85, full: 100 },
    { subject: 'الانضباط', A: 95, full: 100 },
    { subject: 'السلوك', A: 100, full: 100 },
    { subject: 'المراجعة', A: 75, full: 100 },
  ];

  const myChildren = useMemo(() => {
    if (user?.role === UserRole.STUDENT) {
      return students.filter(s => s.id === user.studentId);
    }
    return students.filter(s => user?.studentIds?.includes(s.id));
  }, [students, user]);

  // واجهة ولي الأمر
  if (!isAdmin) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-600/20 flex items-center justify-center text-white">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight tracking-tighter">لوحة المتابعة التحليلية</h2>
              <p className="text-slate-500 mt-1 font-medium italic">
                {user?.role === UserRole.STUDENT ? `أهلاً بك يا بطل، ${user?.displayName}` : `أهلاً بك ولي أمر ${user?.displayName}، نعتز بثقتك`}
              </p>
            </div>
          </div>
        </header>

        {myChildren.length === 0 ? (
          <div className="py-32 bg-white rounded-[3rem] border-4 border-dashed border-indigo-50 flex flex-col items-center justify-center text-slate-400 space-y-4 shadow-sm">
            <Heart className="w-20 h-20 opacity-10 text-indigo-300" />
            <div className="text-center">
              <p className="font-black text-xl text-slate-800">
                {user?.role === UserRole.STUDENT ? 'لم يتم ربط بياناتك بنجاح' : 'لم يتم ربط أي أبناء بحسابك'}
              </p>
              <p className="text-sm font-medium mt-2">يرجى التواصل مع إدارة المدرسة لمعالجة المشكلة</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {myChildren.map(child => (
              <div key={child.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8">
                {/* Child Quick Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl font-black border border-white/30 shadow-2xl">
                      {child.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black">{child.name}</h3>
                      <div className="flex items-center gap-3 mt-1 opacity-70 font-bold text-sm">
                        <Target className="w-4 h-4" /> المستوى الحالي: جزء {child.hifzLevel.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedChildId(child.id)}
                    className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-lg active:scale-95"
                  >
                    عرض سجل الدرجات التفصيلي <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Analytical Grid */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">

                  {/* Chart 1: Hifz Growth */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                      <h4 className="text-lg font-black text-slate-800 flex items-center gap-3">
                        <TrendingUp className="w-5 h-5 text-indigo-600" /> مسار الحفظ التراكمي
                      </h4>
                      <div className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">تحليل 5 أشهر</div>
                    </div>
                    <div className="h-72 w-full bg-slate-50/50 rounded-[2rem] p-6 border border-slate-50">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hifzTrendData}>
                          <defs>
                            <linearGradient id="colorJuz" x1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#94a3b8' }} unit=" ج" />
                          <Tooltip
                            contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="juz" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorJuz)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Skills Radar */}
                  <div className="lg:col-span-4 space-y-6">
                    <h4 className="text-lg font-black text-slate-800 flex items-center gap-3 px-2">
                      <Award className="w-5 h-5 text-indigo-600" /> توازن المهارات
                    </h4>
                    <div className="h-72 w-full bg-slate-50/50 rounded-[2rem] p-4 border border-slate-50 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={behaviorData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                          <Radar
                            name="مستوى الطالب"
                            dataKey="A"
                            stroke="#4f46e5"
                            fill="#4f46e5"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Stats Footer Row */}
                  <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نسبة الانضباط</p>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                        <span className="text-2xl font-black text-slate-800">{child.attendanceRate}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الدرجة السلوكية</p>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                        <span className="text-2xl font-black text-slate-800">{child.behaviorScore}/100</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ آخر مراجعة</p>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-indigo-300" />
                        <span className="text-sm font-black text-slate-700">{child.lastRevision || 'قريباً'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الحالة المالية</p>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-xl w-fit text-[10px] font-black border ${child.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                        {child.paymentStatus}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for viewing child details in READ ONLY mode */}
        <Modal
          isOpen={!!selectedChildId}
          onClose={() => setSelectedChildId(null)}
          title="سجل المتابعة الرقمي"
          size="xl"
        >
          {selectedChildId && (
            <div className="pointer-events-none opacity-90 grayscale-[0.2]">
              <div className="bg-indigo-600 text-white p-6 rounded-[2rem] mb-10 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <Activity className="w-6 h-6 animate-pulse" />
                  <div>
                    <span className="text-sm font-black italic block">
                      {user?.role === UserRole.STUDENT ? 'أنت الآن في بوابتك الخاصة' : 'أنت الآن في بوابة ولي الأمر'}
                    </span>
                    <span className="text-[10px] opacity-70">وضع العرض فقط - لا يمكن تعديل السجلات</span>
                  </div>
                </div>
              </div>
              <StudentDetailsContent
                student={students.find(s => s.id === selectedChildId)!}
                teachers={teachers}
                halls={halls}
                onRefresh={() => { }}
                readOnly={true}
              />
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // الواجهة الإدارية (ADMIN DASHBOARD)
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">مرحباً بك مجدداً 👋</h2>
          <p className="text-slate-500 mt-2 font-medium">نظرة عامة على أداء المدرسة القرآنية اليوم</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-xl font-bold text-xs hover:bg-cyan-100 transition-all">
            + طالب جديد
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs hover:bg-rose-100 transition-all">
            إعلان هام
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="إجمالي الطلاب" value={students.length} icon={Users} color="bg-cyan-500" />
        <StatCard label="المعلمون" value={teachers.length} icon={UserSquare2} color="bg-teal-500" />
        <StatCard label="القاعات" value={halls.length} icon={DoorOpen} color="bg-amber-500" />
        <StatCard label="تحصيل اليوم" value="2,500 ر.س" icon={Wallet} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">مؤشر الحضور الأسبوعي</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'الأحد', val: 95 },
                { name: 'الاثنين', val: 88 },
                { name: 'الثلاثاء', val: 92 },
                { name: 'الأربعاء', val: 97 },
                { name: 'الخميس', val: 91 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="val" fill="#0891b2" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">طلاب متميزون</h3>
          <div className="space-y-4">
            {students.slice(0, 4).map((student, idx) => (
              <div key={student.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-sm">#{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">جـ {student.hifzLevel.toFixed(1)}</p>
                </div>
                <div className="text-xs font-bold text-green-600 bg-green-50 px-2 rounded-lg">{student.behaviorScore}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock StatCard used in Dashboard
const Users = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const UserSquare2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" /></svg>;
const DoorOpen = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14" /><path d="M2 20h3" /><path d="M13 20h9" /><path d="M10 12v.01" /><path d="M13 4c-3.3 0-6 2.7-6 6v10H3V10c0-4.4 3.6-8 8-8s8 3.6 8 8v1h-2v-1c0-3.3-2.7-6-6-6Z" /></svg>;
const Wallet = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>;

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
    <div className={`${color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default Dashboard;

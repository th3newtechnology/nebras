
import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Save,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Loader2,
  BarChart3,
  ArrowLeftRight,
  TrendingUp,
  FileText,
  ChevronLeft,
  UserCheck,
  UserX
} from 'lucide-react';
import { useLocalCollection, addLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

type ViewMode = 'daily' | 'report';

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { data: students, loading: studentsLoading } = useLocalCollection('students');
  const { data: logs, refreshData: refreshLogs, loading: logsLoading } = useLocalCollection('attendance_logs');
  const { addNotification } = useNotifications();

  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Report filters
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (students.length > 0) {
      const initial: Record<string, boolean> = {};
      students.forEach(s => initial[s.id] = true);
      setAttendance(initial);
    }
  }, [students]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markAllPresent = () => {
    const updated: Record<string, boolean> = {};
    students.forEach(s => updated[s.id] = true);
    setAttendance(updated);
    addNotification('تحضير جماعي', 'تم تحديد جميع الطلاب كحضور. يرجى حفظ الكشف للاعتماد.', 'info');
  };

  const markAllAbsent = () => {
    const updated: Record<string, boolean> = {};
    students.forEach(s => updated[s.id] = false);
    setAttendance(updated);
    addNotification('تغييب جماعي', 'تم تحديد جميع الطلاب كغياب. يرجى حفظ الكشف للاعتماد.', 'warning');
  };

  const handleSave = () => {
    setIsSaving(true);
    const log = {
      date: currentDate,
      records: attendance,
      totalPresent: Object.values(attendance).filter(v => v).length,
      totalAbsent: Object.values(attendance).filter(v => !v).length
    };

    addLocalData('attendance_logs', log);

    setTimeout(() => {
      setIsSaving(false);
      refreshLogs();
      addNotification('تم حفظ التحضير', `تم تسجيل حضور ${log.totalPresent} طالباً لتاريخ ${currentDate}`, 'success');
    }, 1000);
  };

  const filteredStudents = useMemo(() => {
    let list = students;
    if (user?.role === UserRole.TEACHER) {
      list = students.filter(s => s.teacherId === user.teacherId);
    }
    return list.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm, user]);

  // Filtered logs for report
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => log.date >= startDate && log.date <= endDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, startDate, endDate]);

  const stats = useMemo(() => {
    if (filteredLogs.length === 0) return { avg: 0, totalP: 0, totalA: 0 };
    const totalP = filteredLogs.reduce((acc, curr) => acc + curr.totalPresent, 0);
    const totalA = filteredLogs.reduce((acc, curr) => acc + curr.totalAbsent, 0);
    const avg = (totalP / (totalP + totalA)) * 100;
    return { avg: Math.round(avg), totalP, totalA };
  }, [filteredLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">الحضور والغياب</h2>
          <p className="text-slate-500 mt-1 font-medium">إدارة التحضير اليومي واستخراج تقارير الانضباط</p>
        </div>

        {/* Toggle Switch */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-1">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'daily'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <CheckSquare className="w-4 h-4" />
            التحضير اليومي
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'report'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            تقارير الفترة
          </button>
        </div>
      </header>

      {viewMode === 'daily' ? (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">تاريخ التحضير</p>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-lg font-bold text-slate-800 p-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={markAllPresent}
                disabled={isSaving || students.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all font-black text-xs border border-emerald-100 active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                تحضير الجميع
              </button>
              <button
                onClick={markAllAbsent}
                disabled={isSaving || students.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-700 rounded-2xl hover:bg-rose-100 transition-all font-black text-xs border border-rose-100 active:scale-95"
              >
                <UserX className="w-4 h-4" />
                تغييب الجميع
              </button>
              <div className="w-px h-8 bg-slate-100 mx-2 hidden md:block"></div>
              <button
                onClick={handleSave}
                disabled={isSaving || students.length === 0}
                className="flex items-center gap-2 px-10 py-3.5 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-700 transition-all font-bold shadow-xl shadow-cyan-600/30 disabled:opacity-50 active:scale-95"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                اعتماد الكشف وحفظ البيانات
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-emerald-200 transition-colors">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">الحضور الآن</p>
                <p className="text-2xl font-black text-slate-800">{Object.values(attendance).filter(v => v).length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-rose-200 transition-colors">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">الغياب الآن</p>
                <p className="text-2xl font-black text-slate-800">{Object.values(attendance).filter(v => !v).length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-cyan-200 transition-colors">
              <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">نسبة الحضور</p>
                <p className="text-2xl font-black text-slate-800">
                  {students.length > 0 ? Math.round((Object.values(attendance).filter(v => v).length / students.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث عن اسم الطالب لسرعة التحضير..."
                  className="w-full pr-11 pl-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {studentsLoading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mb-4" />
                <p className="font-bold">جاري تحميل كشف الأسماء...</p>
              </div>
            ) : (
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">الملف التعريفي للطالب</th>
                    <th className="px-8 py-5">تسجيل الحالة</th>
                    <th className="px-8 py-5">الملاحظات والأعذار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className={`hover:bg-slate-50/50 transition-colors ${!attendance[student.id] ? 'bg-rose-50/10' : ''}`}>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm ${attendance[student.id] ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                            {student.name[0]}
                          </div>
                          <div>
                            <span className="text-base font-bold text-slate-800 block leading-none">{student.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1 block uppercase">رقم الطالب: #{student.id.slice(0, 4)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => toggleAttendance(student.id)}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border ${attendance[student.id]
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-sm'
                              : 'bg-rose-50 text-rose-700 border-rose-100 shadow-sm'
                            }`}
                        >
                          {attendance[student.id] ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {attendance[student.id] ? 'حاضر' : 'غائب'}
                        </button>
                      </td>
                      <td className="px-8 py-5">
                        <input type="text" placeholder="سجل هنا في حال وجود عذر مسبق..." className="bg-transparent border-b border-dashed border-slate-200 focus:border-cyan-500 focus:outline-none text-xs text-slate-500 w-full py-1 transition-colors" />
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-24 text-center text-slate-400 font-bold italic">لا توجد سجلات طلاب مطابقة للبحث.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          {/* Report Header & Filter */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">من تاريخ</label>
                <div className="relative group">
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pr-11 pl-6 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 border-none focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center pt-6 text-slate-300">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mr-1">إلى تاريخ</label>
                <div className="relative group">
                  <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pr-11 pl-6 py-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 border-none focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 px-8 py-4 bg-slate-50/50 rounded-3xl border border-slate-100">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">متوسط الانضباط</p>
                <p className="text-3xl font-black text-cyan-600">{stats.avg}%</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">إجمالي الحضور</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalP}</p>
              </div>
            </div>
          </div>

          {/* Detailed Logs Table */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <FileText className="w-4 h-4 text-cyan-600" />
                تفاصيل السجلات اليومية للفترة المختارة
              </h3>
            </div>

            {logsLoading ? (
              <div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-cyan-600" /></div>
            ) : filteredLogs.length > 0 ? (
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5 border-b border-slate-100">تاريخ اليوم</th>
                    <th className="px-8 py-5 border-b border-slate-100">الحضور</th>
                    <th className="px-8 py-5 border-b border-slate-100">الغياب</th>
                    <th className="px-8 py-5 border-b border-slate-100 w-1/3">مؤشر الانضباط اليومي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((log, idx) => {
                    const dailyAvg = Math.round((log.totalPresent / (log.totalPresent + log.totalAbsent)) * 100);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all">
                              <CalendarIcon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{log.date}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-emerald-600">{log.totalPresent} طالب</td>
                        <td className="px-8 py-5 text-sm font-bold text-rose-500">{log.totalAbsent} طالب</td>
                        <td className="px-8 py-5">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-400">النسبة</span>
                              <span className="text-cyan-700">{dailyAvg}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${dailyAvg > 90 ? 'bg-emerald-500' : dailyAvg > 70 ? 'bg-cyan-500' : 'bg-amber-500'
                                  }`}
                                style={{ width: `${dailyAvg}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                <BarChart3 className="w-12 h-12 opacity-10 mb-4" />
                <p className="font-bold">لا توجد سجلات حضور مسجلة في هذا النطاق الزمني</p>
                <p className="text-xs opacity-60">تأكد من اختيار تواريخ تم فيها إجراء عمليات تحضير</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;

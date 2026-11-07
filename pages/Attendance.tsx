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
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Clock,
  Sparkles,
  Users,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import {
  StudentAttendanceRow,
  AttendanceStatus,
  AttendanceStudentSummary,
  SaveAttendanceDTO,
} from '../types/pedagogical.types';
import { CircleItem } from '../types/circle.types';
import {
  fetchCircleAttendance,
  saveCircleAttendance,
  fetchAttendanceReports,
  exportAttendanceToCSV,
} from '../lib/attendanceService';
import { fetchCircles } from '../lib/circlesService';
import { AttendanceNotesModal } from '../components/attendance/AttendanceNotesModal';
import { useNotifications } from '../context/NotificationContext';

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; activeColor: string; inactiveColor: string; icon: any }
> = {
  present: {
    label: 'حاضر',
    activeColor: 'bg-emerald-600 text-white shadow-xs',
    inactiveColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    icon: CheckCircle2,
  },
  absent: {
    label: 'غائب',
    activeColor: 'bg-rose-600 text-white shadow-xs',
    inactiveColor: 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100',
    icon: XCircle,
  },
  late: {
    label: 'متأخر',
    activeColor: 'bg-amber-600 text-white shadow-xs',
    inactiveColor: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    icon: Clock,
  },
  excused: {
    label: 'معذور',
    activeColor: 'bg-purple-600 text-white shadow-xs',
    inactiveColor: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
    icon: AlertCircle,
  },
};

const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'reports'>('daily');

  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Daily Mode State
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reports Mode State
  const [summaries, setSummaries] = useState<AttendanceStudentSummary[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Notes Modal State
  const [editingRow, setEditingRow] = useState<StudentAttendanceRow | null>(null);

  const { addNotification } = useNotifications();

  // Load circles on mount
  useEffect(() => {
    fetchCircles().then(res => {
      setCircles(res.circles);
      if (res.circles.length > 0) {
        setSelectedCircleId(res.circles[0].id);
      }
    });
  }, []);

  // Load daily attendance when circle or date changes
  const loadDailyAttendance = async () => {
    if (!selectedCircleId) return;
    setLoading(true);
    try {
      const res = await fetchCircleAttendance(selectedCircleId, selectedDate);
      setRows(res.rows);
      setIsLive(res.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCircleId && activeTab === 'daily') {
      loadDailyAttendance();
    }
  }, [selectedCircleId, selectedDate, activeTab]);

  // Load reports when switching to reports tab
  const loadReports = async () => {
    if (!selectedCircleId) return;
    setReportsLoading(true);
    try {
      const res = await fetchAttendanceReports(selectedCircleId);
      setSummaries(res.summaries);
    } catch (err) {
      console.error(err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCircleId && activeTab === 'reports') {
      loadReports();
    }
  }, [selectedCircleId, activeTab]);

  // Selected Circle Metadata
  const currentCircle = circles.find(c => c.id === selectedCircleId);

  // One-Click Status Change
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setRows(prev =>
      prev.map(r => {
        if (r.studentId === studentId) {
          return {
            ...r,
            status: newStatus,
            delayMinutes: newStatus === 'late' ? (r.delayMinutes > 0 ? r.delayMinutes : 15) : 0,
          };
        }
        return r;
      })
    );
  };

  // Bulk Actions
  const handleMarkAll = (status: AttendanceStatus) => {
    setRows(prev => prev.map(r => ({ ...r, status, delayMinutes: 0 })));
    addNotification(
      'تحضير جماعي',
      `تم تعيين جميع الطلاب بحالة (${STATUS_CONFIG[status].label}). يرجى حفظ الكشف لتثبيت التغييرات.`,
      'info'
    );
  };

  // Save Attendance to Supabase
  const handleSave = async () => {
    if (!selectedCircleId) return;
    setIsSaving(true);

    try {
      const dto: SaveAttendanceDTO = {
        circleId: selectedCircleId,
        date: selectedDate,
        records: rows.map(r => ({
          studentId: r.studentId,
          status: r.status,
          delayMinutes: r.delayMinutes,
          notes: r.notes,
        })),
      };

      const res = await saveCircleAttendance(dto);
      if (res.success) {
        addNotification(
          'تم الحفظ بنجاح',
          `تم حفظ كشف الحضور والغياب لحلقة "${currentCircle?.name}" ليوم ${selectedDate} بنجاح.`,
          'success'
        );
      } else {
        addNotification('خطأ أثناء الحفظ', res.error || 'فشل حفظ الكشف', 'error');
      }
    } catch (err) {
      addNotification('خطأ', 'حدث خطأ غير متوقع أثناء الحفظ', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Notes Modal Save
  const handleSaveNotes = (delayMinutes: number, notes: string) => {
    if (!editingRow) return;
    setRows(prev =>
      prev.map(r => {
        if (r.studentId === editingRow.studentId) {
          return {
            ...r,
            delayMinutes,
            notes,
          };
        }
        return r;
      })
    );
    setEditingRow(null);
  };

  // Daily Stats Counters
  const dailyStats = useMemo(() => {
    const total = rows.length;
    const present = rows.filter(r => r.status === 'present').length;
    const absent = rows.filter(r => r.status === 'absent').length;
    const late = rows.filter(r => r.status === 'late').length;
    const excused = rows.filter(r => r.status === 'excused').length;
    return { total, present, absent, late, excused };
  }, [rows]);

  // Filtered Rows by search
  const filteredRows = useMemo(() => {
    return rows.filter(
      r =>
        !searchTerm ||
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.registrationNumber.includes(searchTerm)
    );
  }, [rows, searchTerm]);

  // Filtered Summaries by search
  const filteredSummaries = useMemo(() => {
    return summaries.filter(
      s =>
        !searchTerm ||
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registrationNumber.includes(searchTerm)
    );
  }, [summaries, searchTerm]);

  // Print Handlers
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>السجل التربوي وضبط الحضور</span>
              </span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {isLive ? '● متصل بقاعدة البيانات' : '○ وضع العرض المحلي'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black font-amiri text-gold-300">
              كشوفات الحضور والغياب اليومية
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              رصد الحضور السريع بنظام النقرة الواحدة لحلقات مسجد إبراهيم الخليل، تتبع التأخر والأعذار، وإصدار تقارير الإنذارات التلقائية عند تجاوز نسبة الغياب.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="طباعة الكشف"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>طباعة الكشف</span>
            </button>

            {activeTab === 'daily' && (
              <button
                onClick={handleSave}
                disabled={isSaving || loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>حفظ كشف اليوم</span>
              </button>
            )}

            {activeTab === 'reports' && (
              <button
                onClick={() => exportAttendanceToCSV(summaries, currentCircle?.name || 'عام')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>تصدير تقرير Excel/CSV</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'daily'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-gold-400" />
          <span>الرصد اليومي السريع (بنظام النقرة)</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'reports'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-gold-400" />
          <span>الكشوفات وتقارير الغياب التراكمية والإنذارات</span>
        </button>
      </div>

      {/* Selector Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Circle Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">
                الحلقة القرآنية
              </label>
              <select
                value={selectedCircleId}
                onChange={e => setSelectedCircleId(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800"
              >
                {circles.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.level}) — المحفظ: {c.teacherName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker (in Daily Mode) */}
            {activeTab === 'daily' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  تاريخ الحصة
                </label>
                <div className="relative">
                  <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب أو رقم القيد..."
              className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>
        </div>

        {/* Daily Mode Quick Counters & Bulk Actions */}
        {activeTab === 'daily' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
            {/* Stat Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                إجمالي المقيدين: <strong>{dailyStats.total}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                حاضر: <strong>{dailyStats.present}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
                غائب: <strong>{dailyStats.absent}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                متأخر: <strong>{dailyStats.late}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200">
                معذور: <strong>{dailyStats.excused}</strong>
              </span>
            </div>

            {/* Bulk Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors text-xs font-bold"
              >
                تحضير الجميع
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl transition-colors text-xs font-bold"
              >
                تغييب الجميع
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Main Content: Daily Mode Table */}
      {activeTab === 'daily' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل كشف طلاب الحلقة...</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا يوجد طلاب مسجلون في هذه الحلقة</p>
              <p className="text-xs">تأكد من انتساب الطلاب للحلقة من خلال شاشة إدارة الطلاب</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase">
                  <tr>
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">رقم القيد</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4 text-center">حالة الحضور (نقرة واحدة)</th>
                    <th className="p-4">التأخر / الأعذار والملاحظات</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={row.studentId}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-mono font-bold text-slate-600">
                        {row.registrationNumber}
                      </td>
                      <td className="p-4">
                        <strong className="font-black text-slate-900 font-amiri text-sm block">
                          {row.studentName}
                        </strong>
                      </td>

                      {/* 4 Single-Click Status Buttons */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map(st => {
                            const cfg = STATUS_CONFIG[st];
                            const isSelected = row.status === st;
                            const Icon = cfg.icon;

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(row.studentId, st)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  isSelected
                                    ? cfg.activeColor
                                    : cfg.inactiveColor
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{cfg.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Delay / Notes preview */}
                      <td className="p-4 text-slate-600">
                        {row.status === 'late' && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200 font-mono text-[11px] ml-2">
                            تأخر: {row.delayMinutes} دقيقة
                          </span>
                        )}
                        {row.notes ? (
                          <span className="text-[11px] text-slate-700 italic">
                            «{row.notes}»
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Edit Note Button */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => setEditingRow(row)}
                          className="p-1.5 text-slate-400 hover:text-islamic-800 hover:bg-islamic-50 rounded-lg transition-colors"
                          title="تعديل الملاحظات أو دقائق التأخر"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Main Content: Reports Mode */}
      {activeTab === 'reports' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {reportsLoading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري احتساب المؤشرات والإنذارات التراكمية...</p>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد سجلات تراكمية للحلقة المحددة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase">
                  <tr>
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">رقم القيد</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4 text-center">إجمالي الحصص</th>
                    <th className="p-4 text-center">أيام الحضور</th>
                    <th className="p-4 text-center">أيام الغياب</th>
                    <th className="p-4 text-center">التأخر</th>
                    <th className="p-4 text-center">نسبة الالتزام</th>
                    <th className="p-4 text-center">حالة الإنذار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummaries.map((summary, idx) => (
                    <tr
                      key={summary.studentId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        summary.hasWarning ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-mono font-bold text-slate-600">
                        {summary.registrationNumber}
                      </td>
                      <td className="p-4">
                        <strong className="font-black text-slate-900 font-amiri text-sm">
                          {summary.studentName}
                        </strong>
                      </td>
                      <td className="p-4 text-center font-mono font-bold">{summary.totalSessions}</td>
                      <td className="p-4 text-center font-mono text-emerald-700 font-bold">
                        {summary.presentCount}
                      </td>
                      <td className="p-4 text-center font-mono text-rose-700 font-bold">
                        {summary.absentCount}
                      </td>
                      <td className="p-4 text-center font-mono text-amber-700 font-bold">
                        {summary.lateCount}
                      </td>
                      <td className="p-4 text-center font-mono font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-lg ${
                            summary.attendanceRate >= 85
                              ? 'bg-emerald-50 text-emerald-800'
                              : summary.attendanceRate >= 70
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {summary.attendanceRate}%
                        </span>
                      </td>

                      {/* Warning Badge */}
                      <td className="p-4 text-center">
                        {summary.hasWarning ? (
                          <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 mx-auto w-fit shadow-xs animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>إنذار تجاوز الغياب ({summary.consecutiveAbsences} متتالي)</span>
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>مواظب</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Notes Modal */}
      {editingRow && (
        <AttendanceNotesModal
          isOpen={!!editingRow}
          onClose={() => setEditingRow(null)}
          studentName={editingRow.studentName}
          status={editingRow.status}
          currentDelay={editingRow.delayMinutes}
          currentNotes={editingRow.notes}
          onSave={handleSaveNotes}
        />
      )}
    </div>
  );
};

export default Attendance;

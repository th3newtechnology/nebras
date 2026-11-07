import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  User,
  DoorOpen,
  Plus,
  Loader2,
  Trash2,
  Printer,
  RefreshCw,
  Sparkles,
  Users,
  Search,
  BookOpen,
  Layers,
  Filter,
  AlertTriangle,
  GraduationCap,
  Building,
  CheckCircle2,
  Ban,
  Info,
} from 'lucide-react';
import {
  TimetableSession,
  CircleItem,
  TimetableViewMode,
  WorkDaysConfig,
} from '../types/circle.types';
import {
  fetchTimetableSessions,
  deleteScheduleSession,
  WORK_DAYS_MAP,
} from '../lib/timetableService';
import { fetchCircles } from '../lib/circlesService';
import { fetchStudents } from '../lib/studentsService';
import { StudentListItem } from '../types/student.types';
import { ScheduleSessionModal } from '../components/timetable/ScheduleSessionModal';
import { SessionDetailsModal } from '../components/timetable/SessionDetailsModal';
import { ScheduleExceptionModal } from '../components/timetable/ScheduleExceptionModal';
import { TimetablePrintView } from '../components/timetable/TimetablePrintView';
import { useNotifications } from '../context/NotificationContext';

const Timetable: React.FC = () => {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // View Mode & Config
  const [viewMode, setViewMode] = useState<TimetableViewMode>('all');
  const [workDaysConfig, setWorkDaysConfig] = useState<WorkDaysConfig>('sat_thu');

  // Selected Entities for specific views
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all');
  const [selectedHallId, setSelectedHallId] = useState<string>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // General Filters
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<TimetableSession | null>(null);
  const [selectedSessionForException, setSelectedSessionForException] = useState<TimetableSession | null>(null);

  const { addNotification } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, circlesRes, studentsRes] = await Promise.all([
        fetchTimetableSessions(),
        fetchCircles(),
        fetchStudents({ page: 1, pageSize: 100 }),
      ]);
      setSessions(sessionsRes.sessions);
      setCircles(circlesRes.circles);
      setStudents(studentsRes.students);
      setIsLive(sessionsRes.isLive);

      if (studentsRes.students.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsRes.students[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unique teachers & halls for filters & dropdowns
  const uniqueTeachers = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => {
      if (s.teacherId && s.teacherName) {
        map.set(s.teacherId, s.teacherName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  const uniqueHalls = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => {
      if (s.hallId && s.hallName) {
        map.set(s.hallId, s.hallName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sessions]);

  // Selected student's circle
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  // Active days list based on workDaysConfig
  const activeDays = useMemo(() => {
    return WORK_DAYS_MAP[workDaysConfig] || WORK_DAYS_MAP.sat_thu;
  }, [workDaysConfig]);

  // Conflict Detection: Look for overlapping sessions in the active dataset
  const detectedConflicts = useMemo(() => {
    const conflicts: { session1: TimetableSession; session2: TimetableSession; reason: string }[] = [];

    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const s1 = sessions[i];
        const s2 = sessions[j];

        if (s1.dayOfWeek === s2.dayOfWeek) {
          const isOverlapping = s1.startTime < s2.endTime && s1.endTime > s2.startTime;
          if (isOverlapping) {
            // Check hall overlap
            if (s1.hallId && s2.hallId && s1.hallId === s2.hallId) {
              conflicts.push({
                session1: s1,
                session2: s2,
                reason: `تعارض قاعة: "${s1.hallName}" بين (${s1.circleName}) و (${s2.circleName}) يوم ${s1.dayName}`,
              });
            }
            // Check teacher overlap
            else if (s1.teacherId && s2.teacherId && s1.teacherId === s2.teacherId) {
              conflicts.push({
                session1: s1,
                session2: s2,
                reason: `تعارض معلم: "${s1.teacherName}" بين (${s1.circleName}) و (${s2.circleName}) يوم ${s1.dayName}`,
              });
            }
          }
        }
      }
    }
    return conflicts;
  }, [sessions]);

  // Filtered Sessions depending on View Mode and Filters
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // 1. View Mode logic
      if (viewMode === 'teacher' && selectedTeacherId !== 'all') {
        if (s.teacherId !== selectedTeacherId) return false;
      }

      if (viewMode === 'hall' && selectedHallId !== 'all') {
        if (s.hallId !== selectedHallId) return false;
      }

      if (viewMode === 'student' && currentStudent) {
        if (currentStudent.currentCircleId && s.circleId !== currentStudent.currentCircleId) {
          return false;
        }
      }

      // 2. Day filter
      if (filterDay !== 'all' && s.dayOfWeek !== filterDay) {
        return false;
      }

      // 3. Level filter
      if (filterLevel !== 'all' && s.circleLevel !== filterLevel) {
        return false;
      }

      // 4. In general view, additional teacher/hall filters
      if (viewMode === 'all') {
        if (selectedTeacherId !== 'all' && s.teacherId !== selectedTeacherId) return false;
        if (selectedHallId !== 'all' && s.hallId !== selectedHallId) return false;
      }

      // 5. Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCircle = s.circleName.toLowerCase().includes(term);
        const matchesTeacher = s.teacherName.toLowerCase().includes(term);
        const matchesHall = s.hallName ? s.hallName.toLowerCase().includes(term) : false;
        if (!matchesCircle && !matchesTeacher && !matchesHall) return false;
      }

      return true;
    });
  }, [
    sessions,
    viewMode,
    selectedTeacherId,
    selectedHallId,
    currentStudent,
    filterDay,
    filterLevel,
    searchTerm,
  ]);

  // Group filtered sessions by day
  const sessionsByDay = useMemo(() => {
    const map: Record<number, TimetableSession[]> = {};
    activeDays.forEach((d) => {
      map[d.value] = [];
    });

    filteredSessions.forEach((s) => {
      if (map[s.dayOfWeek]) {
        map[s.dayOfWeek].push(s);
      }
    });

    // Sort each day's sessions by start time
    Object.keys(map).forEach((key) => {
      map[Number(key)].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return map;
  }, [filteredSessions, activeDays]);

  const handleDeleteSession = async (sessionId: string, circleName: string, dayName: string) => {
    if (confirm(`هل أنت متأكد من حذف موعد حلقة "${circleName}" يوم ${dayName} نهائياً من الجدول؟`)) {
      const res = await deleteScheduleSession(sessionId);
      if (res.success) {
        addNotification('تم حذف الحصة', 'تمت إزالة الحصة من الجدول الدراسي بنجاح.', 'info');
        loadData();
      } else {
        addNotification('خطأ', res.error || 'فشل حذف الحصة', 'error');
      }
    }
  };

  const printTitle = useMemo(() => {
    if (viewMode === 'teacher' && selectedTeacherId !== 'all') {
      const t = uniqueTeachers.find((x) => x.id === selectedTeacherId);
      return `الجدول الأسبوعي للمحفظ: ${t?.name || ''}`;
    }
    if (viewMode === 'student' && currentStudent) {
      return `الجدول الأسبوعي للطالب: ${currentStudent.fullName} (${currentStudent.currentCircleName})`;
    }
    if (viewMode === 'hall' && selectedHallId !== 'all') {
      const h = uniqueHalls.find((x) => x.id === selectedHallId);
      return `جدول إشغال القاعة: ${h?.name || ''}`;
    }
    return 'الجدول الأسبوعي العام للحلقات القرآنية';
  }, [viewMode, selectedTeacherId, selectedHallId, currentStudent, uniqueTeachers, uniqueHalls]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنظومة التعليمية 8.4 • الجداول والحصص</span>
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

              {detectedConflicts.length > 0 && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{detectedConflicts.length} تعارض مكتشف</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black font-amiri text-gold-300">
              الجدول الزمني للحلقات القرآنية
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              إدارة الجداول الأسبوعية (السبت-الخميس)، توزيع الحصص والقاعات، فحص التعارض المسبق، وتوثيق استثناءات الحصص والإلغاء مع السجل الرقابي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="معاينة وطباعة وتصدير PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>طباعة وتصدير PDF</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>جدولة حصة جديدة</span>
            </button>
          </div>
        </div>
      </section>

      {/* Conflict Alert Banner if detected */}
      {detectedConflicts.length > 0 && (
        <section className="p-4 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>تنبيه هندسي: تم اكتشاف تعارض في المواعيد يتطلب معالجة إدارية</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
            {detectedConflicts.map((c, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-white border border-rose-200 text-rose-800">
                {c.reason}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* View Mode Tabs & Custom Working Days */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* View Modes Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'all'
                  ? 'bg-islamic-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>الجدول العام</span>
            </button>

            <button
              onClick={() => setViewMode('teacher')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'teacher'
                  ? 'bg-islamic-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>جدول المعلم</span>
            </button>

            <button
              onClick={() => setViewMode('student')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'student'
                  ? 'bg-islamic-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>جدول الطالب</span>
            </button>

            <button
              onClick={() => setViewMode('hall')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                viewMode === 'hall'
                  ? 'bg-islamic-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>جدول القاعات</span>
            </button>
          </div>

          {/* Working Days Configurator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400">أيام العمل:</span>
            <select
              value={workDaysConfig}
              onChange={(e) => setWorkDaysConfig(e.target.value as WorkDaysConfig)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="sat_thu">السبت إلى الخميس (6 أيام)</option>
              <option value="sun_thu">الأحد إلى الخميس (5 أيام)</option>
              <option value="all_week">كامل الأسبوع (7 أيام)</option>
            </select>
          </div>
        </div>

        {/* View Specific Selectors & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* If Teacher Mode */}
            {viewMode === 'teacher' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  اختر المعلم
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">-- جميع المعلمين --</option>
                  {uniqueTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Student Mode */}
            {viewMode === 'student' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  اختر الطالب
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 max-w-xs"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.currentCircleName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Hall Mode */}
            {viewMode === 'hall' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  اختر القاعة
                </label>
                <select
                  value={selectedHallId}
                  onChange={(e) => setSelectedHallId(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">-- جميع القاعات --</option>
                  {uniqueHalls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* In General View: Day filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">اليوم</label>
              <select
                value={filterDay}
                onChange={(e) =>
                  setFilterDay(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
                }
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع الأيام</option>
                {activeDays.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Circle Level Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">المستوى</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع المستويات</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
                <option value="إتمام الحفظ">إتمام الحفظ</option>
                <option value="مراجعة">مراجعة</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">بحث سريع</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="حلقة، معلم، قاعة..."
                  className="pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 w-44"
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-bold shrink-0">
            إجمالي الحصص المعروضة:{' '}
            <strong className="text-islamic-900 font-mono text-sm">
              {filteredSessions.length}
            </strong>{' '}
            حصة
          </div>
        </div>
      </section>

      {/* Timetable Weekly Columns */}
      <section className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
            <p className="text-xs font-bold text-slate-500">جاري تحميل الجدول الأسبوعي للحلقات...</p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(
              activeDays.length,
              7
            )} gap-4`}
          >
            {activeDays.map((day) => {
              const daySessions = sessionsByDay[day.value] || [];

              return (
                <div
                  key={day.value}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col"
                >
                  {/* Day Header */}
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 text-center flex items-center justify-between">
                    <span className="font-black text-slate-900 font-amiri text-sm">{day.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold">
                      {daySessions.length}
                    </span>
                  </div>

                  {/* Day Sessions List */}
                  <div className="p-3 space-y-2.5 flex-1 overflow-y-auto min-h-[180px] bg-slate-50/30">
                    {daySessions.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-4 text-center text-slate-400">
                        <span className="text-[11px] italic font-bold">لا توجد حصص</span>
                      </div>
                    ) : (
                      daySessions.map((session) => {
                        const isCancelled = session.activeException?.exceptionType === 'cancelled';
                        const isRescheduled = session.activeException?.exceptionType === 'rescheduled';

                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedSessionForDetails(session)}
                            className={`p-3 rounded-2xl border transition-all text-xs space-y-2 cursor-pointer group relative ${
                              isCancelled
                                ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
                                : session.activeException
                                ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                                : 'bg-white border-slate-200/90 hover:border-islamic-700/50 hover:shadow-md'
                            }`}
                          >
                            {/* Timing & Exception Badges */}
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-lg bg-islamic-50 text-islamic-900 border border-islamic-200 font-mono font-bold text-[10px] flex items-center gap-1">
                                <Clock className="w-3 h-3 text-islamic-800" />
                                <span>
                                  {isRescheduled && session.activeException
                                    ? `${session.activeException.newStartTime} - ${session.activeException.newEndTime}`
                                    : `${session.startTime} - ${session.endTime}`}
                                </span>
                              </span>

                              {session.activeException && (
                                <span
                                  className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                                    isCancelled
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {isCancelled ? 'ملغاة' : 'تعديل'}
                                </span>
                              )}
                            </div>

                            {/* Circle Name & Level */}
                            <div>
                              <h4 className="font-black text-slate-900 font-amiri text-xs leading-tight group-hover:text-islamic-900">
                                {session.circleName}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                                {session.circleLevel} • {session.enrolledStudentsCount} طالب
                              </span>
                            </div>

                            {/* Teacher & Hall */}
                            <div className="pt-1.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {session.activeException?.substituteTeacherName || session.teacherName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <DoorOpen className="w-3 h-3 text-gold-600 shrink-0" />
                                <span className="truncate">
                                  {session.activeException?.newHallName || session.hallName || 'بدون قاعة'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Schedule Modal (Add new session) */}
      <ScheduleSessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadData}
        circles={circles}
        existingSessions={sessions}
      />

      {/* Session Details Modal */}
      <SessionDetailsModal
        isOpen={Boolean(selectedSessionForDetails)}
        onClose={() => setSelectedSessionForDetails(null)}
        session={selectedSessionForDetails}
        onOpenExceptionModal={(s) => setSelectedSessionForException(s)}
        onDeleteSession={handleDeleteSession}
        onReload={loadData}
      />

      {/* Schedule Exception / Cancellation Modal */}
      <ScheduleExceptionModal
        isOpen={Boolean(selectedSessionForException)}
        onClose={() => setSelectedSessionForException(null)}
        onSuccess={loadData}
        session={selectedSessionForException}
        teachers={uniqueTeachers}
        halls={uniqueHalls}
      />

      {/* Dedicated Clean Printable / PDF View */}
      <TimetablePrintView
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        sessions={filteredSessions}
        activeDays={activeDays}
        title={printTitle}
      />
    </div>
  );
};

export default Timetable;

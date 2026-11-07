import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Award,
  ChevronLeft,
  MapPin,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Eye,
  LayoutGrid,
  List,
  DoorOpen,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  TeacherCircleDetail,
  TeacherStudentItem,
} from '../types/teacherPortal.types';
import {
  fetchTeacherCirclesWithDetails,
  fetchTeacherStudents,
} from '../lib/teacherPortalService';
import { QuickRecitationModal } from '../components/teacher/QuickRecitationModal';
import { StudentDetailModal } from '../components/teacher/StudentDetailModal';
import { StudentFollowupRecordModal } from '../components/students/StudentFollowupRecordModal';
import { TeacherReportsTab } from '../components/teacher/reports/TeacherReportsTab';
import { TeacherReportModal } from '../components/teacher/reports/TeacherReportModal';
import { ViewType } from '../types';

interface TeacherCirclesStudentsProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
  initialCircleId?: string;
}

export const TeacherCirclesStudents: React.FC<TeacherCirclesStudentsProps> = ({
  onNavigateView,
  initialCircleId,
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [circles, setCircles] = useState<TeacherCircleDetail[]>([]);
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Views
  const [activeTab, setActiveTab] = useState<'circles' | 'students' | 'reports'>('students');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>(initialCircleId || 'all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');

  // Modals
  const [isRecitationModalOpen, setIsRecitationModalOpen] = useState(false);
  const [recitationStudentId, setRecitationStudentId] = useState<string | undefined>(undefined);
  const [detailModalStudentId, setDetailModalStudentId] = useState<string | null>(null);
  const [followupModalStudentId, setFollowupModalStudentId] = useState<string | null>(null);
  const [reportModalStudentId, setReportModalStudentId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const teacherId = user?.teacherId || user?.id || 't-01';

  const loadData = async () => {
    setLoading(true);
    try {
      const [circlesData, studentsData] = await Promise.all([
        fetchTeacherCirclesWithDetails(teacherId),
        fetchTeacherStudents(undefined, teacherId),
      ]);
      setCircles(circlesData);
      setStudents(studentsData);
    } catch (err) {
      console.error('خطأ في تحميل بيانات الحلقات والطلاب:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  // Recitation Handlers
  const handleOpenRecitation = (studentId?: string) => {
    setRecitationStudentId(studentId);
    setIsRecitationModalOpen(true);
  };

  const handleRecitationSuccess = (studentName: string) => {
    addNotification(
      'تم اعتماد التسميع',
      `تم رصد التسميع القرآني بنجاح للطالب ${studentName}.`,
      'success'
    );
    loadData();
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Circle filter
      if (selectedCircleFilter !== 'all' && student.circleId !== selectedCircleFilter) {
        return false;
      }
      // Level filter
      if (selectedLevelFilter !== 'all' && student.hifzLevel !== selectedLevelFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = student.fullName.toLowerCase().includes(term);
        const matchesReg = student.registrationNumber.toLowerCase().includes(term);
        const matchesGuardian = student.guardianName.toLowerCase().includes(term);
        if (!matchesName && !matchesReg && !matchesGuardian) {
          return false;
        }
      }
      return true;
    });
  }, [students, selectedCircleFilter, selectedLevelFilter, searchTerm]);

  // Unique Levels
  const availableLevels = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.hifzLevel));
    return Array.from(set);
  }, [students]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      addNotification('تنبيه', 'لا توجد بيانات للتصدير', 'warning');
      return;
    }

    const headers = ['رقم القيد', 'اسم الطالب', 'الحلقة', 'المستوى', 'الجزء الحالي', 'ولي الأمر', 'رقم الهاتف', 'نسبة الحضور', 'آخر تسميع'];
    const rows = filteredStudents.map((s) => [
      s.registrationNumber,
      `"${s.fullName}"`,
      `"${s.circleName}"`,
      `"${s.hifzLevel}"`,
      s.currentJuz,
      `"${s.guardianName}"`,
      s.guardianPhone,
      `${s.attendanceRate}%`,
      `"${s.lastRecitationSurah || '---'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `كشف_طلاب_المعلم_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification('تم التصدير', 'تم تصدير كشف الطلاب بنجاح إلى ملف CSV', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Top Banner / Stats Overview */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>محراب القرآن الكريم • مسجد إبراهيم الخليل</span>
              </div>
              {circles.some(c => c.isSimulated) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>وضع المحاكاة الميدانية التجريبية</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>قاعدة بيانات Supabase الحية</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-amiri text-white">
              إدارة الحلقات القرآنية وسجل الطلاب
            </h1>
            <p className="text-xs md:text-sm text-emerald-200 font-medium max-w-2xl leading-relaxed">
              استعراض الحلقات المسندة لفضيلتكم، متابعة تطور حفظ الطلاب بالأجزاء القرآنية، والتواصل مع أولياء الأمور
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateView?.('recitation')}
              className="px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-emerald-950 rounded-2xl font-black text-xs transition-all shadow-lg shadow-gold-500/20 active:scale-95 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>محطة الإقراء المباشر</span>
            </button>

            <button
              onClick={() => handleOpenRecitation()}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs transition-all border border-white/15"
            >
              <span>رصد سريع لطالب</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors border border-white/10"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-800/80">
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">الحلقات المسندة</span>
            <p className="text-2xl font-black font-mono mt-1 text-white">{circles.length}</p>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">إجمالي طلاب الشيخ</span>
            <p className="text-2xl font-black font-mono mt-1 text-gold-300">{students.length}</p>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">متوسط الحضور</span>
            <p className="text-2xl font-black font-mono mt-1 text-emerald-300">95%</p>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">الطلاب فوق 10 أجزاء</span>
            <p className="text-2xl font-black font-mono mt-1 text-teal-300">
              {students.filter((s) => s.currentJuz >= 10).length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'students'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-700" />
            <span>سجل الطلاب ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('circles')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'circles'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-emerald-700" />
            <span>الحلقات والقاعات ({circles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'reports'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>التقارير التربوية والدورية</span>
          </button>
        </div>

        {/* View mode toggle (only on students tab) */}
        {activeTab === 'students' && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير CSV</span>
            </button>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500'
                }`}
                title="عرض جدول"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CIRCLES LIST & HALLS */}
      {/* ===================================================================== */}
      {activeTab === 'circles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {circles.map((circle) => {
              const capacityPercent = Math.round((circle.studentCount / (circle.capacity || 15)) * 100);

              return (
                <div
                  key={circle.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 hover:border-emerald-400 shadow-sm transition-all space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {circle.level}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{circle.targetGender}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{circle.academicYear}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-1.5">{circle.name}</h3>
                    </div>

                    <div className="text-left font-mono">
                      <span className="text-3xl font-black text-emerald-900">{circle.studentCount}</span>
                      <span className="text-xs text-slate-400 font-sans block">/ {circle.capacity} طالباً</span>
                    </div>
                  </div>

                  {circle.description && (
                    <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {circle.description}
                    </p>
                  )}

                  {/* Hall & Schedule Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">{circle.hallName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 font-mono">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{circle.sessionTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 sm:col-span-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold">أيام التسميع: {circle.scheduleDays.join(' • ')}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>نسبة امتلاء الحلقة</span>
                      <span className="font-mono">{capacityPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCircleFilter(circle.id);
                        setActiveTab('students');
                      }}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>استعراض طلاب الفوج ({circle.studentCount})</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigateView?.('attendance')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        كشف الحضور
                      </button>
                      <button
                        onClick={() => onNavigateView?.('grades')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        سجل الإتقان
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: STUDENTS ROSTER */}
      {/* ===================================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم، برقم القيد (مثلاً NEB-2026-0001)، أو ولي الأمر..."
                className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            {/* Circle Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">الحلقة:</span>
              <select
                value={selectedCircleFilter}
                onChange={(e) => setSelectedCircleFilter(e.target.value)}
                className="flex-1 md:flex-initial px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">كافة الحلقات ({students.length})</option>
                {circles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.studentCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">المستوى:</span>
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="flex-1 md:flex-initial px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">كافة المستويات</option>
                {availableLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || selectedCircleFilter !== 'all' || selectedLevelFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCircleFilter('all');
                  setSelectedLevelFilter('all');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold whitespace-nowrap px-2 py-1"
              >
                إلغاء التصفية
              </button>
            )}
          </div>

          {/* Result Count */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
            <span>
              عرض <strong className="text-slate-800">{filteredStudents.length}</strong> طالباً من أصل {students.length}
            </span>
          </div>

          {/* Empty State */}
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-black text-slate-800">لا يوجد طلاب يطابقون خيارات البحث</h4>
              <p className="text-xs text-slate-400 mt-1">يرجى تعديل معايير التصفية أو البحث عن اسم آخر</p>
            </div>
          ) : viewMode === 'cards' ? (
            /* ================= CARD VIEW ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((student) => {
                const completionPercentage = Math.round(
                  (student.currentJuz / (student.targetJuz || 30)) * 100
                );
                const cleanPhone = student.guardianPhone.replace(/[^0-9]/g, '');
                const whatsappUrl = cleanPhone.startsWith('0')
                  ? `https://wa.me/213${cleanPhone.substring(1)}`
                  : `https://wa.me/${cleanPhone}`;

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-400 shadow-sm transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar + Name + Reg Number */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-black font-amiri text-xl flex items-center justify-center border border-emerald-100">
                            {student.fullName[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{student.fullName}</h4>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{student.registrationNumber}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
                          {student.hifzLevel}
                        </span>
                      </div>

                      {/* Circle Name */}
                      <div className="mt-3 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{student.circleName}</span>
                      </div>

                      {/* Quran Progress */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-600">مسار الحفظ القرآني:</span>
                          <span className="font-black text-emerald-900 font-mono">
                            جزء {student.currentJuz} من {student.targetJuz || 30}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Last Recitation & Attendance */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-bold block">آخر تسميع</span>
                          <span className="font-bold text-slate-800 block truncate mt-0.5">
                            {student.lastRecitationSurah || 'لم يسجل'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 font-bold block">التقدير / الحضور</span>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="font-black text-emerald-700">{student.lastGrade || 'ممتاز'}</span>
                            <span className="font-mono font-bold text-slate-600">{student.attendanceRate}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Guardian Contact */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="truncate pr-1">
                          <span className="text-[10px] text-slate-400 font-bold block">ولي الأمر:</span>
                          <span className="font-bold text-slate-700 truncate block">
                            {student.guardianName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`tel:${student.guardianPhone}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                            title="اتصال هاتف"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                            title="واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="pt-3 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => setDetailModalStudentId(student.id)}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-black transition-colors flex items-center justify-center gap-1"
                        title="خريطة الأجزاء الـ 30"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>الأجزاء</span>
                      </button>

                      <button
                        onClick={() => setFollowupModalStudentId(student.id)}
                        className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/60 rounded-xl text-[11px] font-black transition-colors flex items-center justify-center gap-1"
                        title="سجل المتابعة التربوي والخط الزمني"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>المتابعة</span>
                      </button>

                      <button
                        onClick={() => {
                          setReportModalStudentId(student.id);
                          setIsReportModalOpen(true);
                        }}
                        className="py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200/60 rounded-xl text-[11px] font-black transition-colors flex items-center justify-center gap-1"
                        title="إصدار تقرير تربوي دوري"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-700" />
                        <span>التقرير</span>
                      </button>

                      <button
                        onClick={() => handleOpenRecitation(student.id)}
                        className="py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[11px] font-black transition-all active:scale-95 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>تسميع</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= TABLE VIEW ================= */
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="p-4">الطالب ورقم القيد</th>
                      <th className="p-4">الحلقة</th>
                      <th className="p-4 text-center">المستوى</th>
                      <th className="p-4">مسار الحفظ</th>
                      <th className="p-4">آخر تسميع</th>
                      <th className="p-4 text-center">التقدير</th>
                      <th className="p-4 text-center">الانضباط</th>
                      <th className="p-4">ولي الأمر</th>
                      <th className="p-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      const cleanPhone = student.guardianPhone.replace(/[^0-9]/g, '');
                      const whatsappUrl = cleanPhone.startsWith('0')
                        ? `https://wa.me/213${cleanPhone.substring(1)}`
                        : `https://wa.me/${cleanPhone}`;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <span className="font-black text-slate-900 text-sm block">
                              {student.fullName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{student.registrationNumber}
                            </span>
                          </td>

                          <td className="p-4 font-bold text-slate-700">{student.circleName}</td>

                          <td className="p-4 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {student.hifzLevel}
                            </span>
                          </td>

                          <td className="p-4 font-bold text-emerald-800">
                            جزء {student.currentJuz} من {student.targetJuz || 30}
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-700 block">
                              {student.lastRecitationSurah || 'لم يسجل'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {student.lastRecitationDate || '---'}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                              {student.lastGrade || 'ممتاز'}
                            </span>
                          </td>

                          <td className="p-4 text-center font-mono font-bold text-emerald-700">
                            {student.attendanceRate}%
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-800 block">
                              {student.guardianName}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                {student.guardianPhone}
                              </span>
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="واتساب"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setDetailModalStudentId(student.id)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                                title="عرض السجل القرآني وخريطة الأجزاء"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setFollowupModalStudentId(student.id)}
                                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 rounded-xl transition-colors"
                                title="سجل المتابعة التربوي المستمر"
                              >
                                <Clock className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setReportModalStudentId(student.id);
                                  setIsReportModalOpen(true);
                                }}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/60 rounded-xl transition-colors"
                                title="إصدار تقرير تربوي دوري"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenRecitation(student.id)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>تسميع</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: TEACHER PERIODIC REPORTS */}
      {/* ===================================================================== */}
      {activeTab === 'reports' && (
        <TeacherReportsTab
          teacherId={teacherId}
          selectedCircleId={selectedCircleFilter !== 'all' ? selectedCircleFilter : undefined}
        />
      )}

      {/* Quick Recitation Modal */}
      <QuickRecitationModal
        isOpen={isRecitationModalOpen}
        students={students}
        preselectedStudentId={recitationStudentId}
        onClose={() => setIsRecitationModalOpen(false)}
        onSuccess={handleRecitationSuccess}
      />

      {/* Student Detail Modal (30 Juz Progress & History) */}
      <StudentDetailModal
        isOpen={detailModalStudentId !== null}
        studentId={detailModalStudentId}
        onClose={() => setDetailModalStudentId(null)}
        onOpenRecitation={handleOpenRecitation}
      />

      {/* Student Followup Record Modal (Stage 8.4.3) */}
      <StudentFollowupRecordModal
        isOpen={followupModalStudentId !== null}
        studentId={followupModalStudentId}
        onClose={() => setFollowupModalStudentId(null)}
      />

      {/* Teacher Report Modal (Stage 8.4.4) */}
      {isReportModalOpen && (
        <TeacherReportModal
          isOpen={isReportModalOpen}
          defaultStudentId={reportModalStudentId || undefined}
          teacherId={teacherId}
          defaultCircleId={selectedCircleFilter !== 'all' ? selectedCircleFilter : undefined}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportModalStudentId(null);
          }}
          onSaved={() => {
            setIsReportModalOpen(false);
            setReportModalStudentId(null);
          }}
        />
      )}
    </div>
  );
};

export default TeacherCirclesStudents;

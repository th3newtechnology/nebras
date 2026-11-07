import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  Award,
  ChevronLeft,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ClipboardCheck,
  CheckSquare,
  MessageCircle,
  RefreshCw,
  Loader2,
  Eye,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  TeacherDashboardStats,
  TeacherCircleOverview,
  TeacherStudentItem,
} from '../types/teacherPortal.types';
import {
  fetchTeacherDashboardStats,
  fetchTeacherCircles,
  fetchTeacherStudents,
} from '../lib/teacherPortalService';
import { QuickRecitationModal } from '../components/teacher/QuickRecitationModal';
import { StudentDetailModal } from '../components/teacher/StudentDetailModal';
import { ViewType } from '../types';

interface TeacherDashboardProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateView }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [circles, setCircles] = useState<TeacherCircleOverview[]>([]);
  const [students, setStudents] = useState<TeacherStudentItem[]>([]);
  const [selectedCircleFilter, setSelectedCircleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Quick Recitation Modal
  const [isRecitationModalOpen, setIsRecitationModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const [detailModalStudentId, setDetailModalStudentId] = useState<string | null>(null);

  const teacherId = user?.teacherId || user?.id || 't-01';

  const loadData = async () => {
    setLoading(true);
    try {
      const [loadedStats, loadedCircles, loadedStudents] = await Promise.all([
        fetchTeacherDashboardStats(teacherId),
        fetchTeacherCircles(teacherId),
        fetchTeacherStudents(undefined, teacherId),
      ]);

      setStats(loadedStats);
      setCircles(loadedCircles);
      setStudents(loadedStudents);
    } catch (err) {
      console.error('خطأ في تحميل بيانات بوابة المعلم:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const handleOpenRecitation = (studentId?: string) => {
    setSelectedStudentId(studentId);
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

  const filteredStudents = selectedCircleFilter === 'all'
    ? students
    : students.filter((s) => s.circleId === selectedCircleFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800">
        <div className="absolute top-0 left-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-gold-300 font-black text-2xl flex items-center justify-center border border-white/20 shadow-inner font-amiri">
              م
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-gold-400 bg-gold-950/60 px-3 py-1 rounded-full border border-gold-500/30">
                  بوابة المعلم والمحفظ
                </span>
                <span className="text-xs text-ivory-200">مسجد إبراهيم الخليل عليه السلام</span>
                {stats?.isSimulated ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    وضع المحاكاة الميدانية
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    بيانات حية (Supabase)
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black mt-1 font-amiri tracking-tight">
                مرحباً بفضيلة الشيخ: {user?.displayName || 'المحفظ المعتمد'}
              </h1>
              <p className="text-xs text-ivory-200/90 mt-1 font-medium">
                « خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ » — متابعة جلسات الإقراء والتسميع اليومية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateView?.('students')}
              className="hidden sm:flex items-center gap-2 px-4 py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl font-bold text-xs border border-white/15 transition-all"
            >
              <FileText className="w-4 h-4 text-gold-300" />
              <span>التقارير الدورية</span>
            </button>
            <button
              onClick={() => handleOpenRecitation()}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 active:scale-95 text-white rounded-2xl font-black text-xs shadow-lg shadow-gold-500/20 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>رصد تسميع فوري</span>
            </button>
            <button
              onClick={() => loadData()}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Next Session Spotlight */}
      {stats?.nextSession && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-800 text-gold-300 rounded-2xl shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider block">
                الحلقة القادمة اليوم
              </span>
              <h3 className="text-lg font-black text-slate-800">
                {stats.nextSession.circleName}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  {stats.nextSession.hallName}
                </span>
                <span>•</span>
                <span className="font-mono font-bold text-slate-700">{stats.nextSession.time}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateView?.('recitation')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-gold-300" />
              <span>محطة الإقراء المباشر</span>
            </button>

            <button
              onClick={() => onNavigateView?.('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>كشف التحضير</span>
            </button>

            <button
              onClick={() => handleOpenRecitation()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-sm transition-all"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>رصد سريع</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              الحلقات المسندة
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {stats?.assignedCirclesCount || circles.length}
          </div>
          <p className="text-xs text-emerald-700 font-bold mt-2">حلقات قرآنية نشطة</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              إجمالي الطلاب
            </span>
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {stats?.totalStudentsCount || students.length}
          </div>
          <p className="text-xs text-teal-700 font-bold mt-2">طالباً مقيداً بالحلقات</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              نسبة الحضور اليوم
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-800 font-mono">
            {stats?.todayAttendanceRate || 94}%
          </div>
          <p className="text-xs text-emerald-700 font-bold mt-2">انضباط استثنائي في الحضور</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              تسميع هذا الأسبوع
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-800 font-mono">
            {stats?.completedRecitationsThisWeek || 32}
          </div>
          <p className="text-xs text-amber-700 font-bold mt-2">جلسة تسميع ومراجعة موثقة</p>
        </div>
      </div>

      {/* Teacher's Circles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">الحلقات القرآنية المسندة لفضيلتكم</h2>
            <span className="text-xs text-slate-400 font-bold">مسجد إبراهيم الخليل</span>
          </div>
          <button
            onClick={() => onNavigateView?.('students')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-black flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span>إدارة الحلقات والطلاب</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {circles.map((circle) => (
            <div
              key={circle.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {circle.level}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{circle.targetGender}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mt-1">{circle.name}</h3>
                </div>
                <div className="text-left font-mono">
                  <span className="text-2xl font-black text-emerald-900">{circle.studentCount}</span>
                  <span className="text-xs text-slate-400 block font-sans">طلاب</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs">
                <p className="flex items-center gap-2 text-slate-600 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{circle.hallName}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-500 font-mono">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{circle.sessionTime}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateView?.('attendance')}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black transition-colors"
                  >
                    رصد الحضور
                  </button>
                  <button
                    onClick={() => onNavigateView?.('grades')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors"
                  >
                    دفتر المتابعة
                  </button>
                </div>
                <button
                  onClick={() => onNavigateView?.('messages')}
                  className="p-2 text-slate-400 hover:text-emerald-700 rounded-xl hover:bg-slate-50 transition-colors"
                  title="مراسلة أولياء الأمور"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Roster in Circles */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-800">قائمة طلاب الحلقات ووتيرة الحفظ</h3>
            <p className="text-xs text-slate-400 mt-0.5">متابعة إنجاز كل طالب والتسميع المباشر</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">تصفية الحلقة:</span>
            <select
              value={selectedCircleFilter}
              onChange={(e) => setSelectedCircleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            >
              <option value="all">كافة الحلقات المسندة</option>
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="p-3.5">اسم الطالب ورقم القيد</th>
                <th className="p-3.5">الحلقة القرآنية</th>
                <th className="p-3.5 text-center">المستوى</th>
                <th className="p-3.5">آخر تسميع معتمد</th>
                <th className="p-3.5 text-center">التقدير</th>
                <th className="p-3.5 text-center">الانضباط</th>
                <th className="p-3.5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <span className="font-black text-slate-800 text-sm block">
                      {student.fullName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{student.registrationNumber} • ولي الأمر: {student.guardianName}
                    </span>
                  </td>

                  <td className="p-3.5 font-bold text-slate-700">{student.circleName}</td>

                  <td className="p-3.5 text-center font-bold text-emerald-800">
                    جزء {student.currentJuz} من {student.targetJuz}
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold text-slate-700 block">
                      {student.lastRecitationSurah || '---'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {student.lastRecitationDate || 'لم يسجل'}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {student.lastGrade || 'ممتاز'}
                    </span>
                  </td>

                  <td className="p-3.5 text-center font-mono font-bold text-emerald-700">
                    {student.attendanceRate}%
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setDetailModalStudentId(student.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="عرض السجل القرآني وخريطة الأجزاء"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenRecitation(student.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-sm transition-all active:scale-95 flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>تسميع</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Recitation Modal */}
      <QuickRecitationModal
        isOpen={isRecitationModalOpen}
        students={students}
        preselectedStudentId={selectedStudentId}
        onClose={() => setIsRecitationModalOpen(false)}
        onSuccess={handleRecitationSuccess}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={detailModalStudentId !== null}
        studentId={detailModalStudentId}
        onClose={() => setDetailModalStudentId(null)}
        onOpenRecitation={(sId) => {
          setSelectedStudentId(sId);
          setIsRecitationModalOpen(true);
        }}
      />
    </div>
  );
};

export default TeacherDashboard;

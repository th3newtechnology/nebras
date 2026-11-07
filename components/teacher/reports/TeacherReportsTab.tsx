import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Printer,
  Eye,
  Edit,
  Send,
  Trash2,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Award,
  Users,
  ChevronLeft,
  Calendar,
} from 'lucide-react';
import {
  TeacherReport,
  TeacherReportStatus,
  TeacherReportType,
} from '../../../types/teacherReport.types';
import {
  fetchTeacherReports,
  deleteTeacherReport,
  sendReportToGuardian,
  getTeacherReportsMetrics,
} from '../../../lib/teacherReportService';
import { TeacherReportModal } from './TeacherReportModal';
import { TeacherReportPrintModal } from './TeacherReportPrintModal';
import { useNotifications } from '../../../context/NotificationContext';

interface TeacherReportsTabProps {
  teacherId?: string;
  selectedCircleId?: string;
  onSelectStudent?: (studentId: string) => void;
}

export const TeacherReportsTab: React.FC<TeacherReportsTabProps> = ({
  teacherId = 'c0000000-0000-0000-0000-000000000001',
  selectedCircleId,
  onSelectStudent,
}) => {
  const { addNotification } = useNotifications();

  const [reports, setReports] = useState<TeacherReport[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    drafts: 0,
    submitted: 0,
    approved: 0,
    sent: 0,
    excellentRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TeacherReport | null>(null);
  const [printModalReport, setPrintModalReport] = useState<TeacherReport | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, met] = await Promise.all([
        fetchTeacherReports({
          teacherId,
          circleId: selectedCircleId,
          status: statusFilter === 'all' ? undefined : (statusFilter as TeacherReportStatus),
          reportType: typeFilter === 'all' ? undefined : (typeFilter as TeacherReportType),
          search: searchTerm,
        }),
        getTeacherReportsMetrics(teacherId),
      ]);
      setReports(data);
      setMetrics(met);
    } catch (err) {
      console.error('فشل تحميل التقارير التربوية:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teacherId, selectedCircleId, statusFilter, typeFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه المسودة؟')) return;

    try {
      await deleteTeacherReport(id);
      addNotification(
        'تم حذف المسودة بنجاح',
        'تمت إزالة مسودة التقرير من النظام',
        'success'
      );
      loadData();
    } catch (err: any) {
      addNotification(
        'تعذر الحذف',
        err.message || 'حدث خطأ أثناء محاولة الحذف',
        'error'
      );
    }
  };

  const handleSend = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل تريد اعتماد وإرسال هذا التقرير لولي الأمر الآن؟ سيصبح التقرير مقفلاً.')) return;

    try {
      await sendReportToGuardian(id);
      addNotification(
        'تم إرسال التقرير لولي الأمر',
        'تم قفل التقرير رسمياً وتوثيق الختم الزمني',
        'success'
      );
      loadData();
    } catch (err: any) {
      addNotification(
        'فشل الإرسال',
        err.message || 'حدث خطأ',
        'error'
      );
    }
  };

  const getStatusBadge = (status: TeacherReportStatus) => {
    switch (status) {
      case 'sent_to_guardian':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-700" />
            <span>مرسل للولي (مقفل)</span>
          </span>
        );
      case 'approved':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>معتمد من الإدارة</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple-700" />
            <span>مقدم للاعتماد</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" />
            <span>مسودة للمعلم</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black font-amiri text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-800" />
            <span>تقارير المتابعة التربوية والدورية للطلاب</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            إصدار ومراجعة التقارير الأسبوعية والشهرية، توثيق نقاط القوة والتحسين، والمراسلة المعتمدة لأولياء الأمور
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedReport(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-xs transition-all shadow-md shadow-emerald-700/20 active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار تقرير جديد</span>
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors border border-slate-200/60"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 block">إجمالي التقارير</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-slate-900">{metrics.total}</span>
            <span className="text-[10px] font-bold text-slate-400">تقرير مسجل</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 block">المسودات الحالية</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-amber-700">{metrics.drafts}</span>
            <span className="text-[10px] font-bold text-amber-500">قيد الصياغة</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 block">المرسلة للأولياء</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-emerald-800">{metrics.sent}</span>
            <span className="text-[10px] font-bold text-emerald-500">مقفل رسمياً</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 block">نسبة التقدير الممتاز</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black font-mono text-blue-800">{metrics.excellentRate}%</span>
            <span className="text-[10px] font-bold text-blue-500">تفوق قرآني</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder="ابحث باسم الطالب، رقم القيد، أو السورة والملاحظة..."
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الحالات</option>
            <option value="draft">المسودات فقط</option>
            <option value="sent_to_guardian">المرسلة للأولياء</option>
            <option value="approved">المعتمدة</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الفترات</option>
            <option value="weekly">أسبوعي</option>
            <option value="monthly">شهري</option>
            <option value="quarterly">فصلي</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">لا توجد تقارير مطابقة للمعايير المحددة</h3>
            <p className="text-xs text-slate-400 mt-1">
              اضغط على "إصدار تقرير جديد" لبدء توليد أول تقرير تربوي لطلابك.
            </p>
          </div>
        ) : (
          reports.map((report) => {
            const isLocked = report.status === 'sent_to_guardian';

            return (
              <div
                key={report.id}
                onClick={() => {
                  setSelectedReport(report);
                  setIsModalOpen(true);
                }}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Student & Period Meta */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 font-black font-amiri text-lg flex items-center justify-center border border-emerald-100 shrink-0">
                      {report.studentName ? report.studentName[0] : 'ط'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                          {report.studentName}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{report.registrationNumber}
                        </span>
                        {getStatusBadge(report.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                        <span className="text-emerald-800 font-bold">{report.circleName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.periodStart} ⬅️ {report.periodEnd}</span>
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">
                          {report.reportType === 'weekly' ? 'أسبوعي' : 'شهري'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantitative Pill & Rating */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">المواظبة</span>
                      <span className="text-xs font-mono font-black text-slate-800">
                        {report.attendanceRate}%
                      </span>
                    </div>

                    <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                      <span className="text-[10px] text-emerald-600 font-bold block">التقدير</span>
                      <span className="text-xs font-black text-emerald-800">
                        {report.overallRating}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintModalReport(report);
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                        title="طباعة رسمية A4"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {!isLocked ? (
                        <>
                          <button
                            onClick={(e) => handleSend(report.id, e)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                            title="اعتماد وإرسال لولي الأمر"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(report.id, e)}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors"
                            title="حذف المسودة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="p-2 text-slate-400" title="مقفل - لا يمكن التعديل">
                          <Lock className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Report Highlights Preview */}
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="truncate">
                    <span className="font-bold text-emerald-900">📖 الحفظ: </span>
                    <span className="text-slate-600">{report.newMemorizationProgress}</span>
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-amber-900">✨ التميز: </span>
                    <span className="text-slate-600">{report.strengths}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for editing / creating */}
      {isModalOpen && (
        <TeacherReportModal
          isOpen={isModalOpen}
          initialReport={selectedReport}
          teacherId={teacherId}
          defaultCircleId={selectedCircleId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReport(null);
          }}
          onSaved={() => {
            setIsModalOpen(false);
            setSelectedReport(null);
            loadData();
          }}
        />
      )}

      {/* Print Modal */}
      {printModalReport && (
        <TeacherReportPrintModal
          isOpen={Boolean(printModalReport)}
          report={printModalReport}
          onClose={() => setPrintModalReport(null)}
        />
      )}
    </div>
  );
};

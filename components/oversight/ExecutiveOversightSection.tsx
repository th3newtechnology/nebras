import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  Building,
  Printer,
  Sparkles,
  ChevronLeft,
  Phone,
  Send,
  Loader2,
  Filter,
  UserCheck,
  RefreshCw,
  Clock,
  FileText
} from 'lucide-react';
import {
  ExecutiveOversightMetrics,
  StrugglingStudentItem,
  StandoutStudentItem,
  RoomOccupancyConflict,
  ScheduleExceptionAuditItem,
  TeacherWorkflowItem,
} from '../../types/oversight.types';
import {
  fetchExecutiveOversightMetrics,
  fetchStrugglingStudentsWatchlist,
  fetchStandoutStudentsWatchlist,
  fetchHallsOccupancyAudit,
  fetchTeachersWorkflowAudit,
  fetchScheduleExceptionsAudit,
  dispatchInterventionNotice,
} from '../../lib/adminOversightService';
import { ExecutiveOversightPrintModal } from './ExecutiveOversightPrintModal';
import { useNotifications } from '../../context/NotificationContext';
import { ViewType } from '../../types';

interface ExecutiveOversightSectionProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
}

export const ExecutiveOversightSection: React.FC<ExecutiveOversightSectionProps> = ({
  onNavigateView,
}) => {
  const { addNotification } = useNotifications();

  const [metrics, setMetrics] = useState<ExecutiveOversightMetrics | null>(null);
  const [strugglingStudents, setStrugglingStudents] = useState<StrugglingStudentItem[]>([]);
  const [standoutStudents, setStandoutStudents] = useState<StandoutStudentItem[]>([]);
  const [hallsAudit, setHallsAudit] = useState<RoomOccupancyConflict[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleExceptionAuditItem[]>([]);
  const [teacherWorkflows, setTeacherWorkflows] = useState<TeacherWorkflowItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'struggling' | 'standout' | 'halls' | 'teachers'>('struggling');
  const [notifyingStudentId, setNotifyingStudentId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        { metrics: m },
        { students: st },
        { students: sd },
        { halls: ha },
        { exceptions: ex },
        { workflows: wf },
      ] = await Promise.all([
        fetchExecutiveOversightMetrics(),
        fetchStrugglingStudentsWatchlist(),
        fetchStandoutStudentsWatchlist(),
        fetchHallsOccupancyAudit(),
        fetchScheduleExceptionsAudit(),
        fetchTeachersWorkflowAudit(),
      ]);

      setMetrics(m);
      setStrugglingStudents(st);
      setStandoutStudents(sd);
      setHallsAudit(ha);
      setExceptions(ex);
      setTeacherWorkflows(wf);
    } catch (err) {
      console.error('Error loading oversight data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // تنفيذ تدخل إداري عاجل
  const handleIntervention = async (student: StrugglingStudentItem) => {
    setNotifyingStudentId(student.id);
    try {
      const res = await dispatchInterventionNotice({
        studentId: student.id,
        studentName: student.name,
        guardianUserId: student.guardianUserId || 'u-guardian-01',
        message: `السلام عليكم ورحمة الله. تسترعي إدارة مدرسة نبراس القرآنية بمسجد إبراهيم الخليل انتباهكم إلى انخفاض نسبة مواظبة الطالب ${student.name} (${student.attendanceRate}%)، ويرجى التعاون في تدارك ذلك حفاظاً على ثبات المحفوظ.`,
      });

      if (res.success) {
        addNotification(
          'تم إرسال إشعار التدخل بنجاح',
          `تم توجيه تنبيه إداري رسمي لولي أمر الطالب ${student.name} وتوثيق الإجراء في السجل الرقابي.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Failed intervention:', err);
    } finally {
      setNotifyingStudentId(null);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="py-12 bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-xs font-bold">جاري تحميل بيانات الرقابة الشاملة وفحص التعارضات...</span>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
      
      {/* 1. الترويسة الرئيسية والإجراءات */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-gold-300 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 font-amiri flex items-center gap-2">
                <span>لوحة الرقابة الإدارية الشاملة وجودة التحفيظ</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {metrics.mosqueAffiliation}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                الرصد اللحظي للسلامة التشغيلية، فحص التعارضات، رصد الطلاب المتعثرين، وتدقيق سير عمل المشايخ
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-gold-300" />
            <span>طباعة التقرير الرقابي الرسمي (A4)</span>
          </button>
          <button
            onClick={loadData}
            title="تحديث البيانات"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. شريط مؤشرات الرقابة والإنذار المبكر (Oversight KPI Sentinel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* بطاقة 1: سلامة القاعات وخلو التعارضات */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/90 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-900 block">سلامة القاعات والمحفظين</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-950 font-amiri">0</span>
              <span className="text-xs font-bold text-emerald-700">تعارضات نشطة</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
              قاعات المسجد آمنة 100%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-200">
            <Building className="w-5 h-5" />
          </div>
        </div>

        {/* بطاقة 2: رصد الطلاب المتعثرين */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100/90 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-900 block">قائمة المتعثرين للتدخل</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-rose-950 font-amiri">{metrics.strugglingStudentsCount}</span>
              <span className="text-xs font-bold text-rose-700">طلاب يحتاجون دعماً</span>
            </div>
            <span className="text-[10px] text-rose-800 font-bold flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline" />
              انخفاض الحضور أو بطء الحفظ
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white text-rose-700 flex items-center justify-center shadow-2xs border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* بطاقة 3: لوحة المتفوقين وأشبال الإتقان */}
        <div className="p-4 rounded-2xl bg-gold-50/60 border border-gold-200/90 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gold-950 block">أشبال القرآن المتميزون</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-gold-950 font-amiri">{metrics.standoutStudentsCount}</span>
              <span className="text-xs font-bold text-gold-800">طالباً متفوقاً</span>
            </div>
            <span className="text-[10px] text-gold-900 font-bold flex items-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-600 inline" />
              رواية ورش وحفظ مكثف
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white text-gold-700 flex items-center justify-center shadow-2xs border border-gold-200">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* بطاقة 4: سير اعتماد تقارير المعلمين */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-900 block">اعتماد تقارير المعلمين</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-indigo-950 font-amiri">{metrics.reportsApprovedRate}%</span>
              <span className="text-xs font-bold text-indigo-700">نسبة الاعتماد</span>
            </div>
            <span className="text-[10px] text-indigo-800 font-bold flex items-center gap-1 mt-1">
              <FileText className="w-3.5 h-3.5 text-indigo-600 inline" />
              {metrics.draftsPendingCount} مسودات قيد الإرسال
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white text-indigo-700 flex items-center justify-center shadow-2xs border border-indigo-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. تبويبات استعراض الأقسام الرقابية التفصيلية */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 text-xs font-bold">
        <button
          onClick={() => setActiveTab('struggling')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'struggling'
              ? 'bg-white text-rose-900 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>الطلاب المتعثرون ({strugglingStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('standout')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'standout'
              ? 'bg-white text-gold-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-gold-600" />
          <span>لوحة شرف المتفوقين ({standoutStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('halls')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'halls'
              ? 'bg-white text-emerald-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4 text-emerald-700" />
          <span>إشغال القاعات وتدقيق التعارض ({hallsAudit.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'teachers'
              ? 'bg-white text-indigo-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 text-indigo-600" />
          <span>سير عمل المحفظين والتقارير ({teacherWorkflows.length})</span>
        </button>
      </div>

      {/* 4. محتوى التبويب النشط */}

      {/* التبويب 1: الطلاب المتعثرون */}
      {activeTab === 'struggling' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>تم رصد {strugglingStudents.length} طلاب بحاجة إلى تدخل إداري أو تربوي عاجل</span>
            <span className="text-[11px] text-rose-700 font-bold">معايير الرصد: حضور أقل من 75% أو تكرار تقييم مقبول</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {strugglingStudents.map((st) => (
              <div
                key={st.id}
                className="p-4 rounded-2xl bg-rose-50/30 border border-rose-200/80 hover:border-rose-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm shrink-0 border border-rose-200">
                    {st.name[0]}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">{st.name}</h4>
                      <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {st.circleName} ({st.teacherName})
                      </span>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        المواظبة: {st.attendanceRate}%
                      </span>
                    </div>

                    <p className="text-xs text-rose-900 font-medium">
                      ⚠️ {st.primaryAlert}
                    </p>

                    <p className="text-[11px] text-slate-600">
                      <strong>خطة التدخل المقترحة:</strong> {st.interventionPlan}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleIntervention(st)}
                    disabled={notifyingStudentId === st.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                  >
                    {notifyingStudentId === st.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>إرسال إشعار للولي</span>
                  </button>

                  {onNavigateView && (
                    <button
                      onClick={() => onNavigateView('grades')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors border border-slate-200"
                    >
                      <span>سجل المتابعة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* التبويب 2: لوحة المتفوقين */}
      {activeTab === 'standout' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standoutStudents.map((st) => (
            <div
              key={st.id}
              className="p-5 rounded-3xl bg-linear-to-br from-gold-50/50 via-white to-emerald-50/30 border border-gold-200/80 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-900">{st.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {st.completedAjza} أجزاء
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{st.circleName} • {st.teacherName}</p>
                <p className="text-xs text-slate-700 mt-2 italic leading-relaxed">
                  "{st.commendation}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-emerald-700 font-bold">الانضباط: {st.attendanceRate}%</span>
                <span className="text-gold-700 font-black">سلوك: {st.behaviorScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* التبويب 3: إشغال القاعات وتدقيق التعارض */}
      {activeTab === 'halls' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hallsAudit.map((hall) => (
              <div
                key={hall.hallId}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900">{hall.hallName}</h4>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {hall.occupancyPercent}% إشغال
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>السعة: {hall.capacity} مقعد</span>
                  <span>المقيدون: {hall.currentEnrolled} طالب</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${hall.occupancyPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-slate-400">{hall.activeCirclesCount} حلقات أسبوعية</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline" />
                    خالية من أي تعارض
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* استثناءات الحصص النشطة */}
          {exceptions.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
              <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>سجل استثناءات وتعديلات الحصص النشطة بالمسجد ({exceptions.length})</span>
              </h4>
              <div className="space-y-2">
                {exceptions.map((ex) => (
                  <div key={ex.id} className="text-xs text-slate-700 flex items-center justify-between py-1 border-b border-amber-100/60 last:border-none">
                    <span><strong>{ex.circleName}</strong>: {ex.reason}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ex.exceptionDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* التبويب 4: سير عمل المحفظين */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {teacherWorkflows.map((wf) => (
            <div
              key={wf.teacherId}
              className="p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/90 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-900">{wf.teacherName}</h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  التزام {wf.complianceRate}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{wf.circleName} ({wf.totalStudents} طالباً)</p>

              <div className="pt-2 border-t border-indigo-100/80 flex items-center justify-between text-xs">
                <span>التقارير المعتمدة: <strong>{wf.submittedReports}</strong></span>
                <span className="text-emerald-700 font-bold">مرسل للولي: {wf.sentReports}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. نافذة المعاينة والطباعة الرسمية */}
      <ExecutiveOversightPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        metrics={metrics}
        strugglingStudents={strugglingStudents}
        standoutStudents={standoutStudents}
        hallsAudit={hallsAudit}
      />

    </section>
  );
};

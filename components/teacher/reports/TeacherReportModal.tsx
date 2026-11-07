import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Printer,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Lock,
  Loader2,
  Calendar,
  BookOpen,
  User,
  Heart,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  TeacherReport,
  TeacherOverallRating,
  TeacherReportType,
  CreateTeacherReportDTO,
  UpdateTeacherReportDTO,
} from '../../../types/teacherReport.types';
import {
  createTeacherReport,
  updateTeacherReport,
  generateReportDraftForStudent,
  sendReportToGuardian,
  approveTeacherReport,
} from '../../../lib/teacherReportService';
import { useNotifications } from '../../../context/NotificationContext';
import { TeacherReportPrintModal } from './TeacherReportPrintModal';

interface TeacherReportModalProps {
  isOpen: boolean;
  reportId?: string | null;
  initialReport?: TeacherReport | null;
  defaultStudentId?: string;
  defaultCircleId?: string;
  teacherId?: string;
  onClose: () => void;
  onSaved?: (report: TeacherReport) => void;
}

export const TeacherReportModal: React.FC<TeacherReportModalProps> = ({
  isOpen,
  reportId,
  initialReport,
  defaultStudentId = 's-001',
  defaultCircleId = 'd0000000-0000-0000-0000-000000000002',
  teacherId = 'c0000000-0000-0000-0000-000000000001',
  onClose,
  onSaved,
}) => {
  const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<TeacherReport | null>(null);

  // Form Fields
  const [reportType, setReportType] = useState<TeacherReportType>('weekly');
  const [periodStart, setPeriodStart] = useState<string>('2026-11-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-11-06');
  const [studentId, setStudentId] = useState<string>(defaultStudentId);
  const [studentName, setStudentName] = useState<string>('محمد ياسين درويش');
  const [registrationNumber, setRegistrationNumber] = useState<string>('NEB-2026-0001');

  const [attendanceRate, setAttendanceRate] = useState<number>(100);
  const [sessionsAttended, setSessionsAttended] = useState<number>(4);
  const [sessionsTotal, setSessionsTotal] = useState<number>(4);

  const [newMemorizationProgress, setNewMemorizationProgress] = useState<string>('');
  const [revisionProgress, setRevisionProgress] = useState<string>('');
  const [tajweedLevel, setTajweedLevel] = useState<string>('');
  const [warshAdherence, setWarshAdherence] = useState<string>('ملتزم بأحكام الرواية (مد البدل، التقليل، نقل الهمز)');

  const [behaviorNotes, setBehaviorNotes] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [areasForImprovement, setAreasForImprovement] = useState<string>('');
  const [recommendationsForGuardian, setRecommendationsForGuardian] = useState<string>('');
  const [nextWeekGoals, setNextWeekGoals] = useState<string>('');
  const [overallRating, setOverallRating] = useState<TeacherOverallRating>('ممتاز');

  const isLocked = activeReport?.status === 'sent_to_guardian';

  useEffect(() => {
    if (initialReport) {
      setActiveReport(initialReport);
      setReportType(initialReport.reportType);
      setPeriodStart(initialReport.periodStart);
      setPeriodEnd(initialReport.periodEnd);
      setStudentId(initialReport.studentId);
      setStudentName(initialReport.studentName || 'طالب مسجل');
      setRegistrationNumber(initialReport.registrationNumber || '');
      setAttendanceRate(initialReport.attendanceRate);
      setSessionsAttended(initialReport.sessionsAttended);
      setSessionsTotal(initialReport.sessionsTotal);
      setNewMemorizationProgress(initialReport.newMemorizationProgress);
      setRevisionProgress(initialReport.revisionProgress);
      setTajweedLevel(initialReport.tajweedLevel);
      setWarshAdherence(initialReport.warshAdherence);
      setBehaviorNotes(initialReport.behaviorNotes || '');
      setStrengths(initialReport.strengths);
      setAreasForImprovement(initialReport.areasForImprovement);
      setRecommendationsForGuardian(initialReport.recommendationsForGuardian);
      setNextWeekGoals(initialReport.nextWeekGoals || '');
      setOverallRating(initialReport.overallRating);
    } else {
      setActiveReport(null);
      // Auto populate draft for default student
      handleSmartAutoFill(defaultStudentId);
    }
  }, [isOpen, initialReport, defaultStudentId]);

  const handleSmartAutoFill = async (sid: string = studentId) => {
    setAutoGenerating(true);
    try {
      const draft = await generateReportDraftForStudent(sid, periodStart, periodEnd);
      setStudentName(draft.studentName);
      setRegistrationNumber(draft.registrationNumber);
      setPeriodStart(draft.periodStart);
      setPeriodEnd(draft.periodEnd);
      setAttendanceRate(draft.attendanceRate);
      setSessionsAttended(draft.sessionsAttended);
      setSessionsTotal(draft.sessionsTotal);
      setNewMemorizationProgress(draft.newMemorizationProgress);
      setRevisionProgress(draft.revisionProgress);
      setTajweedLevel(draft.tajweedLevel);
      setWarshAdherence(draft.warshAdherence);
      setStrengths(draft.suggestedStrengths);
      setAreasForImprovement(draft.suggestedAreasForImprovement);
      setRecommendationsForGuardian(draft.suggestedRecommendationsForGuardian);
      setNextWeekGoals(draft.suggestedNextWeekGoals);
      setOverallRating(draft.suggestedOverallRating);

      addNotification(
        'تم التوليد الذكي للتقرير بنجاح',
        'تم استيراد بيانات الحفظ والمواظبة والتجويد من جلسات التسميع الفعلية',
        'success'
      );
    } catch (err) {
      console.error('فشل التوليد التلقائي:', err);
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      let saved: TeacherReport;
      if (activeReport?.id) {
        saved = await updateTeacherReport(activeReport.id, {
          reportType,
          periodStart,
          periodEnd,
          attendanceRate,
          sessionsAttended,
          sessionsTotal,
          newMemorizationProgress,
          revisionProgress,
          tajweedLevel,
          warshAdherence,
          behaviorNotes,
          strengths,
          areasForImprovement,
          recommendationsForGuardian,
          nextWeekGoals,
          overallRating,
          status: 'draft',
        });
      } else {
        saved = await createTeacherReport({
          studentId,
          teacherId,
          circleId: defaultCircleId,
          reportType,
          periodStart,
          periodEnd,
          attendanceRate,
          sessionsAttended,
          sessionsTotal,
          newMemorizationProgress,
          revisionProgress,
          tajweedLevel,
          warshAdherence,
          behaviorNotes,
          strengths,
          areasForImprovement,
          recommendationsForGuardian,
          nextWeekGoals,
          overallRating,
          status: 'draft',
        });
      }

      setActiveReport(saved);
      addNotification(
        'تم حفظ مسودة التقرير بنجاح',
        'التقرير محفوظ كمسودة قابلة للتعديل والمراجعة قبل الإرسال',
        'success'
      );
      if (onSaved) onSaved(saved);
    } catch (err: any) {
      addNotification(
        'تعذر حفظ المسودة',
        err.message || 'حدث خطأ أثناء الحفظ',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendToGuardian = async () => {
    if (!strengths || !areasForImprovement || !recommendationsForGuardian) {
      addNotification(
        'بيانات التقرير غير مكتملة',
        'يرجى ملء نقاط القوة والتحسين وتوجيهات ولي الأمر قبل الإرسال',
        'warning'
      );
      return;
    }

    if (!window.confirm('تأكيد الإرسال لولي الأمر؟ بمجرد الإرسال يصبح التقرير مقفلاً وغير قابل للتعديل لضمان الأمان والنزاهة القانونية.')) {
      return;
    }

    setLoading(true);
    try {
      let targetId = activeReport?.id;
      if (!targetId) {
        const created = await createTeacherReport({
          studentId,
          teacherId,
          circleId: defaultCircleId,
          reportType,
          periodStart,
          periodEnd,
          attendanceRate,
          sessionsAttended,
          sessionsTotal,
          newMemorizationProgress,
          revisionProgress,
          tajweedLevel,
          warshAdherence,
          behaviorNotes,
          strengths,
          areasForImprovement,
          recommendationsForGuardian,
          nextWeekGoals,
          overallRating,
          status: 'draft',
        });
        targetId = created.id;
      }

      const sent = await sendReportToGuardian(targetId);
      setActiveReport(sent);

      addNotification(
        'تم إرسال التقرير لولي الأمر بنجاح 🛡️',
        'تم قفل التقرير رسمياً وتوثيق الختم الزمني والإشعار في بوابة الولي',
        'success'
      );

      if (onSaved) onSaved(sent);
    } catch (err: any) {
      addNotification(
        'فشل إرسال التقرير',
        err.message || 'حدث خطأ أثناء معالجة الإرسال',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-islamic-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 border border-emerald-700/60 flex items-center justify-center text-gold-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-amiri text-white">
                    {activeReport ? 'تفاصيل التقرير التربوي والدوري' : 'إصدار تقرير تربوي دوري جديد'}
                  </h3>
                  {isLocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>مقفل (مرسل للولي)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>مسودة قابلة للتعديل</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
                  الطالب: <span className="font-bold text-white">{studentName}</span> ({registrationNumber})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isLocked && (
                <button
                  onClick={() => handleSmartAutoFill()}
                  disabled={autoGenerating}
                  className="px-3.5 py-1.5 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 border border-gold-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="استيراد وتوليد ذكي من سجل التسميع الفعلي"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${autoGenerating ? 'animate-spin' : ''}`} />
                  <span>توليد ذكي</span>
                </button>
              )}

              {activeReport && (
                <button
                  onClick={() => setPrintModalOpen(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                  title="معاينة وطباعة A4"
                >
                  <Printer className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-slate-800">
            {/* Immutability Banner */}
            {isLocked && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900 font-medium">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  هذا التقرير تم إرساله رسمياً لولي الأمر وهو مقفل ومحمي بواسطة سياسات الأمان (RLS Immutability). لا يمكن التعديل عليه.
                </span>
              </div>
            )}

            {/* Row 1: Report Type & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">نوع التقرير</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as TeacherReportType)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                >
                  <option value="weekly">تقرير أسبوعي (افتراضي)</option>
                  <option value="monthly">تقرير شهري</option>
                  <option value="quarterly">تقرير فصلي</option>
                  <option value="daily">تقرير يومي</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">بداية الفترة (السبت)</label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">نهاية الفترة (الخميس)</label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Row 2: Attendance & Overall Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">الحصص المحضورة</label>
                <input
                  type="number"
                  min="0"
                  value={sessionsAttended}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSessionsAttended(val);
                    if (sessionsTotal > 0) {
                      setAttendanceRate(Math.round((val / sessionsTotal) * 100));
                    }
                  }}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">إجمالي حصص الفترة</label>
                <input
                  type="number"
                  min="1"
                  value={sessionsTotal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSessionsTotal(val);
                    if (val > 0) {
                      setAttendanceRate(Math.round((sessionsAttended / val) * 100));
                    }
                  }}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">نسبة الحضور</label>
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 font-mono">
                  {attendanceRate}%
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">التقدير العام للفترة</label>
                <select
                  value={overallRating}
                  onChange={(e) => setOverallRating(e.target.value as TeacherOverallRating)}
                  disabled={isLocked}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-emerald-900 disabled:opacity-60"
                >
                  <option value="ممتاز">ممتاز ⭐⭐⭐</option>
                  <option value="جيد جداً">جيد جداً ⭐⭐</option>
                  <option value="جيد">جيد ⭐</option>
                  <option value="مقبول">مقبول</option>
                  <option value="يحتاج متابعة">يحتاج متابعة</option>
                </select>
              </div>
            </div>

            {/* Row 3: Hifz & Revision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>الحفظ الجديد المنجز خلال الفترة:</span>
                </label>
                <textarea
                  rows={2}
                  value={newMemorizationProgress}
                  onChange={(e) => setNewMemorizationProgress(e.target.value)}
                  disabled={isLocked}
                  placeholder="مثال: حفظ سورة النور من آية 1 إلى آية 20 بإتقان تام..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  <span>المراجعة والتثبيت:</span>
                </label>
                <textarea
                  rows={2}
                  value={revisionProgress}
                  onChange={(e) => setRevisionProgress(e.target.value)}
                  disabled={isLocked}
                  placeholder="مثال: مراجعة الجزء السادس عشر وسرد متصل..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Row 4: Tajweed & Warsh Adherence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>مستوى التجويد ومخارج الحروف:</span>
                </label>
                <input
                  type="text"
                  value={tajweedLevel}
                  onChange={(e) => setTajweedLevel(e.target.value)}
                  disabled={isLocked}
                  placeholder="إتقان أحكام الغنن والمدود ومخارج الحروف..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>الالتزام برواية ورش عن نافع:</span>
                </label>
                <input
                  type="text"
                  value={warshAdherence}
                  onChange={(e) => setWarshAdherence(e.target.value)}
                  disabled={isLocked}
                  placeholder="مد البدل 4 حركات، تقليل ذوات الياء، نقل الهمز..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Row 5: Strengths & Areas for Improvement (Pedagogical Core) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>أبرز نقاط القوة والتميز (Strengths):</span>
                </label>
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  disabled={isLocked}
                  placeholder="صف ما تميز به الطالب: سرعة الحفظ، الصوت الحسن، التفاعل والانضباط..."
                  className="w-full px-3.5 py-2.5 bg-emerald-50/30 border border-emerald-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>فرص التحسين ومجالات التطوير (Areas for Improvement):</span>
                </label>
                <textarea
                  rows={3}
                  value={areasForImprovement}
                  onChange={(e) => setAreasForImprovement(e.target.value)}
                  disabled={isLocked}
                  placeholder="حدد ما يحتاج لمراجعة: عدم العجلة، ضبط مخارج معينة، تكثيف السرد..."
                  className="w-full px-3.5 py-2.5 bg-amber-50/30 border border-amber-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Row 6: Guardian Recommendations & Next Week Goals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-blue-700" />
                  <span>توجيهات عملية لولي الأمر في البيت:</span>
                </label>
                <textarea
                  rows={2}
                  value={recommendationsForGuardian}
                  onChange={(e) => setRecommendationsForGuardian(e.target.value)}
                  disabled={isLocked}
                  placeholder="نصائح للأسرة: مرافقة الطالب للاستماع للمصحف المرتل، تخصيص 20 دقيقة..."
                  className="w-full px-3.5 py-2.5 bg-blue-50/30 border border-blue-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-700" />
                  <span>أهداف الأسبوع / الفترة القادمة (Next Week Goals):</span>
                </label>
                <textarea
                  rows={2}
                  value={nextWeekGoals}
                  onChange={(e) => setNextWeekGoals(e.target.value)}
                  disabled={isLocked}
                  placeholder="المستهدف القرآني للأسبوع القادم: إتمام الحزب كذا، مراجعة سورة كذا..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-700 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeReport && (
                <button
                  type="button"
                  onClick={() => setPrintModalOpen(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>معاينة الطباعة الرسمية</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                إغلاق
              </button>

              {!isLocked && (
                <>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ كمسودة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToGuardian}
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>اعتماد وإرسال لولي الأمر</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {printModalOpen && activeReport && (
        <TeacherReportPrintModal
          isOpen={printModalOpen}
          report={activeReport}
          onClose={() => setPrintModalOpen(false)}
        />
      )}
    </>
  );
};

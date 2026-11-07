import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Heart,
  Loader2,
  Printer,
  Plus,
  Target,
  FileText,
  User,
  Phone,
  ShieldCheck,
  Check,
  ChevronLeft,
  Ban,
  Activity,
  Layers,
  Lock,
} from 'lucide-react';
import {
  StudentFollowupProfile,
  PedagogicalTimelineCategory,
  StudentGoalStatus,
} from '../../types/studentFollowup.types';
import {
  fetchStudentFollowupRecord,
  updateStudentGoalStatus,
} from '../../lib/studentFollowupService';
import { TeacherReport } from '../../types/teacherReport.types';
import { fetchTeacherReports } from '../../lib/teacherReportService';
import { TeacherReportModal } from '../teacher/reports/TeacherReportModal';
import { TeacherReportPrintModal } from '../teacher/reports/TeacherReportPrintModal';
import { AddGoalModal } from './AddGoalModal';
import { useNotifications } from '../../context/NotificationContext';

interface StudentFollowupRecordModalProps {
  isOpen: boolean;
  studentId: string | null;
  onClose: () => void;
}

export const StudentFollowupRecordModal: React.FC<StudentFollowupRecordModalProps> = ({
  isOpen,
  studentId,
  onClose,
}) => {
  const [profile, setProfile] = useState<StudentFollowupProfile | null>(null);
  const [reports, setReports] = useState<TeacherReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'kpis' | 'goals' | 'tajweed' | 'notes' | 'reports'>('timeline');
  const [timelineFilter, setTimelineFilter] = useState<'all' | PedagogicalTimelineCategory>('all');
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState<TeacherReport | null>(null);

  const { addNotification } = useNotifications();

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [data, studentReports] = await Promise.all([
        fetchStudentFollowupRecord(id),
        fetchTeacherReports({ studentId: id }),
      ]);
      setProfile(data);
      setReports(studentReports);
    } catch (err) {
      console.error('فشل تحميل سجل المتابعة:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentId) {
      loadData(studentId);
    } else {
      setProfile(null);
    }
  }, [isOpen, studentId]);

  if (!isOpen || !studentId) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleGoalStatusChange = async (goalId: string, newStatus: StudentGoalStatus) => {
    const res = await updateStudentGoalStatus(goalId, newStatus);
    if (res.success) {
      addNotification('تم تحديث حالة الهدف', 'تم حفظ حالة الهدف القرآني بنجاح.', 'success');
      loadData(studentId);
    }
  };

  const filteredTimeline = profile?.timeline.filter((item) => {
    if (timelineFilter === 'all') return true;
    if (timelineFilter === 'new_memorization') return item.category === 'new_memorization';
    if (timelineFilter === 'minor_review') return item.category === 'minor_review' || item.category === 'major_review';
    if (timelineFilter === 'attendance') return item.category === 'attendance';
    if (timelineFilter === 'evaluation') return item.category === 'evaluation';
    return true;
  }) || [];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-300 text-2xl font-black font-amiri shadow-inner">
              {profile?.fullName ? profile.fullName.charAt(0) : <BookOpen className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px] font-bold">
                  سجل المتابعة التربوي المستمر (8.4.3)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                  {profile?.registrationNumber || 'قيد التحميل...'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  {profile?.hifzLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-amiri text-gold-200 mt-1">
                {profile?.fullName || 'جاري التحميل...'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {profile?.circleName} • المحفظ المسؤول: {profile?.teacherName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="طباعة السجل التربوي"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden sm:inline">طباعة السجل</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading || !profile ? (
          <div className="p-16 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-islamic-800" />
            <p className="text-xs font-bold text-slate-500">جاري تجميع السجل التربوي والقرآني للطالب...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Top KPIs Summary Ribbon (All 7 required dimensions) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. الحفظ */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between text-emerald-900 text-[11px] font-bold">
                  <span>محفوظ القرآن</span>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                </div>
                <div className="text-lg font-black font-amiri text-slate-900">
                  الجزء {profile.metrics.currentJuz}{' '}
                  <span className="text-xs font-mono text-slate-500">/ 30</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {profile.metrics.totalSurahsCompleted} سورة • {profile.metrics.totalVersesMemorized} آية
                </div>
              </div>

              {/* 2. المراجعة */}
              <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                <div className="flex items-center justify-between text-teal-900 text-[11px] font-bold">
                  <span>انتظام المراجعة</span>
                  <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <div className="text-lg font-black font-amiri text-slate-900">
                  {profile.metrics.revisionConsistencyScore}%
                </div>
                <div className="text-[10px] text-slate-500">مواظبة وتثبيت متين</div>
              </div>

              {/* 3 & 4. التجويد ورواية ورش */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-center justify-between text-amber-900 text-[11px] font-bold">
                  <span>رواية ورش والتجويد</span>
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div className="text-lg font-black font-amiri text-slate-900">
                  {profile.metrics.warshComplianceIndex}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {profile.metrics.totalTajweedMistakesCount === 0
                    ? 'خالٍ من اللحون'
                    : `${profile.metrics.totalTajweedMistakesCount} ملاحظات تجويد`}
                </div>
              </div>

              {/* 5. الحضور والمواظبة */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
                <div className="flex items-center justify-between text-blue-900 text-[11px] font-bold">
                  <span>نسبة المواظبة</span>
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                </div>
                <div className="text-lg font-black font-amiri text-slate-900">
                  {profile.metrics.attendanceRate}%
                </div>
                <div className="text-[10px] text-slate-500">
                  حضر {profile.metrics.presentSessionsCount} • غياب {profile.metrics.absentSessionsCount}
                </div>
              </div>

              {/* 6. التقييم والتطور */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-purple-900 text-[11px] font-bold">
                  <span>المعدل والتقييم</span>
                  <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                </div>
                <div className="text-lg font-black font-amiri text-slate-900">
                  {profile.metrics.averageEvaluationScore}{' '}
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold">منحنى صاعد متميز</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'bg-islamic-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>السجل الزمني للتسميع ({profile.timeline.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'goals'
                      ? 'bg-islamic-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>الأهداف القرآنية ({profile.goals.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('tajweed')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'tajweed'
                      ? 'bg-islamic-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>رواية ورش والتجويد</span>
                </button>

                <button
                  onClick={() => setActiveTab('kpis')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'kpis'
                      ? 'bg-islamic-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>خريطة الأجزاء الـ 30</span>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'reports'
                      ? 'bg-islamic-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>التقارير الدورية ({reports.length})</span>
                </button>
              </div>

              {activeTab === 'goals' && (
                <button
                  onClick={() => setIsAddGoalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تحديد هدف جديد</span>
                </button>
              )}
            </div>

            {/* TAB 1: Pedagogical Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {/* Timeline Category Filters */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 ml-1">تصفية السجل:</span>
                  {[
                    { id: 'all', label: 'كافة الأنشطة' },
                    { id: 'new_memorization', label: 'حفظ جديد' },
                    { id: 'minor_review', label: 'مراجعة وتثبيت' },
                    { id: 'evaluation', label: 'اختبارات وتقييمات' },
                    { id: 'attendance', label: 'سجل الحضور' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTimelineFilter(f.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        timelineFilter === f.id
                          ? 'bg-islamic-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredTimeline.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 font-bold">
                    لا توجد سجلات مسجلة ضمن التصنيف المحدد
                  </div>
                ) : (
                  <div className="relative border-r-2 border-slate-200 mr-3 pr-6 space-y-4">
                    {filteredTimeline.map((item) => (
                      <div key={item.id} className="relative group">
                        {/* Timeline Node Icon */}
                        <div className="absolute -right-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-islamic-800 shadow-xs" />

                        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-islamic-600 hover:shadow-xs transition-all text-xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 font-amiri text-sm">
                                {item.title}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">
                              {item.date} {item.time ? `• ${item.time}` : ''}
                            </span>
                          </div>

                          {/* Pedagogical Details */}
                          {item.warshAdherence && (
                            <div className="text-[11px] text-amber-900 bg-amber-50/60 p-2 rounded-xl border border-amber-100 flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{item.warshAdherence}</span>
                            </div>
                          )}

                          {item.notes && (
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>{item.notes}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>بإشراف: {item.teacherName}</span>
                            {item.mistakesCount !== undefined && (
                              <span>
                                الأخطاء: {item.mistakesCount} • التجويد: {item.tajweedMistakesCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Quranic Goals */}
            {activeTab === 'goals' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.goals.map((goal) => {
                    const isCompleted = goal.status === 'completed';
                    return (
                      <div
                        key={goal.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 text-xs ${
                          isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isCompleted ? '✓ تم الإنجاز' : 'قيد المتابعة'}
                            </span>
                            <h4 className="font-bold text-slate-900 font-amiri text-sm mt-1">
                              {goal.title}
                            </h4>
                          </div>

                          {!isCompleted && (
                            <button
                              onClick={() => handleGoalStatusChange(goal.id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors flex items-center gap-1 shadow-2xs shrink-0"
                            >
                              <Check className="w-3 h-3" />
                              <span>اعتماد كمنجز</span>
                            </button>
                          )}
                        </div>

                        {goal.description && (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {goal.description}
                          </p>
                        )}

                        {goal.teacherNotes && (
                          <div className="p-2 rounded-xl bg-slate-50 text-[10px] text-slate-600">
                            توجيه المحفظ: {goal.teacherNotes}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>المستهدف: {goal.targetDate}</span>
                          {goal.completedAt && (
                            <span className="text-emerald-700 font-bold">
                              أنجز في: {new Date(goal.completedAt).toLocaleDateString('ar-DZ')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Warsh & Tajweed Audit */}
            {activeTab === 'tajweed' && (
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-amiri text-sm text-slate-900">
                      تقرير التجويد ورواية ورش عن نافع من طريق الأزرق
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ملاحظات المحفظ المعتمدة وفق المقياس الجزائري للتعليم القرآني
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800">أحكام الهمز والمدود</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      يتقن نقل حركة الهمزة المفردة إلى الساكن قبلها، ويطبق مد البدل بالتوسط (4 حركات) باطراد تام دون تخليط.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800">أحكام الراءات واللامات</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      مراعاة ترقيق الراء المفتوحة والمضمومة بعد ياء ساكنة أو كسر لازم، مع تفخيم اللام المفتوحة بعد الصاد والطاء والظاء.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800">ذوات الياء والإمالة الصغرى</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      تقليل رؤوس الآي بإتقان في السور الإحدى عشرة النجمية (طه، النجم، القيامة، الأعلى...).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-800">مخارج الحروف وصفاتها</div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      تمييز سليم بين الضاد والظاء، وانضباط في صفير الصاد والزاي، وخلو تام من اللحن الجلي.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: 30 Ajza Visual Tracker */}
            {activeTab === 'kpis' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    خريطة تقدم الأجزاء الثلاثين من القرآن الكريم
                  </span>
                  <span className="text-slate-500 font-mono">
                    {profile.metrics.completedAjzaCount} من 30 جزءاً مكتملاً
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
                    const isCompleted = juz < profile.metrics.currentJuz;
                    const isCurrent = juz === profile.metrics.currentJuz;

                    return (
                      <div
                        key={juz}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : isCurrent
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] font-bold">جزء</div>
                        <div className="text-sm font-black font-mono">{juz}</div>
                        <div className="text-[8px] mt-0.5">
                          {isCompleted ? '✓ مكتمل' : isCurrent ? 'جاري' : 'متبقٍ'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: Reports History (8.4.4) */}
            {activeTab === 'reports' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">تقارير المتابعة الدورية الخاصة بالطالب</h3>
                      <p className="text-xs text-slate-500">استعراض التقارير الأسبوعية والشهرية والطباعة الرسمية</p>
                    </div>
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إصدار تقرير جديد</span>
                    </button>
                  </div>

                  {reports.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-600">لا توجد تقارير دورية مسجلة بعد لهذا الطالب</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {reports.map((rep) => (
                        <div
                          key={rep.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {rep.reportType === 'weekly' ? 'تقرير أسبوعي' : 'تقرير دوري'} ({rep.periodStart} ⬅️ {rep.periodEnd})
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {rep.overallRating}
                              </span>
                              {rep.status === 'sent_to_guardian' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>مرسل للولي</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800">
                                  مسودة
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                              <strong>الحفظ:</strong> {rep.newMemorizationProgress} • <strong>المواظبة:</strong> {rep.attendanceRate}%
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setSelectedReportForPrint(rep)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500">
            ولي الأمر: <strong>{profile?.guardianName}</strong> ({profile?.guardianPhone})
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>هدف قرآني جديد</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* Add Goal Sub-modal */}
      {profile && (
        <AddGoalModal
          isOpen={isAddGoalOpen}
          onClose={() => setIsAddGoalOpen(false)}
          onSuccess={() => loadData(profile.studentId)}
          studentId={profile.studentId}
          studentName={profile.fullName}
          circleId={profile.circleId}
        />
      )}

      {/* Teacher Report Modal (Stage 8.4.4) */}
      {isReportModalOpen && profile && (
        <TeacherReportModal
          isOpen={isReportModalOpen}
          defaultStudentId={profile.studentId}
          defaultCircleId={profile.circleId || undefined}
          teacherId={profile.goals[0]?.teacherId || undefined}
          onClose={() => setIsReportModalOpen(false)}
          onSaved={() => {
            setIsReportModalOpen(false);
            loadData(profile.studentId);
          }}
        />
      )}

      {/* Print Report Modal */}
      {selectedReportForPrint && (
        <TeacherReportPrintModal
          isOpen={Boolean(selectedReportForPrint)}
          report={selectedReportForPrint}
          onClose={() => setSelectedReportForPrint(null)}
        />
      )}
    </div>
  );
};

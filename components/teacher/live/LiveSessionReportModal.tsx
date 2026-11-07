import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Flame,
  FileText,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';
import {
  LiveRecitationSession,
  SessionPerformanceAnalytics,
} from '../../../types/liveSession.types';
import {
  calculateSessionAnalytics,
  getCirclePerformanceHistory,
} from '../../../lib/sessionAnalyticsEngine';
import { formatScoreOutOf20 } from '../../../lib/evaluationEngine';
import { getArchivedSessions } from '../../../lib/liveSessionService';

interface LiveSessionReportModalProps {
  isOpen: boolean;
  session: LiveRecitationSession | null;
  onClose: () => void;
  onSelectPastSession?: (session: LiveRecitationSession) => void;
}

export const LiveSessionReportModal: React.FC<LiveSessionReportModalProps> = ({
  isOpen,
  session,
  onClose,
  onSelectPastSession,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'gradesheet' | 'history'>('analytics');

  // Compute analytics for this session
  const analytics: SessionPerformanceAnalytics | null = useMemo(() => {
    if (!session) return null;
    return calculateSessionAnalytics(session);
  }, [session]);

  // Load archived sessions for circle performance history
  const archivedSessions = useMemo(() => {
    if (!session) return [];
    return getArchivedSessions(session.teacherId);
  }, [session]);

  const circleHistory = useMemo(() => {
    if (!session) return null;
    return getCirclePerformanceHistory(archivedSessions, session.circleId);
  }, [archivedSessions, session]);

  if (!isOpen || !session || !analytics) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none print:p-0">
        {/* =================================================================== */}
        {/* TOP MODAL HEADER & ACTIONS                                          */}
        {/* =================================================================== */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white p-5 sm:p-6 relative print:bg-white print:text-slate-900 print:border-b-2 print:border-emerald-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px] font-bold print:border-emerald-800 print:text-emerald-900">
                  مدرسة نبراس القرآنية • مسجد إبراهيم الخليل
                </span>
                <span className="text-xs text-emerald-200 font-mono font-bold">
                  {session.date}
                </span>
              </div>

              <h2 className="text-2xl font-black font-amiri text-white print:text-slate-900">
                تقرير أداء جلسة: {session.circleName}
              </h2>

              <p className="text-xs text-emerald-200 font-bold flex items-center gap-2 print:text-slate-600">
                <span>المحفظ: {session.teacherName}</span>
                <span>•</span>
                <span>القاعة: {session.hallName}</span>
                {analytics.sessionDurationMinutes && (
                  <>
                    <span>•</span>
                    <span>المدة: {analytics.sessionDurationMinutes} دقيقة</span>
                  </>
                )}
              </p>
            </div>

            {/* Print & Close Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-xs"
                title="طباعة التقرير الرسمي للجلسة"
              >
                <Printer className="w-3.5 h-3.5 text-gold-300" />
                <span>طباعة التقرير</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="إغلاق التقرير"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Hidden in Print) */}
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-emerald-800/80 print:hidden text-xs">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>المؤشرات والتحليلات</span>
            </button>

            <button
              onClick={() => setActiveTab('gradesheet')}
              className={`px-3.5 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'gradesheet'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>كشف التسميعات والدرجات ({analytics.completedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-xl font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>تاريخ جلسات الحلقة ({archivedSessions.filter((s) => s.circleId === session.circleId).length})</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BODY CONTENT ACCORDING TO ACTIVE TAB                                */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
          {/* TAB 1: ANALYTICS & KPIS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 4 Big KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Average Score */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>معدل درجات الحلقة</span>
                    <Award className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-2xl font-black font-mono text-emerald-950">
                    {formatScoreOutOf20(analytics.averageScoreOutOf20)}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    {analytics.averageScoreOutOf100}% النسبة المئوية
                  </span>
                </div>

                {/* 2. Completion Rate */}
                <div className="p-4 bg-gradient-to-br from-gold-50 to-amber-50/50 rounded-2xl border border-gold-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-gold-900">
                    <span>نسبة إنجاز التسميع</span>
                    <TrendingUp className="w-4 h-4 text-gold-700" />
                  </div>
                  <p className="text-2xl font-black font-mono text-gold-950">
                    {analytics.completionRate}%
                  </p>
                  <span className="text-[10px] text-gold-800 font-bold block">
                    أتم {analytics.completedCount} من {analytics.presentCount + analytics.lateCount} حاضرين
                  </span>
                </div>

                {/* 3. Attendance Rate */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                    <span>نسبة الحضور</span>
                    <Users className="w-4 h-4 text-blue-700" />
                  </div>
                  <p className="text-2xl font-black font-mono text-blue-950">
                    {analytics.attendanceRate}%
                  </p>
                  <span className="text-[10px] text-blue-800 font-bold block">
                    {analytics.presentCount} حاضر • {analytics.absentCount} غائب
                  </span>
                </div>

                {/* 4. Mistakes Ratio */}
                <div className="p-4 bg-gradient-to-br from-slate-50 to-rose-50/30 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>عثرات التلاوة</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-black font-mono text-slate-900">
                    {analytics.totalHifzMistakes + analytics.totalTajweedMistakes}
                  </p>
                  <span className="text-[10px] text-slate-500 font-bold block">
                    {analytics.totalHifzMistakes} حفظ (جلي) • {analytics.totalTajweedMistakes} تجويد (خفي)
                  </span>
                </div>
              </div>

              {/* Grade Distribution & Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grades Breakdown */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>توزيع تقديرات التسميع القرآني</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800">ممتاز (90 - 100%)</span>
                      <span className="font-mono font-black text-emerald-950">
                        {analytics.gradeDistribution.mumtaz} طلاب
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{
                          width: `${
                            analytics.completedCount > 0
                              ? (analytics.gradeDistribution.mumtaz / analytics.completedCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-teal-800">جيد جداً (80 - 89%)</span>
                      <span className="font-mono font-black text-teal-950">
                        {analytics.gradeDistribution.jayyidJiddan} طلاب
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full"
                        style={{
                          width: `${
                            analytics.completedCount > 0
                              ? (analytics.gradeDistribution.jayyidJiddan / analytics.completedCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-amber-800">جيد (70 - 79%)</span>
                      <span className="font-mono font-black text-amber-950">
                        {analytics.gradeDistribution.jayyid} طلاب
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full"
                        style={{
                          width: `${
                            analytics.completedCount > 0
                              ? (analytics.gradeDistribution.jayyid / analytics.completedCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-rose-800">يحتاج مراجعة (دون 70%)</span>
                      <span className="font-mono font-black text-rose-950">
                        {analytics.gradeDistribution.needsReview} طلاب
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-600 h-full"
                        style={{
                          width: `${
                            analytics.completedCount > 0
                              ? (analytics.gradeDistribution.needsReview / analytics.completedCount) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gold-700" />
                    <span>أنواع المقررات المرصودة بالجلسة</span>
                  </h4>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">الحفظ الجديد</span>
                        <span className="text-[10px] text-slate-500">مقرر الآيات واللوح الجديد</span>
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-700">
                        {analytics.categoryDistribution.newMemorization} طلاب
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">المراجعة الصغرى (القريب)</span>
                        <span className="text-[10px] text-slate-500">مراجعة المحفوظ للأسبوع الماضي</span>
                      </div>
                      <span className="font-mono font-black text-sm text-teal-700">
                        {analytics.categoryDistribution.minorReview} طلاب
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">المراجعة الكبرى (البعيد)</span>
                        <span className="text-[10px] text-slate-500">تثبيت الأجزاء السابقة</span>
                      </div>
                      <span className="font-mono font-black text-sm text-purple-700">
                        {analytics.categoryDistribution.majorReview} طلاب
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED GRADESHEET TABLE (Also visible in print) */}
          {(activeTab === 'gradesheet' || typeof window !== 'undefined') && (
            <div className={`space-y-4 ${activeTab !== 'gradesheet' ? 'hidden print:block' : 'block'}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>كشف نتائج التسميع والحضور القرآني</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono font-bold">
                  تاريخ الجلسة: {session.date}
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-12 text-center">الدور</th>
                      <th className="p-3">اسم الطالب</th>
                      <th className="p-3">الحضور</th>
                      <th className="p-3">السورة والمقطع</th>
                      <th className="p-3 text-center">الدرجة (من 20)</th>
                      <th className="p-3 text-center">التقدير</th>
                      <th className="p-3">توجيه المحفظ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {session.students.map((student) => {
                      const ev = student.evaluation;
                      return (
                        <tr key={student.studentId} className="hover:bg-slate-50/50">
                          <td className="p-3 text-center font-mono font-bold text-slate-500">
                            {student.turnOrder}
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{student.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{student.registrationNumber} • جزء {student.currentJuz}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                student.attendance === 'present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : student.attendance === 'late'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {student.attendance === 'present'
                                ? 'حاضر'
                                : student.attendance === 'late'
                                ? 'متأخر'
                                : student.attendance === 'excused'
                                ? 'معذور'
                                : 'غائب'}
                            </span>
                          </td>
                          <td className="p-3">
                            {ev ? (
                              <div>
                                <span className="font-bold text-slate-800 block">
                                  سورة {ev.surahName}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  الآيات {ev.ayahFrom} - {ev.ayahTo}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium">لم يُسمّع</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-sm text-slate-900">
                            {ev ? formatScoreOutOf20(ev.scoreOutOf20 ?? (ev.score ? ev.score / 5 : 20)) : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {ev ? (
                              <span
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${
                                  ev.grade === 'ممتاز'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ev.grade === 'جيد جداً'
                                    ? 'bg-teal-100 text-teal-800'
                                    : ev.grade === 'جيد'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {ev.grade}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="p-3 text-slate-600 text-[11px] max-w-xs truncate">
                            {ev?.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Official Mosque Signature Stamp (visible on print) */}
              <div className="hidden print:flex items-center justify-between pt-8 border-t border-slate-300 text-xs text-slate-800">
                <div>
                  <span className="font-bold block">إمضاء محفظ الحلقة:</span>
                  <p className="mt-8 font-black font-amiri text-sm">{session.teacherName}</p>
                </div>

                <div className="text-center">
                  <span className="font-bold block">ختم إدارة المدرسة القرآنية:</span>
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-[10px] text-slate-400 mt-2 mx-auto">
                    ختم المسجد
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAST SESSIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>أرشيف الجلسات السابقة لحلقة: {session.circleName}</span>
                </h4>
                {circleHistory && (
                  <span className="text-[11px] font-bold text-slate-500">
                    معدل حضور الحلقة التاريخي: {circleHistory.averageAttendanceRate}%
                  </span>
                )}
              </div>

              {archivedSessions.filter((s) => s.circleId === session.circleId).length > 0 ? (
                <div className="space-y-2.5">
                  {archivedSessions
                    .filter((s) => s.circleId === session.circleId)
                    .map((pastSession) => {
                      const pastAnalytics = calculateSessionAnalytics(pastSession);
                      const isCurrent = pastSession.id === session.id;

                      return (
                        <div
                          key={pastSession.id}
                          className={`p-4 rounded-2xl border text-right transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-slate-900">
                                {pastSession.date}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                                  الجلسة الحالية
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-bold">
                                • {pastSession.hallName}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                              <span>
                                الحضور: <strong>{pastAnalytics.attendanceRate}%</strong>
                              </span>
                              <span>•</span>
                              <span>
                                التسميع: <strong>{pastAnalytics.completionRate}%</strong>
                              </span>
                              <span>•</span>
                              <span>
                                معدل الحلقة: <strong>{formatScoreOutOf20(pastAnalytics.averageScoreOutOf20)}</strong>
                              </span>
                            </div>
                          </div>

                          {!isCurrent && onSelectPastSession && (
                            <button
                              onClick={() => onSelectPastSession(pastSession)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                            >
                              عرض تقريرها
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Calendar className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="font-bold text-xs">لا توجد جلسات سابقة مؤرشفة لهذه الحلقة حتى الآن.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionReportModal;

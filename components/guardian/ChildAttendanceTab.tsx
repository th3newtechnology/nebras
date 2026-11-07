import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  ShieldAlert,
  MessageSquare,
  Plus,
} from 'lucide-react';
import {
  ChildAttendanceLogEntry,
  AbsenceExcuseItem,
  GuardianChildOverview,
} from '../../types/guardianPortal.types';
import { submitAbsenceExcuse } from '../../lib/guardianService';
import { useNotifications } from '../../context/NotificationContext';

interface ChildAttendanceTabProps {
  overview: GuardianChildOverview;
  attendanceLog?: ChildAttendanceLogEntry[];
  excuses?: AbsenceExcuseItem[];
  guardianId: string;
  onRefresh: () => void;
}

export const ChildAttendanceTab: React.FC<ChildAttendanceTabProps> = ({
  overview,
  attendanceLog = [],
  excuses = [],
  guardianId,
  onRefresh,
}) => {
  const { addNotification } = useNotifications();
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
  const [absenceDate, setAbsenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [absenceReason, setAbsenceReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceReason.trim()) return;

    setSubmitting(true);
    try {
      await submitAbsenceExcuse({
        studentId: overview.studentId,
        guardianId,
        absenceDate,
        reason: absenceReason.trim(),
      });

      addNotification(
        'تم تقديم العذر',
        `تم إرسال تبرير الغياب لشيخ حلقة ${overview.circleName} بنجاح.`,
        'success'
      );
      setIsExcuseModalOpen(false);
      setAbsenceReason('');
      onRefresh();
    } catch (err: any) {
      addNotification('خطأ', err.message || 'تعذر إرسال عذر الغياب', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-900 block">نسبة المواظبة</span>
          <span className="text-2xl font-black font-mono text-emerald-950 mt-1 block">
            {overview.attendanceRate}%
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            مواظبة ممتازة
          </span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-700 block">جلسات الحضور</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
            {overview.presentSessions}
          </span>
          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
            جلسة مكتملة
          </span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
          <span className="text-[11px] font-bold text-amber-900 block">مرات التأخر</span>
          <span className="text-2xl font-black font-mono text-amber-950 mt-1 block">
            1
          </span>
          <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
            أقل من 15 دقيقة
          </span>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
          <span className="text-[11px] font-bold text-rose-900 block">مرات الغياب</span>
          <span className="text-2xl font-black font-mono text-rose-950 mt-1 block">
            {overview.absentSessions}
          </span>
          <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
            {overview.absentSessions === 0 ? 'انعدام تام للغياب' : 'جلسات غير مبررة'}
          </span>
        </div>
      </div>

      {/* Excuse Submission CTA */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>تقديم عذر غياب رسمي للشيخ المحفظ</span>
          </h4>
          <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
            في حال تعذر حضور الابن لحلقته بمسجد إبراهيم الخليل لظرف طارئ أو صحي، يرجى تقديم العذر مسبقاً.
          </p>
        </div>

        <button
          onClick={() => setIsExcuseModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>تقديم عذر غياب</span>
        </button>
      </div>

      {/* Submitted Excuses History */}
      {excuses.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>الأعذار والتبريرات المقدمة:</span>
          </h4>

          <div className="space-y-2.5">
            {excuses.map((excuse) => (
              <div
                key={excuse.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">تاريخ الغياب: {excuse.absenceDate}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        excuse.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : excuse.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {excuse.status === 'accepted'
                        ? '✓ معذور ومقبول'
                        : excuse.status === 'rejected'
                        ? 'مرفوض'
                        : '⏳ قيد المراجعة'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {excuse.submittedAt.split('T')[0]}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">
                  <strong>السبب:</strong> {excuse.reason}
                </p>

                {excuse.teacherResponse && (
                  <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
                    <strong>رد الشيخ:</strong> "{excuse.teacherResponse}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attendance Log */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-600" />
          <span>سجل الجلسات الأخيرة وكشف الحضور الميداني:</span>
        </h4>

        <div className="space-y-2">
          {attendanceLog.map((log, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 font-mono">{log.date}</span>
                <span className="text-slate-500 font-bold">يوم {log.dayName}</span>
                {log.notes && (
                  <span className="text-slate-400 hidden sm:inline">• {log.notes}</span>
                )}
              </div>

              <div>
                {log.status === 'present' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ✓ حاضر
                  </span>
                ) : log.status === 'late' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    متأخر
                  </span>
                ) : log.status === 'excused' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    معذور
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    غائب
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Absence Excuse Modal */}
      {isExcuseModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsExcuseModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black font-amiri text-slate-900">
                تقديم عذر غياب للطالب: {overview.fullName}
              </h3>
              <button
                onClick={() => setIsExcuseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExcuse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الغياب:
                </label>
                <input
                  type="date"
                  value={absenceDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب وتبرير الغياب:
                </label>
                <textarea
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="يرجى ذكر سبب الغياب باختصار (مثال: موعد طبي، ظرف عائلي، سفر...)"
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExcuseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={submitting || !absenceReason.trim()}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'جاري الإرسال...' : 'إرسال العذر للشيخ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

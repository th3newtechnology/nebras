import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Clock,
  Calendar,
  DoorOpen,
  UserCheck,
  Ban,
  RefreshCw,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  TimetableSession,
  ScheduleExceptionType,
  CreateScheduleExceptionDTO,
} from '../../types/circle.types';
import { createScheduleException } from '../../lib/timetableService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface ScheduleExceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  session: TimetableSession | null;
  teachers?: { id: string; name: string }[];
  halls?: { id: string; name: string }[];
}

export const ScheduleExceptionModal: React.FC<ScheduleExceptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  session,
  teachers = [],
  halls = [],
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [exceptionType, setExceptionType] = useState<ScheduleExceptionType>('cancelled');
  const [exceptionDate, setExceptionDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [reason, setReason] = useState('');
  const [substituteTeacherId, setSubstituteTeacherId] = useState('');
  const [newHallId, setNewHallId] = useState('');
  const [newStartTime, setNewStartTime] = useState('17:00');
  const [newEndTime, setNewEndTime] = useState('18:30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('يرجى كتابة سبب التعديل أو الإلغاء لتوثيقه في السجل الرقابي');
      return;
    }

    if (exceptionType === 'rescheduled' && newStartTime >= newEndTime) {
      setError('يجب أن يكون وقت النهاية بعد وقت البداية');
      return;
    }

    if (exceptionType === 'substitute_teacher' && !substituteTeacherId) {
      setError('يرجى اختيار المحفظ البديل');
      return;
    }

    if (exceptionType === 'room_change' && !newHallId) {
      setError('يرجى اختيار القاعة البديلة');
      return;
    }

    setLoading(true);

    try {
      const authorName = user?.displayName || 'إدارة مدرسة نبراس';
      const dto: CreateScheduleExceptionDTO = {
        scheduleId: session.id,
        circleId: session.circleId,
        exceptionDate,
        exceptionType,
        reason: reason.trim(),
        substituteTeacherId: exceptionType === 'substitute_teacher' ? substituteTeacherId : undefined,
        newHallId: exceptionType === 'room_change' ? newHallId : undefined,
        newStartTime: exceptionType === 'rescheduled' ? newStartTime : undefined,
        newEndTime: exceptionType === 'rescheduled' ? newEndTime : undefined,
      };

      const res = await createScheduleException(dto, authorName);
      if (!res.success) {
        setError(res.error || 'تعذر تسجيل الاستثناء');
        setLoading(false);
        return;
      }

      addNotification(
        'تم تسجيل تعديل الحصة',
        `تم تسجيل استثناء (${
          exceptionType === 'cancelled'
            ? 'إلغاء'
            : exceptionType === 'rescheduled'
            ? 'تعديل موعد'
            : exceptionType === 'substitute_teacher'
            ? 'معلم بديل'
            : 'نقل قاعة'
        }) لحلقة "${session.circleName}" بنجاح.`,
        'warning'
      );

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white flex items-center justify-between border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-amiri text-amber-200">
                تسجيل استثناء أو تعديل حصة
              </h3>
              <p className="text-[11px] text-slate-300">
                توثيق التغييرات الطارئة مع اسم المستخدم والسبب في السجل الرقابي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Session Summary Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span className="font-amiri text-sm font-black text-islamic-900">
              {session.circleName}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono">
              يوم {session.dayName} ({session.startTime} - {session.endTime})
            </span>
          </div>
          <div className="text-slate-500 flex items-center gap-4 text-[11px]">
            <span>المحفظ: {session.teacherName}</span>
            <span>القاعة: {session.hallName || 'بدون قاعة'}</span>
            <span>الطلاب: {session.enrolledStudentsCount} طالب</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Exception Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">نوع الإجراء الطارئ</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setExceptionType('cancelled')}
                className={`p-3 rounded-2xl border text-right font-bold transition-all flex items-center gap-2 ${
                  exceptionType === 'cancelled'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <div className="leading-tight">إلغاء الحصة</div>
                  <div className="text-[10px] text-slate-500 font-normal">تعطيل أو إجازة رسمية</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExceptionType('rescheduled')}
                className={`p-3 rounded-2xl border text-right font-bold transition-all flex items-center gap-2 ${
                  exceptionType === 'rescheduled'
                    ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="leading-tight">تغيير التوقيت</div>
                  <div className="text-[10px] text-slate-500 font-normal">تأخير أو تقديم استثنائي</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExceptionType('substitute_teacher')}
                className={`p-3 rounded-2xl border text-right font-bold transition-all flex items-center gap-2 ${
                  exceptionType === 'substitute_teacher'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <div className="leading-tight">محفظ منتدب</div>
                  <div className="text-[10px] text-slate-500 font-normal">نيابة عن المحفظ الأصلي</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExceptionType('room_change')}
                className={`p-3 rounded-2xl border text-right font-bold transition-all flex items-center gap-2 ${
                  exceptionType === 'room_change'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <DoorOpen className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <div className="leading-tight">نقل القاعة</div>
                  <div className="text-[10px] text-slate-500 font-normal">نقل لموقع آخر بالمسجد</div>
                </div>
              </button>
            </div>
          </div>

          {/* Exception Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>تاريخ الحصة المعنية</span>
            </label>
            <input
              type="date"
              value={exceptionDate}
              onChange={(e) => setExceptionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-islamic-800"
              required
            />
          </div>

          {/* Dynamic options depending on exception type */}
          {exceptionType === 'rescheduled' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">وقت البدء الجديد</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">وقت النهاية الجديد</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                  required
                />
              </div>
            </div>
          )}

          {exceptionType === 'substitute_teacher' && (
            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">المحفظ البديل المنتدب</label>
              <select
                value={substituteTeacherId}
                onChange={(e) => setSubstituteTeacherId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                required
              >
                <option value="">-- اختر المحفظ البديل --</option>
                {teachers
                  .filter((t) => t.id !== session.teacherId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {exceptionType === 'room_change' && (
            <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">القاعة البديلة بالمسجد</label>
              <select
                value={newHallId}
                onChange={(e) => setNewHallId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                required
              >
                <option value="">-- اختر القاعة البديلة --</option>
                {halls
                  .filter((h) => h.id !== session.hallId)
                  .map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>سبب التعديل أو الإلغاء (إلزامي للتدقيق والرقابة)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: ظرف صحي طارئ للمحفظ / صيانة مكيفات القاعة / عطلة رسمية..."
              rows={3}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-islamic-800"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التسجيل...</span>
                </>
              ) : (
                <span>حفظ التعديل في السجل</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

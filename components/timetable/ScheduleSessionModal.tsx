import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  BookOpen,
  DoorOpen,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  CircleItem,
  TimetableSession,
  CreateScheduleDTO,
} from '../../types/circle.types';
import {
  addScheduleSession,
  checkScheduleConflict,
} from '../../lib/timetableService';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  circles: CircleItem[];
  existingSessions: TimetableSession[];
}

const DAYS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  circles,
  existingSessions,
}) => {
  const [circleId, setCircleId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState('16:30');
  const [endTime, setEndTime] = useState('18:00');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (circles.length > 0 && !circleId) {
      setCircleId(circles[0].id);
    }
    setError(null);
  }, [circles, isOpen]);

  if (!isOpen) return null;

  const selectedCircle = circles.find(c => c.id === circleId);

  // Client-side conflict pre-check
  const conflictCheck = selectedCircle
    ? checkScheduleConflict(existingSessions, {
        circleId,
        teacherId: selectedCircle.teacherId,
        hallId: selectedCircle.hallId,
        dayOfWeek,
        startTime,
        endTime,
      })
    : { hasConflict: false };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!circleId) {
      setError('يرجى اختيار الحلقة القرآنية');
      return;
    }
    if (startTime >= endTime) {
      setError('يجب أن يكون وقت نهاية الحصة بعد وقت البداية');
      return;
    }

    if (conflictCheck.hasConflict) {
      setError(conflictCheck.message || 'يوجد تعارض في الموعد المحدد للقاعة أو المعلم');
      return;
    }

    setLoading(true);

    try {
      const dto: CreateScheduleDTO = {
        circleId,
        dayOfWeek,
        startTime,
        endTime,
      };

      const res = await addScheduleSession(dto);
      if (!res.success) {
        setError(res.error || 'فشل إضافة الحصة إلى الجدول');
        setLoading(false);
        return;
      }

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
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">جدولة حصة أسبوعية جديدة</h3>
              <p className="text-xs text-slate-300">
                إضافة موعد تحفيظ إلى الجدول مع الفحص التلقائي لتعارض القاعات والمعلمين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-bold">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {conflictCheck.hasConflict && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{conflictCheck.message}</span>
            </div>
          )}

          {/* Select Circle */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">الحلقة القرآنية *</label>
            <select
              required
              value={circleId}
              onChange={e => setCircleId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
            >
              {circles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level}) — المحفظ: {c.teacherName} — القاعة: {c.hallName || 'غير مسندة'}
                </option>
              ))}
            </select>
          </div>

          {/* Circle preview metadata */}
          {selectedCircle && (
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-islamic-800" />
                <span>المعلم: <strong>{selectedCircle.teacherName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-gold-600" />
                <span>القاعة: <strong>{selectedCircle.hallName || 'غير محددة'}</strong></span>
              </div>
            </div>
          )}

          {/* Day of Week */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">يوم الحصة الأسبوعي *</label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {DAYS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDayOfWeek(d.value)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    dayOfWeek === d.value
                      ? 'bg-islamic-800 text-gold-300 border-islamic-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">وقت البداية *</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">وقت النهاية *</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Quick presets for prayers */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider block">
              فترات نموذجية مقترحة:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStartTime('06:00');
                  setEndTime('07:30');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px]"
              >
                الفترة الصباحية (بعد الفجر: 06:00 - 07:30)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('16:30');
                  setEndTime('18:00');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px]"
              >
                فترة العصر (16:30 - 18:00)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime('17:30');
                  setEndTime('19:30');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px]"
              >
                بين المغرب والعشاء (17:30 - 19:30)
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || conflictCheck.hasConflict}
              className="px-6 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 font-black"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>تثبيت الحصة بالجدول</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

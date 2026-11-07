import React, { useState } from 'react';
import {
  X,
  Target,
  Calendar,
  BookOpen,
  FileText,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  StudentGoalType,
  CreateStudentGoalDTO,
} from '../../types/studentFollowup.types';
import { createStudentGoal } from '../../lib/studentFollowupService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: string;
  studentName: string;
  circleId?: string | null;
  teacherId?: string;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  studentName,
  circleId,
  teacherId = 'c0000000-0000-0000-0000-000000000001',
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [goalType, setGoalType] = useState<StudentGoalType>('weekly_hifz');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSurah, setTargetSurah] = useState<number | ''>('');
  const [targetSurahName, setTargetSurahName] = useState('');
  const [targetAyahFrom, setTargetAyahFrom] = useState<number | ''>('');
  const [targetAyahTo, setTargetAyahTo] = useState<number | ''>('');
  const [targetDate, setTargetDate] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  });
  const [teacherNotes, setTeacherNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('يرجى إدخال عنوان الهدف القرآني');
      return;
    }

    setLoading(true);

    try {
      const dto: CreateStudentGoalDTO = {
        studentId,
        teacherId: user?.id || teacherId,
        circleId: circleId || undefined,
        goalType,
        title: title.trim(),
        description: description.trim() || undefined,
        targetSurah: targetSurah !== '' ? Number(targetSurah) : undefined,
        targetSurahName: targetSurahName.trim() || undefined,
        targetAyahFrom: targetAyahFrom !== '' ? Number(targetAyahFrom) : undefined,
        targetAyahTo: targetAyahTo !== '' ? Number(targetAyahTo) : undefined,
        targetDate,
        teacherNotes: teacherNotes.trim() || undefined,
      };

      const res = await createStudentGoal(dto);
      if (!res.success) {
        setError(res.error || 'فشل حفظ الهدف');
        setLoading(false);
        return;
      }

      addNotification(
        'تم تحديد الهدف القرآني',
        `تمت إضافة المستهدف للطالب "${studentName}" بنجاح.`,
        'success'
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
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-amiri text-gold-200">
                تحديد هدف قرآني جديد
              </h3>
              <p className="text-[11px] text-slate-300">
                للطالب: <span className="font-bold text-white">{studentName}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold">
              {error}
            </div>
          )}

          {/* Goal Type Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">نوع الهدف القرآني</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'weekly_hifz' as const, label: 'حفظ جديد', desc: 'مقرر الأسبوع' },
                { type: 'weekly_revision' as const, label: 'مراجعة وتثبيت', desc: 'تثبيت المحفوظ' },
                { type: 'juz_completion' as const, label: 'إتمام جزء', desc: 'سرد جزء كامل' },
                { type: 'tajweed_mastery' as const, label: 'إتقان التجويد', desc: 'أحكام ورش' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setGoalType(item.type)}
                  className={`p-2.5 rounded-2xl border text-right transition-all font-bold ${
                    goalType === item.type
                      ? 'border-islamic-800 bg-islamic-50 text-islamic-900 ring-2 ring-islamic-800/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div>{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">عنوان الهدف</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حفظ سورة النور من الآية 1 إلى 26"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
              required
            />
          </div>

          {/* Surah & Ayah Range */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">اسم السورة</label>
              <input
                type="text"
                value={targetSurahName}
                onChange={(e) => setTargetSurahName(e.target.value)}
                placeholder="النور"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">من آية</label>
              <input
                type="number"
                value={targetAyahFrom}
                onChange={(e) =>
                  setTargetAyahFrom(e.target.value === '' ? '' : parseInt(e.target.value))
                }
                placeholder="1"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">إلى آية</label>
              <input
                type="number"
                value={targetAyahTo}
                onChange={(e) =>
                  setTargetAyahTo(e.target.value === '' ? '' : parseInt(e.target.value))
                }
                placeholder="26"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold font-mono"
              />
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>تاريخ الإنجاز المستهدف</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
              required
            />
          </div>

          {/* Description & Notes */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">
              توجيهات المحفظ والملاحظات التربوية
            </label>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="مثال: التركيز على أحكام ترقيق الراء وتثبيت الأرباع..."
              rows={2}
              className="w-full p-3 rounded-xl border border-slate-200 font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-islamic-800 hover:bg-islamic-900 text-white font-bold transition-all flex items-center gap-2 shadow-md shadow-islamic-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>تثبيت الهدف في السجل</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

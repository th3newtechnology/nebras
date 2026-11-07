import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  CreateEvaluationDTO,
  EvaluationType,
} from '../../types/pedagogical.types';
import { createEvaluation } from '../../lib/pedagogicalService';
import { CircleItem, TeacherItem } from '../../types/circle.types';
import { fetchCircleStudents } from '../../lib/circlesService';

interface EvaluationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  circles: CircleItem[];
  teachers: TeacherItem[];
}

const EVALUATION_TYPES: Array<{ value: EvaluationType; label: string }> = [
  { value: 'memorization', label: 'اختبار الحفظ والضبط القرآني' },
  { value: 'revision', label: 'اختبار تثبيت المراجعة والأجزاء' },
  { value: 'tajweed', label: 'اختبار أحكام التجويد ومخارج الحروف' },
  { value: 'behavior', label: 'تقييم السلوك والانضباط القرآني' },
];

export const EvaluationFormModal: React.FC<EvaluationFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  circles,
  teachers,
}) => {
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [circleStudents, setCircleStudents] = useState<Array<{ studentId: string; fullName: string }>>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [evaluationType, setEvaluationType] = useState<EvaluationType>('memorization');
  const [score, setScore] = useState<number>(90);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [appreciation, setAppreciation] = useState<string>('ممتاز');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (circles.length > 0 && !selectedCircleId) {
      setSelectedCircleId(circles[0].id);
      setSelectedTeacherId(circles[0].teacherId || (teachers[0]?.id || ''));
    }
  }, [circles, teachers, isOpen]);

  useEffect(() => {
    if (selectedCircleId) {
      fetchCircleStudents(selectedCircleId).then(list => {
        setCircleStudents(list.map(s => ({ studentId: s.studentId, fullName: s.fullName })));
        if (list.length > 0) {
          setSelectedStudentId(list[0].studentId);
        }
      });
      const c = circles.find(cir => cir.id === selectedCircleId);
      if (c && c.teacherId) {
        setSelectedTeacherId(c.teacherId);
      }
    }
  }, [selectedCircleId, circles]);

  // Auto-set appreciation based on score
  useEffect(() => {
    const pct = (score / (maxScore || 100)) * 100;
    if (pct >= 90) setAppreciation('ممتاز');
    else if (pct >= 80) setAppreciation('جيد جداً');
    else if (pct >= 65) setAppreciation('جيد');
    else if (pct >= 50) setAppreciation('مقبول');
    else setAppreciation('ضعيف - يحتاج إعادة');
  }, [score, maxScore]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudentId) {
      setError('يرجى اختيار الطالب');
      return;
    }
    if (!selectedTeacherId) {
      setError('يرجى اختيار المحفظ المشرف');
      return;
    }
    if (score < 0 || score > maxScore) {
      setError(`الدرجة يجب أن تكون بين 0 و ${maxScore}`);
      return;
    }

    setLoading(true);

    try {
      const dto: CreateEvaluationDTO = {
        studentId: selectedStudentId,
        teacherId: selectedTeacherId,
        circleId: selectedCircleId || null,
        date,
        evaluationType,
        score,
        maxScore,
        appreciation,
        notes: notes.trim() || undefined,
      };

      const res = await createEvaluation(dto);
      if (!res.success) {
        setError(res.error || 'فشل حفظ التقييم');
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
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">
                رصد اختبار / تقييم دوري
              </h3>
              <p className="text-xs text-slate-300">
                توثيق نتائج الاختبارات الدورية في الحفظ والتجويد والسلوك
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

          {/* Circle & Student */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">الحلقة القرآنية *</label>
              <select
                value={selectedCircleId}
                onChange={e => setSelectedCircleId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                {circles.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">اسم الطالب *</label>
              <select
                required
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold font-amiri text-sm"
              >
                {circleStudents.map(s => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Teacher & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">المحفظ الممتحن *</label>
              <select
                required
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">تاريخ الاختبار *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Evaluation Type */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">نوع التقييم / الاختبار *</label>
            <select
              value={evaluationType}
              onChange={e => setEvaluationType(e.target.value as EvaluationType)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
            >
              {EVALUATION_TYPES.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Score & Appreciation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">العلامة المحصلة *</label>
              <input
                type="number"
                min={0}
                max={maxScore}
                step="0.5"
                required
                value={score}
                onChange={e => setScore(parseFloat(e.target.value) || 0)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-base focus:bg-white focus:ring-2 focus:ring-islamic-800 font-black text-islamic-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">الدرجة القصوى</label>
              <input
                type="number"
                min={1}
                max={500}
                value={maxScore}
                onChange={e => setMaxScore(parseInt(e.target.value) || 100)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-base focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">التقدير الإجمالي</label>
              <input
                type="text"
                readOnly
                value={appreciation}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-center text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">ملاحظات لجنة الاختبار / المحفظ</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: تفوق ملحوظ في سورتي مريم وطه، بحاجة لتكثيف مراجعة سورة الكهف..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
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
              disabled={loading}
              className="px-6 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 font-black"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>اعتماد النتيجة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

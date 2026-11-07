import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Award,
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  Star,
  FileText,
} from 'lucide-react';
import { TeacherStudentItem } from '../../types/teacherPortal.types';
import { logQuickRecitation } from '../../lib/teacherPortalService';
import { QURAN_SURAHS } from '../../lib/quranMetadata';

interface QuickRecitationModalProps {
  isOpen: boolean;
  students: TeacherStudentItem[];
  preselectedStudentId?: string;
  onClose: () => void;
  onSuccess: (studentName: string) => void;
}

export const QuickRecitationModal: React.FC<QuickRecitationModalProps> = ({
  isOpen,
  students,
  preselectedStudentId,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [studentId, setStudentId] = useState(
    preselectedStudentId || (students.length > 0 ? students[0].id : '')
  );
  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [ayahFrom, setAyahFrom] = useState<number>(1);
  const [ayahTo, setAyahTo] = useState<number>(7);
  const [recordType, setRecordType] = useState<'new_memorization' | 'minor_review' | 'major_review'>('new_memorization');
  const [grade, setGrade] = useState<'ممتاز' | 'جيد جداً' | 'جيد' | 'يحتاج مراجعة'>('ممتاز');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [tajweedMistakesCount, setTajweedMistakesCount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSurah = QURAN_SURAHS.find((s) => s.number === surahNumber) || QURAN_SURAHS[0];

  const handleSurahChange = (num: number) => {
    setSurahNumber(num);
    const s = QURAN_SURAHS.find((item) => item.number === num);
    setAyahFrom(1);
    setAyahTo(s ? Math.min(20, s.ayahsCount) : 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const student = students.find((s) => s.id === studentId);
    if (!student) {
      setError('يرجى اختيار الطالب.');
      return;
    }

    if (ayahFrom > ayahTo) {
      setError('رقم الآية الأولى يجب أن يكون أصغر أو يساوي رقم الآية الأخيرة.');
      return;
    }

    setLoading(true);
    try {
      await logQuickRecitation({
        studentId,
        circleId: student.circleId,
        surahNumber,
        surahName: selectedSurah.name,
        ayahFrom,
        ayahTo,
        recordType,
        grade,
        mistakesCount,
        tajweedMistakesCount,
        notes: notes.trim() || undefined,
      });

      onSuccess(student.fullName);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'تعذر تسجيل التسميع. يرجى إعادة المحاولة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md text-gold-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black font-amiri tracking-wide">
                محطة التسميع القرآني السريع
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                رصد الحفظ والمراجعة وأحكام التجويد في جلسة الحلقة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">الطالب المسمّع *</label>
            <div className="relative">
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.registrationNumber}) — {s.circleName}
                  </option>
                ))}
              </select>
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Recitation Type */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">نوع التسميع *</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'new_memorization', label: 'حفظ جديد' },
                { type: 'minor_review', label: 'مراجعة صغرى' },
                { type: 'major_review', label: 'مراجعة كبرى' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setRecordType(item.type as any)}
                  className={`p-3 rounded-2xl border text-center text-xs font-black transition-all ${
                    recordType === item.type
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surah and Ayahs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">السورة الكريمة *</label>
              <select
                value={surahNumber}
                onChange={(e) => handleSurahChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-bold text-slate-800"
              >
                {QURAN_SURAHS.map((surah) => (
                  <option key={surah.number} value={surah.number}>
                    {surah.number}. {surah.name} ({surah.ayahsCount} آية)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">من الآية</label>
              <input
                type="number"
                min="1"
                max={selectedSurah.ayahsCount}
                value={ayahFrom}
                onChange={(e) => setAyahFrom(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">إلى الآية</label>
              <input
                type="number"
                min={ayahFrom}
                max={selectedSurah.ayahsCount}
                value={ayahTo}
                onChange={(e) => setAyahTo(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Evaluation Grade */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">التقدير والإتقان *</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { g: 'ممتاز', color: 'emerald' },
                { g: 'جيد جداً', color: 'teal' },
                { g: 'جيد', color: 'amber' },
                { g: 'يحتاج مراجعة', color: 'rose' },
              ].map((item) => (
                <button
                  key={item.g}
                  type="button"
                  onClick={() => setGrade(item.g as any)}
                  className={`p-2.5 rounded-xl border text-center text-xs font-black transition-all ${
                    grade === item.g
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.g}
                </button>
              ))}
            </div>
          </div>

          {/* Mistakes Counters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-black text-slate-500 mb-1">
                عثرات الحفظ (اللحن الجلي)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMistakesCount(Math.max(0, mistakesCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-black text-slate-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={mistakesCount}
                  onChange={(e) => setMistakesCount(Number(e.target.value))}
                  className="w-full text-center py-1 font-mono font-black text-sm bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMistakesCount(mistakesCount + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-black text-slate-600"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-[11px] font-black text-slate-500 mb-1">
                ملاحظات التجويد (اللحن الخفي)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTajweedMistakesCount(Math.max(0, tajweedMistakesCount - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-black text-slate-600"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={tajweedMistakesCount}
                  onChange={(e) => setTajweedMistakesCount(Number(e.target.value))}
                  className="w-full text-center py-1 font-mono font-black text-sm bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTajweedMistakesCount(tajweedMistakesCount + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-black text-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">ملاحظات الشيخ المحفظ</label>
            <input
              type="text"
              placeholder="مثال: إتقان مميز لأحكام المد العارض للسكون..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs text-slate-800"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-black text-xs hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-2xl font-black text-xs shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الرصد...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-gold-300" />
                  <span>اعتماد التسميع</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

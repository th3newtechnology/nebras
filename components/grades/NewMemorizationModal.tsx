import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  User,
  Calendar,
  Award,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import {
  CreateMemorizationDTO,
  MemorizationRecordType,
  MemorizationGrade,
} from '../../types/pedagogical.types';
import { QURAN_SURAHS, SurahMetadata } from '../../lib/quranMetadata';
import { createMemorizationRecord } from '../../lib/pedagogicalService';
import { CircleItem, TeacherItem } from '../../types/circle.types';
import { fetchCircleStudents } from '../../lib/circlesService';

interface NewMemorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  circles: CircleItem[];
  teachers: TeacherItem[];
}

const RECORD_TYPES: Array<{ value: MemorizationRecordType; label: string }> = [
  { value: 'new_memorization', label: 'حفظ جديد (تسميع أول مرة)' },
  { value: 'minor_review', label: 'مراجعة صغرى (تثبيت المحفوظ الأخير)' },
  { value: 'major_review', label: 'مراجعة كبرى (أجزاء سابقة)' },
];

const GRADES: MemorizationGrade[] = ['ممتاز', 'جيد جداً', 'جيد', 'يحتاج مراجعة'];

export const NewMemorizationModal: React.FC<NewMemorizationModalProps> = ({
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

  const [recordType, setRecordType] = useState<MemorizationRecordType>('new_memorization');
  const [surahNumber, setSurahNumber] = useState<number>(78); // عم
  const [ayahFrom, setAyahFrom] = useState<number>(1);
  const [ayahTo, setAyahTo] = useState<number>(20);
  const [grade, setGrade] = useState<MemorizationGrade>('ممتاز');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [tajweedMistakesCount, setTajweedMistakesCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize circle & teacher
  useEffect(() => {
    if (circles.length > 0 && !selectedCircleId) {
      setSelectedCircleId(circles[0].id);
      setSelectedTeacherId(circles[0].teacherId || (teachers[0]?.id || ''));
    }
  }, [circles, teachers, isOpen]);

  // Load students for circle
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

  // Current selected surah metadata
  const currentSurah = QURAN_SURAHS.find(s => s.number === surahNumber) || QURAN_SURAHS[0];

  // Adjust ayah range when surah changes
  const handleSurahChange = (num: number) => {
    setSurahNumber(num);
    const s = QURAN_SURAHS.find(sur => sur.number === num);
    if (s) {
      setAyahFrom(1);
      setAyahTo(Math.min(20, s.ayahsCount));
    }
  };

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
    if (ayahFrom <= 0 || ayahTo < ayahFrom || ayahTo > currentSurah.ayahsCount) {
      setError(`نطاق الآيات غير صحيح. سورة ${currentSurah.name} تحوي ${currentSurah.ayahsCount} آية.`);
      return;
    }

    setLoading(true);

    try {
      const dto: CreateMemorizationDTO = {
        studentId: selectedStudentId,
        teacherId: selectedTeacherId,
        circleId: selectedCircleId || null,
        date,
        recordType,
        juz: currentSurah.startJuz,
        surahNumber: currentSurah.number,
        surahName: currentSurah.name,
        ayahFrom,
        ayahTo,
        grade,
        mistakesCount,
        tajweedMistakesCount,
        notes: notes.trim() || undefined,
      };

      const res = await createMemorizationRecord(dto);
      if (!res.success) {
        setError(res.error || 'فشل تسجيل حصة التسميع');
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
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">
                تسجيل حصة تسميع / مراجعة قرآنية
              </h3>
              <p className="text-xs text-slate-300">
                توثيق محفوظات الطالب بدقة السورة والآيات ودرجة الإتقان التجويدي
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

          {/* Circle & Student Selection */}
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
                    {c.name} ({c.level})
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
                {circleStudents.length === 0 ? (
                  <option value="">لا يوجد طلاب مقيدون بهذه الحلقة</option>
                ) : (
                  circleStudents.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Teacher & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">المحفظ المسؤول *</label>
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
              <label className="text-slate-700 block">تاريخ التسميع *</label>
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

          {/* Record Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">نوع السجل القرآني *</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {RECORD_TYPES.map(rt => (
                <button
                  key={rt.value}
                  type="button"
                  onClick={() => setRecordType(rt.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                    recordType === rt.value
                      ? 'bg-islamic-800 text-gold-300 border-islamic-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Surah & Ayah Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-slate-700 block">السورة القرآنية *</label>
              <select
                value={surahNumber}
                onChange={e => handleSurahChange(parseInt(e.target.value))}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                {QURAN_SURAHS.map(s => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.name} ({s.ayahsCount} آية) — جـ{s.startJuz}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">من الآية *</label>
              <input
                type="number"
                min={1}
                max={currentSurah.ayahsCount}
                value={ayahFrom}
                onChange={e => setAyahFrom(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-islamic-800 text-center"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">إلى الآية *</label>
              <input
                type="number"
                min={ayahFrom}
                max={currentSurah.ayahsCount}
                value={ayahTo}
                onChange={e => setAyahTo(parseInt(e.target.value) || currentSurah.ayahsCount)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-islamic-800 text-center"
              />
            </div>
          </div>

          {/* Grade & Mistakes Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">درجة الإتقان *</label>
              <select
                value={grade}
                onChange={e => setGrade(e.target.value as MemorizationGrade)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                {GRADES.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">أخطاء الحفظ والتوقف</label>
              <input
                type="number"
                min={0}
                max={50}
                value={mistakesCount}
                onChange={e => setMistakesCount(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">أخطاء التجويد والرسم</label>
              <input
                type="number"
                min={0}
                max={50}
                value={tajweedMistakesCount}
                onChange={e => setTajweedMistakesCount(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">ملاحظات المحفظ والتوجيهات</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: إتقان رائع، تنبيه لموضع الإقلاب في آية 12..."
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
              <span>حفظ سجل التسميع</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

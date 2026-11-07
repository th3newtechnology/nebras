import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Volume2,
  Calendar,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { StudentDailyWird } from '../../types/studentPortal.types';

interface DailyWirdCardProps {
  wird: StudentDailyWird;
  onToggleSection: (sectionType: 'new' | 'minor' | 'major') => void;
  onOpenMushafForSurah: (surahNumber: number) => void;
}

export const DailyWirdCard: React.FC<DailyWirdCardProps> = ({
  wird,
  onToggleSection,
  onOpenMushafForSurah,
}) => {
  const isAllCompleted =
    wird.newMemorization.isCompleted &&
    wird.minorReview.isCompleted &&
    wird.majorReview.isCompleted;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-black font-amiri text-slate-900">
              ورد اليوم القرآني المقرّر
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{wird.date}</span>
            </span>
            {isAllCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white animate-bounce shadow-xs">
                ✨ اكتمل ورد اليوم بارك الله فيك!
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            مقرر التحفيظ والمراجعة المسند من الشيخ المحفظ برواية ورش عن نافع
          </p>
        </div>

        <button
          onClick={() => onOpenMushafForSurah(wird.newMemorization.surahNumber)}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-black transition-colors flex items-center gap-2 border border-emerald-200 shrink-0 self-start sm:self-center shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>فتح المصحف برواية ورش</span>
        </button>
      </div>

      {/* 3 Wird Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. New Memorization */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
            wird.newMemorization.isCompleted
              ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
              : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                ١. الحفظ الجديد
              </span>
              <span className="text-xs font-mono text-slate-400">الجزء {wird.newMemorization.juzNumber}</span>
            </div>

            <div>
              <h3 className="text-base font-black font-amiri text-slate-900">
                {wird.newMemorization.surahName}
              </h3>
              <p className="text-xs font-black text-emerald-800 font-mono mt-0.5">
                الآيات: {wird.newMemorization.fromAyah} إلى {wird.newMemorization.toAyah}
              </p>
            </div>

            {wird.newMemorization.warshNote && (
              <p className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                <strong>توجيه ورش:</strong> {wird.newMemorization.warshNote}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <button
              onClick={() => onOpenMushafForSurah(wird.newMemorization.surahNumber)}
              className="text-xs font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors"
            >
              <span>قراءة الآيات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleSection('new')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                wird.newMemorization.isCompleted
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {wird.newMemorization.isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم الإنجاز ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>تأكيد الحفظ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Minor Review */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
            wird.minorReview.isCompleted
              ? 'bg-teal-50/70 border-teal-300 ring-1 ring-teal-400'
              : 'bg-slate-50 border-slate-200 hover:border-teal-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-full">
                ٢. المراجعة الصغرى (القريبة)
              </span>
              <span className="text-xs font-mono text-slate-400">الجزء {wird.minorReview.juzNumber}</span>
            </div>

            <div>
              <h3 className="text-base font-black font-amiri text-slate-900">
                {wird.minorReview.surahName}
              </h3>
              <p className="text-xs font-black text-teal-800 font-mono mt-0.5">
                الآيات: {wird.minorReview.fromAyah} إلى {wird.minorReview.toAyah}
              </p>
            </div>

            {wird.minorReview.warshNote && (
              <p className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                <strong>توجيه ورش:</strong> {wird.minorReview.warshNote}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <button
              onClick={() => onOpenMushafForSurah(wird.minorReview.surahNumber)}
              className="text-xs font-bold text-slate-500 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              <span>قراءة الآيات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onToggleSection('minor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                wird.minorReview.isCompleted
                  ? 'bg-teal-700 text-white hover:bg-teal-800'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {wird.minorReview.isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تمت المراجعة ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>تأكيد المراجعة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Major Review */}
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
            wird.majorReview.isCompleted
              ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400'
              : 'bg-slate-50 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                ٣. المراجعة الكبرى (التثبيت البعيد)
              </span>
              <span className="text-xs font-mono font-bold text-amber-800">جزء كامل</span>
            </div>

            <div>
              <h3 className="text-base font-black font-amiri text-slate-900">
                الجزء {wird.majorReview.juzNumber}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {wird.majorReview.juzName}
              </p>
            </div>

            <p className="text-[11px] text-slate-500 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
              تلاوة الجزء غيباً أو من المصحف لتثبيت المحفوظ وعدم التفلت قبل لقاء الشيخ بالحلقة.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-end">
            <button
              onClick={() => onToggleSection('major')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                wird.majorReview.isCompleted
                  ? 'bg-amber-700 text-white hover:bg-amber-800'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {wird.majorReview.isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم التثبيت ✓</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" />
                  <span>تأكيد التثبيت</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Teacher's Note of the Day */}
      {wird.teacherNotes && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 rounded-2xl border border-emerald-200/70 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block mb-0.5">
              توجيه الشيخ المحفظ لورد اليوم:
            </span>
            <p className="text-slate-700 font-medium leading-relaxed">
              "{wird.teacherNotes}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

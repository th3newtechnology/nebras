import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Crown,
  ChevronLeft,
} from 'lucide-react';
import { StudentJuzMapItem } from '../../types/studentPortal.types';
import { getSurahsByJuz } from '../../lib/quranMetadata';

interface StudentJuzMapProps {
  juzMap: StudentJuzMapItem[];
  currentJuz: number;
  onOpenMushafForSurah: (surahNumber: number) => void;
}

export const StudentJuzMap: React.FC<StudentJuzMapProps> = ({
  juzMap,
  currentJuz,
  onOpenMushafForSurah,
}) => {
  const [selectedJuz, setSelectedJuz] = useState<StudentJuzMapItem | null>(null);

  const selectedSurahs = selectedJuz ? getSurahsByJuz(selectedJuz.juzNumber) : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-black font-amiri text-slate-900">
              خريطة الأجزاء الثلاثين نحو الختمة المباركة
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gold-100 text-gold-900">
              {currentJuz - 1} من 30 جزءاً منجزاً 🏆
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            تابع رحلتك القرآنية الشريفة واجمع شارات الإتقان لكل جزء برواية ورش عن نافع
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="flex items-center gap-1 text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>متقن</span>
          </span>
          <span className="flex items-center gap-1 text-amber-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>جاري</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
            <span>متبقٍ</span>
          </span>
        </div>
      </div>

      {/* 30 Juz Visual Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2.5">
        {juzMap.map((juz) => {
          const isCompleted = juz.status === 'completed';
          const isCurrent = juz.status === 'in_progress';
          const isSelected = selectedJuz?.juzNumber === juz.juzNumber;

          return (
            <button
              key={juz.juzNumber}
              onClick={() => setSelectedJuz(juz)}
              className={`p-3 rounded-2xl border text-center transition-all cursor-pointer transform hover:scale-105 active:scale-95 flex flex-col items-center justify-between gap-1 h-24 ${
                isSelected
                  ? 'ring-2 ring-emerald-500 shadow-md'
                  : ''
              } ${
                isCompleted
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-800 shadow-xs'
                  : isCurrent
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400 font-black animate-pulse'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[10px]">
                {isCompleted ? (
                  <Crown className="w-3.5 h-3.5 text-gold-300" />
                ) : isCurrent ? (
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-300" />
                )}
                <span className="font-mono text-[9px] opacity-80">#{juz.juzNumber}</span>
              </div>

              <div className="font-mono font-black text-lg">{juz.juzNumber}</div>

              <div className="text-[9px] font-bold">
                {isCompleted ? '✓ تم' : isCurrent ? 'جاري' : 'متبقٍ'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Juz Detail Card */}
      {selectedJuz && (
        <div className="p-5 bg-gradient-to-r from-emerald-50/70 via-teal-50/60 to-slate-50 rounded-2xl border border-emerald-200/90 space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black font-mono text-xl border ${
                  selectedJuz.status === 'completed'
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : selectedJuz.status === 'in_progress'
                    ? 'bg-amber-200 text-amber-950 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {selectedJuz.juzNumber}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-amiri text-slate-900">
                    الجزء {selectedJuz.juzNumber}: {selectedJuz.juzName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      selectedJuz.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedJuz.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedJuz.status === 'completed'
                      ? '✓ متقن ومحفوظ'
                      : selectedJuz.status === 'in_progress'
                      ? '⏳ قيد الحفظ والتثبيت'
                      : 'مرحلة مستقبلية'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  السور القرآنية المبتدئة في هذا الجزء برواية ورش عن نافع
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedJuz(null)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 self-end sm:self-center"
            >
              إغلاق التفاصيل
            </button>
          </div>

          {/* Surahs in this Juz */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {selectedSurahs.map((surah) => (
              <div
                key={surah.number}
                className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center text-[10px]">
                    {surah.number}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block">{surah.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {surah.ayahsCount} آية
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenMushafForSurah(surah.number)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black transition-colors flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>تلاوة</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

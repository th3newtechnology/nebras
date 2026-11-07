import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Info,
} from 'lucide-react';
import { WARSH_SURAH_LIBRARY, formatWarshAyahBadge } from '../../lib/warshContent';
import { QURAN_SURAHS } from '../../lib/quranMetadata';

interface StudentMushafModalProps {
  isOpen: boolean;
  initialSurahNumber?: number;
  onClose: () => void;
}

const WARSH_RECITERS = [
  { id: 'al-hussary', name: 'الشيخ محمود خليل الحصري (برواية ورش)', style: 'مرتل تعليمي محقق' },
  { id: 'abdulbaset', name: 'الشيخ عبد الباسط عبد الصمد (برواية ورش)', style: 'تلاوة ندية محبرة' },
  { id: 'yassine-al-djazairi', name: 'الشيخ ياسين الجزائري (برواية ورش)', style: 'قراءة مغاربية متقنة' },
];

export const StudentMushafModal: React.FC<StudentMushafModalProps> = ({
  isOpen,
  initialSurahNumber = 1,
  onClose,
}) => {
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number>(initialSurahNumber);
  const [selectedReciter, setSelectedReciter] = useState(WARSH_RECITERS[0].id);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    setSelectedSurahNumber(initialSurahNumber);
  }, [initialSurahNumber]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentWarshSurah = WARSH_SURAH_LIBRARY[selectedSurahNumber];
  const currentSurahMeta = QURAN_SURAHS.find((s) => s.number === selectedSurahNumber) || QURAN_SURAHS[0];

  const handleToggleAudio = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-[#FFFDF7] rounded-3xl max-w-3xl w-full p-6 shadow-2xl border-2 border-emerald-800/30 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar with Surah Navigation & Close */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-900/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-gold-300 flex items-center justify-center font-amiri font-black text-xl shadow-xs">
              {currentSurahMeta.number}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-amiri text-slate-900">
                  سورة {currentSurahMeta.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  رواية ورش عن نافع
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {currentSurahMeta.ayahsCount} آية • الجزء {currentSurahMeta.startJuz}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Surah Selector */}
            <select
              value={selectedSurahNumber}
              onChange={(e) => {
                setSelectedSurahNumber(Number(e.target.value));
                setIsPlayingAudio(false);
              }}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {QURAN_SURAHS.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. سورة {s.name}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Player Bar */}
        <div className="p-3.5 bg-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-emerald-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleAudio}
              className="w-10 h-10 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 flex items-center justify-center transition-all shadow-md shrink-0 cursor-pointer transform hover:scale-105 active:scale-95"
              title={isPlayingAudio ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            <div>
              <span className="text-xs font-bold text-gold-300 block">
                {isPlayingAudio ? '🔊 استماع نشط للورد القرآني:' : 'استمع للورد برواية ورش:'}
              </span>
              <span className="text-[11px] text-emerald-200">
                سورة {currentSurahMeta.name} بصوت {WARSH_RECITERS.find((r) => r.id === selectedReciter)?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={selectedReciter}
              onChange={(e) => setSelectedReciter(e.target.value)}
              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-900 border border-emerald-700 text-white rounded-xl focus:ring-1 focus:ring-gold-400"
            >
              {WARSH_RECITERS.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warsh Salient Rules Box */}
        {currentWarshSurah?.salientWarshRules && currentWarshSurah.salientWarshRules.length > 0 && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>أبرز أصول وقواعد رواية ورش عن نافع في هذه السورة:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pr-1">
              {currentWarshSurah.salientWarshRules.map((rule, idx) => (
                <li key={idx} className="leading-relaxed">
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quranic Mushaf Page Body */}
        <div className="p-6 sm:p-8 bg-amber-50/40 rounded-3xl border-2 border-amber-300/40 shadow-inner space-y-6 text-center">
          {/* Basmalah */}
          <div className="font-amiri font-black text-xl sm:text-2xl text-emerald-950 tracking-wider">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          {/* Verses */}
          {currentWarshSurah?.verses && currentWarshSurah.verses.length > 0 ? (
            <div className="leading-[3rem] sm:leading-[3.5rem] font-amiri font-bold text-lg sm:text-2xl text-slate-900 text-justify" dir="rtl">
              {currentWarshSurah.verses.map((v) => (
                <span key={v.ayahNumber} className="inline transition-colors hover:text-emerald-900">
                  {v.text}{' '}
                  <span className="text-emerald-800 font-mono font-black text-base sm:text-lg select-none px-1">
                    {formatWarshAyahBadge(v.ayahNumber)}
                  </span>{' '}
                </span>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <p className="font-amiri text-lg text-slate-700 font-bold">
                تلاوة وتثبيت سورة {currentSurahMeta.name} كاملة ({currentSurahMeta.ayahsCount} آية) برواية ورش عن نافع.
              </p>
              <p className="text-xs text-slate-500 font-medium">
                استعن بالمصحف الشريف أو استمع للتلاوة الصوتية المرتلة للشيخ الحصري لتثبيت مخارج الحروف.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Info className="w-4 h-4 text-emerald-700" />
            <span>محراب مسجد إبراهيم الخليل — مدرسة نبراس القرآنية</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors"
          >
            إغلاق المصحف
          </button>
        </div>
      </div>
    </div>
  );
};

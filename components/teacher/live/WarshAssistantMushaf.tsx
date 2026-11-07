import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  Sliders,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bookmark,
} from 'lucide-react';
import { QURAN_SURAHS, getSurahByNumber, getSurahNavigation } from '../../../lib/quranMetadata';
import {
  getWarshVersesForSurah,
  formatWarshAyahBadge,
  WARSH_PRIMARY_RULES,
} from '../../../lib/warshContent';

interface WarshAssistantMushafProps {
  surahNumber: number;
  fromAyah: number;
  toAyah: number;
  onSelectSurah: (surahNumber: number) => void;
  onSelectRange: (fromAyah: number, toAyah: number) => void;
  studentName?: string;
  isCompact?: boolean;
}

export const WarshAssistantMushaf: React.FC<WarshAssistantMushafProps> = ({
  surahNumber,
  fromAyah,
  toAyah,
  onSelectSurah,
  onSelectRange,
  studentName,
  isCompact = false,
}) => {
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(2); // 1: sm, 2: md, 3: lg, 4: xl
  const [showWarshRules, setShowWarshRules] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  // Active Surah metadata
  const currentSurah = useMemo(() => {
    return getSurahByNumber(surahNumber) || QURAN_SURAHS[0];
  }, [surahNumber]);

  // Navigation
  const navigation = useMemo(() => {
    return getSurahNavigation(currentSurah.number);
  }, [currentSurah.number]);

  // Content for the active Surah
  const surahContent = useMemo(() => {
    return getWarshVersesForSurah(
      currentSurah.number,
      currentSurah.name,
      fromAyah,
      toAyah,
      currentSurah.ayahsCount
    );
  }, [currentSurah, fromAyah, toAyah]);

  // Search filtered surahs
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return QURAN_SURAHS;
    const q = searchQuery.trim().toLowerCase();
    return QURAN_SURAHS.filter(
      (s) =>
        s.name.includes(q) ||
        s.number.toString().includes(q) ||
        `جزء ${s.startJuz}`.includes(q)
    );
  }, [searchQuery]);

  // Font size classes
  const fontSizes = [
    'text-base leading-relaxed',
    'text-lg leading-loose',
    'text-xl leading-[2.4rem]',
    'text-2xl leading-[2.8rem]',
  ];

  // Quick preset shortcuts
  const handleSelectFullSurah = () => {
    onSelectRange(1, currentSurah.ayahsCount);
  };

  const handleSelectNextQuarter = () => {
    const nextFrom = Math.min(toAyah + 1, currentSurah.ayahsCount);
    const nextTo = Math.min(nextFrom + 9, currentSurah.ayahsCount);
    onSelectRange(nextFrom, nextTo);
  };

  const handleSelectAyahClick = (clickedAyah: number) => {
    // If clicking outside range, expand or jump
    if (clickedAyah < fromAyah) {
      onSelectRange(clickedAyah, toAyah);
    } else if (clickedAyah > toAyah) {
      onSelectRange(fromAyah, clickedAyah);
    } else {
      // Toggle to set as single ayah if double clicked or focused
      onSelectRange(clickedAyah, Math.min(clickedAyah + 5, currentSurah.ayahsCount));
    }
  };

  return (
    <div
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* =================================================================== */}
      {/* 1. MUSHAF TOP TOOLBAR: SURAH PICKER + NAV + FONT CONTROLS */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-emerald-800">
        {/* Right: Surah Selector & Details */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowSearchDropdown(!showSearchDropdown)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-black transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-gold-300" />
              <span>
                سورة {currentSurah.name} ({currentSurah.number})
              </span>
              <span className="text-[10px] text-emerald-200 font-mono">▼</span>
            </button>

            {/* Surah Dropdown Modal / Popover */}
            {showSearchDropdown && (
              <div className="absolute top-full right-0 mt-2 w-72 max-h-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الرقم..."
                    className="w-full bg-transparent text-xs font-bold outline-none"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto max-h-64 p-1">
                  {filteredSurahs.map((s) => (
                    <button
                      key={s.number}
                      onClick={() => {
                        onSelectSurah(s.number);
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        s.number === currentSurah.number
                          ? 'bg-emerald-700 text-white font-black'
                          : 'hover:bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-mono text-[11px] opacity-70">
                          {s.number}
                        </span>
                        <span>{s.name}</span>
                      </div>
                      <span className="text-[10px] opacity-80 font-mono">
                        جزء {s.startJuz} • {s.ayahsCount} آية
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Prev / Next Surah */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigation.prev && onSelectSurah(navigation.prev.number)}
              disabled={!navigation.prev}
              title={navigation.prev ? `السورة السابقة: ${navigation.prev.name}` : 'لا توجد سورة سابقة'}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigation.next && onSelectSurah(navigation.next.number)}
              disabled={!navigation.next}
              title={navigation.next ? `السورة التالية: ${navigation.next.name}` : 'لا توجد سورة تالية'}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Badges: Type & Juz */}
          <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30 font-bold">
              {surahContent.type}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/20 font-mono">
              الجزء {currentSurah.startJuz}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/20 font-mono">
              {currentSurah.ayahsCount} آية
            </span>
          </div>
        </div>

        {/* Left: Font Zoom & Warsh Rules Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
            disabled={fontSizeLevel === 0}
            title="تصغير الخط"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5 text-slate-200" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-300 w-4 text-center">
            {fontSizeLevel + 1}
          </span>
          <button
            onClick={() => setFontSizeLevel((prev) => Math.min(fontSizes.length - 1, prev + 1))}
            disabled={fontSizeLevel === fontSizes.length - 1}
            title="تكبير الخط"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5 text-slate-200" />
          </button>

          <button
            onClick={() => setShowWarshRules(!showWarshRules)}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
              showWarshRules
                ? 'bg-gold-500 text-slate-950 border-gold-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-gold-300 border-gold-400/30'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">أحكام ورش</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. RECITATION SCOPE HIGHLIGHT BAR */}
      {/* =================================================================== */}
      <div className="bg-emerald-50/70 border-b border-emerald-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-bold text-emerald-950">المقرر المرصود:</span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-black font-mono">
            الآيات {fromAyah} إلى {toAyah}
          </span>
          {studentName && (
            <span className="text-slate-500 text-[11px] font-medium hidden md:inline">
              (للطالب: <span className="font-bold text-slate-800">{studentName}</span>)
            </span>
          )}
        </div>

        {/* Fast range presets */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSelectFullSurah}
            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-[10px] transition-colors"
          >
            كامل السورة (1-{currentSurah.ayahsCount})
          </button>
          <button
            onClick={handleSelectNextQuarter}
            className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-[10px] transition-colors"
          >
            المقطع الموالي (+10)
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. WARSH RULES ACCORDION / DRAWER (COLLAPSIBLE) */}
      {/* =================================================================== */}
      {showWarshRules && (
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/80 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>أبرز أصول وقواعد رواية ورش عن نافع في سورة {currentSurah.name}:</span>
            </h5>
            <button
              onClick={() => setShowWarshRules(false)}
              className="text-[10px] font-bold text-amber-700 hover:underline"
            >
              إخفاء
            </button>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-amber-900 font-medium">
            {surahContent.salientRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-1.5 bg-white/70 p-2 rounded-xl border border-amber-200">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MAIN MUSHAF DISPLAY: SURAH BANNER + BASMALAH + VERSES */}
      {/* =================================================================== */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-ivory-50/40 text-slate-900 space-y-6">
        {/* Traditional Islamic Surah Banner Header */}
        <div className="relative text-center py-4 px-6 bg-gradient-to-r from-emerald-50 via-gold-50/50 to-emerald-50 rounded-3xl border-2 border-gold-300/80 shadow-xs max-w-lg mx-auto">
          <div className="text-[11px] font-bold text-emerald-800 tracking-wider">
            رواية ورش عن نافع من طريق الأزرق
          </div>
          <h2 className="text-2xl md:text-3xl font-black font-amiri text-emerald-950 my-1">
            سُورَةُ {currentSurah.name}
          </h2>
          <div className="text-[11px] text-slate-500 font-mono font-bold flex items-center justify-center gap-2">
            <span>{surahContent.type}</span>
            <span>•</span>
            <span>آياتها {currentSurah.ayahsCount}</span>
            <span>•</span>
            <span>ترتيب نزولها {surahContent.revelationOrder}</span>
          </div>
        </div>

        {/* Basmalah (shown for all except Surat At-Tawbah 9) */}
        {currentSurah.number !== 9 && (
          <div className="text-center py-2">
            <p className="font-amiri text-xl md:text-2xl text-emerald-900 font-bold tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Quranic Verses Container */}
        <div
          className={`font-amiri ${fontSizes[fontSizeLevel]} text-justify tracking-wide leading-loose select-text p-4 md:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-inner`}
        >
          {surahContent.verses.map((v) => {
            const isInRange = v.ayahNumber >= fromAyah && v.ayahNumber <= toAyah;
            const isStart = v.ayahNumber === fromAyah;
            const isEnd = v.ayahNumber === toAyah;

            return (
              <span
                key={v.ayahNumber}
                onClick={() => handleSelectAyahClick(v.ayahNumber)}
                className={`inline transition-all cursor-pointer rounded-lg px-1.5 py-0.5 ${
                  isInRange
                    ? 'bg-emerald-100/90 text-emerald-950 font-bold border-b-2 border-emerald-500 shadow-xs'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
                title={`الآية ${v.ayahNumber} - انقر لتحديد النطاق`}
              >
                {/* Visual marker if start of recitation block */}
                {isStart && (
                  <span className="inline-block px-1 py-0.2 mx-1 text-[9px] font-sans font-black bg-emerald-700 text-white rounded-md align-middle">
                    بداية المقطع
                  </span>
                )}

                {/* The Ayah Text */}
                <span>{v.text}</span>

                {/* The Ayah Badge */}
                <span
                  className={`inline-block mx-1 font-bold ${
                    isInRange ? 'text-emerald-700 font-black' : 'text-gold-600'
                  }`}
                >
                  {formatWarshAyahBadge(v.ayahNumber)}
                </span>

                {/* Visual marker if end of recitation block */}
                {isEnd && (
                  <span className="inline-block px-1 py-0.2 mx-1 text-[9px] font-sans font-black bg-gold-600 text-white rounded-md align-middle">
                    نهاية المقطع
                  </span>
                )}

                {/* Inline Warsh Tip if any */}
                {v.warshRuleNote && (
                  <span
                    className="inline-block mx-1 align-middle text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300"
                    title={v.warshRuleNote}
                  >
                    ورش: {v.warshRuleNote}
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Footer info: Mosque verification stamp */}
        <div className="pt-2 text-center text-[10px] text-slate-400 font-medium">
          مصحف المحفظ المساعد • مدرسة نبراس القرآن بمسجد إبراهيم الخليل • رواية ورش عن نافع
        </div>
      </div>
    </div>
  );
};

export default WarshAssistantMushaf;

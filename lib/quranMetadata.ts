/**
 * بيانات السور القرآنية الـ 114 المعتمدة لمدرسة نبراس القرآنية
 * تستخدم للتحقق الصارم من أسماء السور ونطاقات الآيات وأرقام الأجزاء
 */

export interface SurahMetadata {
  number: number;
  name: string;
  ayahsCount: number;
  startJuz: number;
}

export const QURAN_SURAHS: SurahMetadata[] = [
  { number: 1, name: 'الفاتحة', ayahsCount: 7, startJuz: 1 },
  { number: 2, name: 'البقرة', ayahsCount: 286, startJuz: 1 },
  { number: 3, name: 'آل عمران', ayahsCount: 200, startJuz: 3 },
  { number: 4, name: 'النساء', ayahsCount: 176, startJuz: 4 },
  { number: 5, name: 'المائدة', ayahsCount: 120, startJuz: 6 },
  { number: 6, name: 'الأنعام', ayahsCount: 165, startJuz: 7 },
  { number: 7, name: 'الأعراف', ayahsCount: 206, startJuz: 8 },
  { number: 8, name: 'الأنفال', ayahsCount: 75, startJuz: 9 },
  { number: 9, name: 'التوبة', ayahsCount: 129, startJuz: 10 },
  { number: 10, name: 'يونس', ayahsCount: 109, startJuz: 11 },
  { number: 11, name: 'هود', ayahsCount: 123, startJuz: 11 },
  { number: 12, name: 'يوسف', ayahsCount: 111, startJuz: 12 },
  { number: 13, name: 'الرعد', ayahsCount: 43, startJuz: 13 },
  { number: 14, name: 'إبراهيم', ayahsCount: 52, startJuz: 13 },
  { number: 15, name: 'الحجر', ayahsCount: 99, startJuz: 14 },
  { number: 16, name: 'النحل', ayahsCount: 128, startJuz: 14 },
  { number: 17, name: 'الإسراء', ayahsCount: 111, startJuz: 15 },
  { number: 18, name: 'الكهف', ayahsCount: 110, startJuz: 15 },
  { number: 19, name: 'مريم', ayahsCount: 98, startJuz: 16 },
  { number: 20, name: 'طه', ayahsCount: 135, startJuz: 16 },
  { number: 21, name: 'الأنبياء', ayahsCount: 112, startJuz: 17 },
  { number: 22, name: 'الحج', ayahsCount: 78, startJuz: 17 },
  { number: 23, name: 'المؤمنون', ayahsCount: 118, startJuz: 18 },
  { number: 24, name: 'النور', ayahsCount: 64, startJuz: 18 },
  { number: 25, name: 'الفرقان', ayahsCount: 77, startJuz: 18 },
  { number: 26, name: 'الشعراء', ayahsCount: 227, startJuz: 19 },
  { number: 27, name: 'النمل', ayahsCount: 93, startJuz: 19 },
  { number: 28, name: 'القصص', ayahsCount: 88, startJuz: 20 },
  { number: 29, name: 'العنكبوت', ayahsCount: 69, startJuz: 20 },
  { number: 30, name: 'الروم', ayahsCount: 60, startJuz: 21 },
  { number: 31, name: 'لقمان', ayahsCount: 34, startJuz: 21 },
  { number: 32, name: 'السجدة', ayahsCount: 30, startJuz: 21 },
  { number: 33, name: 'الأحزاب', ayahsCount: 73, startJuz: 21 },
  { number: 34, name: 'سبأ', ayahsCount: 54, startJuz: 22 },
  { number: 35, name: 'فاطر', ayahsCount: 45, startJuz: 22 },
  { number: 36, name: 'يس', ayahsCount: 83, startJuz: 22 },
  { number: 37, name: 'الصافات', ayahsCount: 182, startJuz: 23 },
  { number: 38, name: 'ص', ayahsCount: 88, startJuz: 23 },
  { number: 39, name: 'الزمر', ayahsCount: 75, startJuz: 23 },
  { number: 40, name: 'غافر', ayahsCount: 85, startJuz: 24 },
  { number: 41, name: 'فصلت', ayahsCount: 54, startJuz: 24 },
  { number: 42, name: 'الشورى', ayahsCount: 53, startJuz: 25 },
  { number: 43, name: 'الزخرف', ayahsCount: 89, startJuz: 25 },
  { number: 44, name: 'الدخان', ayahsCount: 59, startJuz: 25 },
  { number: 45, name: 'الجاثية', ayahsCount: 37, startJuz: 25 },
  { number: 46, name: 'الأحقاف', ayahsCount: 35, startJuz: 26 },
  { number: 47, name: 'محمد', ayahsCount: 38, startJuz: 26 },
  { number: 48, name: 'الفتح', ayahsCount: 29, startJuz: 26 },
  { number: 49, name: 'الحجرات', ayahsCount: 18, startJuz: 26 },
  { number: 50, name: 'ق', ayahsCount: 45, startJuz: 26 },
  { number: 51, name: 'الذاريات', ayahsCount: 60, startJuz: 26 },
  { number: 52, name: 'الطور', ayahsCount: 49, startJuz: 27 },
  { number: 53, name: 'النجم', ayahsCount: 62, startJuz: 27 },
  { number: 54, name: 'القمر', ayahsCount: 55, startJuz: 27 },
  { number: 55, name: 'الرحمن', ayahsCount: 78, startJuz: 27 },
  { number: 56, name: 'الواقعة', ayahsCount: 96, startJuz: 27 },
  { number: 57, name: 'الحديد', ayahsCount: 29, startJuz: 27 },
  { number: 58, name: 'المجادلة', ayahsCount: 22, startJuz: 28 },
  { number: 59, name: 'الحشر', ayahsCount: 24, startJuz: 28 },
  { number: 60, name: 'الممتحنة', ayahsCount: 13, startJuz: 28 },
  { number: 61, name: 'الصف', ayahsCount: 14, startJuz: 28 },
  { number: 62, name: 'الجمعة', ayahsCount: 11, startJuz: 28 },
  { number: 63, name: 'المنافقون', ayahsCount: 11, startJuz: 28 },
  { number: 64, name: 'التغابن', ayahsCount: 18, startJuz: 28 },
  { number: 65, name: 'الطلاق', ayahsCount: 12, startJuz: 28 },
  { number: 66, name: 'التحريم', ayahsCount: 12, startJuz: 28 },
  { number: 67, name: 'الملك', ayahsCount: 30, startJuz: 29 },
  { number: 68, name: 'القلم', ayahsCount: 52, startJuz: 29 },
  { number: 69, name: 'الحاقة', ayahsCount: 52, startJuz: 29 },
  { number: 70, name: 'المعارج', ayahsCount: 44, startJuz: 29 },
  { number: 71, name: 'نوح', ayahsCount: 28, startJuz: 29 },
  { number: 72, name: 'الجن', ayahsCount: 28, startJuz: 29 },
  { number: 73, name: 'المزمل', ayahsCount: 20, startJuz: 29 },
  { number: 74, name: 'المدثر', ayahsCount: 56, startJuz: 29 },
  { number: 75, name: 'القيامة', ayahsCount: 40, startJuz: 29 },
  { number: 76, name: 'الإنسان', ayahsCount: 31, startJuz: 29 },
  { number: 77, name: 'المرسلات', ayahsCount: 50, startJuz: 29 },
  { number: 78, name: 'النبأ', ayahsCount: 40, startJuz: 30 },
  { number: 79, name: 'النازعات', ayahsCount: 46, startJuz: 30 },
  { number: 80, name: 'عبس', ayahsCount: 42, startJuz: 30 },
  { number: 81, name: 'التكوير', ayahsCount: 29, startJuz: 30 },
  { number: 82, name: 'الانفطار', ayahsCount: 19, startJuz: 30 },
  { number: 83, name: 'المطففين', ayahsCount: 36, startJuz: 30 },
  { number: 84, name: 'الانشقاق', ayahsCount: 25, startJuz: 30 },
  { number: 85, name: 'البروج', ayahsCount: 22, startJuz: 30 },
  { number: 86, name: 'الطارق', ayahsCount: 17, startJuz: 30 },
  { number: 87, name: 'الأعلى', ayahsCount: 19, startJuz: 30 },
  { number: 88, name: 'الغاشية', ayahsCount: 26, startJuz: 30 },
  { number: 89, name: 'الفجر', ayahsCount: 30, startJuz: 30 },
  { number: 90, name: 'البلد', ayahsCount: 20, startJuz: 30 },
  { number: 91, name: 'الشمس', ayahsCount: 15, startJuz: 30 },
  { number: 92, name: 'الليل', ayahsCount: 21, startJuz: 30 },
  { number: 93, name: 'الضحى', ayahsCount: 11, startJuz: 30 },
  { number: 94, name: 'الشرح', ayahsCount: 8, startJuz: 30 },
  { number: 95, name: 'التين', ayahsCount: 8, startJuz: 30 },
  { number: 96, name: 'العلق', ayahsCount: 19, startJuz: 30 },
  { number: 97, name: 'القدر', ayahsCount: 5, startJuz: 30 },
  { number: 98, name: 'البينة', ayahsCount: 8, startJuz: 30 },
  { number: 99, name: 'الزلزلة', ayahsCount: 8, startJuz: 30 },
  { number: 100, name: 'العاديات', ayahsCount: 11, startJuz: 30 },
  { number: 101, name: 'القارعة', ayahsCount: 11, startJuz: 30 },
  { number: 102, name: 'التكاثر', ayahsCount: 8, startJuz: 30 },
  { number: 103, name: 'العصر', ayahsCount: 3, startJuz: 30 },
  { number: 104, name: 'الهمزة', ayahsCount: 9, startJuz: 30 },
  { number: 105, name: 'الفيل', ayahsCount: 5, startJuz: 30 },
  { number: 106, name: 'قريش', ayahsCount: 4, startJuz: 30 },
  { number: 107, name: 'الماعون', ayahsCount: 7, startJuz: 30 },
  { number: 108, name: 'الكوثر', ayahsCount: 3, startJuz: 30 },
  { number: 109, name: 'الكافرون', ayahsCount: 6, startJuz: 30 },
  { number: 110, name: 'النصر', ayahsCount: 3, startJuz: 30 },
  { number: 111, name: 'المسد', ayahsCount: 5, startJuz: 30 },
  { number: 112, name: 'الإخلاص', ayahsCount: 4, startJuz: 30 },
  { number: 113, name: 'الفلق', ayahsCount: 5, startJuz: 30 },
  { number: 114, name: 'الناس', ayahsCount: 6, startJuz: 30 },
];

/**
 * جلب سورة برقمها من 1 إلى 114
 */
export function getSurahByNumber(num: number): SurahMetadata | undefined {
  if (num < 1 || num > 114) return undefined;
  return QURAN_SURAHS[num - 1];
}

/**
 * جلب سورة باسمها مع تطبيع بسيط للنصوص العربية
 */
export function getSurahByName(name: string): SurahMetadata | undefined {
  if (!name) return undefined;
  const clean = name.trim().replace(/^سورة\s+/, '').replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه');
  return QURAN_SURAHS.find((s) => {
    const sClean = s.name.replace(/[أإآ]/g, 'ا').replace(/ة$/g, 'ه');
    return s.name === name.trim() || sClean === clean;
  });
}

/**
 * جلب قائمة السور التي تبدأ في جزء معين (من 1 إلى 30)
 */
export function getSurahsByJuz(juzNumber: number): SurahMetadata[] {
  if (juzNumber < 1 || juzNumber > 30) return [];
  return QURAN_SURAHS.filter((s) => s.startJuz === juzNumber);
}

/**
 * التنقل السريع: جلب السورة السابقة والتالية
 */
export function getSurahNavigation(currentSurahNumber: number): {
  prev: SurahMetadata | null;
  next: SurahMetadata | null;
} {
  return {
    prev: currentSurahNumber > 1 ? QURAN_SURAHS[currentSurahNumber - 2] : null,
    next: currentSurahNumber < 114 ? QURAN_SURAHS[currentSurahNumber] : null,
  };
}

export interface AyahRangeValidationResult {
  isValid: boolean;
  error?: string;
  correctedFrom: number;
  correctedTo: number;
  maxAyahs: number;
  surah: SurahMetadata;
}

/**
 * التحقق الصارم من صحة نطاق الآيات وسقف السورة ومنع تجاوز الحدود
 */
export function validateAyahRange(
  surahNumberOrName: number | string,
  fromAyah: number,
  toAyah: number
): AyahRangeValidationResult {
  const surah =
    typeof surahNumberOrName === 'number'
      ? getSurahByNumber(surahNumberOrName)
      : getSurahByName(surahNumberOrName);

  if (!surah) {
    const fallbackSurah = QURAN_SURAHS[0];
    return {
      isValid: false,
      error: 'السورة المحددة غير موجودة في القرآن الكريم.',
      correctedFrom: 1,
      correctedTo: 7,
      maxAyahs: 7,
      surah: fallbackSurah,
    };
  }

  const maxAyahs = surah.ayahsCount;
  let correctedFrom = Math.max(1, Math.min(fromAyah || 1, maxAyahs));
  let correctedTo = Math.max(1, Math.min(toAyah || maxAyahs, maxAyahs));

  let isValid = true;
  let error: string | undefined = undefined;

  if (fromAyah < 1) {
    isValid = false;
    error = `رقم آية البداية يجب أن يكون 1 أو أكثر.`;
  } else if (fromAyah > maxAyahs) {
    isValid = false;
    error = `عدد آيات سورة ${surah.name} هو ${maxAyahs} آية فقط.`;
    correctedFrom = maxAyahs;
  }

  if (toAyah > maxAyahs) {
    isValid = false;
    error = `تجاوزت سقف السورة (${maxAyahs} آية).`;
    correctedTo = maxAyahs;
  }

  if (correctedTo < correctedFrom) {
    isValid = false;
    error = `آية النهاية (${correctedTo}) لا يمكن أن تكون قبل آية البداية (${correctedFrom}).`;
    correctedTo = correctedFrom;
  }

  return {
    isValid,
    error,
    correctedFrom,
    correctedTo,
    maxAyahs,
    surah,
  };
}

/**
 * اقتراح الورد والتسميع التلقائي الذكي للطالب بناءً على جزءه الحالي
 */
export function getDefaultRecitationForStudent(
  currentJuz: number,
  _hifzLevel?: string
): {
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  maxAyahs: number;
} {
  const safeJuz = Math.max(1, Math.min(currentJuz || 1, 30));
  const surahsInJuz = getSurahsByJuz(safeJuz);
  const targetSurah = surahsInJuz.length > 0 ? surahsInJuz[0] : (safeJuz === 1 ? QURAN_SURAHS[0] : QURAN_SURAHS[1]);

  // Standard recitation block: first 10 ayahs or full surah if small
  const defaultTo = Math.min(targetSurah.ayahsCount, 10);

  return {
    surahNumber: targetSurah.number,
    surahName: targetSurah.name,
    fromAyah: 1,
    toAyah: defaultTo,
    maxAyahs: targetSurah.ayahsCount,
  };
}

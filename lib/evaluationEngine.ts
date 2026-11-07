/**
 * محرك احتساب ورصد درجات التسميع القرآني المباشر
 * مدرسة نبراس القرآنية - مسجد إبراهيم الخليل
 * يفصل بدقة بين اللحن الجلي (عثرات الحفظ) واللحن الخفي (أحكام التجويد ورواية ورش)
 */

import { RecitationGrade } from '../types/liveSession.types';

export interface DetailedMistakesInput {
  // اللحن الجلي (عثرات الحفظ)
  hesitation?: number; // توقف أو تردد
  wordSubstitution?: number; // استبدال كلمة أو حركة إعرابية مخلة
  verseSkip?: number; // إسقاط آية أو جملة
  teacherPrompt?: number; // فتح وتلقين من الشيخ

  // اللحن الخفي (أحكام التجويد ورواية ورش)
  nunMeemSakinah?: number; // أحكام النون والميم الساكنة والتنوين
  maddWarsh?: number; // مدود ورش (المتصل، المنفصل، البدل)
  tarqeeqTaghleez?: number; // ترقيق الراءات وتغليظ اللامات
  taqleel?: number; // التقليل والإمالة الصغرى
  naqlHamz?: number; // نقل حركة الهمز إلى الساكن
  makhrajSifah?: number; // مخارج وصفات الحروف والقلقلة

  // عدادات عامة احتياطية
  generalHifzMistakes?: number;
  generalTajweedMistakes?: number;
}

export interface RecitationScoreResult {
  score: number; // 0 - 100
  scoreOutOf20: number; // 0 - 20 (النظام الجزائري المعتمد)
  totalHifzMistakes: number;
  totalTajweedMistakes: number;
  recommendedGrade: RecitationGrade;
  gradeColor: {
    bg: string;
    text: string;
    border: string;
  };
  deductionsSummary: {
    hifzPointsDeducted: number;
    tajweedPointsDeducted: number;
    totalDeducted: number;
  };
  feedbackMessage: string;
}

/**
 * أوزان الخصم المعتمدة لمدرسة نبراس القرآنية (مسجد إبراهيم الخليل)
 */
export const DEDUCTION_RULES = {
  // اللحن الجلي: عثرات الحفظ
  HIFZ_DEFAULT_DEDUCTION: 3.0, // خصم العداد العام للحفظ
  HESITATION: 2.0, // تردد أو تلعثم
  WORD_SUBSTITUTION: 3.5, // تبديل حرف أو حركة
  VERSE_SKIP: 6.0, // نسيان آية كاملة
  TEACHER_PROMPT: 4.0, // فتح المحفظ وتلقينه للطالب

  // اللحن الخفي: أحكام التجويد ورواية ورش
  TAJWEED_DEFAULT_DEDUCTION: 1.5, // خصم العداد العام للتجويد
  NUN_MEEM_SAKINAH: 1.0, // إدغام، إخفاء، غنة
  MADD_WARSH: 1.5, // مد متصل/منفصل (6 حركات) أو بدل
  TARQEEQ_TAGHLEEZ: 1.5, // راءات ولامات ورش
  TAQLEEL: 1.0, // تقليل ذوات الياء
  NAQL_HAMZ: 1.0, // نقل الهمز المفرد
  MAKHRAJ_SIFAH: 1.0, // قلقلة ومخارج
};

/**
 * كبسولات الرصد السريع لأخطاء الحفظ (اللحن الجلي)
 */
export const HIFZ_MISTAKE_TAGS = [
  { id: 'hesitation', label: 'تردد / توقف', deduction: DEDUCTION_RULES.HESITATION, color: 'rose' },
  { id: 'wordSubstitution', label: 'تغيير حرف/حركة', deduction: DEDUCTION_RULES.WORD_SUBSTITUTION, color: 'rose' },
  { id: 'teacherPrompt', label: 'فتح المحفظ', deduction: DEDUCTION_RULES.TEACHER_PROMPT, color: 'rose' },
  { id: 'verseSkip', label: 'إسقاط آية', deduction: DEDUCTION_RULES.VERSE_SKIP, color: 'rose' },
] as const;

/**
 * كبسولات الرصد السريع لأحكام التجويد ورواية ورش (اللحن الخفي)
 */
export const TAJWEED_MISTAKE_TAGS = [
  { id: 'tarqeeqTaghleez', label: 'ترقيق راء / تغليظ لام', deduction: DEDUCTION_RULES.TARQEEQ_TAGHLEEZ, color: 'amber' },
  { id: 'maddWarsh', label: 'مدود ورش (6 حركات/بدل)', deduction: DEDUCTION_RULES.MADD_WARSH, color: 'amber' },
  { id: 'nunMeemSakinah', label: 'غنة / نون / ميم ساكنة', deduction: DEDUCTION_RULES.NUN_MEEM_SAKINAH, color: 'amber' },
  { id: 'naqlHamz', label: 'نقل الهمز', deduction: DEDUCTION_RULES.NAQL_HAMZ, color: 'amber' },
  { id: 'taqleel', label: 'تقليل / إمالة', deduction: DEDUCTION_RULES.TAQLEEL, color: 'amber' },
  { id: 'makhrajSifah', label: 'قلقلة / مخرج حرف', deduction: DEDUCTION_RULES.MAKHRAJ_SIFAH, color: 'amber' },
] as const;

/**
 * محرك الحساب: حساب الدرجة من 100 ومن 20 وتحديد التقدير المقترح بدقة
 */
export function calculateRecitationScore(input: DetailedMistakesInput): RecitationScoreResult {
  let hifzDeductions = 0;
  let tajweedDeductions = 0;

  let totalHifzCount = 0;
  let totalTajweedCount = 0;

  // 1. حساب تفاصيل اللحن الجلي (الحفظ)
  if (
    input.hesitation ||
    input.wordSubstitution ||
    input.verseSkip ||
    input.teacherPrompt
  ) {
    const hes = input.hesitation || 0;
    const sub = input.wordSubstitution || 0;
    const skip = input.verseSkip || 0;
    const prompt = input.teacherPrompt || 0;

    hifzDeductions =
      hes * DEDUCTION_RULES.HESITATION +
      sub * DEDUCTION_RULES.WORD_SUBSTITUTION +
      skip * DEDUCTION_RULES.VERSE_SKIP +
      prompt * DEDUCTION_RULES.TEACHER_PROMPT;

    totalHifzCount = hes + sub + skip + prompt;
  } else {
    // الاعتماد على العداد العام
    const genHifz = Math.max(0, input.generalHifzMistakes || 0);
    hifzDeductions = genHifz * DEDUCTION_RULES.HIFZ_DEFAULT_DEDUCTION;
    totalHifzCount = genHifz;
  }

  // 2. حساب تفاصيل اللحن الخفي (التجويد)
  if (
    input.nunMeemSakinah ||
    input.maddWarsh ||
    input.tarqeeqTaghleez ||
    input.taqleel ||
    input.naqlHamz ||
    input.makhrajSifah
  ) {
    const nun = input.nunMeemSakinah || 0;
    const madd = input.maddWarsh || 0;
    const tar = input.tarqeeqTaghleez || 0;
    const taq = input.taqleel || 0;
    const naql = input.naqlHamz || 0;
    const makh = input.makhrajSifah || 0;

    tajweedDeductions =
      nun * DEDUCTION_RULES.NUN_MEEM_SAKINAH +
      madd * DEDUCTION_RULES.MADD_WARSH +
      tar * DEDUCTION_RULES.TARQEEQ_TAGHLEEZ +
      taq * DEDUCTION_RULES.TAQLEEL +
      naql * DEDUCTION_RULES.NAQL_HAMZ +
      makh * DEDUCTION_RULES.MAKHRAJ_SIFAH;

    totalTajweedCount = nun + madd + tar + taq + naql + makh;
  } else {
    // الاعتماد على العداد العام
    const genTajweed = Math.max(0, input.generalTajweedMistakes || 0);
    tajweedDeductions = genTajweed * DEDUCTION_RULES.TAJWEED_DEFAULT_DEDUCTION;
    totalTajweedCount = genTajweed;
  }

  const totalDeducted = hifzDeductions + tajweedDeductions;
  const rawScore = Math.max(0, 100 - totalDeducted);
  const score = Math.round(rawScore * 10) / 10;
  const scoreOutOf20 = Math.round((rawScore / 5) * 10) / 10;

  // 3. تحديد التقدير المقترح
  let recommendedGrade: RecitationGrade = 'ممتاز';
  let gradeColor = {
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-700',
  };
  let feedbackMessage = 'تلاوة متقنة وممتازة، بارك الله فيك ونفع بك القرآن.';

  if (score >= 90) {
    recommendedGrade = 'ممتاز';
    gradeColor = { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' };
    feedbackMessage = 'أداء قرآني ممتاز؛ ضبط متقن للحفظ ومخارج وأصول ورش.';
  } else if (score >= 80) {
    recommendedGrade = 'جيد جداً';
    gradeColor = { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700' };
    feedbackMessage = 'حفظ جيد جداً وتلاوة طيبة، ركّز على ضبط دقائق التجويد ومراعاة الوقف.';
  } else if (score >= 70) {
    recommendedGrade = 'جيد';
    gradeColor = { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' };
    feedbackMessage = 'تسميع مقبول ويحتاج إلى تثبيت الحفظ ومراجعة أصول ورش في الراءات والمدود.';
  } else {
    recommendedGrade = 'يحتاج مراجعة';
    gradeColor = { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' };
    feedbackMessage = 'يكثر التوقف أو عثرات الحفظ، يُنصح بإعادة مدارسة المقطع وتكراره قبل الاعتماد.';
  }

  return {
    score,
    scoreOutOf20,
    totalHifzMistakes: totalHifzCount,
    totalTajweedMistakes: totalTajweedCount,
    recommendedGrade,
    gradeColor,
    deductionsSummary: {
      hifzPointsDeducted: Math.round(hifzDeductions * 10) / 10,
      tajweedPointsDeducted: Math.round(tajweedDeductions * 10) / 10,
      totalDeducted: Math.round(totalDeducted * 10) / 10,
    },
    feedbackMessage,
  };
}

/**
 * تنسيق الدرجة من 20 كنص (مثال: "18.5 / 20")
 */
export function formatScoreOutOf20(scoreOutOf20: number): string {
  return `${scoreOutOf20.toFixed(1)} / 20`;
}

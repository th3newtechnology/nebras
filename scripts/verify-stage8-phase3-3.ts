/**
 * نصوص الفحص الآلي للمرحلة الفرعية 8.3.3:
 * واجهة التسميع الفردي والمصحف المساعد برواية ورش عن نافع
 */

import {
  QURAN_SURAHS,
  getSurahByNumber,
  getSurahByName,
  getSurahsByJuz,
  getSurahNavigation,
  validateAyahRange,
  getDefaultRecitationForStudent,
} from '../lib/quranMetadata';

import {
  toArabicQuranicDigits,
  formatWarshAyahBadge,
  WARSH_SURAH_LIBRARY,
  getWarshVersesForSurah,
  WARSH_PRIMARY_RULES,
} from '../lib/warshContent';

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [نجاح] ${testName}`);
  } else {
    console.error(`  ❌ [فشل] ${testName}`);
    if (details) console.error(`     السبب: ${details}`);
  }
}

async function runVerification() {
  console.log('\n===============================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.3.3');
  console.log('   واجهة التسميع الفردي والمصحف المساعد برواية ورش عن نافع');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص بيانات السور وحدود الآيات (114 سورة)
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص بيانات السور القرآنية والحدود المعتمدة ---');

  assert(QURAN_SURAHS.length === 114, 'إجمالي السور القرآنية 114 سورة كاملة ومحققة');
  assert(QURAN_SURAHS[0].name === 'الفاتحة' && QURAN_SURAHS[0].ayahsCount === 7, 'سورة الفاتحة برقم 1 و 7 آيات');
  assert(QURAN_SURAHS[1].name === 'البقرة' && QURAN_SURAHS[1].ayahsCount === 286, 'سورة البقرة برقم 2 و 286 آية');
  assert(QURAN_SURAHS[17].name === 'الكهف' && QURAN_SURAHS[17].ayahsCount === 110, 'سورة الكهف برقم 18 و 110 آيات');
  assert(QURAN_SURAHS[66].name === 'الملك' && QURAN_SURAHS[66].ayahsCount === 30, 'سورة الملك برقم 67 و 30 آية');
  assert(QURAN_SURAHS[113].name === 'الناس' && QURAN_SURAHS[113].ayahsCount === 6, 'سورة الناس برقم 114 و 6 آيات');

  const fatiha = getSurahByNumber(1);
  assert(fatiha?.name === 'الفاتحة', 'جلب السورة بالرقم: رقم 1 الفاتحة');

  const invalidSurah = getSurahByNumber(999);
  assert(invalidSurah === undefined, 'جلب سورة برقم غير موجود يعيد undefined بأمان');

  const kahfByName = getSurahByName('الكهف');
  const kahfWithPrefix = getSurahByName('سورة الكهف');
  assert(kahfByName?.number === 18 && kahfWithPrefix?.number === 18, 'جلب السورة بالاسم مجرداً ومع بادئة "سورة"');

  const juz30Surahs = getSurahsByJuz(30);
  assert(juz30Surahs.length > 30, `جلب سور جزء عم: يحتوي على ${juz30Surahs.length} سورة`);

  // Navigation
  const navFatiha = getSurahNavigation(1);
  assert(navFatiha.prev === null && navFatiha.next?.name === 'البقرة', 'تنقل الفاتحة: لا سابقة، والتالية البقرة');

  const navKahf = getSurahNavigation(18);
  assert(navKahf.prev?.name === 'الإسراء' && navKahf.next?.name === 'مريم', 'تنقل الكهف: السابقة الإسراء، والتالية مريم');

  const navNas = getSurahNavigation(114);
  assert(navNas.prev?.name === 'الفلق' && navNas.next === null, 'تنقل الناس: السابقة الفلق، ولا توجد تالية');

  // -------------------------------------------------------------
  // المجموعة 2: التحقق الصارم من صحة نطاقات الآيات (Ayah Boundary Validation)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: التحقق الصارم من صحة نطاق الآيات وسقف السور ---');

  const validBaqarahRange = validateAyahRange(2, 1, 50);
  assert(validBaqarahRange.isValid && validBaqarahRange.correctedFrom === 1 && validBaqarahRange.correctedTo === 50, 'نطاق صحيح لسورة البقرة (1 إلى 50)');

  const overflowBaqarah = validateAyahRange(2, 280, 300);
  assert(!overflowBaqarah.isValid && overflowBaqarah.correctedTo === 286, 'معالجة تجاوز سقف السورة: كبح الآية 300 إلى 286 آية في البقرة');

  const invertedRange = validateAyahRange(1, 5, 2);
  assert(!invertedRange.isValid && invertedRange.correctedTo >= invertedRange.correctedFrom, 'معالجة نطاق معكوس (البداية 5 والنهاية 2): تصحيح النهاية');

  const zeroRange = validateAyahRange(1, 0, 7);
  assert(!zeroRange.isValid && zeroRange.correctedFrom === 1, 'معالجة آية صفر: تصحيح البداية إلى 1');

  // -------------------------------------------------------------
  // المجموعة 3: اقتراح الورد والتسميع التلقائي الذكي حسب مستوى الطالب
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: الاقتراح الذكي لورد التسميع بحسب الجزء والمستوى ---');

  const defJuz1 = getDefaultRecitationForStudent(1);
  assert(defJuz1.surahNumber === 1 && defJuz1.fromAyah === 1 && defJuz1.toAyah === 7, 'اقتراح ورد جزء 1: سورة الفاتحة كاملة');

  const defJuz29 = getDefaultRecitationForStudent(29);
  assert(defJuz29.surahNumber === 67 && defJuz29.surahName === 'الملك', 'اقتراح ورد جزء 29 (تبارك): سورة الملك');

  const defJuz30 = getDefaultRecitationForStudent(30);
  assert(defJuz30.surahNumber === 78 && defJuz30.surahName === 'النبأ', 'اقتراح ورد جزء 30 (عم): سورة النبأ');

  // -------------------------------------------------------------
  // المجموعة 4: مكتبة رواية ورش عن نافع والأصول المعتمدة
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: مكتبة رواية ورش عن نافع والأصول الصوتية ---');

  assert(toArabicQuranicDigits(1) === '١', 'تحويل الأرقام إلى المشرقية: 1 -> ١');
  assert(toArabicQuranicDigits(286) === '٢٨٦', 'تحويل الأرقام إلى المشرقية: 286 -> ٢٨٦');
  assert(formatWarshAyahBadge(7) === '﴿٧﴾', 'علامة نهاية الآية الورشانية: ﴿٧﴾');

  assert(WARSH_SURAH_LIBRARY[1] !== undefined, 'توفر نصوص الفاتحة في مكتبة ورش');
  assert(WARSH_SURAH_LIBRARY[1].verses.length === 7, 'الفاتحة تحتوي على 7 آيات محققة');
  assert(WARSH_SURAH_LIBRARY[1].salientWarshRules.length >= 2, 'توفر أصول ورش في الفاتحة (البسملة، ترقيق الراء)');

  assert(WARSH_SURAH_LIBRARY[67] !== undefined, 'توفر نصوص سورة الملك في مكتبة ورش');
  assert(WARSH_SURAH_LIBRARY[112] !== undefined, 'توفر سورة الإخلاص في مكتبة ورش');
  assert(WARSH_SURAH_LIBRARY[113] !== undefined, 'توفر سورة الفلق في مكتبة ورش');
  assert(WARSH_SURAH_LIBRARY[114] !== undefined, 'توفر سورة الناس في مكتبة ورش');

  const genericSurahContent = getWarshVersesForSurah(18, 'الكهف', 1, 10, 110);
  assert(genericSurahContent.verses.length >= 10, 'توليد آيات سورة الكهف برواية ورش بنجاح');
  assert(genericSurahContent.salientRules.length >= 3, 'توفر القواعد الأصولية العامة لطريق الأزرق');

  assert(WARSH_PRIMARY_RULES.length === 6, 'توفر القواعد الكبرى الست لأصول ورش (النقل، ترقيق الراء، تغليظ اللام، المدود، التقليل، إبدال الهمز)');

  // -------------------------------------------------------------
  // المجموعة 5: التحقق من تكامل المكونات والواجهات البرمجية
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: التحقق من ملفات المكونات وتكامل المحطة ---');

  const mushafComponentPath = path.resolve('components/teacher/live/WarshAssistantMushaf.tsx');
  assert(fs.existsSync(mushafComponentPath), 'ملف مكون المصحف المساعد WarshAssistantMushaf.tsx موجود');

  const mushafContent = fs.readFileSync(mushafComponentPath, 'utf-8');
  assert(mushafContent.includes('WarshAssistantMushaf'), 'المكون يصدر WarshAssistantMushaf بنجاح');
  assert(mushafContent.includes('formatWarshAyahBadge'), 'المكون يستخدم علامات آيات ورش المعتمدة');
  assert(mushafContent.includes('handleSelectFullSurah'), 'المكون يدعم التحديد السريع لكامل السورة');
  assert(mushafContent.includes('showWarshRules'), 'المكون يدعم درج أحكام وتنبيهات رواية ورش');

  const stationPagePath = path.resolve('pages/LiveRecitationStation.tsx');
  const stationContent = fs.readFileSync(stationPagePath, 'utf-8');
  assert(stationContent.includes('WarshAssistantMushaf'), 'محطة الإقراء تدمج مكون المصحف المساعد WarshAssistantMushaf');
  assert(stationContent.includes('workspaceViewMode'), 'محطة الإقراء تدعم أوضاع العرض (مزدوج، مصحف فقط، رصد فقط)');
  assert(stationContent.includes('handleAutoSuggestRecitation'), 'محطة الإقراء تدعم زر اقتراح الورد الذكي بنقرة واحدة');
  assert(stationContent.includes('validateAyahRange'), 'محطة الإقراء تطبق التحقق الصارم من حدود الآيات والسور');
  assert(stationContent.includes('handleSelectSurah'), 'محطة الإقراء تدعم التنقل اللحظي بين سور المصحف الشريف');

  // -------------------------------------------------------------
  // النتائج النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 ملخص نتائج الاختبارات للمرحلة 8.3.3: ${passedTests} / ${totalTests} اختبار ناجح`);
  if (passedTests === totalTests) {
    console.log('🎉 نجحت جميع فحوصات واجهة التسميع الفردي والمصحف المساعد برواية ورش بنسبة 100%!');
  } else {
    console.error('⚠️ توجد اختبارات تحتاج إلى مراجعة قبل الاعتماد.');
  }
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل الفحص:', err);
  process.exit(1);
});

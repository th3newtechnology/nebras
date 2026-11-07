/**
 * نصوص الفحص الآلي للمرحلة الفرعية 8.3.4:
 * محرك الرصد والتقييم وأحكام التجويد واللحن الجلي والخفي
 */

import {
  calculateRecitationScore,
  formatScoreOutOf20,
  DEDUCTION_RULES,
  HIFZ_MISTAKE_TAGS,
  TAJWEED_MISTAKE_TAGS,
} from '../lib/evaluationEngine';

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
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.3.4');
  console.log('   محرك الرصد والتقييم وأحكام التجويد واللحن الجلي والخفي');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص حساب الدرجات والتقدير القرآني التلقائي
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص حساب الدرجات والتقديرات القرآنية ---');

  // 1. تلاوة متقنة دون أي أخطاء
  const perfectResult = calculateRecitationScore({});
  assert(perfectResult.score === 100, 'التلاوة التامة: الدرجة 100 من 100');
  assert(perfectResult.scoreOutOf20 === 20, 'التلاوة التامة: الدرجة 20 من 20');
  assert(perfectResult.recommendedGrade === 'ممتاز', 'التلاوة التامة: التقدير ممتاز');
  assert(perfectResult.totalHifzMistakes === 0 && perfectResult.totalTajweedMistakes === 0, 'التلاوة التامة: صفر أخطاء');

  // 2. تلاوة بها عثرات حفظ فقط (لحن جلي)
  const hifzOnly = calculateRecitationScore({
    hesitation: 1, // -2.0
    wordSubstitution: 1, // -3.5
  });
  // deductions: 2 + 3.5 = 5.5 => score: 94.5 => ممتاز
  assert(hifzOnly.score === 94.5, `خصم اللحن الجلي: النتيجة ${hifzOnly.score} من 100`);
  assert(hifzOnly.scoreOutOf20 === 18.9, `درجة النظام الجزائري: ${hifzOnly.scoreOutOf20} من 20`);
  assert(hifzOnly.recommendedGrade === 'ممتاز', 'تقدير 94.5%: ممتاز');
  assert(hifzOnly.totalHifzMistakes === 2, 'إجمالي عثرات الحفظ 2');

  // 3. عثرات أكبر تدفع للتقدير "جيد جداً" (80 - 89%)
  const jayyidJiddan = calculateRecitationScore({
    hesitation: 2, // -4
    teacherPrompt: 2, // -8
    nunMeemSakinah: 3, // -3
  });
  // deductions: 4 + 8 + 3 = 15 => score: 85 => جيد جداً
  assert(jayyidJiddan.score === 85, `تلاوة بخصم 15 نقطة: الدرجة ${jayyidJiddan.score}`);
  assert(jayyidJiddan.recommendedGrade === 'جيد جداً', 'التقدير المحسوب: جيد جداً');
  assert(jayyidJiddan.scoreOutOf20 === 17, `الدرجة من 20: ${jayyidJiddan.scoreOutOf20}`);

  // 4. عثرات تدفع للتقدير "جيد" (70 - 79%)
  const jayyid = calculateRecitationScore({
    verseSkip: 2, // -12
    wordSubstitution: 2, // -7
    tarqeeqTaghleez: 4, // -6
  });
  // deductions: 12 + 7 + 6 = 25 => score: 75 => جيد
  assert(jayyid.score === 75, `تلاوة بخصم 25 نقطة: الدرجة ${jayyid.score}`);
  assert(jayyid.recommendedGrade === 'جيد', 'التقدير المحسوب: جيد');
  assert(jayyid.scoreOutOf20 === 15, `الدرجة من 20: ${jayyid.scoreOutOf20}`);

  // 5. عثرات كثيرة تدفع للتقدير "يحتاج مراجعة" (أقل من 70%)
  const needsReview = calculateRecitationScore({
    verseSkip: 4, // -24
    teacherPrompt: 3, // -12
  });
  // deductions: 36 => score: 64 => يحتاج مراجعة
  assert(needsReview.score === 64, `تلاوة بخصم 36 نقطة: الدرجة ${needsReview.score}`);
  assert(needsReview.recommendedGrade === 'يحتاج مراجعة', 'التقدير المحسوب: يحتاج مراجعة');

  // 6. كبح الدرجات السالبة
  const massiveMistakes = calculateRecitationScore({
    verseSkip: 25, // -150
  });
  assert(massiveMistakes.score === 0, 'كبح الدرجة الصغرى: لا تقل عن 0');
  assert(massiveMistakes.scoreOutOf20 === 0, 'الدرجة من 20 لا تقل عن 0');

  // -------------------------------------------------------------
  // المجموعة 2: فحص أحكام التجويد ورواية ورش عن نافع
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: فحص أخطاء وأحكام التجويد ورواية ورش ---');

  const warshTajweed = calculateRecitationScore({
    tarqeeqTaghleez: 2, // -3.0
    maddWarsh: 2, // -3.0
    taqleel: 1, // -1.0
    naqlHamz: 1, // -1.0
  });
  // deductions: 3 + 3 + 1 + 1 = 8 => score: 92 => ممتاز
  assert(warshTajweed.score === 92, `خصم أحكام ورش التفصيلية: النتيجة ${warshTajweed.score}`);
  assert(warshTajweed.deductionsSummary.tajweedPointsDeducted === 8, 'مجموع نقاط التجويد المخصومة 8 نقاط بدقة');
  assert(warshTajweed.totalTajweedMistakes === 6, 'إجمالي أخطاء التجويد المرصودة 6 أحكام');

  // -------------------------------------------------------------
  // المجموعة 3: فحص العدادات العامة الاحتياطية وتنسيق الدرجات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: فحص العدادات العامة والدوال المساعدة ---');

  const fallbackResult = calculateRecitationScore({
    generalHifzMistakes: 2, // 2 * 3 = 6
    generalTajweedMistakes: 2, // 2 * 1.5 = 3
  });
  // deductions: 9 => score: 91
  assert(fallbackResult.score === 91, `استخدام العدادات العامة: النتيجة ${fallbackResult.score}`);

  assert(formatScoreOutOf20(18.5) === '18.5 / 20', 'تنسيق الدرجة من 20: "18.5 / 20"');
  assert(formatScoreOutOf20(20) === '20.0 / 20', 'تنسيق الدرجة من 20 الكاملة: "20.0 / 20"');

  assert(HIFZ_MISTAKE_TAGS.length === 4, 'توفر كبسولات اللحن الجلي الأربع (تردد، تغيير، فتح المحفظ، إسقاط آية)');
  assert(TAJWEED_MISTAKE_TAGS.length === 6, 'توفر كبسولات اللحن الخفي الست (ترقيق، مدود ورش، غنة، نقل، تقليل، مخارج)');

  // -------------------------------------------------------------
  // المجموعة 4: التحقق من تكامل المحرك داخل صفحة محطة الإقراء
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: التحقق من تكامل صفحة محطة الإقراء ---');

  const stationPagePath = path.resolve('pages/LiveRecitationStation.tsx');
  assert(fs.existsSync(stationPagePath), 'ملف محطة الإقراء LiveRecitationStation.tsx موجود');

  const stationContent = fs.readFileSync(stationPagePath, 'utf-8');
  assert(stationContent.includes('calculateRecitationScore'), 'المحطة تستدعي محرك الحساب calculateRecitationScore');
  assert(stationContent.includes('scoreResult'), 'المحطة تحتفظ بنتيجة التقييم الحي scoreResult');
  assert(stationContent.includes('handleIncrementHifzTag'), 'المحطة تدعم رصد عثرات الحفظ بالكبسولات السريعة');
  assert(stationContent.includes('handleIncrementTajweedTag'), 'المحطة تدعم رصد أحكام التجويد ورواية ورش بالكبسولات السريعة');
  assert(stationContent.includes('handleResetMistakes'), 'المحطة تدعم زر التصفير وإعادة الضبط السريع');
  assert(stationContent.includes('isManualGradeOverride'), 'المحطة تدعم التعديل اليدوي للتقدير والعودة للحساب الآلي');
  assert(stationContent.includes('formatScoreOutOf20'), 'المحطة تعرض النتيجة بالنظام المعياري الجزائري من 20');
  assert(stationContent.includes('scoreOutOf20'), 'المحطة تحفظ النتيجة المعيارية scoreOutOf20 في سجل التسميع');

  // -------------------------------------------------------------
  // النتائج النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 ملخص نتائج الاختبارات للمرحلة 8.3.4: ${passedTests} / ${totalTests} اختبار ناجح`);
  if (passedTests === totalTests) {
    console.log('🎉 نجحت جميع فحوصات محرك الرصد والتقييم وأحكام التجويد بنسبة 100%!');
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

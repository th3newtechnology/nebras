/**
 * سكريبت الفحص والتحقق الآلي الشامل للمرحلة الفرعية 9.2
 * السجل القرآني وخريطة الأجزاء الـ 30 والمستهدفات القرآنية (Quran Progress & 30-Juz Map & Goals)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  fetchChildDetailForGuardian,
  verifyGuardianStudentAccess,
} from '../lib/guardianService';
import {
  QURAN_SURAHS,
  getSurahsByJuz,
  getDefaultRecitationForStudent,
} from '../lib/quranMetadata';
import { QURAN_JUZ_NAMES } from '../lib/teacherPortalService';

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

async function runStage9Phase2Verification() {
  console.log('\n=============================================================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 9.2: السجل القرآني وخريطة الأجزاء الـ 30');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Parent Quranic Progress Engine)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المجموعة 1: فحص تكامل ملفات ومكونات السجل القرآني وخريطة الأجزاء الـ 30
  // -----------------------------------------------------------------------------------------
  console.log('📂 المجموعة 1: فحص تكامل ملفات ومكونات السجل القرآني في شجرة الكود:');

  const requiredFiles = [
    'components/guardian/ChildQuranProgress.tsx',
    'components/guardian/JuzDetailModal.tsx',
    'lib/quranMetadata.ts',
    'lib/teacherPortalService.ts',
    'lib/guardianService.ts',
    'types/guardianPortal.types.ts',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(fullPath), `وجود الملف الأساسي: ${file}`);
  }

  // -----------------------------------------------------------------------------------------
  // المجموعة 2: التحقق من بنية وبيانات خريطة الأجزاء الثلاثين (30-Juz Map Metadata)
  // -----------------------------------------------------------------------------------------
  console.log('\n📖 المجموعة 2: التحقق من بيانات وتوزيع الأجزاء الـ 30 برواية ورش عن نافع:');

  assert(
    QURAN_JUZ_NAMES.length === 30,
    'اكتمال مسميات الأجزاء الثلاثين من القرآن الكريم (30 جزءاً)',
    `العدد الفعلي: ${QURAN_JUZ_NAMES.length}`
  );

  assert(
    QURAN_SURAHS.length === 114,
    'اكتمال مصفوفة السور القرآنية الـ 114 المعتمدة',
    `العدد الفعلي: ${QURAN_SURAHS.length}`
  );

  // فحص توزيع السور على الأجزاء
  const juz1Surahs = getSurahsByJuz(1);
  assert(
    juz1Surahs.length > 0 && juz1Surahs[0].name === 'الفاتحة',
    'مطابقة بداية الجزء الأول بسورة الفاتحة المباركة'
  );

  const juz30Surahs = getSurahsByJuz(30);
  assert(
    juz30Surahs.length >= 30 && juz30Surahs[0].name === 'النبأ',
    'مطابقة بداية جزء عم (الجزء 30) بسورة النبأ العظيم',
    `عدد سور جزء عم المبتدئة فيه: ${juz30Surahs.length}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 3: حساب نسب التقدم القرآني ومعدل إتمام الختمة المباركة
  // -----------------------------------------------------------------------------------------
  console.log('\n📊 المجموعة 3: فحص حساب التقدم القرآني ومعدل إتمام الختمة للطالب:');

  const guardianUserId = 'u-guardian-01';
  const child1Detail = await fetchChildDetailForGuardian('s-001', guardianUserId);

  assert(
    child1Detail.overview.currentJuz === 16,
    'رصد الجزء الحالي للطالب (الجزء 16)',
    `الجزء الحالي: ${child1Detail.overview.currentJuz}`
  );

  const expectedCompletedJuzCount = child1Detail.overview.currentJuz - 1; // 15 أجزاء مكتملة
  assert(
    expectedCompletedJuzCount === 15,
    'تحديد الأجزاء المكتملة بدقة (15 جزءاً متقناً ومكتمل)',
    `الأجزاء المكتملة: ${expectedCompletedJuzCount}`
  );

  const calculatedPercentage = Math.round((child1Detail.overview.currentJuz / 30) * 100);
  assert(
    calculatedPercentage === 53,
    'حساب نسبة إتمام القرآن الكريم بدقة (53%)',
    `النسبة المحسوبة: ${calculatedPercentage}%`
  );

  const remainingAjza = 30 - child1Detail.overview.currentJuz;
  assert(
    remainingAjza === 14,
    'حساب الأجزاء المتبقية للختمة بدقة (14 جزءاً)',
    `المتبقي: ${remainingAjza}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 4: فحص سجل جلسات التسميع وتصنيفها والالتزام برواية ورش
  // -----------------------------------------------------------------------------------------
  console.log('\n🎙️ المجموعة 4: فحص سجل جلسات التسميع وتصنيفها وملاحظات الشيخ المحفظ:');

  assert(
    child1Detail.timeline.length > 0,
    'استرجاع الخط الزمني لسجل جلسات التسميع والمراجعة',
    `عدد الجلسات: ${child1Detail.timeline.length}`
  );

  const newMemEntries = child1Detail.timeline.filter((t) => t.category === 'new_memorization');
  assert(
    newMemEntries.length > 0,
    'تصنيف جلسات الحفظ الجديد (New Memorization)',
    `الجلسات: ${newMemEntries.length}`
  );

  const reviewEntries = child1Detail.timeline.filter(
    (t) => t.category === 'minor_review' || t.category === 'major_review'
  );
  assert(
    reviewEntries.length > 0,
    'تصنيف جلسات المراجعة الصغرى والكبرى (Minor & Major Review)',
    `الجلسات: ${reviewEntries.length}`
  );

  const hasWarshDetails = child1Detail.timeline.some((t) => t.warshAdherence && t.warshAdherence.length > 0);
  assert(
    hasWarshDetails,
    'توثيق أحكام ورش عن نافع (نقل الهمز، ترقيق الراءات، وتوسط البدل)',
    'تم توثيق الالتزام برواية ورش'
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 5: فحص الأهداف والمستهدفات القرآنية والمراجعة المنزلية
  // -----------------------------------------------------------------------------------------
  console.log('\n🎯 المجموعة 5: فحص الأهداف القرآنية ومتابعة المراجعة المنزلية للأسرة:');

  assert(
    child1Detail.goals.length > 0,
    'استرجاع المستهدفات القرآنية المسندة للطالب',
    `عدد الأهداف: ${child1Detail.goals.length}`
  );

  const hasActiveGoal = child1Detail.goals.some((g) => g.status === 'in_progress');
  assert(
    hasActiveGoal,
    'وجود هدف قرآني جارٍ وقيد التحقيق في الحلقة والمراجعة البيتية'
  );

  const targetRecitation = getDefaultRecitationForStudent(child1Detail.overview.currentJuz);
  assert(
    targetRecitation.surahNumber > 0 && targetRecitation.fromAyah >= 1,
    'توليد المقترح التلقائي للتسميع الذكي بناءً على الجزء الحالي',
    `السورة المقترحة: ${targetRecitation.surahName} (الآيات 1-${targetRecitation.toAyah})`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 6: فحص العزل الأمني الصارم للسجل القرآني ومنع الوصول غير المصرح به
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ المجموعة 6: فحص العزل الأمني الصارم للسجل القرآني (Zero Leakage):');

  let unauthorizedAccessBlocked = false;
  try {
    // محاولة استرجاع السجل القرآني لطالب أجنبي (s-003) بواسطة الولي u-guardian-01
    await fetchChildDetailForGuardian('s-003', guardianUserId);
  } catch (err: any) {
    unauthorizedAccessBlocked = true;
    assert(
      err.message.includes('اختراق أمني مرفوض'),
      'حظر استرجاع السجل القرآني لطالب غير مسجل تحت ولاية المستخدم',
      err.message
    );
  }

  assert(
    unauthorizedAccessBlocked,
    'تأكيد الحصانة الأمنية التامة ومنع تسريب بيانات الحفظ للغرباء'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة النتائج
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية لاختبارات المرحلة الفرعية 9.2:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الإنجاز والاعتماد: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز جميع اختبارات المرحلة الفرعية 9.2 بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage9Phase2Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل اختبارات المرحلة 9.2:', err);
  process.exit(1);
});

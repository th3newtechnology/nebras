/**
 * سكريبت الفحص والتحقق الآلي للمرحلة الفرعية 11.1
 * كشف وتطهير وتدقيق البيانات القديمة (Legacy Data Discovery & Sanitation)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  detectLegacyLocalStorageData,
  parseLegacyJsonDump,
  validateAndSanitizeLegacyData,
} from '../lib/dataMigrationService';

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

async function runStage11Phase1Verification() {
  console.log('\n=============================================================================================');
  console.log('🧪 بدء الاختبارات الآلية للمرحلة الفرعية 11.1: كشف وتطهير البيانات القديمة');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Legacy Data Sanitation Engine)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المجموعة 1: فحص تكامل ملفات ومكونات ترحيل البيانات في شجرة الكود
  // -----------------------------------------------------------------------------------------
  console.log('📂 المجموعة 1: فحص تكامل ملفات ترحيل البيانات في شجرة الكود:');

  const requiredFiles = [
    'types/dataMigration.types.ts',
    'lib/dataMigrationService.ts',
    'components/settings/DataMigrationModal.tsx',
    'pages/Settings.tsx',
    'project-docs/STAGE_11_EXECUTION_PLAN.md',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(fullPath), `وجود الملف الأساسي: ${file}`);
  }

  // -----------------------------------------------------------------------------------------
  // المجموعة 2: فحص كشف وقراءة البيانات التاريخية
  // -----------------------------------------------------------------------------------------
  console.log('\n🔍 المجموعة 2: فحص كشف واستخراج البيانات التاريخية القديمة:');

  const detectedData = detectLegacyLocalStorageData();
  assert(
    typeof detectedData === 'object' && detectedData !== null,
    'كشف واستخراج كائن البيانات التاريخية بنجاح'
  );

  const hasStudents = Boolean(detectedData.nebras_students && detectedData.nebras_students.length > 0);
  assert(hasStudents, 'كشف وتحديد سجلات الطلاب التاريخية');

  const hasTeachers = Boolean(detectedData.nebras_teachers && detectedData.nebras_teachers.length > 0);
  assert(hasTeachers, 'كشف وتحديد سجلات المعلمين التاريخية');

  // -----------------------------------------------------------------------------------------
  // المجموعة 3: فحص فك ترميز وتدقيق ملفات النسخ الاحتياطي JSON
  // -----------------------------------------------------------------------------------------
  console.log('\n📄 المجموعة 3: فحص استيراد وتدقيق ملفات JSON الخارجية:');

  const sampleJson = JSON.stringify({
    nebras_students: [
      { id: 'ext-1', name: 'أحمد التلمساني', current_juz: 35 }, // جزء غير صالح (> 30)
      { id: 'ext-2', name: 'عبد الله الجزائري' }, // بدون رقم قيد
    ],
    nebras_teachers: [
      { id: 'ext-t1', name: 'الشيخ الفاضل', phone: '550123456' }, // بدون صفر في البداية
    ],
  });

  const parsedDump = parseLegacyJsonDump(sampleJson);
  assert(
    Boolean(parsedDump.nebras_students) && parsedDump.nebras_students?.length === 2,
    'فك ترميز وتحليل ملف النسخة الاحتياطية JSON بنجاح'
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 4: فحص محرك التطهير التلقائي للبيانات
  // -----------------------------------------------------------------------------------------
  console.log('\n🧹 المجموعة 4: فحص التطهير التلقائي وتصحيح التنسيقات (Sanitation):');

  const { report, sanitizedDump } = validateAndSanitizeLegacyData(parsedDump);

  assert(
    report.totalRecordsFound === 3,
    'حصر عدد السجلات الإجمالي في التقرير المبدئي (3 سجلات)',
    `العدد: ${report.totalRecordsFound}`
  );

  assert(
    report.issues.length >= 2,
    'رصد وتوثيق الملاحظات والتصحيحات المطلوبة تلقائياً',
    `عدد الملاحظات: ${report.issues.length}`
  );

  const sanitizedStd1 = sanitizedDump.nebras_students?.[0];
  assert(
    sanitizedStd1.currentJuz === 30,
    'تصحيح وضبط رقم الجزء غير الصالح (35 -> 30)',
    `الجزء المصحح: ${sanitizedStd1.currentJuz}`
  );

  const sanitizedStd2 = sanitizedDump.nebras_students?.[1];
  assert(
    Boolean(sanitizedStd2.registrationNumber?.startsWith('NEB-2026-')),
    'توليد رقم قيد قياسي جديد للطالب المفتقر لرقم قيد (NEB-2026-XXXX)',
    `رقم القيد: ${sanitizedStd2.registrationNumber}`
  );

  const sanitizedTch = sanitizedDump.nebras_teachers?.[0];
  assert(
    sanitizedTch.phone.startsWith('0'),
    'تصحيح بادئة رقم الهاتف الجزائري بإضافة الصفر (0550123456)',
    `الهاتف: ${sanitizedTch.phone}`
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة النتائج
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية لاختبارات المرحلة الفرعية 11.1:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الإنجاز والاعتماد: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز جميع اختبارات المرحلة الفرعية 11.1 بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage11Phase1Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل اختبارات المرحلة 11.1:', err);
  process.exit(1);
});

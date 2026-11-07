/**
 * سكريبت التدقيق النهائي وضمان الجودة الشاملة للمرحلة 11 بالكامل
 * (Master QA & Institutional Sign-Off - Stage 11: Data Migration & Sanitation)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  detectLegacyLocalStorageData,
  parseLegacyJsonDump,
  validateAndSanitizeLegacyData,
  executeLegacyDataMigration,
} from '../lib/dataMigrationService';
import { fetchAuditLogs } from '../lib/settingsService';

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

async function runStage11MasterQA() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء الفحص الهندسي الشامل والتدقيق النهائي لمنظومة ترحيل البيانات (المرحلة 11 بالكامل)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Data Migration Master QA & Sign-Off)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. فحص الشجرة الهيكلية والمكونات البرمجية
  // -----------------------------------------------------------------------------------------
  console.log('📂 1. فحص اكتمال المكونات والخدمات والأنواع البرمجية لترحيل البيانات:');

  const requiredModules = [
    'types/dataMigration.types.ts',
    'lib/dataMigrationService.ts',
    'components/settings/DataMigrationModal.tsx',
    'pages/Settings.tsx',
    'project-docs/STAGE_11_EXECUTION_PLAN.md',
  ];

  for (const mod of requiredModules) {
    const fullPath = path.resolve(process.cwd(), mod);
    assert(fs.existsSync(fullPath), `اكتمال الملف البرمجي: ${mod}`);
  }

  // -----------------------------------------------------------------------------------------
  // 2. فحص كشف البيانات التاريخية وفك ترميز النسخ الاحتياطية
  // -----------------------------------------------------------------------------------------
  console.log('\n🔍 2. فحص كشف واستخراج البيانات التاريخية القديمة:');

  const localDump = detectLegacyLocalStorageData();
  assert(
    Boolean(localDump.nebras_students) && localDump.nebras_students!.length > 0,
    'كشف واستخراج سجلات الطلاب القديمة من التخزين المحلي'
  );

  const sampleBackup = {
    nebras_students: [
      { id: 'leg-std-101', name: 'بلال بن رباح', current_juz: 12, gender: 'male' },
      { id: 'leg-std-102', name: 'أسماء بنت أبي بكر', current_juz: 40, gender: 'female' }, // جزء غير صالح (>30)
    ],
    nebras_teachers: [
      { id: 'leg-tch-101', name: 'الشيخ مصطفى', phone: '770112233', specialization: 'ورش' },
    ],
    nebras_halls: [
      { id: 'leg-hall-101', name: 'قاعة الإمام نافع', capacity: 30 },
    ],
    nebras_fees: [
      { id: 'leg-fee-101', studentId: 'leg-std-101', amount: 3000, status: 'paid' },
    ],
    nebras_attendance_logs: [
      { id: 'leg-att-101', studentId: 'leg-std-101', date: '2026-11-01', status: 'present' },
    ],
  };

  const jsonStr = JSON.stringify(sampleBackup);
  const parsed = parseLegacyJsonDump(jsonStr);
  assert(
    parsed.nebras_students?.length === 2 && parsed.nebras_teachers?.length === 1,
    'فك ترميز وتحليل ملف النسخة الاحتياطية JSON متعدد الكيانات بنجاح'
  );

  // -----------------------------------------------------------------------------------------
  // 3. فحص التطهير التلقائي وضبط النزاهة (Sanitation Engine)
  // -----------------------------------------------------------------------------------------
  console.log('\n🧹 3. فحص التطهير التلقائي والتحقق من النزاهة الهندسية:');

  const { report: preflight, sanitizedDump } = validateAndSanitizeLegacyData(parsed);

  assert(
    preflight.totalRecordsFound === 6,
    'حصر إجمالي السجلات التاريخية الدقيقة عبر كافة الكيانات (6 سجلات)',
    `العدد: ${preflight.totalRecordsFound}`
  );

  assert(
    preflight.isValid === true,
    'تأكيد جاهزية وصلاحية البيانات للترحيل بعد المعالجة التلقائية'
  );

  const std2 = sanitizedDump.nebras_students?.[1];
  assert(
    std2.currentJuz === 30,
    'تطهير وضبط الجزء القرآني غير الصحيح إلى الحد الأقصى المعتمد (40 -> 30)',
    `الجزء: ${std2.currentJuz}`
  );

  assert(
    std2.registrationNumber.startsWith('NEB-2026-'),
    'توليد رقم قيد قياسي جزائري موحد للطالب',
    `رقم القيد: ${std2.registrationNumber}`
  );

  const tch = sanitizedDump.nebras_teachers?.[0];
  assert(
    tch.phone.startsWith('0'),
    'ضبط بادئة رقم هاتف المعلم لتطابق التنسيق الجزائري الرسمي (0770112233)',
    `الهاتف: ${tch.phone}`
  );

  // -----------------------------------------------------------------------------------------
  // 4. فحص محرك الترحيل العلائقي والتنفيذ الفعلي
  // -----------------------------------------------------------------------------------------
  console.log('\n🚀 4. فحص محرك الترحيل العلائقي والتنفيذ:');

  const migrationExecution = await executeLegacyDataMigration(parsed, 'admin@nebras.edu');

  assert(
    migrationExecution.isSuccessful === true,
    'نجاح تنفيذ الترحيل الكامل للبيانات'
  );

  assert(
    migrationExecution.totalMigrated === 6,
    'مطابقة عدد السجلات المنقولة بنجاح (6 من أصل 6 سجلات)',
    `المرحل: ${migrationExecution.totalMigrated}`
  );

  assert(
    migrationExecution.totalFailed === 0,
    'انعدام الأخطاء أثناء الترحيل (Zero Migration Failures)'
  );

  assert(
    Boolean(migrationExecution.auditLogId),
    'توليد معرف توثيق رقابي رسمي للعملية',
    `معرف التوثيق: ${migrationExecution.auditLogId}`
  );

  // -----------------------------------------------------------------------------------------
  // 5. فحص عدم التكرار والقابلية للتشغيل المتكرر (Idempotency)
  // -----------------------------------------------------------------------------------------
  console.log('\n🔄 5. فحص خاصية عدم التكرار والقابلية لإعادة التشغيل (Idempotency):');

  const secondRun = await executeLegacyDataMigration(parsed, 'admin@nebras.edu');
  assert(
    secondRun.isSuccessful === true && secondRun.totalMigrated === 6,
    'إعادة تشغيل الترحيل لنفس الحزمة بنجاح واستقرار تام دون توليد أخطاء تكرار'
  );

  // -----------------------------------------------------------------------------------------
  // 6. فحص التكامل مع سجل التدقيق الرقابي وإعدادات المدرسة
  // -----------------------------------------------------------------------------------------
  console.log('\n📑 6. فحص التكامل مع سجل التدقيق الرقابي وشاشة الإعدادات:');

  const auditLogs = await fetchAuditLogs();
  assert(
    Array.isArray(auditLogs) && auditLogs.length > 0,
    'حفظ وتوثيق العمليات الإدارية في سجل التدقيق الرقابي غير القابل للتعديل'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة الاعتماد المؤسسي والنهائي للمرحلة 11
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للتدقيق الهندسي الشامل لترحيل البيانات (المرحلة 11):`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد النهائي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز الفحص الهندسي والاعتماد النهائي للمرحلة الحادية عشرة بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage11MasterQA().catch((err) => {
  console.error('خطأ غير متوقع أثناء التدقيق النهائي للمرحلة 11:', err);
  process.exit(1);
});

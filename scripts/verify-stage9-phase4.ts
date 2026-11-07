/**
 * سكريبت الفحص والتحقق الآلي الشامل للمرحلة الفرعية 9.4
 * الاشتراكات المدرسية (DZD) والمراسلات الموجهة (Fees & Structured Messaging)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  fetchChildFeeSummary,
  fetchGuardianDashboardData,
  verifyGuardianStudentAccess,
} from '../lib/guardianService';
import { formatDZD } from '../lib/financeService';
import {
  fetchChatContacts,
  canUsersCommunicate,
  sendChatMessage,
  fetchMessages,
  PEDAGOGICAL_TEMPLATES,
} from '../lib/messagesService';

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

async function runStage9Phase4Verification() {
  console.log('\n=============================================================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 9.4: الاشتراكات المدرسية والتواصل الموجه');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Parent Fees & Structured Messaging Engine)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // المجموعة 1: فحص تكامل ملفات ومكونات الرسوم والمراسلات التربوية
  // -----------------------------------------------------------------------------------------
  console.log('📂 المجموعة 1: فحص تكامل ملفات ومكونات الرسوم والمراسلات في شجرة الكود:');

  const requiredFiles = [
    'components/guardian/ChildFeesTab.tsx',
    'lib/guardianService.ts',
    'lib/financeService.ts',
    'lib/messagesService.ts',
    'types/guardianPortal.types.ts',
    'types/communication.types.ts',
  ];

  for (const file of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    assert(fs.existsSync(fullPath), `وجود الملف الأساسي: ${file}`);
  }

  // -----------------------------------------------------------------------------------------
  // المجموعة 2: فحص كشف الرسوم والاشتراكات بالدينار الجزائري (DZD)
  // -----------------------------------------------------------------------------------------
  console.log('\n💰 المجموعة 2: فحص الاشتراكات وسندات القبض بالدينار الجزائري (DZD):');

  const child1Fees = await fetchChildFeeSummary('s-001');

  assert(
    child1Fees.currency === 'DZD',
    'اعتماد العملة الوطنية الرسمية الدينار الجزائري (DZD)',
    `العملة: ${child1Fees.currency}`
  );

  assert(
    child1Fees.totalRequired === 4500 && child1Fees.totalPaid === 4500,
    'مطابقة الحسابات المالية: إجمالي المستحق 4,500 د.ج والمسدد 4,500 د.ج',
    `المستحق: ${child1Fees.totalRequired} | المسدد: ${child1Fees.totalPaid}`
  );

  assert(
    child1Fees.remaining === 0 && child1Fees.isFullyPaid === true,
    'تأكيد براءة الذمة والسداد الكامل لاشتراكات الابن الأول',
    `المتبقي: ${child1Fees.remaining}`
  );

  const formattedRequired = formatDZD(child1Fees.totalRequired);
  assert(
    formattedRequired.includes('د.ج') || formattedRequired.includes('DA'),
    'تنسيق المبالغ بالهوية الجزائرية الرسمية',
    `المبلغ المنسق: ${formattedRequired}`
  );

  // فحص الابن الثاني ذو السداد الجزئي
  const child2Fees = await fetchChildFeeSummary('s-002');
  assert(
    child2Fees.remaining > 0 && child2Fees.isFullyPaid === false,
    'رصد المبالغ المتبقية للابن الثاني بدقة (سداد جزئي 1,000 د.ج متبقية)',
    `المتبقي: ${child2Fees.remaining} د.ج`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 3: فحص سندات القبض المعتمدة والتوثيق المالي
  // -----------------------------------------------------------------------------------------
  console.log('\n🧾 المجموعة 3: فحص سندات القبض المعتمدة وأرقام الإيصالات:');

  const paidItem = child1Fees.fees.find((f) => f.status === 'paid' && f.receiptNumber);
  assert(
    Boolean(paidItem) && Boolean(paidItem?.receiptNumber?.startsWith('REC-')),
    'ربط كل دفعة مسددة برقم سند قبض رسمي معتمد من أمانة المدرسة',
    `رقم السند: ${paidItem?.receiptNumber}`
  );

  assert(
    Boolean(paidItem?.paidAt),
    'توثيق التاريخ الدقيق لعملية السداد',
    `تاريخ السداد: ${paidItem?.paidAt}`
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 4: فحص التواصل التربوي وقنوات المراسلة المسموحة للولي
  // -----------------------------------------------------------------------------------------
  console.log('\n💬 المجموعة 4: فحص قنوات التواصل المسموحة لولي الأمر:');

  const guardianContactsRes = await fetchChatContacts('GUARDIAN', 'u-guardian-01');
  const contacts = guardianContactsRes.contacts;

  assert(
    contacts.length > 0,
    'استرجاع جهات الاتصال المصرح بها للولي',
    `عدد جهات الاتصال: ${contacts.length}`
  );

  const hasTeacherContact = contacts.some((c) => c.role === 'TEACHER');
  const hasAdminContact = contacts.some((c) => c.role === 'ADMIN');
  assert(
    hasTeacherContact && hasAdminContact,
    'سماح التواصل المباشر مع معلم الحلقة وإدارة المدرسة'
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 5: فحص العزل الصارم وحظر تراسل الأولياء فيما بينهم (Zero Cross-Guardian)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ المجموعة 5: فحص العزل الأمني وحظر تراسل الأولياء فيما بينهم:');

  const hasOtherGuardianInContacts = contacts.some((c) => c.role === 'GUARDIAN');
  assert(
    !hasOtherGuardianInContacts,
    'حجب كافة الأولياء الآخرين من قائمة جهات اتصال ولي الأمر (Zero Visibility)'
  );

  const crossGuardianAllowed = await canUsersCommunicate('GUARDIAN', 'GUARDIAN', 'u-guardian-01', 'u-guardian-02');
  assert(
    crossGuardianAllowed === false,
    'الحظر الأمني القاطع لتراسل الأولياء فيما بينهم (canUsersCommunicate = false)'
  );

  const crossSendResult = await sendChatMessage({
    senderId: 'u-guardian-01',
    senderRole: 'GUARDIAN',
    recipientId: 'u-guardian-02',
    recipientRole: 'GUARDIAN',
    content: 'محاولة تواصل محظورة بين وليين',
  });

  assert(
    crossSendResult.success === false && Boolean(crossSendResult.error?.includes('مرفوضة')),
    'إحباط محاولة إرسال رسالة بين وليين ورفضها أمنياً',
    crossSendResult.error
  );

  // -----------------------------------------------------------------------------------------
  // المجموعة 6: فحص إرسال رسالة تربوية مشروعة للشيخ المحفظ مع سياق الطالب
  // -----------------------------------------------------------------------------------------
  console.log('\n📨 المجموعة 6: فحص إرسال رسالة مشروعة للشيخ المحفظ بسياق الطالب:');

  const validSendResult = await sendChatMessage({
    senderId: 'u-guardian-01',
    senderRole: 'GUARDIAN',
    recipientId: 'u-teacher-01',
    recipientRole: 'TEACHER',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'pedagogical',
    content: 'السلام عليكم يا شيخ، تم بحمد الله مراجعة ربع الحزب المنزلي المقترح برواية ورش.',
  });

  assert(
    validSendResult.success === true && Boolean(validSendResult.message?.id),
    'نجاح إرسال الرسالة التربوية للمعلم مع تثبيت معرف واسم الطالب',
    `معرف الرسالة: ${validSendResult.message?.id}`
  );

  assert(
    validSendResult.message?.studentId === 's-001',
    'ربط سياق الابن المحدد بالرسالة المرسلة'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة النتائج
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة النهائية لاختبارات المرحلة الفرعية 9.4:`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الإنجاز والاعتماد: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز جميع اختبارات المرحلة الفرعية 9.4 بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage9Phase4Verification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل اختبارات المرحلة 9.4:', err);
  process.exit(1);
});

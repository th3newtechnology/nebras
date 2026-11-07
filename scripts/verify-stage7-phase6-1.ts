/**
 * سكريبت التحقق الشامل من المرحلة الفرعية 7.6.1
 * المحرك المالي، إدارة الرسوم، وسندات القبض بالدينار الجزائري (Fees, Payments & Receipts)
 */

import fs from 'fs';
import path from 'path';
import {
  fetchFees,
  fetchPayments,
  fetchFinanceStats,
  createFee,
  updateFee,
  cancelFee,
  recordPayment,
  reversePayment,
  getReceiptPrintData,
  formatDZD,
  generateReceiptNumber,
} from '../lib/financeService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
    failed++;
  }
}

async function runStage7Phase6_1Verification() {
  console.log('===============================================================');
  console.log(' 🔍 بدء الفحص الشامل للمرحلة الفرعية 7.6.1: المحرك المالي وسندات القبض');
  console.log('===============================================================\n');

  // 1. فحص وجود الملفات الأساسية
  console.log('📂 1. التحقق من وجود ملفات المرحلة 7.6.1:');
  const requiredFiles = [
    'types/finance.types.ts',
    'lib/financeService.ts',
    'components/finance/PaymentModal.tsx',
    'components/finance/ReceiptModal.tsx',
    'components/finance/FeeFormModal.tsx',
    'pages/Fees.tsx',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    assert(fs.existsSync(filePath), `وجود الملف: ${file}`);
  }

  // 2. التحقق من استعلامات وحسابات الرسوم المالية
  console.log('\n💰 2. فحص استعلامات الرسوم والمستحقات (Fees Management):');
  const allFees = await fetchFees();
  assert(Array.isArray(allFees) && allFees.length > 0, `جلب الرسوم كمصفوفة (العدد: ${allFees.length})`);

  const paidFees = await fetchFees({ status: 'paid' });
  assert(
    paidFees.every(f => f.status === 'paid'),
    'تصفية الرسوم المدفوعة بالكامل بنجاح'
  );

  const searched = await fetchFees({ search: 'أحمد' });
  assert(
    searched.length > 0 && searched.some(f => f.studentName.includes('أحمد')),
    'البحث الفوري في الرسوم باسم الطالب'
  );

  // 3. التحقق من الحسابات والإحصائيات المالية بالدينار الجزائري
  console.log('\n📊 3. فحص الإحصائيات والمؤشرات المالية (Finance Stats & DZD):');
  const stats = await fetchFinanceStats();
  assert(stats.totalExpected > 0, `إجمالي المبالغ المطلوبة: ${formatDZD(stats.totalExpected)}`);
  assert(stats.totalCollected > 0, `إجمالي المبالغ المحصلة: ${formatDZD(stats.totalCollected)}`);
  assert(stats.totalRemaining >= 0, `المبالغ قيد التحصيل: ${formatDZD(stats.totalRemaining)}`);
  assert(stats.collectionRate >= 0 && stats.collectionRate <= 100, `نسبة التحصيل: ${stats.collectionRate}%`);
  assert(formatDZD(1500).includes('د.ج'), 'تنسيق العملة بالدينار الجزائري الرسمي (د.ج)');

  // 4. التحقق من إنشاء وتعديل الرسوم المالية
  console.log('\n📝 4. فحص دورة حياة الرسوم (Fee Creation & Update):');
  const newFee = await createFee({
    studentId: 's-001',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    feeTitle: 'اشتراك اختبار تجريبي للمرحلة 7.6.1',
    periodKey: '2026-TEST',
    amount: 3000,
    discount: 500,
    dueDate: '2026-12-31',
    notes: 'رسم تجريبي لفحص النظام المالي',
  });

  assert(newFee.finalAmount === 2500, 'حساب الصافي تلقائياً (3000 - 500 = 2500 د.ج)');
  assert(newFee.remainingAmount === 2500, 'الرصيد المتبقي مساوٍ للصافي قبل السداد');
  assert(newFee.status === 'pending', 'حالة الرسم المبدئية قيد الانتظار (pending)');

  const updatedFee = await updateFee(newFee.id, {
    notes: 'ملاحظة محدثة بنجاح',
  });
  assert(updatedFee.notes === 'ملاحظة محدثة بنجاح', 'تحديث بيانات الرسم المالي بنجاح');

  // 5. التحقق من الرقابة الصارمة ضد الدفع الزائد (Overpayment Prevention)
  console.log('\n🛡️ 5. فحص قيود النزاهة المالية ومنع التجاوز (Overpayment Protection):');
  let overpayBlocked = false;
  try {
    await recordPayment({
      feeId: newFee.id,
      studentId: newFee.studentId,
      amount: 5000, // أكثر من المتبقي (2500)
      paymentDate: '2026-11-05',
      paymentMethod: 'cash',
    });
  } catch (err: any) {
    overpayBlocked = true;
    assert(
      err?.message?.includes('تجاوز مالي'),
      `حظر الدفع الزائد بنجاح مع رسالة خطأ صريحة: ${err.message}`
    );
  }
  assert(overpayBlocked, 'تأكيد رفض المعاملة المالية عند تجاوز الرصيد المتبقي');

  // 6. التحقق من تسجيل سداد صحيح وإصدار سند قبض فوري
  console.log('\n🧾 6. فحص تسجيل السداد وتوليد سند القبض (Receipt Generation):');
  const payResult = await recordPayment({
    feeId: newFee.id,
    studentId: newFee.studentId,
    amount: 1500, // سداد جزئي
    paymentDate: '2026-11-05',
    paymentMethod: 'bank_transfer',
    transactionReference: 'CCP-TEST-7788',
    notes: 'دفعة أولى عبر الحساب الجاري',
  });

  assert(payResult.payment.status === 'confirmed', 'حالة السند معتمد ومؤكد (confirmed)');
  assert(payResult.payment.amount === 1500, 'تسجيل مبلغ السند 1500 د.ج بدقة');
  assert(payResult.payment.receiptNumber.startsWith('REC-'), `توليد رقم سند رسمي فريد: ${payResult.payment.receiptNumber}`);
  assert(payResult.receipt.remainingAmount === 1000, 'تحديث المتبقي على الرسم بدقة (2500 - 1500 = 1000 د.ج)');
  assert(newFee.status === 'partially_paid', 'ترقية حالة الرسم تلقائياً إلى سداد جزئي (partially_paid)');

  // سداد باقي المبلغ
  const payFinalResult = await recordPayment({
    feeId: newFee.id,
    studentId: newFee.studentId,
    amount: 1000, // إكمال المتبقي
    paymentDate: '2026-11-05',
    paymentMethod: 'cash',
  });
  assert(payFinalResult.receipt.remainingAmount === 0, 'تصفير المتبقي وسداد كامل الذمة');
  assert(newFee.status === 'paid', 'ترقية حالة الرسم إلى مدفوع بالكامل (paid)');

  // 7. التحقق من استخراج سند القبض للطباعة الرسمية
  console.log('\n🖨️ 7. فحص إعداد السند للطباعة المعتمدة (Printable Voucher):');
  const printable = await getReceiptPrintData(payResult.payment.id);
  assert(printable !== null, 'استخراج بيانات السند القابل للطباعة بنجاح');
  assert(printable?.schoolName === 'مدرسة نبراس القرآنية', 'تضمين ترويسة المدرسة الرسمية');
  assert(Boolean(printable?.mosqueAffiliation?.includes('مسجد إبراهيم الخليل')), 'تضمين تبعية المسجد');

  // 8. التحقق من إلغاء الرسوم وعكس السندات
  console.log('\n↩️ 8. فحص إلغاء الرسوم وعكس السندات (Cancellation & Reversals):');
  const feeToCancel = await createFee({
    studentId: 's-002',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    feeTitle: 'رسم ملغى للتجربة',
    amount: 1000,
    dueDate: '2026-11-30',
  });
  const cancelOk = await cancelFee(feeToCancel.id, 'إلغاء لغرض الاختبار');
  assert(cancelOk && feeToCancel.status === 'cancelled', 'إلغاء الرسم غير المسدد بأمان وتوثيق السبب');

  // 9. فحص شاشة Fees.tsx وتكامل الواجهات
  console.log('\n🖥️ 9. التحقق من مكونات واجهة المستخدم (Fees UI Integration):');
  const feesContent = fs.readFileSync(path.join(process.cwd(), 'pages/Fees.tsx'), 'utf-8');
  assert(feesContent.includes('formatDZD'), 'استخدام العملة الرسمية د.ج في الواجهة');
  assert(feesContent.includes('PaymentModal'), 'تكامل نافذة تسجيل الدفع وسند القبض');
  assert(feesContent.includes('ReceiptModal'), 'تكامل نافذة طباعة السند المعتمد');
  assert(feesContent.includes('FeeFormModal'), 'تكامل نافذة إصدار وتعديل الرسوم');
  assert(feesContent.includes('activeTab'), 'توفير تبويبات منفصلة للرسوم وسندات القبض');

  console.log('\n===============================================================');
  console.log(` 📊 نتيجة الفحص للمرحلة 7.6.1: ${passed} نجح | ${failed} فشل`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage7Phase6_1Verification().catch((err) => {
  console.error('فشل غير متوقع في فحص المرحلة 7.6.1:', err);
  process.exit(1);
});

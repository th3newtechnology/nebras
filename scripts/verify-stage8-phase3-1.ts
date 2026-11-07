/**
 * سكريبت التحقق الشامل من المرحلة الفرعية 8.3.1
 * تصميم محطة الإقراء والواجهة الرئيسية (Live Recitation Station Architecture & Layout)
 */

import fs from 'fs';
import path from 'path';
import {
  initLiveSession,
  calculateSessionStats,
  updateLiveSessionStatus,
  setActiveSessionStudent,
  saveLiveSessionDraft,
  clearLiveSession,
} from '../lib/liveSessionService';

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

async function runStage8Phase31Verification() {
  console.log('=============================================================================');
  console.log(' 🔍 بدء الفحص الشامل للمرحلة الفرعية 8.3.1: تصميم محطة الإقراء والواجهة الرئيسية');
  console.log('=============================================================================\n');

  // 1. التحقق من وجود الملفات
  console.log('📂 1. التحقق من وجود ملفات المرحلة الفرعية 8.3.1:');
  const requiredFiles = [
    'types/liveSession.types.ts',
    'lib/liveSessionService.ts',
    'pages/LiveRecitationStation.tsx',
    'App.tsx',
    'components/Sidebar.tsx',
    'layouts/DashboardLayout.tsx',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    assert(fs.existsSync(filePath), `وجود الملف: ${file}`);
  }

  // 2. التحقق من بدء وتجهيز الجلسة الحية لحلقة المعلم
  console.log('\n🕌 2. فحص محرك تهيئة جلسة الإقراء الحية (Live Session Engine):');
  const session = await initLiveSession('c1', 't-01', 'الشيخ إبراهيم');
  assert(Boolean(session.id), `توليد معرف فريد للجلسة: ${session.id}`);
  assert(session.circleId === 'c1', `ربط الجلسة بالحلقة الصحيحة: ${session.circleName}`);
  assert(session.teacherId === 't-01', `ربط الجلسة بمعلم الحلقة: ${session.teacherName}`);
  assert(session.status === 'preparing', 'الحالة الابتدائية للجلسة: قيد التجهيز (preparing)');
  assert(session.students.length > 0, `استدعاء طلاب الحلقة تلقائياً (العدد: ${session.students.length})`);

  const firstStudent = session.students[0];
  assert(firstStudent.attendance === 'present', 'تسجيل حضور أولي تلقائي للطلاب');
  assert(firstStudent.recitationState === 'pending', 'حالة التسميع الأولية: بالانتظار (pending)');
  assert(firstStudent.turnOrder === 1, 'ترتيب الدور التلقائي للطالب الأول: رقم 1');

  // 3. التحقق من الحساب التلقائي لإحصائيات الجلسة
  console.log('\n📊 3. فحص الحساب التلقائي لإحصائيات الجلسة الحية (Live Session Stats):');
  const initialStats = calculateSessionStats(session);
  assert(initialStats.total === session.students.length, `إجمالي الطلاب: ${initialStats.total}`);
  assert(initialStats.present === session.students.length, `الطلاب الحاضرون: ${initialStats.present}`);
  assert(initialStats.completed === 0, 'الطلاب الذين أتموا التسميع في البداية: 0');
  assert(initialStats.remaining === session.students.length, `الطلاب المتبقون: ${initialStats.remaining}`);
  assert(initialStats.progressPercentage === 0, 'نسبة الإنجاز الأولية: 0%');

  // 4. التحقق من إدارة حالات الجلسة واختيار الطالب النشط
  console.log('\n🔄 4. فحص إدارة حالات الجلسة والتنقل بين الطلاب (Session Lifecycle & Active Student):');
  const startedSession = updateLiveSessionStatus(session, 'in_progress');
  assert(startedSession.status === 'in_progress', 'بدء جلسة الإقراء بنجاح (in_progress)');
  assert(Boolean(startedSession.startedAt), `توثيق لحظة بدء الجلسة: ${startedSession.startedAt}`);

  const pausedSession = updateLiveSessionStatus(startedSession, 'paused');
  assert(pausedSession.status === 'paused', 'إيقاف الجلسة مؤقتاً (paused)');

  const student2Id = session.students[1]?.studentId || firstStudent.studentId;
  const activatedSession = setActiveSessionStudent(startedSession, student2Id);
  assert(activatedSession.activeStudentId === student2Id, `تحديد الطالب النشط في المنصة: ${student2Id}`);

  // 5. التحقق من العزل المعماري والصلاحيات (RLS & Scoping Guard)
  console.log('\n🛡️ 5. فحص العزل المعماري ومنع فتح جلسة لحلقة غير مسندة للمعلم:');
  let securityBlocked = false;
  try {
    // محاولة فتح جلسة لحلقة c2 التابعة للمعلم t-02 من قبل المعلم t-01
    await initLiveSession('c2', 't-01');
  } catch (err: any) {
    securityBlocked = true;
    assert(err.message.includes('[SECURITY]'), `اعتراض وحظر فتح جلسة لمعلم آخر: ${err.message}`);
  }
  assert(securityBlocked, 'حماية محطة الإقراء تمنع المعلم من فتح جلسة لحلقات معلم آخر');

  // 6. التحقق من تكامل واجهة المستخدم والتوجيه
  console.log('\n🖥️ 6. فحص التكامل مع App.tsx و Sidebar.tsx و DashboardLayout:');
  const appContent = fs.readFileSync(path.join(process.cwd(), 'App.tsx'), 'utf-8');
  assert(appContent.includes('LiveRecitationStation'), 'استيراد LiveRecitationStation في App.tsx');
  assert(appContent.includes("case 'recitation':"), 'مسار recitation مخصص وموجّه للمعلم');

  const sidebarContent = fs.readFileSync(path.join(process.cwd(), 'components/Sidebar.tsx'), 'utf-8');
  assert(sidebarContent.includes("'محطة الإقراء المباشر'"), 'إضافة بند "محطة الإقراء المباشر" في قائمة المعلم بالـ Sidebar');

  const layoutContent = fs.readFileSync(path.join(process.cwd(), 'layouts/DashboardLayout.tsx'), 'utf-8');
  assert(layoutContent.includes('محطة الإقراء والتسميع المباشر'), 'ترويسة محطة الإقراء معرفة في DashboardLayout');

  const stationPage = fs.readFileSync(path.join(process.cwd(), 'pages/LiveRecitationStation.tsx'), 'utf-8');
  assert(stationPage.includes('isFieldMode'), 'توفير وضع الشاشة الكاملة الميداني (Field Focus Mode)');
  assert(stationPage.includes('mobileTab'), 'دعم التبديل السلس للشاشات الصغيرة بين الطابور والمنصة');
  assert(stationPage.includes('queueFilter'), 'توفير فلاتر تصفية طابور الطلاب (الكل، بالانتظار، تم التسميع، الغائبون)');

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة الفحص للمرحلة الفرعية 8.3.1: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage8Phase31Verification().catch((err) => {
  console.error('فشل غير متوقع في الفحص:', err);
  process.exit(1);
});

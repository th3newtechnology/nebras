/**
 * سكريبت التحقق الشامل من المرحلة الفرعية 8.3.2
 * إدارة الجلسات والتحضير الجماعي وطابور التسميع (Live Session Management & Bulk Attendance)
 */

import fs from 'fs';
import path from 'path';
import {
  initLiveSession,
  calculateSessionStats,
  markAllStudentsAttendance,
  updateStudentAttendance,
  reorderStudentTurn,
  sortQueueByPriority,
  deferStudentTurn,
  syncSessionAttendanceToSupabase,
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

async function runStage8Phase32Verification() {
  console.log('=============================================================================');
  console.log(' 🔍 بدء الفحص الشامل للمرحلة الفرعية 8.3.2: إدارة الجلسات والتحضير الجماعي');
  console.log('=============================================================================\n');

  // 1. التحقق من وجود الملفات البرمجية
  console.log('📂 1. التحقق من وجود ملفات المرحلة الفرعية 8.3.2:');
  const requiredFiles = [
    'types/liveSession.types.ts',
    'lib/liveSessionService.ts',
    'pages/LiveRecitationStation.tsx',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    assert(fs.existsSync(filePath), `وجود الملف: ${file}`);
  }

  // 2. التحقق من التحضير الجماعي السريع
  console.log('\n👥 2. فحص التحضير الجماعي السريع لطلاب الحلقة (Bulk Attendance):');
  let session = await initLiveSession('c1', 't-01', 'الشيخ إبراهيم');
  assert(session.students.length >= 2, `تهيئة الجلسة لطلاب حلقة الصديق (العدد: ${session.students.length})`);

  // تحضير الكل حاضر بنقرة واحدة
  session = markAllStudentsAttendance(session, 'present');
  assert(
    session.students.every((s) => s.attendance === 'present'),
    'تحضير جميع طلاب الحلقة كـ "حاضر" بنقرة زر واحدة'
  );

  let stats = calculateSessionStats(session);
  assert(stats.present === session.students.length, `عدد الحاضرين يطابق الإجمالي: ${stats.present}/${stats.total}`);
  assert(stats.absent === 0, 'عدد الغائبين: 0');

  // رصد استثناء غياب لطالب واحد
  const firstStudentId = session.students[0].studentId;
  session = updateStudentAttendance(session, firstStudentId, 'absent');
  assert(
    session.students.find((s) => s.studentId === firstStudentId)?.attendance === 'absent',
    'تحديد استثناء غياب لطالب بنجاح'
  );

  stats = calculateSessionStats(session);
  assert(stats.absent === 1, `تحديث إحصائية الغياب آلياً: ${stats.absent} غائب`);
  assert(stats.present === session.students.length - 1, `تحديث إحصائية الحاضرين: ${stats.present} حاضر`);

  // إعادة الطالب لحاضر
  session = updateStudentAttendance(session, firstStudentId, 'present');

  // 3. التحقق من إدارة أدوار الطابور وتقديم وتأخير الأدوار
  console.log('\n🔄 3. فحص إدارة طابور التسميع وإعادة ترتيب الأدوار (Queue Turn Reordering):');
  const studentA = session.students[0];
  const studentB = session.students[1];
  const originalAId = studentA.studentId;
  const originalBId = studentB.studentId;

  // تأخير دور الطالب الأول
  session = reorderStudentTurn(session, originalAId, 'down');
  assert(session.students[0].studentId === originalBId, 'تقديم دور الطالب الثاني للأمام');
  assert(session.students[1].studentId === originalAId, 'تأخير دور الطالب الأول للخلف');
  assert(session.students[0].turnOrder === 1 && session.students[1].turnOrder === 2, 'إعادة ترقيم الأدوار تلقائياً (1, 2)');

  // إعادة التقديم
  session = reorderStudentTurn(session, originalAId, 'up');
  assert(session.students[0].studentId === originalAId, 'إرجاع الطالب الأول لمكانه الأصلي');

  // 4. فحص تأجيل الدور للمراجعة
  console.log('\n⏳ 4. فحص ميزة تأجيل دور الطالب للمراجعة (Defer Student Turn):');
  session = deferStudentTurn(session, originalAId);
  const deferredStudent = session.students.find((s) => s.studentId === originalAId);
  assert(deferredStudent?.recitationState === 'deferred', 'ضبط حالة الطالب إلى "مؤجل للمراجعة" (deferred)');
  assert(session.activeStudentId !== originalAId, `الانتقال التلقائي للطالب التالي في المنصة: ${session.activeStudentId}`);

  // 5. فحص الفرز التلقائي حسب الأولوية
  console.log('\n⚡ 5. فحص الفرز التلقائي لطابور الحلقة حسب الأولوية:');
  // جعل طالب ذو أولوية مستعجلة
  const lastStudent = session.students[session.students.length - 1];
  lastStudent.priority = 'priority_high';
  lastStudent.recitationState = 'pending';
  lastStudent.attendance = 'present';

  session = sortQueueByPriority(session);
  assert(
    session.students[0].studentId === lastStudent.studentId,
    `تقديم الطالب ذو الأولوية المستعجلة إلى المرتبة الأولى في الطابور (${session.students[0].fullName})`
  );
  assert(session.students[0].turnOrder === 1, 'إعادة تعيين الدور الأول للطالب ذو الأولوية القصوى');

  // 6. فحص مزامنة سجلات الحضور مع السجلات الرسمية
  console.log('\n☁️ 6. فحص مزامنة كشف الحضور للجلسة:');
  const syncResult = await syncSessionAttendanceToSupabase(session);
  assert(syncResult.success, 'نجاح عملية مزامنة كشف الحضور للجلسة');
  assert(syncResult.syncedCount === session.students.length, `مزامنة سجلات ${syncResult.syncedCount} طالباً بالحلقة`);

  // 7. فحص واجهة المستخدم في LiveRecitationStation.tsx
  console.log('\n🖥️ 7. فحص تكامل عناصر التحضير الجماعي وإدارة الطابور بالواجهة:');
  const stationCode = fs.readFileSync(path.join(process.cwd(), 'pages/LiveRecitationStation.tsx'), 'utf-8');
  assert(stationCode.includes('handleMarkAllPresent'), 'تضمين دالة تحضير الكل حاضر بالواجهة');
  assert(stationCode.includes('handleSortByPriority'), 'تضمين دالة فرز الأولويات بالواجهة');
  assert(stationCode.includes('handleSyncAttendance'), 'تضمين دالة مزامنة كشف الحضور بالواجهة');
  assert(stationCode.includes('handleReorder'), 'تضمين أزرار تقديم وتأخير الأدوار في بطاقة الطالب');
  assert(stationCode.includes('handleDefer'), 'تضمين زر تأجيل الدور للمراجعة');
  assert(stationCode.includes('handleQuickAttendance'), 'تضمين كبسولات تبديل الحضور الفوري في بطاقة الطالب');

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة الفحص للمرحلة الفرعية 8.3.2: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage8Phase32Verification().catch((err) => {
  console.error('فشل غير متوقع في الفحص:', err);
  process.exit(1);
});

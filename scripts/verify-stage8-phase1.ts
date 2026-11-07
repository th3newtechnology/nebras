/**
 * سكريبت التحقق الشامل من المرحلة الفرعية 8.1
 * البنية الهيكلية ولوحة تحكم المعلم (Teacher Dashboard & Scoped Engine)
 */

import fs from 'fs';
import path from 'path';
import {
  fetchTeacherDashboardStats,
  fetchTeacherCircles,
  fetchTeacherStudents,
  logQuickRecitation,
} from '../lib/teacherPortalService';

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

async function runStage8Phase1Verification() {
  console.log('=============================================================================');
  console.log(' 🔍 بدء الفحص الشامل للمرحلة الفرعية 8.1: البنية الهيكلية ولوحة تحكم المعلم');
  console.log('=============================================================================\n');

  // 1. التحقق من وجود الملفات
  console.log('📂 1. التحقق من وجود ملفات المرحلة 8.1:');
  const requiredFiles = [
    'types/teacherPortal.types.ts',
    'lib/teacherPortalService.ts',
    'components/teacher/QuickRecitationModal.tsx',
    'pages/TeacherDashboard.tsx',
    'project-docs/STAGE_8_EXECUTION_PLAN.md',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    assert(fs.existsSync(filePath), `وجود الملف: ${file}`);
  }

  // 2. التحقق من مؤشرات لوحة تحكم المعلم
  console.log('\n📊 2. فحص مؤشرات وإحصائيات لوحة المعلم (Teacher Dashboard Stats):');
  const stats = await fetchTeacherDashboardStats('t-01');
  assert(stats.assignedCirclesCount > 0, `عدد الحلقات المسندة: ${stats.assignedCirclesCount}`);
  assert(stats.totalStudentsCount > 0, `إجمالي طلاب الشيخ: ${stats.totalStudentsCount}`);
  assert(stats.todayAttendanceRate >= 0 && stats.todayAttendanceRate <= 100, `نسبة حضور اليوم: ${stats.todayAttendanceRate}%`);
  assert(stats.completedRecitationsThisWeek > 0, `جلسات التسميع هذا الأسبوع: ${stats.completedRecitationsThisWeek}`);
  assert(stats.nextSession !== null, `الحلقة القادمة: ${stats.nextSession?.circleName} في ${stats.nextSession?.hallName}`);

  // 3. التحقق من حصر واسترجاع الحلقات المسندة للمعلم
  console.log('\n🕌 3. فحص استرجاع الحلقات المسندة للمعلم (Assigned Circles):');
  const circles = await fetchTeacherCircles('t-01');
  assert(Array.isArray(circles) && circles.length > 0, `استرجاع الحلقات كمصفوفة (العدد: ${circles.length})`);
  assert(circles.every(c => Boolean(c.hallName)), 'جميع الحلقات مقترنة بقاعات مسجد إبراهيم الخليل');

  // 4. التحقق من حصر واسترجاع طلاب المعلم
  console.log('\n👥 4. فحص استرجاع قائمة طلاب المعلم ومستوياتهم (Teacher Students Roster):');
  const students = await fetchTeacherStudents(undefined, 't-01');
  assert(Array.isArray(students) && students.length > 0, `استرجاع الطلاب كمصفوفة (العدد: ${students.length})`);
  const firstStudent = students[0];
  assert(Boolean(firstStudent.registrationNumber), `رقم قيد الطالب: ${firstStudent.registrationNumber}`);
  assert(firstStudent.currentJuz > 0 && firstStudent.targetJuz === 30, `تتبع الحفظ: جزء ${firstStudent.currentJuz} من ${firstStudent.targetJuz}`);

  // 5. التحقق من محطة التسميع القرآني السريع
  console.log('\n📖 5. فحص محطة التسميع القرآني السريع (Live Quick Recitation):');
  const recitationRes = await logQuickRecitation({
    studentId: firstStudent.id,
    circleId: firstStudent.circleId,
    surahNumber: 18,
    surahName: 'الكهف',
    ayahFrom: 1,
    ayahTo: 25,
    recordType: 'new_memorization',
    grade: 'ممتاز',
    mistakesCount: 0,
    tajweedMistakesCount: 1,
    notes: 'تلاوة خاشعة وإتقان لأحكام المد والإدغام',
  });

  assert(recitationRes.success && Boolean(recitationRes.recordId), `تسجيل التسميع بنجاح (المعرف: ${recitationRes.recordId})`);

  // 6. التحقق من تكامل توجيه المعلم في App.tsx
  console.log('\n🖥️ 6. فحص توجيه المعلم في App.tsx و DashboardLayout:');
  const appContent = fs.readFileSync(path.join(process.cwd(), 'App.tsx'), 'utf-8');
  assert(appContent.includes('TeacherDashboard'), 'تضمين TeacherDashboard في App.tsx');
  assert(appContent.includes('isTeacher'), 'فحص دور المعلم لتوجيهه للوحة المخصصة');

  const layoutContent = fs.readFileSync(path.join(process.cwd(), 'layouts/DashboardLayout.tsx'), 'utf-8');
  assert(layoutContent.includes('بوابة المعلم والمحفظ'), 'تخصيص ترويسة البوابة للمعلم');

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة الفحص للمرحلة الفرعية 8.1: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage8Phase1Verification().catch((err) => {
  console.error('فشل غير متوقع في الفحص:', err);
  process.exit(1);
});

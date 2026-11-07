/**
 * سكريبت التحقق الشامل من المرحلة الفرعية 8.2
 * إدارة حلقات وطلاب المعلم (Teacher Circles & Students Roster & Quranic Progress)
 */

import fs from 'fs';
import path from 'path';
import {
  fetchTeacherCirclesWithDetails,
  fetchTeacherStudents,
  fetchTeacherStudentDetail,
  generateJuzProgress,
  logQuickRecitation,
  QURAN_JUZ_NAMES,
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

async function runStage8Phase2Verification() {
  console.log('=============================================================================');
  console.log(' 🔍 بدء الفحص الشامل للمرحلة الفرعية 8.2: إدارة حلقات وطلاب المعلم');
  console.log('=============================================================================\n');

  // 1. التحقق من وجود الملفات البرمجية
  console.log('📂 1. التحقق من وجود ملفات المرحلة الفرعية 8.2:');
  const requiredFiles = [
    'types/teacherPortal.types.ts',
    'lib/teacherPortalService.ts',
    'components/teacher/StudentDetailModal.tsx',
    'pages/TeacherCirclesStudents.tsx',
    'components/Sidebar.tsx',
    'layouts/DashboardLayout.tsx',
    'App.tsx',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    assert(fs.existsSync(filePath), `وجود الملف: ${file}`);
  }

  // 2. التحقق من تفاصيل الحلقات المسندة
  console.log('\n🕌 2. فحص تفاصيل الحلقات المسندة للمعلم (Teacher Circles with Details):');
  const circles = await fetchTeacherCirclesWithDetails('t-01');
  assert(Array.isArray(circles) && circles.length >= 2, `استرجاع الحلقات مع التفاصيل (العدد: ${circles.length})`);
  
  const c1 = circles[0];
  assert(Boolean(c1.hallName), `اسم القاعة: ${c1.hallName}`);
  assert(c1.capacity > 0, `السعة الاستيعابية: ${c1.capacity} طالباً`);
  assert(c1.studentCount > 0, `الطلاب المسجلين: ${c1.studentCount}`);
  assert(Boolean(c1.academicYear), `العام الدراسي: ${c1.academicYear}`);
  assert(c1.scheduleDays.length > 0, `أيام الحضور: ${c1.scheduleDays.join('، ')}`);
  assert(c1.averageAttendanceRate >= 90, `متوسط الانضباط: ${c1.averageAttendanceRate}%`);

  // 3. التحقق من استرجاع الطلاب وتصفيتهم
  console.log('\n👥 3. فحص استرجاع وتصفية قائمة طلاب المعلم (Teacher Student Roster):');
  const allStudents = await fetchTeacherStudents(undefined, 't-01');
  assert(allStudents.length >= 3, `إجمالي طلاب المعلم: ${allStudents.length}`);
  
  const c1Students = await fetchTeacherStudents('c1', 't-01');
  assert(c1Students.length > 0, `طلاب حلقة الصديق المسجلين: ${c1Students.length}`);
  assert(c1Students.every(s => s.circleId === 'c1'), 'تصفية الطلاب حسب الحلقة تعمل بنجاح');

  // 4. فحص خريطة الأجزاء القرآنية الثلاثين (30 Quranic Juz Progress)
  console.log('\n📖 4. فحص خريطة الأجزاء القرآنية الثلاثين (30 Juz Progress Map):');
  assert(QURAN_JUZ_NAMES.length === 30, `فهرس الأجزاء الثلاثين يحتوي على 30 جزءاً بالتمام`);
  assert(QURAN_JUZ_NAMES[0].includes('الفاتحة'), `بداية الجزء الأول: ${QURAN_JUZ_NAMES[0]}`);
  assert(QURAN_JUZ_NAMES[29].includes('عم'), `بداية الجزء الثلاثين: ${QURAN_JUZ_NAMES[29]}`);

  const testJuzList = generateJuzProgress(15, 30);
  assert(testJuzList.length === 30, `توليد قائمة تقدم لـ 30 جزءاً`);
  assert(testJuzList[0].status === 'completed', `الجزء 1 محفوظ ومكتمل`);
  assert(testJuzList[14].status === 'in_progress', `الجزء 15 قيد الحفظ والمراجعة`);
  assert(testJuzList[15].status === 'not_started', `الجزء 16 لم يبدأ بعد`);

  // 5. فحص الملف القرآني الفردي للطالب (Student Detail Profile)
  console.log('\n👤 5. فحص الملف القرآني الفردي وسجل التسميع للطالب:');
  const studentDetail = await fetchTeacherStudentDetail('s-001');
  assert(studentDetail !== null, 'استرجاع الملف القرآني التفصيلي للطالب s-001');
  if (studentDetail) {
    assert(studentDetail.fullName === 'أحمد محمد علي', `اسم الطالب: ${studentDetail.fullName}`);
    assert(studentDetail.registrationNumber === 'NEB-2026-0001', `رقم القيد: ${studentDetail.registrationNumber}`);
    assert(studentDetail.guardianPhone === '0550123456', `هاتف ولي الأمر: ${studentDetail.guardianPhone}`);
    assert(studentDetail.behaviorScore >= 95, `الدرجة السلوكية: ${studentDetail.behaviorScore}/100`);
    assert(studentDetail.juzProgress.length === 30, `خريطة الأجزاء كاملة (30 جزء)`);
    assert(studentDetail.recitationHistory.length >= 3, `سجل التسميعات السابقة (العدد: ${studentDetail.recitationHistory.length})`);
    
    const rec1 = studentDetail.recitationHistory[0];
    assert(Boolean(rec1.surahName), `آخر سورة مسموعة: ${rec1.surahName}`);
    assert(Boolean(rec1.grade), `تقدير التسميع: ${rec1.grade}`);
    assert(rec1.mistakesCount >= 0 && rec1.tajweedMistakesCount >= 0, `عثرات الحفظ والتجويد موثقة`);
  }

  // 6. فحص التكامل مع App.tsx و Sidebar.tsx و DashboardLayout
  console.log('\n🖥️ 6. فحص التكامل المعماري في App.tsx و Sidebar و DashboardLayout:');
  const appContent = fs.readFileSync(path.join(process.cwd(), 'App.tsx'), 'utf-8');
  assert(appContent.includes('TeacherCirclesStudents'), 'استيراد واستخدام TeacherCirclesStudents في App.tsx');
  assert(appContent.includes("isTeacher"), 'فصل مسار المعلم عن الإدارة عند طلب شاشة الطلاب');

  const sidebarContent = fs.readFileSync(path.join(process.cwd(), 'components/Sidebar.tsx'), 'utf-8');
  assert(sidebarContent.includes("'حلقاتي وطلابي'"), 'إضافة بند "حلقاتي وطلابي" في قائمة المعلم بالـ Sidebar');

  const layoutContent = fs.readFileSync(path.join(process.cwd(), 'layouts/DashboardLayout.tsx'), 'utf-8');
  assert(layoutContent.includes('حلقاتي وطلابي بمحراب المسجد'), 'تخصيص ترويسة "حلقاتي وطلابي" للمعلم في DashboardLayout');

  const teacherCirclesStudentsContent = fs.readFileSync(path.join(process.cwd(), 'pages/TeacherCirclesStudents.tsx'), 'utf-8');
  assert(teacherCirclesStudentsContent.includes('StudentDetailModal'), 'ربط نافذة خريطة الأجزاء والتفاصيل بصفحة الحلقات والطلاب');
  assert(teacherCirclesStudentsContent.includes('QuickRecitationModal'), 'ربط نافذة التسميع المباشر بصفحة الحلقات والطلاب');
  assert(teacherCirclesStudentsContent.includes('handleExportCSV'), 'توفير ميزة تصدير كشف الطلاب إلى CSV');

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة الفحص للمرحلة الفرعية 8.2: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage8Phase2Verification().catch((err) => {
  console.error('فشل غير متوقع في الفحص:', err);
  process.exit(1);
});

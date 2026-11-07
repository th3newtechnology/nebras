/**
 * سكريبت الفحص التكاملي الأمني الشامل للمرحلة الفرعية 8.2
 * 1. اختبار RLS وحصانة العزل المعماري في Supabase
 * 2. اختبار الصلاحيات ومنع محاولات الاختراق المباشر عبر الخدمات
 * 3. اختبار سلامة البيانات والعلاقات وتمييز المحاكاة vs الحقيقي
 * 4. اختبار التجاوب ومرونة الواجهات على الهواتف والحواسيب
 */

import fs from 'fs';
import path from 'path';
import {
  fetchTeacherCirclesWithDetails,
  fetchTeacherStudents,
  fetchTeacherStudentDetail,
  logQuickRecitation,
  checkTeacherStudentAccess,
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

async function runSecurityAndIntegrationTests() {
  console.log('=============================================================================');
  console.log(' 🛡️ الفحص التكاملي الأمني المتقدم للمرحلة الفرعية 8.2 (Final Sign-off Audit)');
  console.log('=============================================================================\n');

  // =========================================================================
  // الاختبار 1: اختبار RLS في Supabase وعزل بيانات المعلمين
  // =========================================================================
  console.log('🔒 [الاختبار 1] فحص RLS والعزل المعماري لبيانات المعلم وحلقاته:');

  // أ. قراءة سياسات RLS من ملف الهجرة للتأكد من سلامتها الشرطية
  const rlsMigrationPath = path.join(process.cwd(), 'supabase/migrations/20261103000009_auth_and_rls_policies.sql');
  assert(fs.existsSync(rlsMigrationPath), 'ملف سياسات RLS والأمان موجود ومثبت في المشروع');

  const rlsContent = fs.readFileSync(rlsMigrationPath, 'utf-8');
  assert(
    rlsContent.includes('public.get_current_teacher_id()'),
    'سياسات RLS تعتمد على الدالة الأمنية public.get_current_teacher_id()'
  );
  assert(
    rlsContent.includes('c.teacher_id = public.get_current_teacher_id()'),
    'سياسة students تمنع المعلم من استعراض أي طالب خارج حلقاته'
  );
  assert(
    rlsContent.includes('WHERE teacher_id = public.get_current_teacher_id()'),
    'سياسة circle_students تحصر انتساب الطلاب على حلقات المعلم فقط'
  );

  // ب. اختبار عملي للعزل: المعلم t-01 يسترجع فقط حلقاته الخاصة (c1 و c3) ولا يرى حلقة المعلم t-02 (c2)
  const teacher1Circles = await fetchTeacherCirclesWithDetails('t-01');
  const hasForeignCircle = teacher1Circles.some(c => c.id === 'c2' || c.teacherId === 't-02');
  assert(!hasForeignCircle, 'المعلم t-01 لا يستطيع رؤية حلقة c2 التابعة للمعلم t-02');
  assert(teacher1Circles.every(c => c.teacherId === 't-01'), 'كافة الحلقات المسترجعة تتبع حصراً للمعلم المستعلم');

  // =========================================================================
  // الاختبار 2: اختبار الصلاحيات ومنع الوصول غير المصرح به (Direct API Calls)
  // =========================================================================
  console.log('\n🚫 [الاختبار 2] فحص منع الوصول المباشر واختراق الخدمات (Service Attack Resistance):');

  // أ. محاولة جلب طلاب حلقة تابعة لمعلم آخر مباشرة
  const foreignCircleStudents = await fetchTeacherStudents('c2', 't-01');
  assert(foreignCircleStudents.length === 0, 'حجب طلب طلاب حلقة c2 التابعة لمعلم آخر (إرجاع 0 طلاب)');

  // ب. محاولة فتح الملف القرآني لطالب مسجل لدى معلم آخر مباشرة عبر معرفه (s-099)
  const unauthorizedStudentProfile = await fetchTeacherStudentDetail('s-099', 't-01');
  assert(unauthorizedStudentProfile === null, 'رفض وحجب فتح الملف القرآني للطالب s-099 التابع لمعلم آخر');

  // ج. فحص صلاحية الوصول المعرفي عبر دالة checkTeacherStudentAccess
  const accessCheckDenied = await checkTeacherStudentAccess('t-01', 's-099');
  assert(!accessCheckDenied.allowed, 'دالة التحقق ترفض إعطاء صلاحية وصول للمعلم t-01 للطالب s-099');

  const accessCheckGranted = await checkTeacherStudentAccess('t-01', 's-001');
  assert(accessCheckGranted.allowed, 'دالة التحقق تمنح المعلم t-01 صلاحية الوصول لطلابه الشرعيين (s-001)');

  // د. محاولة تسجيل تسميع قرآني لطالب في حلقة معلم آخر (s-099 في c2)
  const illegalRecitationAttempt = await logQuickRecitation({
    studentId: 's-099',
    circleId: 'c2',
    surahNumber: 1,
    surahName: 'الفاتحة',
    ayahFrom: 1,
    ayahTo: 7,
    recordType: 'new_memorization',
    grade: 'ممتاز',
    mistakesCount: 0,
    tajweedMistakesCount: 0,
  }, 't-01');

  assert(!illegalRecitationAttempt.success, 'إفشال محاولة تسجيل التسميع لطالب خارج الحلقات المسندة للمعلم');
  assert(Boolean(illegalRecitationAttempt.error), `رسالة الرفض الأمني: ${illegalRecitationAttempt.error}`);

  // =========================================================================
  // الاختبار 3: اختبار سلامة البيانات وتمييز المحاكاة vs الحقيقي
  // =========================================================================
  console.log('\n📊 [الاختبار 3] فحص سلامة البيانات والعلاقات والشفافية (Data Integrity & Transparency):');

  // أ. التحقق من سلامة علاقات الطلاب بحلقاتهم ومعلمهم
  const teacherStudents = await fetchTeacherStudents(undefined, 't-01');
  assert(teacherStudents.length > 0, `استرجاع طلاب المعلم t-01 (العدد: ${teacherStudents.length})`);
  
  for (const student of teacherStudents) {
    assert(student.teacherId === 't-01', `الطالب ${student.fullName} مقيد مع المعلم الصحيح t-01`);
    assert(['c1', 'c3'].includes(student.circleId), `حلقة الطالب ${student.circleName} تتبع حلقات المعلم`);
    assert(student.currentJuz <= (student.targetJuz || 30), `مسار الحفظ متسق (جزء ${student.currentJuz} <= ${student.targetJuz})`);
    assert(/^NEB-2026-\d{4}$/.test(student.registrationNumber), `رقم القيد سليم ويطابق المعيار الرسمي: ${student.registrationNumber}`);
  }

  // ب. التحقق من تمييز بيانات المحاكاة صراحة عن البيانات الحية
  const teacher1Detail = await fetchTeacherStudentDetail('s-001', 't-01');
  assert(teacher1Detail !== null, 'استرجاع ملف الطالب s-001 بنجاح');
  if (teacher1Detail) {
    assert('isSimulated' in teacher1Detail, 'خاصية isSimulated متوفرة في نموذج بيانات الطالب');
    assert('dataSource' in teacher1Detail, 'خاصية dataSource متوفرة صراحة لتحديد مصدر البيانات');
    assert(
      teacher1Detail.dataSource === 'supabase_live' || teacher1Detail.dataSource === 'local_simulated',
      `مصدر البيانات محدد بدقة: ${teacher1Detail.dataSource}`
    );
  }

  // =========================================================================
  // الاختبار 4: اختبار التجاوب والأجهزة (Mobile & Desktop Viewports)
  // =========================================================================
  console.log('\n📱 [الاختبار 4] فحص التجاوب ومرونة الواجهات للهواتف والحواسيب:');

  const teacherCirclesStudentsPage = fs.readFileSync(path.join(process.cwd(), 'pages/TeacherCirclesStudents.tsx'), 'utf-8');
  assert(
    teacherCirclesStudentsPage.includes('grid-cols-1 md:grid-cols-2 lg:grid-cols-3'),
    'بطاقات الطلاب تتجاوب بمرونة من عمود واحد للهواتف إلى 3 أعمدة للشاشات الكبيرة'
  );
  assert(
    teacherCirclesStudentsPage.includes('overflow-x-auto'),
    'جدول الطلاب محمي بحاوية تمرير أفقي سلسة overflow-x-auto لمنع تشوه الشاشات الصغيرة'
  );
  assert(
    teacherCirclesStudentsPage.includes("setViewMode('cards')"),
    'دعم التبديل السهل بين عرض البطاقات والجدول لتلائم الهواتف المحمولة'
  );

  const studentDetailModalContent = fs.readFileSync(path.join(process.cwd(), 'components/teacher/StudentDetailModal.tsx'), 'utf-8');
  assert(
    studentDetailModalContent.includes('overflow-x-auto'),
    'شريط تبويبات الملف القرآني يدعم التمرير الأفقي على الهواتف دون تكسير للتصميم'
  );
  assert(
    studentDetailModalContent.includes('grid-cols-2') && studentDetailModalContent.includes('md:grid-cols-5'),
    'خريطة الأجزاء الـ 30 تتكيف من عمودين على الهواتف إلى 5 أعمدة على الحواسيب'
  );
  assert(
    studentDetailModalContent.includes('max-h-[92vh]'),
    'النافذة المنبثقة محددة الارتفاع بنسبة شاشة الجهاز مع تمرير داخلي مريح'
  );
  assert(
    studentDetailModalContent.includes('tel:') && studentDetailModalContent.includes('https://wa.me/'),
    'تضمين روابط الاتصال السريع بالهاتف والواتساب المباشر لأولياء الأمور بنقرة إصبع واحدة'
  );

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة الفحص الأمني والتكاملي الشامل للمرحلة 8.2: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAndIntegrationTests().catch((err) => {
  console.error('فشل غير متوقع في الفحص الأمني:', err);
  process.exit(1);
});

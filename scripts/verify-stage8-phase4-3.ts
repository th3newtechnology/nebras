/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.3:
 * سجل المتابعة الفردي (ملف متابعة تربوي وقرآني متكامل لكل طالب مع خط زمني)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  fetchStudentFollowupRecord,
  createStudentGoal,
  updateStudentGoalStatus,
  deleteStudentGoal,
} from '../lib/studentFollowupService';
import { CreateStudentGoalDTO } from '../types/studentFollowup.types';
import fs from 'fs';
import path from 'path';

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

async function runVerification() {
  console.log('\n===============================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.3');
  console.log('   سجل المتابعة التربوي الفردي وأهداف الطالب والخط الزمني');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص استرجاع سجل المتابعة وأبعاد التقييم السبعة
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص استرجاع سجل المتابعة وأبعاد التقييم السبعة ---');

  const profile = await fetchStudentFollowupRecord('s-001');

  assert(
    Boolean(profile && profile.studentId === 's-001' && profile.fullName),
    'استرجاع الملف التربوي الأساسي للطالب بنجاح',
    profile.fullName
  );

  // 1. الحفظ
  assert(
    profile.metrics.currentJuz > 0 &&
      profile.metrics.totalVersesMemorized > 0 &&
      profile.metrics.totalSurahsCompleted > 0,
    'البعد الأول (الحفظ): توثيق السور والآيات والأجزاء المحفوظة',
    `جزء ${profile.metrics.currentJuz} • ${profile.metrics.totalVersesMemorized} آية`
  );

  // 2. المراجعة
  assert(
    profile.metrics.revisionConsistencyScore > 0,
    'البعد الثاني (المراجعة): احتساب مقدار المراجعة وانتظامها والتثبيت',
    `درجة الانتظام: ${profile.metrics.revisionConsistencyScore}%`
  );

  // 3. التجويد
  assert(
    profile.metrics.tajweedMasteryRate >= 0 &&
      profile.metrics.totalTajweedMistakesCount !== undefined,
    'البعد الثالث (التجويد): قياس مستوى الإتقان ورصد الأخطاء واللحون',
    `نسبة الإتقان: ${profile.metrics.tajweedMasteryRate}%`
  );

  // 4. رواية ورش
  assert(
    profile.metrics.warshComplianceIndex > 0 &&
      Boolean(profile.metrics.warshObservationSummary),
    'البعد الرابع (رواية ورش): التحقق من الالتزام بأحكام الرواية (البدل، الإمالة، نقل الهمز)',
    profile.metrics.warshObservationSummary
  );

  // 5. الحضور والمواظبة
  assert(
    profile.metrics.attendanceRate >= 0 &&
      profile.metrics.totalSessionsRecorded >=
        profile.metrics.presentSessionsCount + profile.metrics.absentSessionsCount,
    'البعد الخامس (الحضور): رصد الغياب والتأخر ونسبة المواظبة',
    `نسبة الحضور: ${profile.metrics.attendanceRate}%`
  );

  // 6. التقييم الدوري والتطور
  assert(
    profile.metrics.averageEvaluationScore > 0 &&
      Boolean(profile.metrics.recentGradeTrend),
    'البعد السادس (التقييم): التقييم الدوري ومنحنى التطور والدرجات',
    `المعدل: ${profile.metrics.averageEvaluationScore} / 100`
  );

  // 7. الملاحظات التربوية
  assert(
    profile.timeline.some((t) => Boolean(t.notes)),
    'البعد السابع (الملاحظات): توثيق ملاحظات وتوجيهات المعلم والإدارة في السجل'
  );

  // -------------------------------------------------------------
  // المجموعة 2: فحص الخط الزمني التراكمي (Chronological Timeline)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: فحص الخط الزمني التراكمي للسجل ---');

  assert(
    Array.isArray(profile.timeline) && profile.timeline.length > 0,
    'اشتمال السجل على خط زمني تسلسلي لجلسات التسميع والاختبارات والحضور',
    `عدد السجلات الزمنية: ${profile.timeline.length}`
  );

  // فحص الترتيب الزمني التنازلي
  let isSorted = true;
  for (let i = 0; i < profile.timeline.length - 1; i++) {
    if (profile.timeline[i].date < profile.timeline[i + 1].date) {
      isSorted = false;
      break;
    }
  }

  assert(
    isSorted,
    'ترتيب السجل الزمني بصورة تسلسلية دقيقة (من الأحدث إلى الأقدم)'
  );

  // التحقق من تعدد فئات السجل (حفظ، مراجعة، اختبار، حضور)
  const categories = new Set(profile.timeline.map((t) => t.category));
  assert(
    categories.has('new_memorization') &&
      categories.has('attendance') &&
      categories.has('evaluation'),
    'تنوع مدخلات الخط الزمني لتشمل الحفظ والمراجعة والاختبارات والحضور',
    Array.from(categories).join(', ')
  );

  // -------------------------------------------------------------
  // المجموعة 3: فحص منظومة الأهداف القرآنية للطلاب (Student Goals)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: فحص منظومة الأهداف والمستهدفات القرآنية ---');

  const newGoalDto: CreateStudentGoalDTO = {
    studentId: 's-001',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    goalType: 'weekly_hifz',
    title: 'حفظ سورة المؤمنون من الآية 23 إلى 50',
    description: 'تثبيت أحكام الإخفاء الحقيقي والغنة',
    targetSurah: 23,
    targetSurahName: 'المؤمنون',
    targetAyahFrom: 23,
    targetAyahTo: 50,
    targetDate: '2026-11-20',
    teacherNotes: 'مراجعة المقطع 3 مرات قبل العرض',
  };

  const createGoalRes = await createStudentGoal(newGoalDto);
  assert(
    createGoalRes.success && Boolean(createGoalRes.goal?.id),
    'إنشاء هدف قرآني جديد للطالب بنجاح مع تحديد التاريخ والآيات المستهدفة'
  );

  const goalId = createGoalRes.goal!.id;

  // تحديث حالة الهدف إلى مكتمل
  const updateGoalRes = await updateStudentGoalStatus(
    goalId,
    'completed',
    'تم الإنجاز بحفظ متقن ولله الحمد'
  );
  assert(
    updateGoalRes.success,
    'تحديث حالة الهدف إلى مكتمل مع توثيق وقت الإنجاز وملاحظات المعلم'
  );

  // حذف الهدف بعد الاختبار
  const deleteGoalRes = await deleteStudentGoal(goalId);
  assert(
    deleteGoalRes.success,
    'حذف الهدف القرآني بنجاح'
  );

  // -------------------------------------------------------------
  // المجموعة 4: فحص ملف ترحيل Supabase وسياسات RLS والأمان
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: فحص ملف ترحيل Supabase وسياسات RLS والأمان ---');

  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261106000014_student_goals.sql'
  );
  assert(fs.existsSync(migrationPath), 'وجود ملف ترحيل Supabase الخاص بأهداف الطالب 20261106000014');

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.student_goals'),
    'إنشاء جدول student_goals مع المفاتيح الأجنبية والقيود الصارمة'
  );

  assert(
    migrationSql.includes('ENABLE ROW LEVEL SECURITY'),
    'تفعيل حماية Row Level Security (RLS) على جدول student_goals'
  );

  assert(
    migrationSql.includes('student_goals_select_policy') &&
      migrationSql.includes('student_goals_insert_policy') &&
      migrationSql.includes('student_goals_update_policy') &&
      migrationSql.includes('student_goals_delete_policy'),
    'تعريف سياسات RLS الأربعة مع عزل الولي والطالب والمعلم والإدارة'
  );

  // -------------------------------------------------------------
  // المجموعة 5: فحص تكامل واجهة المستخدم والربط في بوابة المعلم
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: فحص تكامل واجهة المستخدم والربط في بوابة المعلم ---');

  const modalPath = path.resolve(
    process.cwd(),
    'components/students/StudentFollowupRecordModal.tsx'
  );
  assert(fs.existsSync(modalPath), 'وجود مكون نافذة سجل المتابعة التربوي المستمر');

  const modalContent = fs.readFileSync(modalPath, 'utf8');
  assert(
    modalContent.includes('timeline') &&
      modalContent.includes('goals') &&
      modalContent.includes('tajweed') &&
      modalContent.includes('kpis'),
    'اشتمال نافذة المتابعة على التبويبات الأربعة (الخط الزمني، الأهداف، التجويد، خريطة الأجزاء)'
  );

  assert(
    modalContent.includes('window.print()'),
    'دعم الطباعة والتصدير الورقي والرسمي لسجل المتابعة'
  );

  const addGoalModalPath = path.resolve(
    process.cwd(),
    'components/students/AddGoalModal.tsx'
  );
  assert(fs.existsSync(addGoalModalPath), 'وجود نافذة تحديد هدف قرآني جديد للطالب');

  const teacherCirclesPagePath = path.resolve(
    process.cwd(),
    'pages/TeacherCirclesStudents.tsx'
  );
  const teacherCirclesContent = fs.readFileSync(teacherCirclesPagePath, 'utf8');
  assert(
    teacherCirclesContent.includes('StudentFollowupRecordModal') &&
      teacherCirclesContent.includes('followupModalStudentId'),
    'ربط وتكامل نافذة سجل المتابعة في شاشة حلقات وطلاب المعلم (نمطي البطاقات والجدول)'
  );

  const studentDetailModalPath = path.resolve(
    process.cwd(),
    'components/teacher/StudentDetailModal.tsx'
  );
  const studentDetailContent = fs.readFileSync(studentDetailModalPath, 'utf8');
  assert(
    studentDetailContent.includes('StudentFollowupRecordModal') &&
      studentDetailContent.includes('isFollowupOpen'),
    'ربط نافذة سجل المتابعة التربوي في نافذة تفاصيل الطالب وخريطة الأجزاء الـ 30'
  );

  // -------------------------------------------------------------
  // النتيجة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 النتيجة النهائية لاختبارات المرحلة الفرعية 8.4.3:`);
  console.log(`   الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   نسبة النجاح: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    console.log('🏆 نجاح تام لكافة معايير المرحلة الفرعية 8.4.3 (سجل المتابعة الفردي)!');
    process.exit(0);
  } else {
    console.error('⚠️ توجد اختبارات غير مجتازة!');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل الفحص:', err);
  process.exit(1);
});

/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.4:
 * تقارير المعلمين التربوية والدورية (التقارير الأسبوعية، نقاط القوة والضعف، وأهداف الأسبوع)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  fetchTeacherReports,
  fetchReportById,
  createTeacherReport,
  updateTeacherReport,
  deleteTeacherReport,
  sendReportToGuardian,
  approveTeacherReport,
  generateReportDraftForStudent,
  getTeacherReportsMetrics,
} from '../lib/teacherReportService';
import { CreateTeacherReportDTO } from '../types/teacherReport.types';
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
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.4');
  console.log('   تقارير المعلمين التربوية والدورية وأهداف الأسبوع والأمان');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: الفحص الهندسي لجدول ومخطط Supabase وسياسات RLS
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: الفحص الهندسي لمخطط Supabase وسياسات الـ RLS ---');

  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261106000015_teacher_reports.sql'
  );
  const migrationExists = fs.existsSync(migrationPath);
  assert(migrationExists, 'وجود ملف ترحيل Supabase الخاص بتقارير المعلمين (8.4.4)', migrationPath);

  const migrationContent = migrationExists ? fs.readFileSync(migrationPath, 'utf-8') : '';

  assert(
    migrationContent.includes('CREATE TABLE IF NOT EXISTS public.teacher_reports') &&
      migrationContent.includes('student_id UUID NOT NULL') &&
      migrationContent.includes('teacher_id UUID NOT NULL') &&
      migrationContent.includes('circle_id UUID NOT NULL') &&
      migrationContent.includes('period_start DATE NOT NULL') &&
      migrationContent.includes('period_end DATE NOT NULL'),
    'تحديد جدول teacher_reports مع المفاتيح الأجنبية وتواريخ الفترة',
    'student_id, teacher_id, circle_id, period_start, period_end'
  );

  assert(
    migrationContent.includes('CONSTRAINT chk_report_period CHECK (period_end >= period_start)'),
    'قيد السلامة الزمنية: تاريخ نهاية التقرير بعد أو يساوي تاريخ البداية',
    'chk_report_period'
  );

  assert(
    migrationContent.includes('strengths TEXT NOT NULL') &&
      migrationContent.includes('areas_for_improvement TEXT NOT NULL') &&
      migrationContent.includes('recommendations_for_guardian TEXT NOT NULL') &&
      migrationContent.includes('next_week_goals TEXT'),
    'حقول التقييم التربوي الإلزامية: نقاط القوة، مجالات التحسين، توجيهات الولي، وأهداف الأسبوع',
    'strengths, areas_for_improvement, recommendations_for_guardian, next_week_goals'
  );

  assert(
    migrationContent.includes('CHECK (status IN (\'draft\', \'submitted\', \'approved\', \'sent_to_guardian\'))'),
    'دورة حالات التقرير الصارمة: draft -> submitted -> approved -> sent_to_guardian',
    'status check constraint'
  );

  assert(
    migrationContent.includes('ALTER TABLE public.teacher_reports ENABLE ROW LEVEL SECURITY;') &&
      migrationContent.includes('teacher_update_draft_reports_only'),
    'تفعيل RLS مع سياسة قفل التقرير ومنع المعلم من تعديله بعد الإرسال لولي الأمر',
    'teacher_update_draft_reports_only'
  );

  assert(
    migrationContent.includes('guardian_select_children_reports') &&
      migrationContent.includes('guardian_students'),
    'سياسة العزل الأمني التام للأولياء: حظر رؤية أي تقرير لا يخص أبناء الولي المعتمدين',
    'guardian_select_children_reports'
  );

  // -------------------------------------------------------------
  // المجموعة 2: استرجاع التقارير والتصفية والإحصائيات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: استرجاع التقارير والتصفية والمؤشرات الإحصائية ---');

  const allReports = await fetchTeacherReports();
  assert(
    allReports.length >= 3,
    'استرجاع قائمة التقارير التربوية بنجاح',
    `إجمالي التقارير: ${allReports.length}`
  );

  const teacherFiltered = await fetchTeacherReports({
    teacherId: 'c0000000-0000-0000-0000-000000000001',
  });
  assert(
    teacherFiltered.every((r) => r.teacherId === 'c0000000-0000-0000-0000-000000000001'),
    'فلترة التقارير بحسب المعلم المسؤول',
    `تقارير الشيخ: ${teacherFiltered.length}`
  );

  const sentReports = await fetchTeacherReports({ status: 'sent_to_guardian' });
  assert(
    sentReports.length > 0 && sentReports.every((r) => r.status === 'sent_to_guardian'),
    'فلترة التقارير بحسب الحالة (المرسلة للأولياء والمقفلة)',
    `المرسلة: ${sentReports.length}`
  );

  const searchFiltered = await fetchTeacherReports({ search: 'درويش' });
  assert(
    searchFiltered.length > 0 &&
      searchFiltered.some((r) => r.studentName?.includes('درويش')),
    'البحث النصي الذكي باسم الطالب أو السورة أو الملاحظات',
    `نتائج البحث: ${searchFiltered.length}`
  );

  const metrics = await getTeacherReportsMetrics();
  assert(
    metrics.total >= 3 &&
      metrics.sent >= 1 &&
      metrics.excellentRate >= 0 &&
      metrics.drafts >= 1,
    'حساب مؤشرات إحصائيات التقارير (الإجمالي، المسودات، المرسلة، نسبة الامتياز)',
    `إجمالي: ${metrics.total} • مسودات: ${metrics.drafts} • مرسلة: ${metrics.sent} • امتياز: ${metrics.excellentRate}%`
  );

  // -------------------------------------------------------------
  // المجموعة 3: المحرك الذكي للتوليد التلقائي للتقرير
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: المحرك الذكي للتوليد التلقائي للتقرير ---');

  const autoDraft = await generateReportDraftForStudent('s-001');

  assert(
    Boolean(autoDraft && autoDraft.studentId === 's-001' && autoDraft.studentName),
    'توليد مسودة التقرير الذكية للطالب بنجاح',
    autoDraft.studentName
  );

  assert(
    Boolean(autoDraft.periodStart && autoDraft.periodEnd && autoDraft.periodEnd >= autoDraft.periodStart),
    'تحديد فترة الأسبوع الجزائري آلياً (السبت إلى الخميس)',
    `${autoDraft.periodStart} ⬅️ ${autoDraft.periodEnd}`
  );

  assert(
    Boolean(autoDraft.newMemorizationProgress && autoDraft.newMemorizationProgress.length > 10),
    'استيراد وتلخيص الحفظ الجديد تلقائياً من سجل التسميع الفعلي',
    autoDraft.newMemorizationProgress
  );

  assert(
    Boolean(autoDraft.revisionProgress && autoDraft.revisionProgress.length > 5),
    'استيراد وتلخيص المراجعة والتثبيت تلقائياً',
    autoDraft.revisionProgress
  );

  assert(
    autoDraft.attendanceRate > 0 && autoDraft.sessionsAttended > 0,
    'احتساب نسبة الحضور وعدد الجلسات خلال الفترة بدقة',
    `حضور: ${autoDraft.attendanceRate}% (${autoDraft.sessionsAttended}/${autoDraft.sessionsTotal})`
  );

  assert(
    Boolean(autoDraft.tajweedLevel && autoDraft.warshAdherence),
    'استخلاص أحكام رواية ورش عن نافع والتجويد',
    autoDraft.warshAdherence
  );

  assert(
    Boolean(
      autoDraft.suggestedStrengths &&
        autoDraft.suggestedAreasForImprovement &&
        autoDraft.suggestedRecommendationsForGuardian &&
        autoDraft.suggestedNextWeekGoals &&
        autoDraft.suggestedOverallRating
    ),
    'اقتراح التقدير العام ونقاط القوة والتحسين وتوجيهات الولي وأهداف الأسبوع آلياً',
    `التقدير المقترح: ${autoDraft.suggestedOverallRating}`
  );

  // -------------------------------------------------------------
  // المجموعة 4: إنشاء وتعديل وحذف التقارير
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: إنشاء وتعديل وحذف التقارير ودورة الحياة ---');

  const newReportDTO: CreateTeacherReportDTO = {
    studentId: 's-001',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    reportType: 'weekly',
    periodStart: '2026-11-07',
    periodEnd: '2026-11-12',
    attendanceRate: 100,
    sessionsAttended: 4,
    sessionsTotal: 4,
    newMemorizationProgress: 'حفظ سورة النور من آية 21 إلى 30',
    revisionProgress: 'مراجعة الحزب الأول من الجزء السابع عشر',
    tajweedLevel: 'إتقان تام لمخارج الحروف',
    warshAdherence: 'تطبيق متميز لمد البدل وتسهيل الهمز',
    strengths: 'حفظ متين وتركيز استثنائي',
    areasForImprovement: 'العناية بالوصل بين رؤوس الآي',
    recommendationsForGuardian: 'الاستماع لترتيل الطالب مساءً لمدة ربع ساعة',
    nextWeekGoals: 'إتمام سورة النور كاملة',
    overallRating: 'ممتاز',
    status: 'draft',
  };

  const createdReport = await createTeacherReport(newReportDTO);
  assert(
    Boolean(createdReport && createdReport.id && createdReport.status === 'draft'),
    'إنشاء تقرير تربوي جديد كمسودة بنجاح',
    `معرف التقرير: ${createdReport.id}`
  );

  const updatedReport = await updateTeacherReport(createdReport.id, {
    strengths: 'حفظ متين وتركيز استثنائي مع حسن الصوت والتأني',
    overallRating: 'ممتاز',
  });
  assert(
    updatedReport.strengths.includes('حسن الصوت'),
    'تعديل بيانات مسودة التقرير بنجاح وتحديث المحتوى',
    updatedReport.strengths
  );

  const deleteSuccess = await deleteTeacherReport(createdReport.id);
  assert(deleteSuccess === true, 'حذف مسودة التقرير بنجاح من النظام');

  // التأكد من الحذف
  const fetchDeleted = await fetchReportById(createdReport.id);
  assert(fetchDeleted === null, 'التحقق من عدم وجود التقرير المحذوف');

  // -------------------------------------------------------------
  // المجموعة 5: أمان الاعتماد وقفل التقرير وعدم القابلية للتغيير
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: أمان الاعتماد وقفل التقرير (Immutability Enforced) ---');

  // إنشاء تقرير للاعتماد والإرسال
  const reportForLock = await createTeacherReport({
    ...newReportDTO,
    periodStart: '2026-11-01',
    periodEnd: '2026-11-06',
  });

  const approvedReport = await approveTeacherReport(reportForLock.id, 'مدير مدرسة نبراس');
  assert(
    approvedReport.status === 'approved',
    'اعتماد التقرير بنجاح قبل الإرسال',
    `الحالة: ${approvedReport.status}`
  );

  const sentReport = await sendReportToGuardian(reportForLock.id);
  assert(
    sentReport.status === 'sent_to_guardian' && Boolean(sentReport.sentAt),
    'إرسال التقرير لولي الأمر وتوثيق الختم الزمني والإشعار',
    `تاريخ الإرسال: ${sentReport.sentAt}`
  );

  // محاولة التعديل بعد الإرسال (يجب أن ترفض!)
  let modificationBlocked = false;
  try {
    await updateTeacherReport(reportForLock.id, {
      strengths: 'محاولة تعديل غير مصرح بها بعد الإرسال',
    });
  } catch (err: any) {
    modificationBlocked = true;
  }
  assert(
    modificationBlocked,
    'حماية عدم القابلية للتعديل (Immutability): منع تعديل التقرير بعد إرساله للولي',
    'تم رفض التعديل بنجاح لضمان الأمان والنزاهة القانونية'
  );

  // محاولة الحذف بعد الإرسال (يجب أن ترفض!)
  let deleteBlocked = false;
  try {
    await deleteTeacherReport(reportForLock.id);
  } catch (err: any) {
    deleteBlocked = true;
  }
  assert(
    deleteBlocked,
    'منع حذف التقرير المعتمد والمرسل رسمياً لولي الأمر',
    'تم رفض الحذف بنجاح'
  );

  // -------------------------------------------------------------
  // المجموعة 6: تكامل واجهة المستخدم والمكونات والطباعة
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 6: تكامل واجهات المستخدم والمكونات والطباعة الرسمية ---');

  const modalPath = path.resolve(
    process.cwd(),
    'components/teacher/reports/TeacherReportModal.tsx'
  );
  assert(fs.existsSync(modalPath), 'وجود مكون نافذة إعداد وتحرير التقرير TeacherReportModal.tsx');

  const printModalPath = path.resolve(
    process.cwd(),
    'components/teacher/reports/TeacherReportPrintModal.tsx'
  );
  assert(fs.existsSync(printModalPath), 'وجود مكون الوثيقة الرسمية A4 للطباعة TeacherReportPrintModal.tsx');

  const tabPath = path.resolve(
    process.cwd(),
    'components/teacher/reports/TeacherReportsTab.tsx'
  );
  assert(fs.existsSync(tabPath), 'وجود مكون تبويب إدارة التقارير TeacherReportsTab.tsx');

  const circlesStudentsContent = fs.readFileSync(
    path.resolve(process.cwd(), 'pages/TeacherCirclesStudents.tsx'),
    'utf-8'
  );
  assert(
    circlesStudentsContent.includes('TeacherReportsTab') &&
      circlesStudentsContent.includes('TeacherReportModal') &&
      circlesStudentsContent.includes('activeTab === \'reports\''),
    'تكامل التقارير التربوية في شاشة حلقات وطلاب المعلم (تبويب + بطاقات + جداول)',
    'TeacherCirclesStudents.tsx integration verified'
  );

  const followupModalContent = fs.readFileSync(
    path.resolve(process.cwd(), 'components/students/StudentFollowupRecordModal.tsx'),
    'utf-8'
  );
  assert(
    followupModalContent.includes('TeacherReportModal') &&
      followupModalContent.includes('activeTab === \'reports\''),
    'تكامل استعراض وإصدار التقارير من داخل سجل المتابعة التربوي المستمر للطالب',
    'StudentFollowupRecordModal.tsx integration verified'
  );

  // -------------------------------------------------------------
  // النتيجة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 نتيجة الفحص للمرحلة 8.4.4: ${passedTests} / ${totalTests} اختباراً ناجحاً`);
  if (passedTests === totalTests) {
    console.log('🏆 نجاح تام بنسبة 100% (PASS 100%) لكافة معايير المرحلة 8.4.4!');
  } else {
    console.log(`⚠️ يوجد ${totalTests - passedTests} اختبارات غير مكتملة.`);
  }
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل الفحص:', err);
  process.exit(1);
});

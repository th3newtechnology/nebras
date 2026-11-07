/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.8:
 * لوحة الإدارة والرقابة الشاملة (مؤشرات الأداء، نسبة الحضور، رصد الطلاب المتعثرين، وفحص التعارضات)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  fetchExecutiveOversightMetrics,
  fetchStrugglingStudentsWatchlist,
  fetchStandoutStudentsWatchlist,
  fetchHallsOccupancyAudit,
  fetchTeachersWorkflowAudit,
  fetchScheduleExceptionsAudit,
  dispatchInterventionNotice,
} from '../lib/adminOversightService';
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
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.8');
  console.log('   لوحة الإدارة والرقابة الشاملة وجودة التحفيظ والتحقق من التعارض');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: المؤشرات الكلية وتبعية مسجد إبراهيم الخليل
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: المؤشرات الكلية وتبعية مسجد إبراهيم الخليل ---');

  const { metrics } = await fetchExecutiveOversightMetrics();
  assert(
    metrics !== undefined && metrics.totalActiveStudents > 0,
    'استرجاع المؤشرات الرقابية الكلية للمدرسة بنجاح',
    `إجمالي الطلاب النشطين: ${metrics.totalActiveStudents}`
  );

  assert(
    metrics.mosqueAffiliation.includes('مسجد إبراهيم الخليل'),
    'تأكيد التبعية والربط الرسمي بمسجد إبراهيم الخليل',
    `التبعية: ${metrics.mosqueAffiliation}`
  );

  assert(
    metrics.schoolAttendanceRate >= 80 && metrics.schoolAttendanceRate <= 100,
    'احتساب نسبة المواظبة المدرسية الكلية بنسق مئوي دقيق',
    `نسبة الحضور: ${metrics.schoolAttendanceRate}%`
  );

  assert(
    metrics.unresolvedConflictsCount === 0,
    'نظام الإنذار المبكر: خلو قاعات المسجد وجداول الحلقات من أي تعارض نشط (100% Conflict-Free)',
    `التعارضات النشطة: ${metrics.unresolvedConflictsCount}`
  );

  assert(
    metrics.reportsApprovedRate >= 80,
    'رصد نسبة اعتماد تقارير المعلمين وسير دورة التقارير التربوية',
    `نسبة الاعتماد: ${metrics.reportsApprovedRate}%`
  );

  // -------------------------------------------------------------
  // المجموعة 2: خوارزمية رصد وتصنيف الطلاب المتعثرين (Watchlist)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: خوارزمية رصد وتصنيف الطلاب المتعثرين ---');

  const { students: strugglingList } = await fetchStrugglingStudentsWatchlist();
  assert(
    strugglingList.length > 0,
    'رصد وحصر قائمة الطلاب المتعثرين بنجاح لاستهدافهم بالتدخل التربوي',
    `عدد المتعثرين المرصودين: ${strugglingList.length}`
  );

  const sampleStruggling = strugglingList[0];
  assert(
    sampleStruggling.attendanceRate < 75 || sampleStruggling.behaviorScore < 75,
    'مطابقة معايير الرصد الآلي للتعثر (حضور أقل من 75% أو سلوك ومواظبة منخفضة)',
    `طالب: ${sampleStruggling.name} • نسبة الحضور: ${sampleStruggling.attendanceRate}%`
  );

  assert(
    sampleStruggling.primaryAlert !== undefined && sampleStruggling.primaryAlert.length > 10,
    'توليد نص تنبيه تشخيصي دقيق يشرح سبب التعثر القرآني أو السلوكي',
    `التنبيه: ${sampleStruggling.primaryAlert}`
  );

  assert(
    sampleStruggling.interventionPlan !== undefined && sampleStruggling.interventionPlan.length > 10,
    'اقتراح خطة علاجية وتدخل تربوي محدد لمعالجة تعثر الطالب',
    `الخطة: ${sampleStruggling.interventionPlan}`
  );

  // تصفية حسب الحلقة
  const { students: circleFiltered } = await fetchStrugglingStudentsWatchlist({
    circleId: sampleStruggling.circleId,
  });
  assert(
    circleFiltered.every((s) => s.circleId === sampleStruggling.circleId),
    'إتاحة تصفية قائمة المتعثرين حسب الحلقة القرآنية',
    `عدد طلاب الحلقة المتعثرين: ${circleFiltered.length}`
  );

  // -------------------------------------------------------------
  // المجموعة 3: لوحة شرف الطلاب المتفوقين وأشبال الإتقان
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: لوحة شرف الطلاب المتفوقين وأشبال الإتقان ---');

  const { students: standoutList } = await fetchStandoutStudentsWatchlist();
  assert(
    standoutList.length > 0,
    'حصر الطلاب المتميزين والمرشحين لختم القرآن ونيل الإجازات',
    `عدد المتفوقين: ${standoutList.length}`
  );

  const topStudent = standoutList[0];
  assert(
    topStudent.attendanceRate >= 95 && topStudent.behaviorScore >= 90,
    'مطابقة معايير التميز القرآني والانضباط التام (حضور 95%+ وسلوك 90%+)',
    `طالب: ${topStudent.name} • حضور: ${topStudent.attendanceRate}% • أجزاء: ${topStudent.completedAjza}`
  );

  assert(
    topStudent.commendation.includes('ورش') || topStudent.commendation.includes('إتقان'),
    'اشتمال إشادة المحفظ على إتقان رواية ورش عن نافع والأداء الصوتي الندي',
    `الإشادة: ${topStudent.commendation}`
  );

  // -------------------------------------------------------------
  // المجموعة 4: تدقيق إشغال القاعات وتأكيد انعدام التعارضات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: تدقيق إشغال القاعات وتأكيد انعدام التعارضات ---');

  const hallsAuditRes = await fetchHallsOccupancyAudit();
  assert(
    hallsAuditRes.halls.length >= 5,
    'تدقيق قاعات مسجد إبراهيم الخليل الخمس الأساسية (الأرقم، ابن الجزري، نافع، الشاطبي، الصحن)',
    `عدد القاعات المدققة: ${hallsAuditRes.halls.length}`
  );

  assert(
    hallsAuditRes.conflictFree === true,
    'تأكيد السلامة التشغيلية وانعدام أي تعارض زمني أو مكاني بين الحلقات (Conflict Sentinel = PASS)',
    `سلامة القاعات: ${hallsAuditRes.conflictFree}`
  );

  const allHallsSafe = hallsAuditRes.halls.every((h) => !h.hasConflict);
  assert(
    allHallsSafe,
    'خلو كافة قاعات المسجد من تداخل الحصص أو زيادة الإشغال عن السعة القصوى',
    'All halls verified conflict-free'
  );

  // -------------------------------------------------------------
  // المجموعة 5: التزام المحفظين والتدخل الإداري العاجل
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: التزام المحفظين والتدخل الإداري العاجل ---');

  const { workflows } = await fetchTeachersWorkflowAudit();
  assert(
    workflows.length > 0,
    'تدقيق سير عمل المشايخ والمحفظين ونسب التزامهم برفع التقارير',
    `عدد المحفظين المدققين: ${workflows.length}`
  );

  const averageCompliance =
    workflows.reduce((acc, curr) => acc + curr.complianceRate, 0) / workflows.length;
  assert(
    averageCompliance >= 85,
    'متوسط نسبة التزام المشايخ برفع التقارير تتجاوز 85% بنجاح',
    `متوسط الالتزام: ${averageCompliance.toFixed(1)}%`
  );

  const { exceptions } = await fetchScheduleExceptionsAudit();
  assert(
    exceptions.length > 0,
    'استرجاع وتدقيق سجل استثناءات الحصص النشطة بالمسجد مع توثيق الأسباب',
    `عدد الاستثناءات المسجلة: ${exceptions.length}`
  );

  // اختبار التدخل الإداري العاجل
  const interventionResult = await dispatchInterventionNotice({
    studentId: sampleStruggling.id,
    studentName: sampleStruggling.name,
    guardianUserId: sampleStruggling.guardianUserId || 'u-guardian-01',
    message: 'تنبيه إداري رسمي بمتابعة غياب الطالب وحضور لقاء توجيهي بالمسجد.',
  });
  assert(
    interventionResult.success === true,
    'نجاح إرسال إشعار التدخل الإداري والتربوي الفوري لولي أمر الطالب المتعثر',
    'Intervention notice dispatched successfully'
  );

  // -------------------------------------------------------------
  // المجموعة 6: تكامل واجهة المستخدم ومكون الطباعة الرسمية
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 6: تكامل واجهة المستخدم ومكون الطباعة الرسمية ---');

  const oversightSectionPath = path.resolve(
    process.cwd(),
    'components/oversight/ExecutiveOversightSection.tsx'
  );
  assert(fs.existsSync(oversightSectionPath), 'وجود مكون لوحة الرقابة الشاملة ExecutiveOversightSection.tsx');

  const sectionCode = fs.readFileSync(oversightSectionPath, 'utf-8');
  assert(
    sectionCode.includes('fetchExecutiveOversightMetrics') &&
      sectionCode.includes('fetchStrugglingStudentsWatchlist') &&
      sectionCode.includes('handleIntervention') &&
      sectionCode.includes('ExecutiveOversightPrintModal'),
    'تكامل كافة خدمات الرقابة والتدخل السريع والطباعة في المكون التفاعلي',
    'Services & modals integrated in ExecutiveOversightSection'
  );

  const printModalPath = path.resolve(
    process.cwd(),
    'components/oversight/ExecutiveOversightPrintModal.tsx'
  );
  assert(fs.existsSync(printModalPath), 'وجود مكون وثيقة الطباعة الرسمية ExecutiveOversightPrintModal.tsx');

  const printCode = fs.readFileSync(printModalPath, 'utf-8');
  assert(
    printCode.includes('الجمهورية الجزائرية الديمقراطية الشعبية') &&
      printCode.includes('وزارة الشؤون الدينية والأوقاف') &&
      printCode.includes('مسجد إبراهيم الخليل') &&
      printCode.includes('ختم المدرسة والمسجد'),
    'اشتمال نموذج الطباعة على الترويسة الجزائرية الرسمية وتبعية المسجد وكتلة التوقيع والختم',
    'Official Algerian print format & signature blocks verified'
  );

  const dashboardPagePath = path.resolve(process.cwd(), 'pages/Dashboard.tsx');
  const dashboardCode = fs.readFileSync(dashboardPagePath, 'utf-8');
  assert(
    dashboardCode.includes('ExecutiveOversightSection'),
    'إدراج وربط لوحة الرقابة الإدارية الشاملة مباشرة في واجهة لوحة تحكم الإدارة Dashboard.tsx',
    'ExecutiveOversightSection embedded in Admin Dashboard'
  );

  // -------------------------------------------------------------
  // الخلاصة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 النتيجة النهائية لاختبارات المرحلة الفرعية 8.4.8:`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   - نسبة الإنجاز: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  if (passedTests === totalTests) {
    console.log('   🎉 تم اجتياز جميع اختبارات لوحة الإدارة والرقابة الشاملة بنجاح 100%!');
  } else {
    console.error('   ⚠️ توجد بعض الاختبارات التي لم تكتمل بنجاح، يرجى المراجعة.');
  }
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء الفحص:', err);
  process.exit(1);
});

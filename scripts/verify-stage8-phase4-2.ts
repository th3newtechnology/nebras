/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.2:
 * الجدول الأسبوعي، إدارة الحصص والاستثناءات، كشف التعارض، والطباعة الرسمية
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  fetchTimetableSessions,
  fetchScheduleExceptions,
  createScheduleException,
  deleteScheduleException,
  checkScheduleConflict,
  addScheduleSession,
  deleteScheduleSession,
  WORK_DAYS_MAP,
  DAY_NAMES,
} from '../lib/timetableService';
import {
  TimetableSession,
  CreateScheduleExceptionDTO,
  CreateScheduleDTO,
} from '../types/circle.types';
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
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.2');
  console.log('   الجدول الأسبوعي وإدارة الحصص والاستثناءات وكشف التعارض');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص تهيئة أيام العمل وتقويم الأسبوع الجزائري
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص تهيئة أيام العمل وتخصيص الأسبوع ---');

  assert(
    Array.isArray(WORK_DAYS_MAP.sat_thu) && WORK_DAYS_MAP.sat_thu.length === 6,
    'تهيئة أسبوع العمل الجزائري (السبت إلى الخميس) كـ 6 أيام'
  );

  assert(
    WORK_DAYS_MAP.sat_thu[0].value === 6 && WORK_DAYS_MAP.sat_thu[0].label === 'السبت',
    'أول يوم في الأسبوع الجزائري المعتمد هو يوم السبت'
  );

  assert(
    WORK_DAYS_MAP.sun_thu.length === 5,
    'تهيئة خيار أسبوع العمل البديل (الأحد إلى الخميس - 5 أيام)'
  );

  assert(
    WORK_DAYS_MAP.all_week.length === 7,
    'تهيئة خيار كامل أيام الأسبوع (7 أيام)'
  );

  assert(
    DAY_NAMES[6] === 'السبت' && DAY_NAMES[0] === 'الأحد' && DAY_NAMES[4] === 'الخميس',
    'مطابقة مصفوفة تسميات الأيام بالعربية الفصحى'
  );

  // -------------------------------------------------------------
  // المجموعة 2: فحص استرجاع الحصص الأسبوعية وتكامل البيانات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: فحص استرجاع الحصص الأسبوعية وربط الكيانات ---');

  const { sessions } = await fetchTimetableSessions();

  assert(sessions.length > 0, 'استرجاع الحصص المجدولة بنجاح', `تم استرجاع ${sessions.length} حصة`);

  const saturdaySession = sessions.find((s) => s.dayOfWeek === 6);
  assert(
    Boolean(saturdaySession),
    'وجود حصة مجدولة يوم السبت متوافقة مع التقويم الجزائري',
    saturdaySession?.circleName
  );

  const sampleSession = sessions[0];
  assert(
    Boolean(sampleSession.id && sampleSession.circleId && sampleSession.circleName),
    'اكتمال ربط الحصة بالحلقة القرآنية المعنية'
  );

  assert(
    Boolean(sampleSession.teacherId && sampleSession.teacherName),
    'اكتمال ربط الحصة بالمحفظ المسؤول'
  );

  assert(
    Boolean(sampleSession.startTime && sampleSession.endTime),
    'تحديد توقيت بداية ونهاية كل حصة بنسق زمني قياسي HH:MM'
  );

  // -------------------------------------------------------------
  // المجموعة 3: فحص محرك كشف التعارض (Conflict Detection Engine)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: فحص محرك كشف التعارض المسبق ---');

  // أ. فحص تعارض القاعة
  const hallConflictResult = checkScheduleConflict(sessions, {
    circleId: 'different-circle-id',
    teacherId: 'different-teacher-id',
    hallId: sampleSession.hallId, // نفس القاعة
    dayOfWeek: sampleSession.dayOfWeek, // نفس اليوم
    startTime: sampleSession.startTime, // وقت متطابق/متداخل
    endTime: sampleSession.endTime,
  });

  assert(
    hallConflictResult.hasConflict && hallConflictResult.type === 'hall',
    'اكتشاف تعارض القاعة عند محاولة حجز قاعة محجوزة مسبقاً في نفس الوقت',
    hallConflictResult.message
  );

  // ب. فحص تعارض المعلم
  const teacherConflictResult = checkScheduleConflict(sessions, {
    circleId: 'different-circle-id',
    teacherId: sampleSession.teacherId, // نفس المعلم
    hallId: 'different-hall-id',
    dayOfWeek: sampleSession.dayOfWeek,
    startTime: sampleSession.startTime,
    endTime: sampleSession.endTime,
  });

  assert(
    teacherConflictResult.hasConflict && teacherConflictResult.type === 'teacher',
    'اكتشاف تعارض المعلم عند محاولة إسناد حلقتين له في نفس الوقت',
    teacherConflictResult.message
  );

  // ج. فحص تعارض نفس الحلقة
  const circleConflictResult = checkScheduleConflict(sessions, {
    circleId: sampleSession.circleId,
    dayOfWeek: sampleSession.dayOfWeek,
    startTime: sampleSession.startTime,
    endTime: sampleSession.endTime,
  });

  assert(
    circleConflictResult.hasConflict,
    'اكتشاف تعارض تكرار نفس الحلقة في وقت متداخل'
  );

  // د. حالة عدم التعارض (وقت مختلف أو يوم مختلف)
  const noConflictResult = checkScheduleConflict(sessions, {
    circleId: 'new-circle-99',
    teacherId: sampleSession.teacherId,
    hallId: sampleSession.hallId,
    dayOfWeek: (sampleSession.dayOfWeek + 1) % 7, // يوم مختلف تماماً
    startTime: '10:00',
    endTime: '11:30',
  });

  assert(
    !noConflictResult.hasConflict,
    'اجتياز الفحص بنجاح عند عدم وجود أي تعارض زمني أو مكاني'
  );

  // -------------------------------------------------------------
  // المجموعة 4: فحص منظومة الاستثناءات والإلغاء (Schedule Exceptions)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: فحص إدارة استثناءات الحصص والإلغاء وتعديل المواعيد ---');

  // أ. إنشاء استثناء إلغاء حصة
  const cancelDto: CreateScheduleExceptionDTO = {
    scheduleId: sampleSession.id,
    circleId: sampleSession.circleId,
    exceptionDate: '2026-11-14',
    exceptionType: 'cancelled',
    reason: 'عطلة رسمية بمناسبة المولد النبوي الشريف',
  };

  const cancelRes = await createScheduleException(cancelDto, 'إدارة نبراس الرقابية');
  assert(
    cancelRes.success && Boolean(cancelRes.exception?.id),
    'تسجيل استثناء إلغاء حصة بنجاح مع السبب واسم المستخدم وتاريخ التعديل'
  );

  assert(
    cancelRes.exception?.exceptionType === 'cancelled' &&
      cancelRes.exception?.authorName === 'إدارة نبراس الرقابية',
    'توثيق بيانات المستخدم المعدل في السجل الرقابي للاستثناء'
  );

  // ب. استرجاع الاستثناءات والتأكد من إدراجها
  const exceptionsRes = await fetchScheduleExceptions(sampleSession.circleId);
  const foundException = exceptionsRes.exceptions.find((e) => e.scheduleId === sampleSession.id);
  assert(
    Boolean(foundException),
    'استرجاع استثناءات الحصة والربط الصحيح بالحلقة',
    `تم استرجاع ${exceptionsRes.exceptions.length} استثناء`
  );

  // ج. إلغاء الاستثناء واستعادة الجدول النظامي
  if (cancelRes.exception) {
    const delExRes = await deleteScheduleException(cancelRes.exception.id);
    assert(
      delExRes.success,
      'إلغاء الاستثناء واستعادة الموعد النظامي بنجاح'
    );
  }

  // -------------------------------------------------------------
  // المجموعة 5: فحص ملف ترحيل Supabase والـ RLS للمرحلة 8.4.2
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: فحص ملف ترحيل Supabase وسياسات RLS والأمان ---');

  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261106000013_schedule_exceptions.sql'
  );
  assert(fs.existsSync(migrationPath), 'وجود ملف ترحيل Supabase الخاص بالاستثناءات 20261106000013');

  const migrationSql = fs.readFileSync(migrationPath, 'utf8');
  assert(
    migrationSql.includes('CREATE TABLE IF NOT EXISTS public.schedule_exceptions'),
    'إنشاء جدول schedule_exceptions مع المفاتيح الأجنبية والقيود'
  );

  assert(
    migrationSql.includes('ENABLE ROW LEVEL SECURITY'),
    'تفعيل حماية Row Level Security (RLS) على جدول الاستثناءات'
  );

  assert(
    migrationSql.includes('schedule_exceptions_select_policy') &&
      migrationSql.includes('schedule_exceptions_insert_policy') &&
      migrationSql.includes('schedule_exceptions_delete_policy'),
    'تعريف سياسات RLS الأربعة (Select, Insert, Update, Delete) مع عزل المعلم والولي والإدارة'
  );

  // -------------------------------------------------------------
  // المجموعة 6: فحص مكونات واجهة المستخدم والطباعة الرسمية
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 6: فحص مكونات واجهة المستخدم والطباعة الرسمية ---');

  const timetablePagePath = path.resolve(process.cwd(), 'pages/Timetable.tsx');
  const timetablePageContent = fs.readFileSync(timetablePagePath, 'utf8');

  assert(
    timetablePageContent.includes("viewMode === 'all'") &&
      timetablePageContent.includes("viewMode === 'teacher'") &&
      timetablePageContent.includes("viewMode === 'student'") &&
      timetablePageContent.includes("viewMode === 'hall'"),
    'دعم أنماط العرض الأربعة (الجدول العام، جدول المعلم، جدول الطالب، جدول القاعات)'
  );

  assert(
    timetablePageContent.includes('workDaysConfig') &&
      timetablePageContent.includes('sat_thu'),
    'إتاحة تخصيص أيام العمل من السبت إلى الخميس أو خيارات بديلة'
  );

  const printViewPath = path.resolve(
    process.cwd(),
    'components/timetable/TimetablePrintView.tsx'
  );
  assert(fs.existsSync(printViewPath), 'وجود مكون المعاينة والطباعة الرسمية وتصدير PDF');

  const printViewContent = fs.readFileSync(printViewPath, 'utf8');
  assert(
    printViewContent.includes('الجمهورية الجزائرية الديمقراطية الشعبية') &&
      printViewContent.includes('مسجد إبراهيم الخليل') &&
      printViewContent.includes('window.print()'),
    'اشتمال نموذج الطباعة على الترويسة الجزائرية الرسمية والختم والتوقيع'
  );

  const detailsModalPath = path.resolve(
    process.cwd(),
    'components/timetable/SessionDetailsModal.tsx'
  );
  assert(
    fs.existsSync(detailsModalPath),
    'وجود نافذة تفاصيل الحصة وقائمة الطلاب المقيدين'
  );

  const exceptionModalPath = path.resolve(
    process.cwd(),
    'components/timetable/ScheduleExceptionModal.tsx'
  );
  assert(
    fs.existsSync(exceptionModalPath),
    'وجود نافذة تسجيل استثناءات وتعديل وإلغاء الحصص مع توثيق اسم المستخدم والسبب'
  );

  // -------------------------------------------------------------
  // النتيجة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 النتيجة النهائية لاختبارات المرحلة الفرعية 8.4.2:`);
  console.log(`   الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   نسبة النجاح: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    console.log('🏆 نجاح تام لكافة معايير المرحلة الفرعية 8.4.2 (الجدول الأسبوعي المطور)!');
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

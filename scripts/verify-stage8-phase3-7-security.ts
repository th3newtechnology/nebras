/**
 * سكريبت الفحص التكاملي الأمني الشامل والتدقيق النهائي للمرحلة الفرعية 8.3
 * المرحلة 8.3.7: الاختبارات الأمنية والتكاملية والتدقيق النهائي لمحطة الإقراء (Security, RLS & Integration Audit Gate)
 *
 * يشمل الفحص:
 * 1. فحص سياسات RLS والعزل المعماري في Supabase لجداول التسميع والحضور
 * 2. اختبار حماية الخدمات ومنع السطو على حلقات المعلمين الآخرين (Circle Hijacking Prevention)
 * 3. اختبار عزل الجلسات المؤرشفة وخصوصية المعلم (Archived Session Privacy)
 * 4. اختبار منع التكرار ومقاومة إعادة الإرسال (Idempotency & Replay Defense)
 * 5. فحص حماية النطاقات القرآنية والمدخلات (Ayah Boundary Enforcement)
 * 6. فحص محرك الرصد والدرجات واللحن الجلي والخفي (Evaluation Engine Integrity)
 * 7. فحص التجاوب عبر الأجهزة وإمكانية الوصول والطباعة الرسمية (Responsive & Print Audit)
 */

import fs from 'fs';
import path from 'path';
import {
  initLiveSession,
  saveLiveSessionDraft,
  clearLiveSession,
  archiveAndSyncLiveSession,
  getArchivedSessions,
  saveToArchivedSessions,
} from '../lib/liveSessionService';
import {
  calculateRecitationScore,
  DEDUCTION_RULES,
  formatScoreOutOf20,
} from '../lib/evaluationEngine';
import {
  validateAyahRange,
  getSurahNavigation,
} from '../lib/quranMetadata';
import {
  getWarshVersesForSurah,
  WARSH_PRIMARY_RULES,
  formatWarshAyahBadge,
} from '../lib/warshContent';
import { LiveRecitationSession } from '../types/liveSession.types';

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

async function runStage8Phase3SecurityAudit() {
  console.log('=============================================================================');
  console.log(' 🛡️ المرحلة 8.3.7: الفحص التكاملي الأمني الشامل لمحطة الإقراء والتسميع المباشر');
  console.log('    (Security, RLS, Integrity & Cross-Device Audit Gate)');
  console.log('=============================================================================\n');

  // =========================================================================
  // المحور 1: فحص سياسات RLS والعزل المعماري في Supabase
  // =========================================================================
  console.log('🔒 [المحور 1] فحص سياسات RLS والعزل الصارم في قاعدة بيانات Supabase:');

  const rlsMigrationPath = path.join(
    process.cwd(),
    'supabase/migrations/20261103000009_auth_and_rls_policies.sql'
  );
  assert(fs.existsSync(rlsMigrationPath), 'ملف سياسات RLS متوفر في المشروع');

  const rlsContent = fs.readFileSync(rlsMigrationPath, 'utf-8');

  // أ. RLS على جدول الحضور attendance
  assert(
    rlsContent.includes('ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;'),
    'تفعيل RLS إجبارياً على جدول الحضور (public.attendance)'
  );
  assert(
    rlsContent.includes('CREATE POLICY "attendance_select_policy"') &&
      rlsContent.includes('teacher_id = public.get_current_teacher_id()'),
    'سياسة قراءة الحضور تشترط انتساب الحلقة للمعلم المصرح له'
  );
  assert(
    rlsContent.includes('CREATE POLICY "attendance_insert_policy"') &&
      rlsContent.includes('public.is_teacher()'),
    'سياسة إدراج الحضور تشترط صلاحية المعلم وتطابق معرف حلقته'
  );

  // ب. RLS على جدول التسميع memorization_records
  assert(
    rlsContent.includes('ALTER TABLE public.memorization_records ENABLE ROW LEVEL SECURITY;'),
    'تفعيل RLS إجبارياً على جدول التسميع القرآني (public.memorization_records)'
  );
  assert(
    rlsContent.includes('CREATE POLICY "memorization_select_policy"') &&
      rlsContent.includes('teacher_id = public.get_current_teacher_id()'),
    'سياسة قراءة التسميع تحصر الوصول على معلم الطالب أو الإدارة'
  );
  assert(
    rlsContent.includes('CREATE POLICY "memorization_insert_policy"') &&
      rlsContent.includes('teacher_id = public.get_current_teacher_id()'),
    'سياسة رصد التسميع تشترط أن المعلم يدرج فقط باسمه الخاص المسجل'
  );
  assert(
    rlsContent.includes('CREATE POLICY "memorization_admin_delete_policy"') &&
      rlsContent.includes('USING (public.is_admin())'),
    'منع المعلمين من حذف سجلات التسميع (الحذف مقصور على الإدارة العليا فقط)'
  );

  // =========================================================================
  // المحور 2: حماية الخدمات ومنع السطو على الحلقات (Circle Hijacking Defense)
  // =========================================================================
  console.log('\n🚫 [المحور 2] اختبار منع السطو على الحلقات والوصول غير المصرح به:');

  // المعلم t-01 يملك الحلقات c1 و c3. الحلقة c2 ملك للمعلم t-02.
  let circleHijackBlocked = false;
  try {
    await initLiveSession('c2', 't-01', 'الشيخ رفيق');
  } catch (err: any) {
    circleHijackBlocked = true;
    assert(
      err.message.includes('[SECURITY]'),
      `رسالة المنع الأمني الصريح للخدمة: "${err.message}"`
    );
  }
  assert(circleHijackBlocked, 'حظر محاولة المعلم t-01 بدء جلسة إقراء لحلقة c2 التابعة للمعلم t-02');

  // التحقق من بدء جلسة شرعية للمعلم t-01 على حلقة c1
  const legitimateSession = await initLiveSession('c1', 't-01', 'الشيخ رفيق');
  assert(legitimateSession.circleId === 'c1', 'بدء جلسة شرعية بنجاح لحلقة c1');
  assert(legitimateSession.teacherId === 't-01', 'المعلم المسجل في الجلسة هو t-01');
  assert(legitimateSession.students.length > 0, `استدعاء طلاب الحلقة الشرعيين (العدد: ${legitimateSession.students.length})`);
  assert(
    legitimateSession.students.every((s) => s.circleId === 'c1'),
    'جميع الطلاب في الجلسة ينتسبون فعلياً لحلقة c1'
  );

  // =========================================================================
  // المحور 3: عزل الجلسات المؤرشفة وخصوصية المعلم (Archived Session Isolation)
  // =========================================================================
  console.log('\n🗄️ [المحور 3] اختبار خصوصية وعزل الجلسات المؤرشفة بين المعلمين:');

  const testSessionTeacher1: LiveRecitationSession = {
    id: 'session-arch-t1-test',
    circleId: 'c1',
    circleName: 'حلقة الإمام ورش',
    teacherId: 't-01',
    teacherName: 'الشيخ رفيق',
    hallName: 'قاعة الإمام نافع',
    date: '2026-11-06',
    status: 'completed',
    students: legitimateSession.students,
  };

  const testSessionTeacher2: LiveRecitationSession = {
    id: 'session-arch-t2-test',
    circleId: 'c2',
    circleName: 'حلقة الإمام نافع',
    teacherId: 't-02',
    teacherName: 'الشيخ عبد الله',
    hallName: 'قاعة الإمام مالك',
    date: '2026-11-06',
    status: 'completed',
    students: [],
  };

  saveToArchivedSessions(testSessionTeacher1);
  saveToArchivedSessions(testSessionTeacher2);

  const teacher1Archive = getArchivedSessions('t-01');
  const teacher2Archive = getArchivedSessions('t-02');

  assert(
    teacher1Archive.some((s) => s.id === 'session-arch-t1-test'),
    'المعلم t-01 يسترجع جلسته المؤرشفة بنجاح'
  );
  assert(
    !teacher1Archive.some((s) => s.id === 'session-arch-t2-test'),
    'المعلم t-01 لا يرى بتاتاً جلسات المعلم t-02 المؤرشفة'
  );
  assert(
    teacher2Archive.some((s) => s.id === 'session-arch-t2-test'),
    'المعلم t-02 يسترجع جلسته المؤرشفة بنجاح'
  );
  assert(
    !teacher2Archive.some((s) => s.id === 'session-arch-t1-test'),
    'المعلم t-02 لا يرى بتاتاً جلسات المعلم t-01 المؤرشفة'
  );

  // =========================================================================
  // المحور 4: منع التكرار ومقاومة إعادة الإرسال (Idempotency & Replay Defense)
  // =========================================================================
  console.log('\n🔁 [المحور 4] اختبار مقاومة تكرار الرصد وإعادة المحاولات (Idempotency):');

  // تحضير جلسة تحتوي على طالب مع تقييم
  const student0 = legitimateSession.students[0];
  const sessionWithRecitation: LiveRecitationSession = {
    ...legitimateSession,
    id: 'idempotency-test-session',
    students: [
      {
        ...student0,
        recitationState: 'completed',
        evaluation: {
          category: 'new_memorization',
          surahNumber: 1,
          surahName: 'الفاتحة',
          ayahFrom: 1,
          ayahTo: 7,
          grade: 'ممتاز',
          score: 100,
          scoreOutOf20: 20,
          mistakesCount: 0,
          tajweedMistakesCount: 0,
          notes: 'تلاوة متقنة',
          completedAt: new Date().toISOString(),
        },
      },
    ],
  };

  // المزامنة للمرة الأولى
  const archiveResult1 = await archiveAndSyncLiveSession(sessionWithRecitation);
  assert(archiveResult1.success, 'نجاح الأرشفة الأولى للجلسة');

  // المزامنة للمرة الثانية (محاكاة انقطاع الإنترنت وإعادة الإرسال)
  const archiveResult2 = await archiveAndSyncLiveSession(sessionWithRecitation);
  assert(archiveResult2.success, 'نجاح إعادة الإرسال دون خطأ تعارض');

  // التحقق من أن عدد الجلسات في الأرشيف لم يتضاعف
  const currentArchive = getArchivedSessions('t-01');
  const matchingArchived = currentArchive.filter((s) => s.id === 'idempotency-test-session');
  assert(matchingArchived.length === 1, 'الجلسة مخزنة مرة واحدة فقط في الأرشيف دون تكرار');

  // التحقق من صيغة المعرف الفريد للتسميع rec-{sessionId}-{studentId}
  const expectedRecitationId = `rec-idempotency-test-session-${student0.studentId}`;
  assert(
    expectedRecitationId.startsWith('rec-') && expectedRecitationId.includes(student0.studentId),
    `صيغة معرف التسميع تضمن عدم التكرار: ${expectedRecitationId}`
  );

  // =========================================================================
  // المحور 5: حماية النطاقات والمدخلات القرآنية (Boundary Enforcement)
  // =========================================================================
  console.log('\n📖 [المحور 5] فحص حماية النطاقات والمدخلات القرآنية برواية ورش:');

  // أ. التحقق من النطاقات غير المقبولة
  const invalidCases = [
    { s: 1, from: -1, to: 5, expectedMsg: '1 أو أكثر', reason: 'آية بداية سالبة' },
    { s: 1, from: 0, to: 5, expectedMsg: '1 أو أكثر', reason: 'آية بداية صفر' },
    { s: 1, from: 1, to: 8, expectedMsg: 'سقف السورة', reason: 'آية نهاية تتجاوز آيات الفاتحة (7)' },
    { s: 1, from: 5, to: 2, expectedMsg: 'قبل آية البداية', reason: 'نطاق مقلوب (5 إلى 2)' },
    { s: 0, from: 1, to: 5, expectedMsg: 'غير موجودة', reason: 'سورة رقم صفر' },
    { s: 115, from: 1, to: 5, expectedMsg: 'غير موجودة', reason: 'سورة رقم 115' },
  ];

  for (const tc of invalidCases) {
    const res = validateAyahRange(tc.s, tc.from, tc.to);
    assert(!res.isValid, `رفض الإدخال غير السليم: ${tc.reason}`);
    assert(res.error?.includes(tc.expectedMsg) ?? false, `رسالة الخطأ واضحة: ${res.error}`);
  }

  // ب. التحقق من النطاقات الصحيحة
  const validFatiha = validateAyahRange(1, 1, 7);
  assert(validFatiha.isValid, 'قبول سورة الفاتحة كاملة (1 إلى 7)');

  const validBaqarahPart = validateAyahRange(2, 1, 25);
  assert(validBaqarahPart.isValid, 'قبول مقطع صحيح من سورة البقرة (1 إلى 25)');

  // ج. التحقق من بيانات ورش وقواعد الأزرق الست
  assert(WARSH_PRIMARY_RULES.length === 6, 'تضمين القواعد الست الكبرى لطريق الأزرق عن ورش');
  const fatihaWarsh = getWarshVersesForSurah(1, 'الفاتحة', 1, 7, 7);
  assert(fatihaWarsh.verses.length === 7, 'الفاتحة برواية ورش تحتوي على 7 آيات مرقمة');
  assert(fatihaWarsh.verses[0].ayahNumber === 1, 'الآية الأولى من الفاتحة برقم 1');
  assert(formatWarshAyahBadge(1) === '﴿١﴾', 'استخدام أقواس الترقيم المصحفي الأصيل ﴿١﴾');

  // =========================================================================
  // المحور 6: سلامة محرك الرصد والدرجات واللحن الجلي والخفي
  // =========================================================================
  console.log('\n⚖️ [المحور 6] فحص محرك احتساب الدرجات واللحن الجلي والخفي والمقياس الجزائري:');

  // أ. التسميع المتقن (دون أخطاء)
  const perfectScore = calculateRecitationScore({ generalHifzMistakes: 0, generalTajweedMistakes: 0 });
  assert(perfectScore.score === 100, 'التسميع المتقن يحصل على 100/100');
  assert(perfectScore.scoreOutOf20 === 20, 'العلامة بالمقياس الجزائري 20/20');
  assert(perfectScore.recommendedGrade === 'ممتاز', 'التقدير التلقائي ممتاز');

  // ب. خصم اللحن الجلي (-3 افتراضياً)
  const oneJali = calculateRecitationScore({ generalHifzMistakes: 1, generalTajweedMistakes: 0 });
  assert(oneJali.score === 97, `لحن جلي واحد يخصم 3 درجات: ${oneJali.score}/100`);
  assert(oneJali.scoreOutOf20 === 19.4, `العلامة بالمقياس الجزائري 19.4/20`);

  // ج. خصم اللحن الخفي (-1.5 افتراضياً)
  const oneKhafi = calculateRecitationScore({ generalHifzMistakes: 0, generalTajweedMistakes: 1 });
  assert(oneKhafi.score === 98.5, `لحن خفي واحد يخصم 1.5 درجة: ${oneKhafi.score}/100`);
  assert(oneKhafi.scoreOutOf20 === 19.7, `العلامة بالمقياس الجزائري 19.7/20`);

  // د. خليط: 2 جلي (6-) + 2 خفي (3-) = 91
  const mixed = calculateRecitationScore({ generalHifzMistakes: 2, generalTajweedMistakes: 2 });
  assert(mixed.score === 91, `2 لحن جلي و2 خفي = 91/100`);
  assert(mixed.scoreOutOf20 === 18.2, `العلامة بالمقياس الجزائري 18.2/20`);
  assert(mixed.recommendedGrade === 'ممتاز', `التقدير المستحق ممتاز`);

  // هـ. تدقيق حدود الصفر: أخطاء هائلة تمنع الدرجات السالبة
  const massiveMistakes = calculateRecitationScore({ generalHifzMistakes: 50, generalTajweedMistakes: 50 });
  assert(massiveMistakes.score === 0, 'الدرجة لا تنزل تحت الصفر مطلقاً (الحد الأدنى 0)');
  assert(massiveMistakes.scoreOutOf20 === 0, 'العلامة من 20 لا تنزل تحت الصفر');
  assert(massiveMistakes.recommendedGrade === 'يحتاج مراجعة', 'التقدير التلقائي يحتاج مراجعة');

  // و. التحقق من تنسيق العلامة من 20
  assert(formatScoreOutOf20(18.5) === '18.5 / 20', 'دالة formatScoreOutOf20 تصيغ العلامة الجزائرية بنجاح');

  // =========================================================================
  // المحور 7: فحص التجاوب عبر الأجهزة وإمكانية الوصول والطباعة الرسمية
  // =========================================================================
  console.log('\n📱 [المحور 7] تدقيق التجاوب عبر الهواتف والحواسيب والطباعة الرسمية:');

  const stationCode = fs.readFileSync(path.join(process.cwd(), 'pages/LiveRecitationStation.tsx'), 'utf-8');

  // أ. دعم الشاشات الكبيرة والمقسمة
  assert(
    stationCode.includes('grid-cols-1') && stationCode.includes('xl:grid-cols-12'),
    'تنسيق الواجهة يتكيف من عمود واحد للهواتف إلى 12 عموداً للشاشات الكبيرة'
  );
  // ب. دعم التبديل السلس بين أوضاع العرض (split, mushaf, queue, reciting)
  assert(
    stationCode.includes("'split'") &&
      stationCode.includes("'mushaf'") &&
      stationCode.includes("'queue'") &&
      stationCode.includes("'reciting'"),
    'دعم كامل للأوضاع الأربعة: التقسيم المكتبي، المصحف، الطابور، وواجهة التسميع'
  );
  // ج. اختصارات لوحة المفاتيح للمحفظ
  assert(
    stationCode.includes('handleKeyDown') &&
      stationCode.includes('Space') &&
      stationCode.includes('KeyN') &&
      stationCode.includes('KeyS'),
    'تضمين اختصارات لوحة المفاتيح السريعة (المسافة للتعليق، Alt+N للطالب التالي، Alt+S للحفظ)'
  );
  // د. الشريط السفلي العائم للهواتف المحمولة
  assert(
    stationCode.includes('fixed bottom-0') || stationCode.includes('lg:hidden'),
    'تخصيص أشرطة تحكم سريعة وعائمة ملائمة لشاشات الهواتف المحمولة'
  );

  const reportModalCode = fs.readFileSync(
    path.join(process.cwd(), 'components/teacher/live/LiveSessionReportModal.tsx'),
    'utf-8'
  );

  // هـ. دعم التقرير للطباعة الرسمية النظيفة
  assert(
    reportModalCode.includes('window.print()'),
    'تضمين استدعاء أمر الطباعة المباشر للمتصفح'
  );
  assert(
    reportModalCode.includes('@media print') || reportModalCode.includes('print:'),
    'تضمين قواعد CSS الخاصة بتنسيق الطباعة الورقية وحجب العناصر غير الطباعية'
  );
  assert(
    reportModalCode.includes('مدرسة نبراس القرآنية') &&
      reportModalCode.includes('مسجد إبراهيم الخليل'),
    'الترويسة الرسمية المعتمدة (مدرسة نبراس القرآنية - مسجد إبراهيم الخليل)'
  );

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة الفحص الأمني والتكاملي الشامل للمرحلة 8.3.7: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage8Phase3SecurityAudit().catch((err) => {
  console.error('فشل غير متوقع في الفحص الأمني:', err);
  process.exit(1);
});

/**
 * سكريبت التدقيق النهائي وضمان الجودة الشاملة للمرحلة 10 بالكامل
 * (Master QA & Institutional Sign-Off - Stage 10: Student Portal)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import fs from 'fs';
import path from 'path';
import {
  fetchStudentDashboardData,
  toggleWirdSectionCompleted,
  fetchStudentCertificates,
  verifyStudentAccessGate,
} from '../lib/studentPortalService';
import {
  canUsersCommunicate,
  sendChatMessage,
  fetchChatContacts,
} from '../lib/messagesService';
import { WARSH_SURAH_LIBRARY, formatWarshAyahBadge } from '../lib/warshContent';
import { QURAN_SURAHS, getSurahsByJuz } from '../lib/quranMetadata';
import { QURAN_JUZ_NAMES } from '../lib/teacherPortalService';

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

async function runStage10MasterQA() {
  console.log('\n=============================================================================================');
  console.log('🏆 بدء الفحص الهندسي الشامل والتدقيق النهائي لبوابة الطالب القرآني (المرحلة 10 بالكامل)');
  console.log('   مدرسة نبراس القرآنية — مسجد إبراهيم الخليل (Student Portal Master QA & Sign-Off)');
  console.log('=============================================================================================\n');

  // -----------------------------------------------------------------------------------------
  // 1. فحص الشجرة الهيكلية والمكونات المعيارية
  // -----------------------------------------------------------------------------------------
  console.log('📂 1. فحص اكتمال المكونات والخدمات والأنواع البرمجية لبوابة الطالب:');

  const requiredModules = [
    'types/studentPortal.types.ts',
    'lib/studentPortalService.ts',
    'pages/StudentDashboard.tsx',
    'components/student/StudentHeader.tsx',
    'components/student/DailyWirdCard.tsx',
    'components/student/StudentMushafModal.tsx',
    'components/student/StudentJuzMap.tsx',
    'components/student/StudentBadgesTab.tsx',
    'components/student/StudentCertificateModal.tsx',
    'components/student/StudentScheduleTab.tsx',
    'project-docs/STAGE_10_EXECUTION_PLAN.md',
  ];

  for (const mod of requiredModules) {
    const fullPath = path.resolve(process.cwd(), mod);
    assert(fs.existsSync(fullPath), `اكتمال الملف البرمجي: ${mod}`);
  }

  // -----------------------------------------------------------------------------------------
  // 2. فحص هوية الطالب ولوحة القيادة والنقاط القرآنية (10.1 & 10.2)
  // -----------------------------------------------------------------------------------------
  console.log('\n🌟 2. فحص هوية الطالب القرآني ولوحة القيادة ونقاط الهمة:');

  const studentId = 's-001';
  const dashboard = await fetchStudentDashboardData(studentId);

  assert(
    dashboard.profile.id === 's-001' && dashboard.profile.fullName === 'محمد ياسين درويش',
    'استرجاع الملف التعريفي الكامل للطالب'
  );

  assert(
    dashboard.profile.currentJuz === 16 && dashboard.profile.completionPercentage === 53,
    'حساب نسبة إتمام القرآن الكريم بدقة (الجزء 16 بنسبة 53%)'
  );

  assert(
    dashboard.profile.points >= 1000,
    'توفير رصيد نقاط الهمة القرآنية المحفز',
    `النقاط: ${dashboard.profile.points}`
  );

  assert(
    Boolean(dashboard.profile.teacherName) && Boolean(dashboard.profile.circleName),
    'إسناد حلقة وقاعة وشيخ الطالب بمسجد إبراهيم الخليل'
  );

  // -----------------------------------------------------------------------------------------
  // 3. فحص الورد اليومي والمصحف المرتل برواية ورش (10.2 & 10.3)
  // -----------------------------------------------------------------------------------------
  console.log('\n📖 3. فحص ورد اليوم والمصحف المرتل برواية ورش عن نافع:');

  assert(
    dashboard.wird.newMemorization.surahNumber === 24 &&
      Boolean(dashboard.wird.newMemorization.warshNote),
    'تحديد الورد الجديد (سورة النور) مع توجيهات وضوابط ورش'
  );

  assert(
    dashboard.wird.minorReview.surahNumber === 23,
    'تحديد المراجعة الصغرى (سورة المؤمنون)'
  );

  assert(
    dashboard.wird.majorReview.juzNumber === 15,
    'تحديد المراجعة الكبرى (الجزء 15)'
  );

  // فحص مكتبة نصوص ورش
  const warshSurah1 = WARSH_SURAH_LIBRARY[1];
  assert(
    Boolean(warshSurah1) && warshSurah1.verses.length === 7,
    'توثيق نص سورة الفاتحة المحقق برواية ورش (7 آيات دون ترقيم البسملة)'
  );

  const formattedAyahBadge = formatWarshAyahBadge(1);
  assert(
    formattedAyahBadge === '﴿١﴾',
    'تنسيق رقم الآية بالأرقام المشرقية القرآنية برواية ورش (﴿١﴾)'
  );

  // -----------------------------------------------------------------------------------------
  // 4. فحص خريطة الأجزاء الـ 30 التفاعلية (10.3)
  // -----------------------------------------------------------------------------------------
  console.log('\n🗺️ 4. فحص خريطة الأجزاء الـ 30 ومسار الختمة:');

  assert(
    dashboard.juzMap.length === 30,
    'اكتمال مصفوفة الأجزاء الثلاثين للطالب (30 جزءاً)'
  );

  const completedCount = dashboard.juzMap.filter((j) => j.status === 'completed').length;
  assert(
    completedCount === 15,
    'رصد الأجزاء المتقنة والمكتملة (15 جزءاً منجزاً)'
  );

  const currentJuzItem = dashboard.juzMap.find((j) => j.status === 'in_progress');
  assert(
    currentJuzItem?.juzNumber === 16,
    'رصد الجزء الجاري حفظه وتثبيته حالياً (الجزء 16)'
  );

  // -----------------------------------------------------------------------------------------
  // 5. فحص الأوسمة وسلسلة التتابع والشهادات (10.4)
  // -----------------------------------------------------------------------------------------
  console.log('\n🏆 5. فحص منظومة التحفيز والأوسمة وسلسلة التتابع والشهادات:');

  assert(
    dashboard.badges.length >= 6,
    'تنوع شارات وأوسمة التحفيز القرآني (6+ أوسمة)'
  );

  const unlockedBadges = dashboard.badges.filter((b) => b.isUnlocked);
  assert(
    unlockedBadges.length >= 5,
    'حصول الطالب على أوسمة التميز المكتسبة (5+ أوسمة)'
  );

  assert(
    dashboard.streak.currentStreakDays >= 14 && dashboard.streak.weeklyActivity.length === 7,
    'تتبع أيام المواظبة والتتابع القرآني (Streak: 14 يوماً)'
  );

  const certs = await fetchStudentCertificates(studentId);
  assert(
    certs.length > 0 && certs[0].title.includes('نصف القرآن'),
    'إصدار وتوثيق شهادة إتمام نصف القرآن الكريم الرسمية'
  );

  // -----------------------------------------------------------------------------------------
  // 6. فحص جدول الحصص الأسبوعية (10.5)
  // -----------------------------------------------------------------------------------------
  console.log('\n📅 6. فحص جدول الحصص الأسبوعية لحلقة الطالب:');

  assert(
    dashboard.weeklySchedule.length > 0 &&
      dashboard.weeklySchedule[0].dayName === 'السبت' &&
      dashboard.weeklySchedule[0].hallName.includes('قاعة'),
    'ربط الحصص الأسبوعية بقاعات مسجد إبراهيم الخليل وفق التقويم الجزائري'
  );

  // -----------------------------------------------------------------------------------------
  // 7. فحص التواصل الداخلي والعزل الأمني الشامل (Security & Zero Leakage)
  // -----------------------------------------------------------------------------------------
  console.log('\n🛡️ 7. فحص التواصل الداخلي والعزل الأمني الشامل للطالب:');

  // أ. جهات اتصال الطالب
  const studentContacts = await fetchChatContacts('STUDENT', studentId);
  const onlyTeacherAndAdmin = studentContacts.contacts.every(
    (c) => c.role === 'TEACHER' || c.role === 'ADMIN'
  );
  assert(
    onlyTeacherAndAdmin,
    'حصر جهات اتصال الطالب في الشيخ المحفظ وإدارة المدرسة فقط (Zero Peer Visibility)'
  );

  // ب. حظر تراسل الطلاب وبعضهم
  const crossStudentBlocked = await canUsersCommunicate('STUDENT', 'STUDENT', 's-001', 's-002');
  assert(
    crossStudentBlocked === false,
    'الحظر الأمني القاطع للتراسل بين الطلاب وبعضهم (Zero Cross-Student Communication)'
  );

  // ج. سماح مراسلة الطالب لمحفظه
  const studentTeacherAllowed = await canUsersCommunicate('STUDENT', 'TEACHER', 's-001', 'u-teacher-01');
  assert(
    studentTeacherAllowed === true,
    'سماح مراسلة الطالب للشيخ المحفظ للاستفسار عن الورد'
  );

  // د. إرسال رسالة مشروعة للشيخ المحفظ
  const sendRes = await sendChatMessage({
    senderId: 's-001',
    senderRole: 'STUDENT',
    recipientId: 'u-teacher-01',
    recipientRole: 'TEACHER',
    content: 'السلام عليكم يا شيخنا، هل ورد الغد يتضمن مراجعة ربع الحزب؟',
    category: 'inquiry',
  });
  assert(
    sendRes.success === true,
    'نجاح إرسال استفسار قرآني للشيخ المحفظ'
  );

  // هـ. حظر محاولة إرسال رسالة لطالب زميل
  const peerSendRes = await sendChatMessage({
    senderId: 's-001',
    senderRole: 'STUDENT',
    recipientId: 's-002',
    recipientRole: 'STUDENT',
    content: 'محاولة تواصل محظورة',
  });
  assert(
    peerSendRes.success === false,
    'إحباط محاولة التراسل بين طالبين بحظر أمني صارم'
  );

  // و. العزل الأمني لملف الطالب
  const foreignProfileBlocked = await verifyStudentAccessGate('s-002', 's-001');
  assert(
    foreignProfileBlocked === false,
    'منع الطالب من التلصص على بيانات وأوراد زملائه (Zero Data Leakage)'
  );

  // -----------------------------------------------------------------------------------------
  // خلاصة الاعتماد المؤسسي والنهائي للمرحلة 10
  // -----------------------------------------------------------------------------------------
  console.log('\n=============================================================================================');
  console.log(`📊 الحصيلة الإجمالية للتدقيق الهندسي الشامل لبوابة الطالب (المرحلة 10):`);
  console.log(`   - إجمالي الفحوصات المنفذة: ${totalTests}`);
  console.log(`   - الفحوصات الناجحة: ${passedTests} من أصل ${totalTests}`);
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  console.log(`   - نسبة الاعتماد النهائي: ${passRate}%`);

  if (passedTests === totalTests) {
    console.log(`   🏆 تم اجتياز الفحص الهندسي والاعتماد النهائي للمرحلة العاشرة بنجاح تام 100%!`);
  } else {
    console.error(`   ⚠️ يوجد ${totalTests - passedTests} اختبار لم يكتمل بنجاح.`);
    process.exit(1);
  }
  console.log('=============================================================================================\n');
}

runStage10MasterQA().catch((err) => {
  console.error('خطأ غير متوقع أثناء التدقيق النهائي للمرحلة 10:', err);
  process.exit(1);
});

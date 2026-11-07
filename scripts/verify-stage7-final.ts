/**
 * سكريبت التدقيق والتحقق النهائي الشامل للمرحلة 7 بالكامل (المرحلة 7.6.4)
 * بوابة الإدارة المتكاملة لمدرسة نبراس القرآنية (Admin Portal Final Audit)
 */

import fs from 'fs';
import path from 'path';

// Services
import { fetchStudents } from '../lib/studentsService';
import { fetchTeachers } from '../lib/teachersService';
import { fetchCircles, fetchHalls } from '../lib/circlesService';
import { fetchTimetableSessions } from '../lib/timetableService';
import { fetchCircleAttendance } from '../lib/attendanceService';
import { fetchMemorizationRecords } from '../lib/pedagogicalService';
import { fetchApplications } from '../lib/registrationService';
import { fetchEvents, fetchAnnouncements } from '../lib/eventsService';
import { fetchChatContacts, fetchMessages } from '../lib/messagesService';
import { fetchFees, fetchPayments, fetchFinanceStats, formatDZD } from '../lib/financeService';
import {
  fetchSchoolSettings,
  updateSchoolSettings,
  fetchAcademicYears,
  setCurrentAcademicYear,
  fetchAuditLogs,
  logAuditEvent,
} from '../lib/settingsService';

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

async function runStage7FinalAudit() {
  console.log('=============================================================================');
  console.log(' 🏆 بدء التدقيق الهندسي النهائي الشامل لبوابة الإدارة لمدرسة نبراس (المرحلة 7.6.4)');
  console.log('=============================================================================\n');

  // 1. التحقق من سلامة وجود جميع شاشات ومكونات بوابة الإدارة
  console.log('📂 1. التحقق من تكامل ملفات شاشات بوابة الإدارة الاثنتي عشرة (Admin Views):');
  const requiredAdminPages = [
    'pages/Dashboard.tsx',
    'pages/Students.tsx',
    'pages/Teachers.tsx',
    'pages/Halls.tsx',
    'pages/Timetable.tsx',
    'pages/Attendance.tsx',
    'pages/Grades.tsx',
    'pages/Registration.tsx',
    'pages/Events.tsx',
    'pages/Messages.tsx',
    'pages/Fees.tsx',
    'pages/Settings.tsx',
  ];

  for (const page of requiredAdminPages) {
    const pagePath = path.join(process.cwd(), page);
    assert(fs.existsSync(pagePath), `وجود شاشة: ${page}`);
  }

  // 2. التحقق من منظومة الطلاب وأولياء الأمور (7.2)
  console.log('\n👥 2. تدقيق منظومة الطلاب وأولياء الأمور (Students & Guardians):');
  const studentsRes = await fetchStudents({ page: 1, pageSize: 10 });
  assert(studentsRes.students.length > 0, `استرجاع قائمة الطلاب بنجاح (العدد: ${studentsRes.students.length})`);
  const sampleStudent = studentsRes.students[0];
  assert(Boolean(sampleStudent.registrationNumber), `رقم القيد سليم: ${sampleStudent.registrationNumber}`);
  assert(Boolean(sampleStudent.guardianPhone), `رقم هاتف ولي الأمر مسجل: ${sampleStudent.guardianPhone}`);

  // 3. التحقق من المعلمين والحلقات والقاعات والمواعيد (7.3)
  console.log('\n🕌 3. تدقيق المعلمين والحلقات والقاعات والمواعيد (Teachers, Circles & Halls):');
  const { teachers } = await fetchTeachers();
  assert(teachers.length > 0, `استرجاع هيئة التدريس (العدد: ${teachers.length})`);

  const { circles } = await fetchCircles();
  assert(circles.length > 0, `استرجاع الحلقات القرآنية (العدد: ${circles.length})`);

  const { halls } = await fetchHalls();
  assert(halls.length > 0, `استرجاع قاعات المسجد (العدد: ${halls.length})`);

  const { sessions } = await fetchTimetableSessions();
  assert(sessions.length > 0, `استرجاع جدول المواعيد وجلسات التسميع (العدد: ${sessions.length})`);

  // 4. التحقق من الحضور والغياب والسجل القرآني والتقييمات (7.4)
  console.log('\n📖 4. تدقيق الحضور والسجل القرآني والتقييمات (Attendance & Pedagogical):');
  const { rows: attendance } = await fetchCircleAttendance('c1', '2026-11-05');
  assert(Array.isArray(attendance) && attendance.length > 0, `استرجاع سجل حضور الحلقة (العدد: ${attendance.length})`);

  const { records: memorization } = await fetchMemorizationRecords();
  assert(Array.isArray(memorization) && memorization.length > 0, `استرجاع دفتر الحفظ والمراجعة القرآني (العدد: ${memorization.length})`);

  // 5. التحقق من طلبات الالتحاق والإعلانات والمراسلات المدرسية (7.5)
  console.log('\n📢 5. تدقيق طلبات الالتحاق والإعلانات والمراسلات (Registration, Events & Comms):');
  const { applications } = await fetchApplications();
  assert(applications.length > 0, `استرجاع طلبات الالتحاق الإلكترونية (العدد: ${applications.length})`);

  const { events } = await fetchEvents();
  assert(Array.isArray(events) && events.length > 0, `استرجاع الفعاليات المدرسية (العدد: ${events.length})`);

  const { announcements } = await fetchAnnouncements();
  assert(Array.isArray(announcements) && announcements.length > 0, `استرجاع لوحة الإعلانات الرسمية (العدد: ${announcements.length})`);

  const { contacts } = await fetchChatContacts();
  assert(contacts.length > 0, `استرجاع جهات الاتصال بمركز المراسلات (العدد: ${contacts.length})`);

  // 6. التحقق من المحرك المالي وسندات القبض بالدينار الجزائري (7.6.1)
  console.log('\n💰 6. تدقيق المحرك المالي وسندات القبض بالدينار الجزائري (Finance Engine DZD):');
  const fees = await fetchFees();
  assert(fees.length > 0, `استرجاع الرسوم والاشتراكات المدرسية (العدد: ${fees.length})`);

  const payments = await fetchPayments();
  assert(payments.length > 0, `استرجاع سندات القبض المعتمدة (العدد: ${payments.length})`);

  const stats = await fetchFinanceStats();
  assert(stats.totalExpected > 0 && stats.collectionRate >= 0, `حساب نسب التحصيل والإيرادات بنجاح (${stats.collectionRate}%)`);
  assert(formatDZD(5000) === '5.000 د.ج', 'تنسيق العملة الوطنية بالدينار الجزائري (د.ج)');

  // 7. التحقق من إعدادات المدرسة والعام الدراسي وسجل التدقيق الرقابي (7.6.2 & 7.6.3)
  console.log('\n⚙️ 7. تدقيق إعدادات المدرسة والعام الدراسي وسجل الرقابة (Settings & Audit Logs):');
  const schoolSettings = await fetchSchoolSettings();
  assert(schoolSettings.schoolName.includes('نبراس'), `اسم المدرسة معتمد: ${schoolSettings.schoolName}`);
  assert(schoolSettings.affiliation.includes('مسجد إبراهيم الخليل'), `التبعية الرسمية: ${schoolSettings.affiliation}`);
  assert(schoolSettings.defaultCurrency === 'DZD', 'العملة الافتراضية مقيدة بالدينار الجزائري DZD');

  const academicYears = await fetchAcademicYears();
  assert(academicYears.length > 0, `استرجاع الأعوام الدراسية (العدد: ${academicYears.length})`);
  const currentYear = academicYears.find(y => y.isCurrent);
  assert(Boolean(currentYear), `العام الدراسي النشط محدد: ${currentYear?.name}`);

  // اختبار تسجيل وتوثيق عملية رقابية
  await logAuditEvent('AUDIT_VERIFICATION_TEST', 'system', 'test-run', null, { status: 'verified' });
  const auditLogs = await fetchAuditLogs();
  assert(auditLogs.length > 0, `استرجاع سجل التدقيق الرقابي غير القابل للتعديل (العدد: ${auditLogs.length})`);
  assert(
    auditLogs.some(l => l.action === 'AUDIT_VERIFICATION_TEST'),
    'توثيق العملية الرقابية الفورية بنجاح في سجل التدقيق'
  );

  console.log('\n=============================================================================');
  console.log(` 📊 نتيجة التدقيق النهائي الشامل للمرحلة 7: ${passed} نجح | ${failed} فشل`);
  console.log('=============================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage7FinalAudit().catch((err) => {
  console.error('فشل غير متوقع في التدقيق النهائي:', err);
  process.exit(1);
});

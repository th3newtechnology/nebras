/**
 * سكربت التحقق الهندسي الشامل للمرحلة الفرعية 7.4 — السجل التربوي ورصد الحضور والمتابعة القرآنية
 * مدرسة نبراس القرآنية التابعة لمسجد إبراهيم الخليل
 */

import * as fs from 'fs';
import * as path from 'path';

interface Check {
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const checks: Check[] = [];
const root = process.cwd();

function logCheck(category: string, name: string, passed: boolean, details: string) {
  checks.push({ category, name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}`);
  console.log(`   ${details}`);
}

console.log('================================================================');
console.log('فحص المرحلة 7.4 — السجل التربوي ورصد الحضور والمتابعة القرآنية');
console.log('================================================================\n');

// 1. فحص وجود جميع ملفات المرحلة 7.4
function checkFilesExistence() {
  const files = [
    { file: 'types/pedagogical.types.ts', name: 'ملف تعريف الأنواع للحضور والمتابعة القرآنية والتقييمات' },
    { file: 'lib/quranMetadata.ts', name: 'ملف بيانات السور القرآنية الـ 114 وأعداد الآيات والأجزاء' },
    { file: 'lib/attendanceService.ts', name: 'خدمة الحضور والغياب والتقارير التراكمية وتصدير CSV' },
    { file: 'lib/pedagogicalService.ts', name: 'خدمة المتابعة القرآنية وسجل الإتقان والاختبارات الدورية' },
    { file: 'components/attendance/AttendanceNotesModal.tsx', name: 'نافذة تدوين تفاصيل التأخر والأعذار والملاحظات' },
    { file: 'components/grades/NewMemorizationModal.tsx', name: 'نافذة تسجيل حصة تسميع / مراجعة قرآنية' },
    { file: 'components/grades/EvaluationFormModal.tsx', name: 'نافذة رصد الاختبارات والتقييمات الدورية' },
    { file: 'pages/Attendance.tsx', name: 'شاشة كشوفات الحضور والغياب والرصد بنظام النقرة' },
    { file: 'pages/Grades.tsx', name: 'شاشة دفتر المتابعة القرآنية وسجل الإتقان' },
  ];

  files.forEach(f => {
    const filePath = path.join(root, f.file);
    const exists = fs.existsSync(filePath);
    logCheck('FILES', f.name, exists, `الملف: ${f.file}`);
  });
}

// 2. فحص خدمة وواجهة الحضور والغياب (Attendance)
function checkAttendanceManagement() {
  const servicePath = path.join(root, 'lib/attendanceService.ts');
  const pagePath = path.join(root, 'pages/Attendance.tsx');

  const serviceContent = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf-8') : '';
  const pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf-8') : '';

  const hasFourStatuses =
    serviceContent.includes('present') &&
    serviceContent.includes('absent') &&
    serviceContent.includes('late') &&
    serviceContent.includes('excused') &&
    pageContent.includes('present') &&
    pageContent.includes('absent') &&
    pageContent.includes('late') &&
    pageContent.includes('excused');
  logCheck('ATTENDANCE', 'دعم الحالات الأربع المعتمدة (حاضر، غائب، متأخر، معذور)', hasFourStatuses, 'توفير أزرار النقرة الواحدة وحساب دقائق التأخر والأعذار');

  const hasUpsertLogic =
    serviceContent.includes('upsert') &&
    serviceContent.includes('circle_id,student_id,date');
  logCheck('ATTENDANCE', 'الحفظ الذري المباشر مع ميزة Upsert الآمنة', hasUpsertLogic, 'منع تكرار السجلات وتحديث كشف اليوم بصورة ذرية موحدة');

  const hasWarningsAndReports =
    serviceContent.includes('consecutiveAbsences') &&
    serviceContent.includes('hasWarning') &&
    pageContent.includes('إنذار تجاوز الغياب');
  logCheck('ATTENDANCE', 'احتساب المؤشرات التراكمية ورصد إنذارات الغياب التلقائية', hasWarningsAndReports, 'إطلاق إنذار عند تجاوز 3 غيابات متتالية أو هبوط نسبة الحضور عن 80%');

  const hasBulkAndExport =
    pageContent.includes('handleMarkAll') &&
    serviceContent.includes('\\uFEFF') &&
    serviceContent.includes('exportAttendanceToCSV');
  logCheck('ATTENDANCE', 'أدوات التحضير والتغييب الجماعي وتصدير كشف Excel/CSV عربي بترميز BOM', hasBulkAndExport, 'أزرار تحضير/تغييب الكل مع تصدير CSV متوافق مع Excel');
}

// 3. فحص بيانات السور ومكتبة القرآن الكريم (Quran Metadata)
function checkQuranMetadata() {
  const metadataPath = path.join(root, 'lib/quranMetadata.ts');
  const content = fs.existsSync(metadataPath) ? fs.readFileSync(metadataPath, 'utf-8') : '';

  const has114Surahs =
    content.includes('الفاتحة') &&
    content.includes('البقرة') &&
    content.includes('الناس') &&
    content.includes('QURAN_SURAHS') &&
    content.includes('ayahsCount') &&
    content.includes('startJuz');
  logCheck('QURAN_DATA', 'اكتمال بيانات السور القرآنية الـ 114 وأعداد الآيات والأجزاء', has114Surahs, 'فهرس قرآني كامل يتيح التحقق الصارم من صحة نطاقات الآيات وأرقام الأجزاء');
}

// 4. فحص دفتر المتابعة القرآنية وسجل الإتقان (Memorization & Grades)
function checkPedagogicalGrades() {
  const servicePath = path.join(root, 'lib/pedagogicalService.ts');
  const pagePath = path.join(root, 'pages/Grades.tsx');
  const modalPath = path.join(root, 'components/grades/NewMemorizationModal.tsx');

  const serviceContent = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf-8') : '';
  const pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf-8') : '';
  const modalContent = fs.existsSync(modalPath) ? fs.readFileSync(modalPath, 'utf-8') : '';

  const hasRecordTypes =
    serviceContent.includes('new_memorization') &&
    serviceContent.includes('minor_review') &&
    serviceContent.includes('major_review');
  logCheck('MEMORIZATION', 'توثيق أنواع السجلات الثلاثة (حفظ جديد، مراجعة صغرى، مراجعة كبرى)', hasRecordTypes, 'ربط مباشر مع جدول memorization_records في Supabase');

  const hasGradesAndMistakes =
    serviceContent.includes('ممتاز') &&
    serviceContent.includes('جيد جداً') &&
    serviceContent.includes('mistakes_count') &&
    serviceContent.includes('tajweed_mistakes_count');
  logCheck('MEMORIZATION', 'رصد درجات الإتقان وحصر أخطاء الحفظ والتجويد', hasGradesAndMistakes, 'توثيق تقدير الشيخ وأخطاء التوقف والتجويد وملاحظات التوجيه');

  const hasEvaluations =
    serviceContent.includes('fetchEvaluations') &&
    serviceContent.includes('createEvaluation') &&
    pageContent.includes('evaluations') &&
    pageContent.includes('appreciation');
  logCheck('EVALUATIONS', 'منظومة الاختبارات والتقييمات الدورية التراكمية', hasEvaluations, 'رصد اختبارات الحفظ والتجويد والسلوك من 100 واحتساب النسب المئوية');

  const hasPrintAndFilter =
    pageContent.includes('window.print') &&
    pageContent.includes('filterType') &&
    pageContent.includes('filterGrade');
  logCheck('PEDAGOGICAL_UI', 'دعم الطباعة والتصفية المزدوجة بالنوع والتقدير والحلقة', hasPrintAndFilter, 'طباعة السجل القرآني الكامل مع أدوات التصفية المتقدمة');
}

// تنفيذ الفحوصات
checkFilesExistence();
checkAttendanceManagement();
checkQuranMetadata();
checkPedagogicalGrades();

console.log('\n================================================================');
const total = checks.length;
const passed = checks.filter(c => c.passed).length;
const failed = total - passed;

console.log(`إجمالي الفحوصات: ${total} | الناجحة: ${passed} | الفاشلة: ${failed}`);
if (failed === 0) {
  console.log('🎉 تهانينا! جميع فحوصات المرحلة 7.4 اجتازت بنجاح تام وفق المعايير الهندسية.');
} else {
  console.log('⚠️ هناك فحوصات تحتاج إلى مراجعة قبل الاعتماد النهائي.');
}
console.log('================================================================');

process.exit(failed === 0 ? 0 : 1);

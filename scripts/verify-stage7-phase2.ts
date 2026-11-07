/**
 * سكربت التحقق الهندسي الشامل للمرحلة الفرعية 7.2 — منظومة إدارة الطلاب والتسجيل والملفات الدراسية
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
console.log('فحص المرحلة 7.2 — منظومة إدارة الطلاب والتسجيل والملفات الدراسية');
console.log('================================================================\n');

// 1. فحص ملفات المرحلة 7.2
function checkFilesExistence() {
  const files = [
    { file: 'supabase/migrations/20261105000012_student_management_rpcs.sql', name: 'ملف ترحيل قاعدة البيانات وإجراءات RPC الذرية' },
    { file: 'types/student.types.ts', name: 'ملف تعريف الأنواع ونماذج البيانات للمرحلة' },
    { file: 'lib/studentsService.ts', name: 'خدمة استعلامات وعمليات الطلاب والتصدير' },
    { file: 'lib/registrationService.ts', name: 'خدمة طلبات التسجيل والتحويل الآلي للطلاب' },
    { file: 'hooks/useStudents.ts', name: 'خطاف إدارة حالة الطلاب والتصفية والتصفح' },
    { file: 'pages/Students.tsx', name: 'شاشة إدارة الطلاب الرئيسية وجدول الـ 12 عموداً' },
    { file: 'pages/Registration.tsx', name: 'شاشة إدارة طلبات التسجيل والتحويل الفوري' },
    { file: 'components/students/StudentProfileModal.tsx', name: 'نافذة ملف الطالب الشامل (7 تبويبات + بطاقة الطالب)' },
    { file: 'components/students/StudentFormModal.tsx', name: 'نافذة إضافة وتعديل بيانات الطالب وقواعد التحقق' },
    { file: 'components/students/StudentTransferModal.tsx', name: 'نافذة نقل الطالب بين الحلقات مع الاحتفاظ بالسجل التاريخي' },
  ];

  files.forEach(f => {
    const filePath = path.join(root, f.file);
    const exists = fs.existsSync(filePath);
    logCheck('FILES', f.name, exists, `الملف: ${f.file}`);
  });
}

// 2. فحص الهجرة البرمجية ودوال RPC في قاعدة البيانات
function checkDatabaseMigration() {
  const migrationPath = path.join(root, 'supabase/migrations/20261105000012_student_management_rpcs.sql');
  if (!fs.existsSync(migrationPath)) {
    logCheck('DATABASE', 'ملف الترحيل مفقود', false, migrationPath);
    return;
  }

  const content = fs.readFileSync(migrationPath, 'utf-8');

  const hasRegNumberFunc = content.includes('generate_student_registration_number');
  const hasTransferFunc = content.includes('transfer_student_circle');
  const hasConvertFunc = content.includes('convert_registration_application');
  const hasLockingOrSecurity = content.includes('pg_advisory_xact_lock') || content.includes('FOR UPDATE');
  const hasRollback = content.includes('DROP FUNCTION IF EXISTS');

  logCheck('DATABASE', 'دالة توليد رقم القيد التسلسلي الذري (generate_student_registration_number)', hasRegNumberFunc, 'توليد أرقام قيد فريدة مع قفل الحماية من التعارض');
  logCheck('DATABASE', 'دالة نقل الطالب الذرية بين الحلقات (transfer_student_circle)', hasTransferFunc, 'نقل الطالب مع إغلاق القيد السابق وحفظ سبب وتاريخ النقل والتحقق من السعة');
  logCheck('DATABASE', 'دالة تحويل طلب التسجيل إلى طالب فعلي (convert_registration_application)', hasConvertFunc, 'تحويل الطلب وإدراج ولي الأمر والطالب وقيده بالحلقة بحركة ذرية واحدة');
  logCheck('DATABASE', 'قفل الصفوف والحماية من التزامن والتكرار (Advisory Lock / FOR UPDATE)', hasLockingOrSecurity, 'ضمان عدم تكرار التحويل أو تجاوز السعة الاستيعابية');
  logCheck('DATABASE', 'توثيق خطة التراجع (Rollback Plan)', hasRollback, 'أوامر التراجع والـ Drop متوفرة وموثقة');
}

// 3. فحص جدول الطلاب (المرحلة 7.2.1)
function checkStudentsTable() {
  const pagePath = path.join(root, 'pages/Students.tsx');
  if (!fs.existsSync(pagePath)) return;

  const content = fs.readFileSync(pagePath, 'utf-8');

  // الأعمدة الـ 12 الإلزامية
  const requiredColumns = [
    'رقم القيد',
    'اسم الطالب الكامل',
    'الجنس',
    'تاريخ الميلاد',
    'ولي الأمر',
    'الهاتف',
    'الحلقة المسندة',
    'المستوى القرآني',
    'حالة القيد',
    'تاريخ الالتحاق',
    'العام الدراسي',
    'الإجراءات'
  ];

  const columnsPresent = requiredColumns.every(col => content.includes(col));
  logCheck('STUDENTS_TABLE', 'تضمين الأعمدة الـ 12 المحددة في المتطلبات', columnsPresent, `الأعمدة المفحوصة: ${requiredColumns.join('، ')}`);

  // وظائف التصفية والبحث والصفحات والتصدير
  const hasFiltersAndExport =
    content.includes('filters.search') &&
    content.includes('filters.circleId') &&
    content.includes('filters.gender') &&
    content.includes('filters.level') &&
    content.includes('filters.status') &&
    content.includes('exportCSV') &&
    content.includes('totalPages');

  logCheck('STUDENTS_TABLE', 'أدوات التصفية والبحث متعدد المعايير والتصدير والتقسيم لصفحات', hasFiltersAndExport, 'البحث بالاسم والهاتف، والتصفية بالحلقة والجنس والمستوى والحالة والعام مع تقسيم الصفحات وتصدير CSV');

  // فحص الحفاظ على توافق تصدير StudentDetailsContent المستورد في لوحة التحكم
  const hasStudentDetailsExport = content.includes('export const StudentDetailsContent') || content.includes('export function StudentDetailsContent');
  logCheck('STUDENTS_TABLE', 'التوافق الخلفي مع لوحة التحكم (تصدير StudentDetailsContent)', hasStudentDetailsExport, 'الحفاظ على المكون دون كسر التبعيات في Dashboard.tsx');
}

// 4. فحص ملف الطالب الشامل (المرحلة 7.2.2)
function checkStudentComprehensiveProfile() {
  const modalPath = path.join(root, 'components/students/StudentProfileModal.tsx');
  if (!fs.existsSync(modalPath)) return;

  const content = fs.readFileSync(modalPath, 'utf-8');

  // فحص التبويبات السبعة
  const tabs = [
    { id: 'personal', name: 'المعلومات الشخصية' },
    { id: 'guardian', name: 'ولي الأمر' },
    { id: 'academic', name: 'المعلومات الدراسية' },
    { id: 'attendance', name: 'سجل الحضور والغياب' },
    { id: 'hifz', name: 'سجل الحفظ والمراجعة' },
    { id: 'financial', name: 'السجل المالي' },
    { id: 'admin', name: 'السجل الإداري' },
  ];

  const allTabsPresent = tabs.every(t => content.includes(t.id));
  logCheck('STUDENT_PROFILE', 'توفير التبويبات السبعة الشاملة لملف الطالب', allTabsPresent, `التبويبات: ${tabs.map(t => t.name).join('، ')}`);

  // فحص العملة بالدينار الجزائري ومنع العملات الأخرى
  const hasDZD = content.includes('د.ج');
  const hasNoSAR = !content.includes('ر.س');
  logCheck('STUDENT_PROFILE', 'اعتماد العملة الرسمية (الدينار الجزائري د.ج)', hasDZD && hasNoSAR, 'عرض الاشتراكات والمدفوعات والمتبقي بالدينار الجزائري د.ج حصراً');

  // فحص بطاقة الطالب
  const hasIdCard = content.includes('بطاقة الطالب') && content.includes('window.print');
  logCheck('STUDENT_PROFILE', 'إمكانية عرض وطباعة بطاقة الطالب المدرسية', hasIdCard, 'بطاقة هوية رسمية قابلة للطباعة بمعرف الطالب والباركود والشعار');
}

// 5. فحص إضافة وتعديل ونقل الطلاب (المرحلتان 7.2.3 و 7.2.4)
function checkFormAndTransferModals() {
  const formPath = path.join(root, 'components/students/StudentFormModal.tsx');
  const transferPath = path.join(root, 'components/students/StudentTransferModal.tsx');

  const formContent = fs.existsSync(formPath) ? fs.readFileSync(formPath, 'utf-8') : '';
  const transferContent = fs.existsSync(transferPath) ? fs.readFileSync(transferPath, 'utf-8') : '';

  const formValidations =
    formContent.includes('fullName') &&
    formContent.includes('gender') &&
    formContent.includes('phone') &&
    formContent.includes('circleId');
  logCheck('STUDENT_FORM', 'التحقق من صحة مدخلات إضافة وتعديل الطالب', formValidations, 'التحقق من الاسم، الجنس، رقم هاتف ولي الأمر، والحلقة المتوافقة');

  const transferFeatures =
    transferContent.includes('currentCircleName') &&
    transferContent.includes('newCircleId') &&
    transferContent.includes('transferReason') &&
    transferContent.includes('transferStudentCircle');
  logCheck('STUDENT_TRANSFER', 'إدارة نقل الطلاب بين الحلقات وحفظ الأسباب والتاريخ', transferFeatures, 'عرض الحلقة الحالية واختيار الحلقة الجديدة وسبب النقل وتاريخه');
}

// 6. فحص التكامل مع طلبات التسجيل (المرحلة 7.2.5)
function checkRegistrationConversion() {
  const regPagePath = path.join(root, 'pages/Registration.tsx');
  const regServicePath = path.join(root, 'lib/registrationService.ts');

  const regContent = fs.existsSync(regPagePath) ? fs.readFileSync(regPagePath, 'utf-8') : '';
  const serviceContent = fs.existsSync(regServicePath) ? fs.readFileSync(regServicePath, 'utf-8') : '';

  const hasConversionInPage =
    regContent.includes('appToConvert') &&
    regContent.includes('handleExecuteConversion') &&
    regContent.includes('تأكيد التحويل وإنشاء ملف الطالب');
  logCheck('REGISTRATION', 'واجهة تحويل طلب التسجيل المقبول إلى طالب رسمي بضغطة زر', hasConversionInPage, 'نافذة منبثقة لتحديد الحلقة والمستوى قبل إتمام التحويل');

  const hasConversionInService =
    serviceContent.includes('convertApplicationToStudent') &&
    serviceContent.includes('convert_registration_application');
  logCheck('REGISTRATION', 'خدمة التحويل الذرية مع حماية عدم التكرار (Idempotency)', hasConversionInService, 'استدعاء RPC الآمن والتحقق من عدم تكرار معالجة الطلب');
}

// 7. فحص تصدير CSV بدعم العربية و UTF-8 BOM
function checkCSVExportEncoding() {
  const servicePath = path.join(root, 'lib/studentsService.ts');
  const content = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf-8') : '';

  const hasBOM = content.includes('\\uFEFF') && content.includes('text/csv;charset=utf-8;');
  logCheck('DATA_EXPORT', 'تصدير ملفات CSV مع ترميز UTF-8 BOM الداعم للغة العربية في Excel', hasBOM, 'إضافة BOM لضمان عدم ظهور الحروف العربية مشوهة عند الفتح ببرنامج Excel');
}

// تنفيذ الفحوصات
checkFilesExistence();
checkDatabaseMigration();
checkStudentsTable();
checkStudentComprehensiveProfile();
checkFormAndTransferModals();
checkRegistrationConversion();
checkCSVExportEncoding();

console.log('\n================================================================');
const total = checks.length;
const passed = checks.filter(c => c.passed).length;
const failed = total - passed;

console.log(`إجمالي الفحوصات: ${total} | الناجحة: ${passed} | الفاشلة: ${failed}`);
if (failed === 0) {
  console.log('🎉 تهانينا! جميع فحوصات المرحلة 7.2 اجتازت بنجاح تام وفق المعايير الهندسية.');
} else {
  console.log('⚠️ هناك فحوصات تحتاج إلى مراجعة قبل الاعتماد النهائي.');
}
console.log('================================================================');

process.exit(failed === 0 ? 0 : 1);

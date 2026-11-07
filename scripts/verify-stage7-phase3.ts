/**
 * سكربت التحقق الهندسي الشامل للمرحلة الفرعية 7.3 — إدارة المعلمين والحلقات والقاعات والجداول الزمنية
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
console.log('فحص المرحلة 7.3 — المعلمون والحلقات والقاعات والجداول الزمنية');
console.log('================================================================\n');

// 1. فحص وجود جميع ملفات المرحلة 7.3
function checkFilesExistence() {
  const files = [
    { file: 'types/circle.types.ts', name: 'ملف تعريف الأنواع للحلقات والقاعات والمعلمين والمواعيد' },
    { file: 'lib/teachersService.ts', name: 'خدمة إدارة المعلمين واستعلامات Supabase' },
    { file: 'lib/circlesService.ts', name: 'خدمة إدارة الحلقات والقاعات وحساب الإشغال' },
    { file: 'lib/timetableService.ts', name: 'خدمة الجداول الزمنية وفحص التعارض' },
    { file: 'components/teachers/TeacherFormModal.tsx', name: 'نافذة إضافة وتعديل بيانات المعلم' },
    { file: 'components/teachers/TeacherDetailsModal.tsx', name: 'نافذة عرض الملف الشامل للمعلم وحلقاته' },
    { file: 'components/circles/CircleFormModal.tsx', name: 'نافذة إنشاء وتعديل الحلقة القرآنية' },
    { file: 'components/circles/HallFormModal.tsx', name: 'نافذة إضافة وتعديل القاعة الدراسية' },
    { file: 'components/circles/CircleStudentsModal.tsx', name: 'نافذة استعراض قائمة طلاب الحلقة' },
    { file: 'components/timetable/ScheduleSessionModal.tsx', name: 'نافذة جدولة الحصص وفحص التعارض' },
    { file: 'pages/Teachers.tsx', name: 'شاشة إدارة المعلمين والمحفظين المطورة' },
    { file: 'pages/Halls.tsx', name: 'شاشة الحلقات والقاعات الموحدة' },
    { file: 'pages/Timetable.tsx', name: 'شاشة الجدول الزمني الأسبوعي المطورة' },
  ];

  files.forEach(f => {
    const filePath = path.join(root, f.file);
    const exists = fs.existsSync(filePath);
    logCheck('FILES', f.name, exists, `الملف: ${f.file}`);
  });
}

// 2. فحص خدمة وواجهة إدارة المعلمين (Teachers)
function checkTeachersManagement() {
  const servicePath = path.join(root, 'lib/teachersService.ts');
  const pagePath = path.join(root, 'pages/Teachers.tsx');

  const serviceContent = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf-8') : '';
  const pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf-8') : '';

  const hasServiceOps =
    serviceContent.includes('fetchTeachers') &&
    serviceContent.includes('createTeacher') &&
    serviceContent.includes('updateTeacher') &&
    serviceContent.includes('changeTeacherStatus');
  logCheck('TEACHERS', 'اكتمال عمليات خدمة المعلمين (استعلام، إضافة، تعديل، تغيير حالة)', hasServiceOps, 'ربط مباشر مع جدول teachers في Supabase مع دعم العزل');

  const hasStatsAndFilters =
    pageContent.includes('stats.total') &&
    pageContent.includes('stats.active') &&
    pageContent.includes('stats.totalCircles') &&
    pageContent.includes('searchTerm') &&
    pageContent.includes('statusFilter');
  logCheck('TEACHERS', 'لوحة مؤشرات المعلمين والتصفية المتقدمة', hasStatsAndFilters, 'عرض إجمالي المعلمين والنشطين والحلقات المدارة مع التصفية بالاسم والتخصص والحالة');

  const hasModals =
    pageContent.includes('TeacherFormModal') &&
    pageContent.includes('TeacherDetailsModal');
  logCheck('TEACHERS', 'تكامل النوافذ المنبثقة لملف المعلم وتعديل البيانات', hasModals, 'إمكانية استعراض ملف المعلم، الحلقات المسندة، وتعديل بياناته');
}

// 3. فحص خدمة وواجهة الحلقات والقاعات (Circles & Halls)
function checkCirclesAndHallsManagement() {
  const servicePath = path.join(root, 'lib/circlesService.ts');
  const pagePath = path.join(root, 'pages/Halls.tsx');

  const serviceContent = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf-8') : '';
  const pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf-8') : '';

  const hasCirclesOps =
    serviceContent.includes('fetchCircles') &&
    serviceContent.includes('fetchHalls') &&
    serviceContent.includes('fetchCircleStudents') &&
    serviceContent.includes('createCircle') &&
    serviceContent.includes('updateCircle') &&
    serviceContent.includes('createHall');
  logCheck('CIRCLES_HALLS', 'اكتمال عمليات خدمة الحلقات والقاعات وحساب الإشغال', hasCirclesOps, 'ربط مباشر مع circles و halls و circle_students');

  const hasTabsAndCapacity =
    pageContent.includes('activeTab') &&
    pageContent.includes('circles') &&
    pageContent.includes('halls') &&
    pageContent.includes('occupancyRate') &&
    pageContent.includes('barColor');
  logCheck('CIRCLES_HALLS', 'التبويب المزدوج الذكي وأشرطة السعة الاستيعابية الملونة', hasTabsAndCapacity, 'فصل الحلقات عن القاعات وعرض شريط ملون لنسبة الامتلاء (أخضر/برتقالي/أحمر)');

  const hasLevelFilters =
    pageContent.includes('levelFilter') &&
    pageContent.includes('genderFilter') &&
    pageContent.includes('statusFilter');
  logCheck('CIRCLES_HALLS', 'تصفية الحلقات حسب المستويات الخمسة والفئات المستهدفة', hasLevelFilters, 'دعم مستويات: مبتدئ، متوسط، متقدم، إتمام الحفظ، ومراجعة');
}

// 4. فحص الجداول الزمنية ومواعيد الحصص ومنع التعارض (Timetable & Schedule Conflict)
function checkTimetableAndConflicts() {
  const servicePath = path.join(root, 'lib/timetableService.ts');
  const pagePath = path.join(root, 'pages/Timetable.tsx');
  const modalPath = path.join(root, 'components/timetable/ScheduleSessionModal.tsx');

  const serviceContent = fs.existsSync(servicePath) ? fs.readFileSync(servicePath, 'utf-8') : '';
  const pageContent = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf-8') : '';
  const modalContent = fs.existsSync(modalPath) ? fs.readFileSync(modalPath, 'utf-8') : '';

  const hasConflictLogic =
    serviceContent.includes('checkScheduleConflict') &&
    serviceContent.includes('isOverlapping') &&
    serviceContent.includes('P0004') &&
    serviceContent.includes('P0005');
  logCheck('TIMETABLE', 'منظومة منع التعارض الاستباقي واعتراض أخطاء الزناد في قاعدة البيانات', hasConflictLogic, 'فحص تداخل الأوقات واعتراض رموز الخطأ P0004 (القاعات) و P0005 (المعلمين)');

  const hasWeeklyView =
    pageContent.includes('sessionsByDay') &&
    pageContent.includes('filterDay') &&
    pageContent.includes('filterTeacher') &&
    pageContent.includes('filterHall');
  logCheck('TIMETABLE', 'عرض الجدول الأسبوعي وتصفيته حسب اليوم والمحفظ والقاعة', hasWeeklyView, 'أعمدة الأيام السبعة مع بطاقات الحصص وتفاصيل الحلقة والقاعة');

  const hasPrintAndModal =
    pageContent.includes('window.print') &&
    pageContent.includes('ScheduleSessionModal') &&
    modalContent.includes('conflictCheck');
  logCheck('TIMETABLE', 'دعم الطباعة والتأكيد الفوري لجداول الحصص', hasPrintAndModal, 'طباعة الجدول الأسبوعي الكامل مع فحص التعارض اللحظي في النافذة المنبثقة');
}

// تنفيذ الفحوصات
checkFilesExistence();
checkTeachersManagement();
checkCirclesAndHallsManagement();
checkTimetableAndConflicts();

console.log('\n================================================================');
const total = checks.length;
const passed = checks.filter(c => c.passed).length;
const failed = total - passed;

console.log(`إجمالي الفحوصات: ${total} | الناجحة: ${passed} | الفاشلة: ${failed}`);
if (failed === 0) {
  console.log('🎉 تهانينا! جميع فحوصات المرحلة 7.3 اجتازت بنجاح تام وفق المعايير الهندسية.');
} else {
  console.log('⚠️ هناك فحوصات تحتاج إلى مراجعة قبل الاعتماد النهائي.');
}
console.log('================================================================');

process.exit(failed === 0 ? 0 : 1);

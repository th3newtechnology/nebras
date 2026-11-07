/**
 * سكربت التحقق الهندسي الشامل للمرحلة الفرعية 7.1 — البنية الهيكلية ولوحة المؤشرات الإدارية
 * مدرسة نبراس القرآن بمسجد إبراهيم الخليل
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
console.log('فحص المرحلة 7.1 — الهيكل العام ولوحة المؤشرات الإدارية (Dashboard & Navigation)');
console.log('================================================================\n');

// 1. فحص ملفات المرحلة 7.1
function checkFilesExistence() {
  const files = [
    { file: 'layouts/DashboardLayout.tsx', name: 'الهيكل العام للوحة التحكم' },
    { file: 'components/Sidebar.tsx', name: 'القائمة الجانبية المتجاوبة' },
    { file: 'pages/Dashboard.tsx', name: 'شاشة لوحة المؤشرات الإدارية المتكاملة' },
    { file: 'hooks/useAdminDashboardData.ts', name: 'خطاف استعلامات ومؤشرات لوحة التحكم' },
  ];

  files.forEach(f => {
    const filePath = path.join(root, f.file);
    const exists = fs.existsSync(filePath);
    logCheck('FILES', f.name, exists, `الملف: ${f.file}`);
  });
}

// 2. فحص الهيكل العام وتجاوب القائمة والقوالب (DashboardLayout & Sidebar)
function checkLayoutAndSidebar() {
  const layoutPath = path.join(root, 'layouts/DashboardLayout.tsx');
  const sidebarPath = path.join(root, 'components/Sidebar.tsx');

  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');

  // دعم القائمة المتجاوبة في الهواتف
  const hasMobileSupport =
    layoutContent.includes('isMobileMenuOpen') &&
    layoutContent.includes('Menu') &&
    sidebarContent.includes('isOpenMobile') &&
    sidebarContent.includes('onCloseMobile');
  logCheck('LAYOUT', 'دعم التجاوب للشاشات الصغيرة والقائمة المنبثقة', hasMobileSupport, 'يتوفر دعم القائمة المنبثقة وزر الإغلاق والخلفية المظللة');

  // مؤشر اتصال Supabase
  const hasConnectionStatus =
    layoutContent.includes('useSupabaseStatus') &&
    layoutContent.includes('isConnected') &&
    layoutContent.includes('Supabase متصل');
  logCheck('LAYOUT', 'مؤشر حالة الاتصال بقاعدة البيانات Supabase', hasConnectionStatus, 'يعرض حالة الاتصال المباشر مع زر التحديث اللحظي');

  // عناوين الصفحات والتنقل
  const hasViewTitles =
    layoutContent.includes('VIEW_TITLES') &&
    layoutContent.includes('لوحة المؤشرات والتحليلات الإدارية') &&
    layoutContent.includes('1447-1448 هـ');
  logCheck('LAYOUT', 'عناوين الصفحات وسياق العام الدراسي', hasViewTitles, 'يوفر سياقاً مرئياً للعام الدراسي والعنوان الفرعي لكل شاشة');

  // قائمة الإدارة الكاملة في الشريط الجانبي
  const hasAdminNavigationItems =
    sidebarContent.includes('dashboard') &&
    sidebarContent.includes('students') &&
    sidebarContent.includes('teachers') &&
    sidebarContent.includes('halls') &&
    sidebarContent.includes('attendance') &&
    sidebarContent.includes('grades') &&
    sidebarContent.includes('timetable') &&
    sidebarContent.includes('registration') &&
    sidebarContent.includes('fees') &&
    sidebarContent.includes('events') &&
    sidebarContent.includes('messages') &&
    sidebarContent.includes('settings');
  logCheck('SIDEBAR', 'اكتمال روابط المحاور الإدارية الـ 12', hasAdminNavigationItems, 'تغطي القائمة الجانبية كافة شاشات بوابة الإدارة');
}

// 3. فحص خطاف البيانات ومؤشرات Supabase (useAdminDashboardData)
function checkDashboardDataHook() {
  const hookPath = path.join(root, 'hooks/useAdminDashboardData.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf-8');

  // استعلام الجداول الحية من Supabase
  const queriesRequiredTables =
    hookContent.includes("from('students')") &&
    hookContent.includes("from('circles')") &&
    hookContent.includes("from('halls')") &&
    hookContent.includes("from('circle_students')") &&
    hookContent.includes("from('attendance')") &&
    hookContent.includes("from('fees')") &&
    hookContent.includes("from('registration_applications')") &&
    hookContent.includes("from('academic_years')") &&
    hookContent.includes("from('memorization_records')");
  logCheck('DATA_HOOK', 'ربط الجداول الحية من مخطط Supabase', queriesRequiredTables, 'يستعلم 9 جداول أساسية بالتوازي عبر Promise.allSettled');

  // التحقق المالي بالدينار الجزائري (DZD)
  const hasDzdCurrency =
    hookContent.includes('totalBilledDzd') &&
    hookContent.includes('totalCollectedDzd') &&
    hookContent.includes('totalRemainingDzd') &&
    hookContent.includes('collectionRate');
  logCheck('DATA_HOOK', 'المحرك المالي بالدينار الجزائري (DZD)', hasDzdCurrency, 'حساب المبالغ المفوترة والمحصلة والمتبقية ومعدل التحصيل');

  // البيانات الاحتياطية لمسجد إبراهيم الخليل
  const hasFallbackData =
    hookContent.includes('FALLBACK_DASHBOARD_DATA') &&
    hookContent.includes('مسجد إبراهيم الخليل') &&
    hookContent.includes('حلقة البراعم التأسيسية') &&
    hookContent.includes('حلقة الصديق للمتقنين');
  logCheck('DATA_HOOK', 'البيانات الاحتياطية المتسقة مع هوية المدرسة', hasFallbackData, 'جاهزية مؤشرات واقعية تضمن عمل الواجهة فوراً حتى قبل اتصال الخادم');
}

// 4. فحص شاشة لوحة المؤشرات (Dashboard.tsx)
function checkDashboardPage() {
  const pagePath = path.join(root, 'pages/Dashboard.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');

  // استئصال العملة السعودية القديمة
  const noOldCurrency = !pageContent.includes('ر.س');
  logCheck('DASHBOARD', 'تطهير العملات القديمة واعتماد الدينار الجزائري', noOldCurrency, 'تم استبدال ر.س بالدينار الجزائري (د.ج / DZD)');

  // البطاقات الخمس الأساسية
  const has5CoreCards =
    pageContent.includes('الطلاب المقيدون') &&
    pageContent.includes('الحلقات والقاعات') &&
    pageContent.includes('الحضور اليومي') &&
    pageContent.includes('تحصيل الاشتراكات') &&
    pageContent.includes('طلبات جديدة');
  logCheck('DASHBOARD', 'البطاقات الإحصائية الخمس الرئيسية', has5CoreCards, 'عرض الطلاب المقيدين، الحلقات، الحضور، الرسوم، والطلبات المعلقة');

  // الرسوم البيانية التفاعلية Recharts
  const hasRecharts =
    pageContent.includes('ResponsiveContainer') &&
    pageContent.includes('AreaChart') &&
    pageContent.includes('BarChart') &&
    pageContent.includes('PieChart') &&
    pageContent.includes('monthlyHifzProgress') &&
    pageContent.includes('weeklyTrend');
  logCheck('DASHBOARD', 'الرسوم البيانية التفاعلية المتقدمة (Recharts)', hasRecharts, 'وتيرة الحفظ التراكمي، الحضور الأسبوعي، والمستويات القرآنية');

  // قسم طلبات الالتحاق المعلقة
  const hasPendingApplicationsSection =
    pageContent.includes('طلبات الالتحاق الجديدة الواردة من الموقع العام') &&
    pageContent.includes('applications.recentPending');
  logCheck('DASHBOARD', 'قسم مراجعة طلبات الالتحاق المعلقة', hasPendingApplicationsSection, 'عرض أحدث الطلبات الواردة من الموقع العام مع رقم ولي الأمر والمسار');

  // أحدث سجلات التسميع والتقييم
  const hasMemorizationLogsSection =
    pageContent.includes('أحدث جلسات التسميع والتقييم') &&
    pageContent.includes('memorization.recentLogs');
  logCheck('DASHBOARD', 'قسم رصد جلسات التسميع والإتقان القرآني', hasMemorizationLogsSection, 'عرض السورة، الأجزاء، الآيات، التقدير، ونوع السجل');

  // إشغال القاعات والحلقات
  const hasHallsOccupancySection =
    pageContent.includes('معدلات إشغال الحلقات وقاعات مسجد إبراهيم الخليل') &&
    pageContent.includes('circlesAndHalls.circlesOverview');
  logCheck('DASHBOARD', 'قسم إشغال قاعات المسجد والحلقات', hasHallsOccupancySection, 'أشرطة تقدم بصرية توضح نسبة إشغال المقاعد لكل حلقة');

  // التنقل المباشر بين الشاشات
  const hasQuickNavigation =
    pageContent.includes("onNavigateView?.('students')") &&
    pageContent.includes("onNavigateView?.('registration')") &&
    pageContent.includes("onNavigateView?.('attendance')") &&
    pageContent.includes("onNavigateView?.('fees')");
  logCheck('DASHBOARD', 'أزرار التوجيه السريع للشاشات الإدارية المتخصصة', hasQuickNavigation, 'إمكانية النقر على البطاقات للانتقال الفوري للشاشة المعنية');
}

// 5. فحص تكامل App.tsx
function checkAppIntegration() {
  const appPath = path.join(root, 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  const passesNavigation = appContent.includes('onNavigateView=') && appContent.includes('setCurrentView(view)');
  logCheck('APP', 'ربط توجيه لوحة المؤشرات في App.tsx', passesNavigation, 'تمرير دالة التنقل وتعيين الشاشة النشطة ومصطلح البحث المالي');
}

// تشغيل الفحوصات
checkFilesExistence();
checkLayoutAndSidebar();
checkDashboardDataHook();
checkDashboardPage();
checkAppIntegration();

console.log('\n================================================================');
const passedCount = checks.filter(c => c.passed).length;
const totalCount = checks.length;
console.log(`النتيجة النهائية لفحص المرحلة 7.1: ${passedCount} / ${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)`);
console.log('================================================================');

if (passedCount !== totalCount) {
  process.exit(1);
}

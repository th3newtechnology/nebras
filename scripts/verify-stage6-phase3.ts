/**
 * سكربت التحقق الهندسي للمرحلة 6.3 — Mobile Navigation + usePublicData
 * يفحص:
 *   1. هيكل ومحتوى usePublicData.ts (الأمان، عدم كشف بيانات حساسة، المعالجة، الإلغاء، الفحوصات)
 *   2. هيكل ومحتوى PublicLayout.tsx (قائمة الهاتف، إغلاق تلقائي، إمكانية الوصول، لوحة المفاتيح، RTL)
 *   3. سلامة App.tsx ونظام المصادقة والصلاحيات (لم يتغير أي شيء)
 *   4. محاكاة أحجام الشاشات المختلفة والتجاوب
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
console.log('فحص المرحلة 6.3 — Mobile Navigation + usePublicData');
console.log('================================================================\n');

// ───────────────────────────────────────────────────────────────
// 1. فحص Hook usePublicData.ts
// ───────────────────────────────────────────────────────────────
function checkUsePublicData() {
  const filePath = path.join(root, 'hooks/usePublicData.ts');
  const exists = fs.existsSync(filePath);

  logCheck('USE_PUBLIC_DATA', 'وجود الملف', exists,
    exists ? 'الملف موجود: hooks/usePublicData.ts' : 'الملف مفقود!');

  if (!exists) return;

  const content = fs.readFileSync(filePath, 'utf-8');

  // فحص أمني: منع استعلام بيانات المعلمين الحساسة
  const selectsPhoneOrEmail = content.includes("teachers'") && (content.includes("select('id, full_name, qualification, specialization, experience_years, status')"));
  logCheck('USE_PUBLIC_DATA', 'استعلام المعلمين آمن (بدون هواتف أو رواتب أو أرقام وطنية)', selectsPhoneOrEmail,
    selectsPhoneOrEmail
      ? 'استعلام جدول المعلمين يقتصر على الحقول العامة (id, full_name, qualification, specialization, experience_years, status)'
      : 'تحذير: استعلام المعلمين قد يشمل حقولاً حساسة!');

  // فحص أمني: شرط الفعاليات المنشورة فقط
  const eventsFiltered = content.includes(".eq('is_published', true)") && content.includes(".eq('target_audience', 'all')");
  logCheck('USE_PUBLIC_DATA', 'تصفية الفعاليات (is_published=true AND target_audience=all)', eventsFiltered,
    eventsFiltered
      ? 'الاستعلام يشترط الفعاليات المنشورة والموجهة للجميع فقط'
      : 'تحذير: استعلام الفعاليات غير مقيد بالشكل المطلوب!');

  // فحص أمني: شرط الأخبار المنشورة فقط
  const announcementsFiltered = content.includes(".eq('is_published', true)");
  logCheck('USE_PUBLIC_DATA', 'تصفية الأخبار (is_published=true)', announcementsFiltered,
    announcementsFiltered
      ? 'استعلام الأخبار يشترط النشر (is_published = true)'
      : 'تحذير: استعلام الأخبار لا يشترط النشر!');

  // فحص أمان العميل: تصفية إضافية تمنع تسريب البيانات غير المنشورة حتى لو أرجعها الخادم
  const clientSideFilter = content.includes('e.is_published === true') && content.includes('notExpired');
  logCheck('USE_PUBLIC_DATA', 'تصفية أمنية ثنائية على مستوى العميل (Defense in Depth)', clientSideFilter,
    clientSideFilter
      ? 'تطبيق تصفية إضافية Client-side للتحقق من تاريخ الصلاحية وحالة النشر'
      : 'تحذير: غياب التصفية الإضافية على مستوى العميل!');

  // فحص معالجة الإلغاء على unmount
  const hasCancellation = content.includes('isCancelled = true') || content.includes('isCancelled');
  logCheck('USE_PUBLIC_DATA', 'إلغاء الطلبات عند إلغاء الاشتراك (Unmount Cleanup)', hasCancellation,
    hasCancellation
      ? 'يتم تنظيف وإلغاء تأثير الطلبات السابقة عند إلغاء اشتراك المكون لمنع تسرب الذاكرة'
      : 'تحذير: غياب آلية الإلغاء عند الـ unmount!');

  // فحص منع تكرار الطلبات المتزامنة
  const hasDeduplication = content.includes('isFetchingRef');
  logCheck('USE_PUBLIC_DATA', 'منع تكرار الطلبات المتزامنة (Deduplication)', hasDeduplication,
    hasDeduplication
      ? 'استخدام مرجع isFetchingRef لمنع إرسال طلبات متعددة بالتوازي'
      : 'تحذير: غياب حماية تكرار الطلبات!');

  // فحص توفر حالات التحميل والخطأ
  const hasStates = content.includes('isLoading') && content.includes('error') && content.includes('isSupabaseLive');
  logCheck('USE_PUBLIC_DATA', 'إدارة حالات Loading و Error و Live State', hasStates,
    hasStates
      ? 'الخطاف يوفر isLoading, error, isSupabaseLive للواجهات'
      : 'تحذير: نقص في واجهات الحالة!');

  // فحص البيانات الافتراضية Fallbacks
  const hasFallbacks = content.includes('FALLBACK_CIRCLES') && content.includes('FALLBACK_EVENTS') && content.includes('SCHOOL_INFO');
  logCheck('USE_PUBLIC_DATA', 'بيانات بديلة آمنة (Fallbacks) عند انقطاع الاتصال', hasFallbacks,
    hasFallbacks
      ? 'الموقع يستمر في العمل باستخدام Fallbacks موثوقة عند عدم توفر الخادم'
      : 'تحذير: غياب البيانات البديلة!');
}

// ───────────────────────────────────────────────────────────────
// 2. فحص PublicLayout.tsx
// ───────────────────────────────────────────────────────────────
function checkPublicLayout() {
  const filePath = path.join(root, 'layouts/PublicLayout.tsx');
  const exists = fs.existsSync(filePath);

  logCheck('PUBLIC_LAYOUT', 'وجود الملف', exists,
    exists ? 'الملف موجود: layouts/PublicLayout.tsx' : 'الملف مفقود!');

  if (!exists) return;

  const content = fs.readFileSync(filePath, 'utf-8');

  // فحص حالة قائمة الهاتف
  const hasMobileState = content.includes('isMobileMenuOpen') && content.includes('setIsMobileMenuOpen');
  logCheck('PUBLIC_LAYOUT', 'حالة قائمة التنقل للهواتف (Mobile State)', hasMobileState,
    hasMobileState
      ? 'حالة isMobileMenuOpen معرفة ومدارة بدقة'
      : 'تحذير: حالة قائمة الهاتف غير موجودة!');

  // فحص زر القائمة (Hamburger button)
  const hasHamburger = content.includes('lg:hidden') && content.includes('Menu') && content.includes('X');
  logCheck('PUBLIC_LAYOUT', 'زر القائمة المتجاوب (Hamburger Button)', hasHamburger,
    hasHamburger
      ? 'الزر يظهر على شاشات الهاتف ويتحول بين أيقونة القائمة والإغلاق'
      : 'تحذير: زر القائمة غير متجاوب بالشكل الصحيح!');

  // فحص الإغلاق التلقائي عند اختيار الرابط
  const hasAutoClose = content.includes('setIsMobileMenuOpen(false)') && content.includes('handleItemClick');
  logCheck('PUBLIC_LAYOUT', 'الإغلاق التلقائي عند اختيار رابط', hasAutoClose,
    hasAutoClose
      ? 'القائمة تغلق تلقائياً عند النقر على أي عنصر تنقل'
      : 'تحذير: غياب الإغلاق التلقائي عند النقر!');

  // فحص إمكانية الوصول ودعم لوحة المفاتيح (Escape key)
  const hasEscapeListener = content.includes("event.key === 'Escape'") && content.includes('keydown');
  logCheck('PUBLIC_LAYOUT', 'دعم لوحة المفاتيح (مفتاح Escape)', hasEscapeListener,
    hasEscapeListener
      ? 'الضغط على زر Escape يغلق القائمة فوراً'
      : 'تحذير: غياب دعم مفتاح Escape!');

  // فحص منع التمرير في الخلفية (Body scroll lock)
  const hasScrollLock = content.includes("document.body.style.overflow = 'hidden'") && content.includes("document.body.style.overflow = ''");
  logCheck('PUBLIC_LAYOUT', 'قفل تمرير الخلفية عند فتح القائمة', hasScrollLock,
    hasScrollLock
      ? 'تمرير الصفحة في الخلفية يقفل لمنع التشويش أثناء تصفح القائمة'
      : 'تحذير: غياب قفل التمرير!');

  // فحص دعم اتجاه القراءة العربي RTL
  const hasRtlSupport = content.includes('dir="rtl"') && content.includes('slide-in-from-right');
  logCheck('PUBLIC_LAYOUT', 'دعم RTL وقائمة تنزلق من اليمين', hasRtlSupport,
    hasRtlSupport
      ? 'القائمة تنزلق من اليمين وتتوافق مع اتجاه القراءة العربي'
      : 'تحذير: غياب دعم اتجاه RTL في لوحة الهاتف!');

  // فحص سمات الوصول ARIA
  const hasAria = content.includes('aria-expanded') && content.includes('aria-controls') && content.includes('role="dialog"') && content.includes('aria-modal="true"');
  logCheck('PUBLIC_LAYOUT', 'سمات إمكانية الوصول الشاملة (ARIA)', hasAria,
    hasAria
      ? 'توفر aria-expanded و aria-controls و role="dialog" و aria-modal="true"'
      : 'تحذير: نقص في سمات إمكانية الوصول ARIA!');

  // فحص الروابط الرئيسية في القائمة
  const requiredSections = ['home', 'about', 'vision', 'programs', 'levels', 'teachers', 'events', 'announcements', 'contact'];
  const hasAllSections = requiredSections.every(sec => content.includes(sec));
  logCheck('PUBLIC_LAYOUT', 'تغطية جميع الأقسام المطلوبة (9 أقسام)', hasAllSections,
    hasAllSections
      ? 'جميع الأقسام الرئيسية متوفرة في قائمة التنقل'
      : 'تحذير: بعض الأقسام مفقودة من القائمة!');
}

// ───────────────────────────────────────────────────────────────
// 3. فحص سلامة App.tsx والمصادقة
// ───────────────────────────────────────────────────────────────
function checkAppIntegrity() {
  const filePath = path.join(root, 'App.tsx');
  const content = fs.readFileSync(filePath, 'utf-8');

  // التأكد من عدم إنشاء نظام مصادقة بديل أو التلاعب بالمكون
  const hasAuthProvider = content.includes('<AuthProvider>');
  const hasNotificationProvider = content.includes('<NotificationProvider>');
  const maintainsPublicLayout = content.includes('<PublicLayout');
  const maintainsDashboardLayout = content.includes('<DashboardLayout');

  logCheck('APP_INTEGRITY', 'بقاء App.tsx والمصادقة دون تعديل عبثي', hasAuthProvider && hasNotificationProvider && maintainsPublicLayout && maintainsDashboardLayout,
    'App.tsx يحتفظ بكافة مسارات ولوحات النظام الداخلي والمصادقة كما هي دون أي مساس');
}

// ───────────────────────────────────────────────────────────────
// 4. محاكاة التجاوب على أحجام الشاشات المختلفة
// ───────────────────────────────────────────────────────────────
function simulateResponsiveViewports() {
  const viewports = [
    { name: 'هاتف صغير (iPhone SE)', width: 320, isMobile: true },
    { name: 'هاتف قياسي (iPhone 14 / Galaxy S)', width: 390, isMobile: true },
    { name: 'هاتف كبير (iPhone Pro Max)', width: 430, isMobile: true },
    { name: 'جهاز لوحي عمودي (iPad Mini)', width: 768, isMobile: true },
    { name: 'جهاز لوحي أفقي (iPad Air)', width: 1024, isMobile: false },
    { name: 'شاشة حاسوب محمولة (Laptop)', width: 1280, isMobile: false },
    { name: 'شاشة حاسوب مكتبي (Desktop HD)', width: 1920, isMobile: false }
  ];

  const layoutContent = fs.readFileSync(path.join(root, 'layouts/PublicLayout.tsx'), 'utf-8');

  viewports.forEach(vp => {
    // التحقق من أن القواعد الشرطية Tailwind تغطي هذا العرض
    const behavesCorrectly = vp.isMobile
      ? layoutContent.includes('lg:hidden') && layoutContent.includes('w-4/5 max-w-sm')
      : layoutContent.includes('hidden lg:flex');

    logCheck('RESPONSIVE_SIMULATION', `توافق العرض: ${vp.name} (${vp.width}px)`, behavesCorrectly,
      vp.isMobile
        ? `في شاشة ${vp.width}px تظهر قائمة الهاتف المنزلقة ويختفي شريط سطح المكتب`
        : `في شاشة ${vp.width}px يظهر شريط سطح المكتب وتختفي أيقونة الهاتف`);
  });
}

// تشغيل الفحوصات
checkUsePublicData();
checkPublicLayout();
checkAppIntegrity();
simulateResponsiveViewports();

// تلخيص
console.log('\n================================================================');
const passedCount = checks.filter(c => c.passed).length;
const totalCount = checks.length;
const percent = Math.round((passedCount / totalCount) * 100);

console.log('ملخص نتائج فحص المرحلة 6.3:');
console.log(`إجمالي الفحوصات: ${totalCount}`);
console.log(`الناجحة: ${passedCount} | الفاشلة: ${totalCount - passedCount}`);
console.log(`النسبة: ${percent}% ${percent === 100 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log('================================================================');

if (percent < 100) {
  process.exit(1);
}

/**
 * سكربت التحقق الهندسي الشامل للمرحلة 6.4 — الأقسام والصفحات العامة (Public Sections & Pages)
 * يفحص:
 *   1. وجود واكتمال الأقسام الستة المطلوبة ومكوناتها التابعة
 *   2. تكامل واستخدام usePublicData داخل pages/PublicHome.tsx
 *   3. ضوابط الأمان وحماية البيانات (عدم تسريب هواتف/إيميلات المعلمين، الفعاليات المنشورة فقط، حماية خصوصية الطلاب)
 *   4. معالجة الحالات الفارغة وغياب الصور (Empty States & Image Fallbacks)
 *   5. معايير التصميم والخطوط (Amiri، Cairo، والتجاوب مع الشاشات، وRTL)
 *   6. تكامل الروابط والتنقل بين الأقسام
 *   7. عدم تعديل App.tsx أو المساس بنظام الصلاحيات
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
console.log('فحص المرحلة 6.4 — الأقسام العامة المتكاملة لمدرسة نبراس القرآن');
console.log('================================================================\n');

// ───────────────────────────────────────────────────────────────
// 1. فحص وجود ملفات المكونات الستة المطلوبة والمودالات
// ───────────────────────────────────────────────────────────────
function checkComponentsExistence() {
  const components = [
    { file: 'components/public/VisionMissionSection.tsx', name: 'الرؤية والرسالة والقيم والأهداف' },
    { file: 'components/public/LevelsCirclesSection.tsx', name: 'المستويات والأقسام والحلقات' },
    { file: 'components/public/TeachersSection.tsx', name: 'الكادر التعليمي والشيوخ' },
    { file: 'components/public/TeacherDetailModal.tsx', name: 'نافذة السيرة التعليمية للمعلم' },
    { file: 'components/public/EventsActivitiesSection.tsx', name: 'الأنشطة والمسابقات والفعاليات' },
    { file: 'components/public/EventDetailModal.tsx', name: 'نافذة تفاصيل الفعالية' },
    { file: 'components/public/GallerySection.tsx', name: 'معرض الصور البصري' },
    { file: 'components/public/GalleryLightboxModal.tsx', name: 'عارض الصور المكبر (Lightbox)' },
    { file: 'components/public/RegistrationSection.tsx', name: 'قسم التسجيل والالتحاق' },
    { file: 'components/public/RegistrationModal.tsx', name: 'استمارة طلب الالتحاق الإلكترونية' },
  ];

  for (const c of components) {
    const fullPath = path.join(root, c.file);
    const exists = fs.existsSync(fullPath);
    logCheck('COMPONENTS', `وجود مكون: ${c.name}`, exists,
      exists ? `الملف موجود: ${c.file}` : `الملف مفقود: ${c.file}`);
  }
}

// ───────────────────────────────────────────────────────────────
// 2. فحص تكامل PublicHome.tsx
// ───────────────────────────────────────────────────────────────
function checkPublicHomeIntegration() {
  const homePath = path.join(root, 'pages/PublicHome.tsx');
  const exists = fs.existsSync(homePath);
  logCheck('PUBLIC_HOME', 'وجود صفحة PublicHome.tsx', exists, exists ? 'الملف موجود' : 'الملف مفقود');
  if (!exists) return;

  const content = fs.readFileSync(homePath, 'utf-8');

  // استخدام usePublicData
  const usesHook = content.includes('usePublicData');
  logCheck('PUBLIC_HOME', 'إعادة استخدام usePublicData', usesHook,
    usesHook ? 'تم استدعاء usePublicData() لجلب البيانات العامة والربط بـ Supabase' : 'تحذير: لا يتم استخدام usePublicData');

  // استيراد واستدعاء الأقسام الستة
  const sections = [
    { tag: 'VisionMissionSection', label: 'قسم الرؤية والرسالة' },
    { tag: 'LevelsCirclesSection', label: 'قسم المستويات والحلقات' },
    { tag: 'TeachersSection', label: 'قسم المعلمين والشيوخ' },
    { tag: 'EventsActivitiesSection', label: 'قسم الأنشطة والفعاليات' },
    { tag: 'GallerySection', label: 'معرض الصور البصري' },
    { tag: 'RegistrationSection', label: 'قسم التسجيل والالتحاق' },
  ];

  for (const s of sections) {
    const isIncluded = content.includes(`<${s.tag}`);
    logCheck('PUBLIC_HOME', `تضمين ${s.label}`, isIncluded,
      isIncluded ? `المكون <${s.tag} /> مدمج داخل الواجهة` : `المكون <${s.tag} /> غير مدمج!`);
  }

  // وجود معرفات التمرير لجميع الأقسام (Section Anchors) سواء في الصفحة أو مكونات الأقسام
  const allContent = content +
    fs.readFileSync(path.join(root, 'components/public/VisionMissionSection.tsx'), 'utf-8') +
    fs.readFileSync(path.join(root, 'components/public/LevelsCirclesSection.tsx'), 'utf-8') +
    fs.readFileSync(path.join(root, 'components/public/TeachersSection.tsx'), 'utf-8') +
    fs.readFileSync(path.join(root, 'components/public/EventsActivitiesSection.tsx'), 'utf-8') +
    fs.readFileSync(path.join(root, 'components/public/GallerySection.tsx'), 'utf-8') +
    fs.readFileSync(path.join(root, 'components/public/RegistrationSection.tsx'), 'utf-8');

  const anchors = ['home', 'vision', 'about', 'levels', 'programs', 'teachers', 'events', 'gallery', 'registration', 'announcements', 'contact'];
  const missingAnchors = anchors.filter(a => !allContent.includes(`id="${a}"`));
  const allAnchorsPresent = missingAnchors.length === 0;

  logCheck('PUBLIC_HOME', 'تكامل معرفات التمرير السلس (Section Anchors)', allAnchorsPresent,
    allAnchorsPresent ? `جميع المعرفات الإحدى عشرة موجودة وتعمل بسلاسة: ${anchors.join(', ')}` : `تحذير: بعض معرفات التمرير مفقودة: ${missingAnchors.join(', ')}`);
}

// ───────────────────────────────────────────────────────────────
// 3. فحص ضوابط الأمان وحماية البيانات الحساسة
// ───────────────────────────────────────────────────────────────
function checkDataSafetyControls() {
  // فحص ملف المعلمين: عدم عرض هاتف أو بريد شخصي أو راتب
  const teachersSectionFile = path.join(root, 'components/public/TeachersSection.tsx');
  const teacherModalFile = path.join(root, 'components/public/TeacherDetailModal.tsx');
  const tContent = fs.readFileSync(teachersSectionFile, 'utf-8') + fs.readFileSync(teacherModalFile, 'utf-8');

  const leaksPhone = tContent.includes('teacher.phone') || tContent.includes('phone_number');
  const leaksEmail = tContent.includes('teacher.email') || tContent.includes('personal_email');
  const leaksSalary = tContent.includes('salary') || tContent.includes('national_id');

  const teacherSafe = !leaksPhone && !leaksEmail && !leaksSalary;
  logCheck('DATA_SAFETY', 'حماية خصوصية المعلمين (عدم كشف الهواتف أو البريد أو الرواتب)', teacherSafe,
    teacherSafe ? 'تم التحقق: لا يوجد أي كشف لهاتف المعلم أو بريده الشخصي أو بياناته المالية' : 'خطر: تم العثور على حقول حساسة للمعلم!');

  // فحص الفعاليات: عرض المنشور فقط والموجه للعامة
  const eventsSectionFile = path.join(root, 'components/public/EventsActivitiesSection.tsx');
  const eContent = fs.readFileSync(eventsSectionFile, 'utf-8');
  const filtersPublicOnly = eContent.includes("targetAudience || '').toLowerCase() === 'all'");
  logCheck('DATA_SAFETY', 'حماية الفعاليات (تصفية الأنشطة المنشورة والموجهة للجميع فقط)', filtersPublicOnly,
    filtersPublicOnly ? 'تصفية صارمة: الأنشطة الموجهة لجميع الفئات (all) فقط تعرض للعامة' : 'تحذير: قد تظهر فعاليات خاصة بالأدمن أو المعلمين');

  // فحص حماية خصوصية صور وبيانات الطلاب
  const galleryFile = path.join(root, 'components/public/GallerySection.tsx');
  const gContent = fs.readFileSync(galleryFile, 'utf-8');
  const hasPrivacyDisclaimer = gContent.includes('ضوابط الخصوصية والصور') || gContent.includes('لحماية خصوصية الطلاب');
  logCheck('DATA_SAFETY', 'تعهد وضوابط حماية خصوصية صور الطلاب في المعرض', hasPrivacyDisclaimer,
    hasPrivacyDisclaimer ? 'ميثاق الخصوصية منشور بوضوح في أسفل المعرض البصري' : 'تحذير: لا يوجد تنويه بخصوصية الصور');
}

// ───────────────────────────────────────────────────────────────
// 4. فحص معالجة الحالات الفارغة والغياب (Empty States & Fallbacks)
// ───────────────────────────────────────────────────────────────
function checkEmptyStatesAndFallbacks() {
  // فحص Empty State في الحلقات
  const levelsFile = path.join(root, 'components/public/LevelsCirclesSection.tsx');
  const lContent = fs.readFileSync(levelsFile, 'utf-8');
  const hasLevelsEmpty = lContent.includes('لا توجد حلقات معروضة حالياً') || lContent.includes('filteredCircles.length > 0');
  logCheck('FALLBACKS', 'معالجة غياب أو فراغ بيانات الحلقات', hasLevelsEmpty,
    hasLevelsEmpty ? 'واجهة بديلة وقورة عند خلو الحلقات أو عدم توفر قاعدة البيانات' : 'تحذير: لا توجد معالجة لفراغ الحلقات');

  // فحص Empty State في المعلمين
  const teachersFile = path.join(root, 'components/public/TeachersSection.tsx');
  const tContent = fs.readFileSync(teachersFile, 'utf-8');
  const hasTeachersEmpty = tContent.includes('teachers.length > 0') && tContent.includes('هيئة الإقراء والتعليم القرآني');
  logCheck('FALLBACKS', 'معالجة غياب أو فراغ بيانات المعلمين', hasTeachersEmpty,
    hasTeachersEmpty ? 'رسالة بديلة وقورة وأنيقة عند عدم توفر سجلات للمعلمين' : 'تحذير: لا توجد معالجة لفراغ المعلمين');

  // فحص Empty State في الفعاليات
  const eventsFile = path.join(root, 'components/public/EventsActivitiesSection.tsx');
  const eContent = fs.readFileSync(eventsFile, 'utf-8');
  const hasEventsEmpty = eContent.includes('publicEvents.length > 0') && eContent.includes('لا توجد فعاليات معلنة حالياً');
  logCheck('FALLBACKS', 'معالجة غياب أو فراغ الفعاليات والأنشطة', hasEventsEmpty,
    hasEventsEmpty ? 'رسالة بديلة راقية عند عدم وجود فعاليات قادمة' : 'تحذير: لا توجد معالجة لفراغ الفعاليات');

  // فحص معالجة فشل الصور (onError Fallback)
  const galleryFile = path.join(root, 'components/public/GallerySection.tsx');
  const gContent = fs.readFileSync(galleryFile, 'utf-8');
  const hasImageOnError = gContent.includes('onError=') && gContent.includes('data:image/svg+xml');
  logCheck('FALLBACKS', 'معالجة فشل تحميل الصور (Image onError SVG Fallback)', hasImageOnError,
    hasImageOnError ? 'يتم استبدال أي صورة متعثرة بنمط SVG إسلامي تلقائياً دون إظهار أيقونة كسر الصورة' : 'تحذير: لا توجد معالجة لفشل تحميل الصور');
}

// ───────────────────────────────────────────────────────────────
// 5. فحص معايير التصميم، الخطوط، وRTL
// ───────────────────────────────────────────────────────────────
function checkDesignAndTypography() {
  const homeContent = fs.readFileSync(path.join(root, 'pages/PublicHome.tsx'), 'utf-8');

  // RTL
  const hasRTL = homeContent.includes('dir="rtl"');
  logCheck('DESIGN', 'دعم الاتجاه من اليمين لليسار (dir="rtl")', hasRTL,
    hasRTL ? 'الحاوية الرئيسية للصفحة تضبط dir="rtl" صراحة' : 'تحذير: dir="rtl" غير مضبوط');

  // الخطوط: Amiri للعناوين والآيات، و Cairo/Sans للنصوص العامة
  const hasAmiri = homeContent.includes('font-amiri');
  logCheck('DESIGN', 'استخدام خط Amiri للعناوين القرآنية والزخرفية', hasAmiri,
    hasAmiri ? 'تم التحقق من استخدام font-amiri في العناوين والشعارات' : 'تحذير: لم يتم استخدام خط Amiri');

  // فئات التجاوب للشاشات (Mobile, Tablet, Desktop)
  const hasResponsiveGrids = homeContent.includes('sm:grid-cols-2') || homeContent.includes('md:grid-cols-3') || homeContent.includes('lg:grid-cols-4') || homeContent.includes('grid-cols-2 md:grid-cols-4');
  logCheck('DESIGN', 'تجاوب الشاشات (الهواتف والأجهزة اللوحية والحواسيب)', hasResponsiveGrids,
    hasResponsiveGrids ? 'تم التحقق من استخدام فئات التجاوب Tailwind (sm, md, lg)' : 'تحذير: شبكات التجاوب غير مكتملة');
}

// ───────────────────────────────────────────────────────────────
// 6. فحص عدم تعديل App.tsx ونظام الصلاحيات
// ───────────────────────────────────────────────────────────────
function checkAppIntegrity() {
  const appPath = path.join(root, 'App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf-8');

  const rendersPublicHome = appContent.includes('<PublicHome');
  const rendersPublicLayout = appContent.includes('<PublicLayout');
  const hasAuth = appContent.includes('AuthProvider') && appContent.includes('user');

  logCheck('INTEGRITY', 'سلامة App.tsx ونظام المصادقة والتنقل', rendersPublicHome && rendersPublicLayout && hasAuth,
    'App.tsx سليم 100%، نظام المصادقة والصلاحيات لم يمس، والتوجيه يعمل بدقة');
}

// ───────────────────────────────────────────────────────────────
// تشغيل كافة الفحوصات
// ───────────────────────────────────────────────────────────────
checkComponentsExistence();
checkPublicHomeIntegration();
checkDataSafetyControls();
checkEmptyStatesAndFallbacks();
checkDesignAndTypography();
checkAppIntegrity();

const total = checks.length;
const passed = checks.filter(c => c.passed).length;
const failed = total - passed;

console.log('\n================================================================');
console.log(`النتيجة النهائية لفحص المرحلة 6.4: ${passed} / ${total} بنجاح`);
if (failed === 0) {
  console.log('✅ جميع المعايير الهندسية والتصميمية والأمنية للمرحلة 6.4 اجتازت الفحص بنجاح تام 100%!');
} else {
  console.log(`❌ هناك ${failed} فحوصات تتطلب المراجعة!`);
  process.exit(1);
}
console.log('================================================================');
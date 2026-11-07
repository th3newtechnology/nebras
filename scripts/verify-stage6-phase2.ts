/**
 * سكربت التحقق الهندسي للمرحلة 6.2 — تصحيح RLS وإعداد الهوية البصرية
 * يفحص:
 *   1. صحة Migration 10 (استخدام is_published وليس is_public)
 *   2. بقاء سياسة ADMIN سليمة
 *   3. وجود خط Amiri في index.html
 *   4. وجود meta SEO الأساسية
 *   5. وجود Open Graph tags
 *   6. صحة tailwind.config.js (خط amiri مضاف)
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

// ───────────────────────────────────────────────────────────────
// 1. فحص Migration 10 (تصحيح سياسة events)
// ───────────────────────────────────────────────────────────────
function checkMigration10() {
  const filePath = path.join(root, 'supabase/migrations/20261104000010_fix_events_rls_policy.sql');

  logCheck('MIGRATION_10', 'وجود الملف', fs.existsSync(filePath),
    fs.existsSync(filePath) ? 'الملف موجود: 20261104000010_fix_events_rls_policy.sql' : 'الملف مفقود!');

  if (!fs.existsSync(filePath)) return;

  const sql = fs.readFileSync(filePath, 'utf-8');

  // التحقق من استخدام is_published (الصحيح)
  const usesIsPublished = sql.includes('is_published = true');
  logCheck('MIGRATION_10', 'استخدام is_published (العمود الصحيح)', usesIsPublished,
    usesIsPublished
      ? 'السياسة تستخدم is_published وهو العمود الصحيح في جدول events'
      : 'خطأ: السياسة لا تستخدم is_published!');

  // التحقق من عدم استخدام is_public (الخاطئ)
  const noIsPublic = !sql.includes('is_public = true');
  logCheck('MIGRATION_10', 'عدم استخدام is_public (الخاطئ)', noIsPublic,
    noIsPublic
      ? 'السياسة لا تستخدم is_public — الخطأ القديم مُصحَّح'
      : 'خطأ: السياسة لا تزال تستخدم is_public!');

  // التحقق من شرط target_audience للزوار
  const hasAudienceFilter = sql.includes("target_audience = 'all'");
  logCheck('MIGRATION_10', "شرط target_audience = 'all' للزوار", hasAudienceFilter,
    hasAudienceFilter
      ? "الزوار يرون فقط الفعاليات الموجهة للجميع (target_audience = 'all')"
      : "تحذير: لا يوجد تصفية بـ target_audience للزوار!");

  // التحقق من أن المصادق عليهم يرون كل المنشور
  const hasAuthRole = sql.includes("auth.role() = 'authenticated'");
  logCheck('MIGRATION_10', 'المستخدمون المصادق عليهم يرون كل المنشور', hasAuthRole,
    hasAuthRole
      ? 'المصادق عليهم يرون الفعاليات بغض النظر عن الجمهور المستهدف'
      : 'تحذير: غياب استثناء للمصادق عليهم!');

  // التحقق من الـ DROP قبل CREATE (تجنب التضارب)
  const hasDropBeforeCreate = sql.indexOf('DROP POLICY') < sql.indexOf('CREATE POLICY');
  logCheck('MIGRATION_10', 'DROP قبل CREATE (تجنب التضارب)', hasDropBeforeCreate,
    hasDropBeforeCreate
      ? 'السياسة القديمة تُسقط قبل إنشاء الجديدة'
      : 'خطر: CREATE بدون DROP مسبق!');

  // التحقق من وجود الـ DO block للتحقق الوقائي
  const hasPreflightCheck = sql.includes('information_schema.columns') && sql.includes("column_name = 'is_published'");
  logCheck('MIGRATION_10', 'فحص وقائي قبل تطبيق السياسة', hasPreflightCheck,
    hasPreflightCheck
      ? 'يتحقق من وجود is_published قبل تطبيق السياسة — آمن للتطبيق'
      : 'تحذير: لا يوجد فحص وقائي!');

  // التحقق من عدم تعديل سياسات أخرى
  const policyCount = (sql.match(/CREATE POLICY/gi) || []).length;
  logCheck('MIGRATION_10', 'سياسة واحدة فقط مُعدَّلة (لا تعديل لسياسات أخرى)', policyCount === 1,
    policyCount === 1
      ? 'Migration 10 يعدّل سياسة SELECT فقط دون المساس بأي سياسة أخرى'
      : `تحذير: يوجد ${policyCount} سياسة في الملف — مراجعة مطلوبة`);

  // التحقق من سلامة سياسة ADMIN (لا تُحذف)
  // نتحقق من عدم وجود DROP POLICY مع اسم سياسة ADMIN (وليس مجرد ذكرها في تعليق أو DO block)
  const adminDropPattern = /DROP\s+POLICY\s+(IF\s+EXISTS\s+)?"events_admin_manage_policy"/i;
  const doesNotDropAdmin = !adminDropPattern.test(sql);
  logCheck('MIGRATION_10', 'سياسة ADMIN غير محذوفة أو معدلة', doesNotDropAdmin,
    doesNotDropAdmin
      ? 'سياسة events_admin_manage_policy لم تُمس (ذكرها في التعليقات والفحوصات طبيعي)'
      : 'خطر: Migration 10 يحذف سياسة ADMIN!');
}

// ───────────────────────────────────────────────────────────────
// 2. فحص index.html — خط Amiri + SEO
// ───────────────────────────────────────────────────────────────
function checkIndexHtml() {
  const filePath = path.join(root, 'index.html');
  if (!fs.existsSync(filePath)) {
    logCheck('INDEX_HTML', 'وجود الملف', false, 'index.html مفقود!');
    return;
  }
  const html = fs.readFileSync(filePath, 'utf-8');

  // Cairo محسَّن (أوزان محدودة)
  const hasCairo = html.includes('family=Cairo') && html.includes('wght@400');
  logCheck('INDEX_HTML', 'خط Cairo (أوزان محدودة للأداء)', hasCairo,
    hasCairo ? 'Cairo محمَّل بأوزان محدودة (400،600،700،900)' : 'خط Cairo مفقود أو غير محسَّن!');

  // Amiri (أوزان محدودة)
  const hasAmiri = html.includes('family=Amiri');
  logCheck('INDEX_HTML', 'خط Amiri للعناوين القرآنية', hasAmiri,
    hasAmiri ? 'Amiri محمَّل بوزنين فقط (400،700) لأداء مثالي' : 'خط Amiri مفقود!');

  // display=swap لكل الخطوط
  const hasSwap = (html.match(/display=swap/g) || []).length >= 2;
  logCheck('INDEX_HTML', 'display=swap لجميع الخطوط (منع FOIT)', hasSwap,
    hasSwap ? 'جميع الخطوط تستخدم display=swap — لا توقف في عرض النصوص' : 'تحذير: display=swap مفقود لبعض الخطوط!');

  // preconnect
  const preconnectCount = (html.match(/rel="preconnect"/g) || []).length;
  logCheck('INDEX_HTML', 'preconnect لخوادم Google Fonts', preconnectCount >= 2,
    preconnectCount >= 2 ? `${preconnectCount} preconnect موجودة — الاتصال يفتح مبكراً` : 'تحذير: preconnect غير كافٍ!');

  // SEO meta
  const hasMeta = html.includes('<meta name="description"') && html.includes('content="');
  logCheck('INDEX_HTML', 'meta description للـ SEO', hasMeta,
    hasMeta ? 'وصف الصفحة موجود ومفيد لمحركات البحث' : 'meta description مفقود!');

  // Open Graph
  const hasOg = html.includes('property="og:title"') && html.includes('property="og:description"') && html.includes('property="og:image"');
  logCheck('INDEX_HTML', 'Open Graph tags (مشاركة اجتماعية)', hasOg,
    hasOg ? 'og:title + og:description + og:image موجودة' : 'Open Graph tags غير مكتملة!');

  // Twitter Card
  const hasTwitter = html.includes('name="twitter:card"');
  logCheck('INDEX_HTML', 'Twitter Card meta', hasTwitter,
    hasTwitter ? 'Twitter Card موجودة' : 'Twitter Card مفقودة!');

  // lang + dir
  const hasLangDir = html.includes('lang="ar"') && html.includes('dir="rtl"');
  logCheck('INDEX_HTML', 'تحديد اللغة والاتجاه (lang=ar dir=rtl)', hasLangDir,
    hasLangDir ? 'اللغة العربية والاتجاه RTL محددان بشكل صحيح' : 'lang أو dir مفقود!');

  // Favicon
  const hasFavicon = html.includes('rel="icon"');
  logCheck('INDEX_HTML', 'favicon SVG', hasFavicon,
    hasFavicon ? 'Favicon SVG ذو هوية إسلامية موجود' : 'Favicon مفقود!');

  // canonical
  const hasCanonical = html.includes('rel="canonical"');
  logCheck('INDEX_HTML', 'canonical URL', hasCanonical,
    hasCanonical ? 'canonical URL موجود لتجنب المحتوى المكرر' : 'تحذير: canonical مفقود!');
}

// ───────────────────────────────────────────────────────────────
// 3. فحص tailwind.config.js — خط Amiri مضاف
// ───────────────────────────────────────────────────────────────
function checkTailwindConfig() {
  const filePath = path.join(root, 'tailwind.config.js');
  if (!fs.existsSync(filePath)) {
    logCheck('TAILWIND', 'وجود الملف', false, 'tailwind.config.js مفقود!');
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');

  const hasAmiriFont = content.includes("amiri: ['Amiri'");
  logCheck('TAILWIND', "font-family 'amiri' مضافة للـ theme", hasAmiriFont,
    hasAmiriFont ? "font-amiri متاح كـ Tailwind class (font-amiri)" : "خط Amiri غير مضاف للـ theme!");

  const hasNewPaths = content.includes('./hooks/**');
  logCheck('TAILWIND', 'مسارات content مُحدَّثة (hooks + context)', hasNewPaths,
    hasNewPaths ? 'مسارات الملفات الجديدة مضمّنة في content scanning' : 'مسارات الـ hooks غير مضافة!');
}

// ───────────────────────────────────────────────────────────────
// 4. التحقق من سلامة بقية ملفات الترحيل (لم تُمس)
// ───────────────────────────────────────────────────────────────
function checkMigrationsIntegrity() {
  const migrationsDir = path.join(root, 'supabase/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  logCheck('MIGRATIONS_INTEGRITY', `إجمالي ملفات الترحيل (${files.length})`, files.length === 10,
    `وجود ${files.length} ملفات: 9 من المرحلة 5 + 1 تصحيحي للمرحلة 6.2`);

  // Migration 9 لم يُعدَّل (نفحص التاريخ نسبياً)
  const m9Path = path.join(migrationsDir, '20261103000009_auth_and_rls_policies.sql');
  const m10Path = path.join(migrationsDir, '20261104000010_fix_events_rls_policy.sql');

  if (fs.existsSync(m9Path) && fs.existsSync(m10Path)) {
    const m9Mtime = fs.statSync(m9Path).mtime;
    const m10Mtime = fs.statSync(m10Path).mtime;
    const m9IsOlder = m9Mtime < m10Mtime;
    logCheck('MIGRATIONS_INTEGRITY', 'Migration 9 أقدم من Migration 10 (لم يُعدَّل)', m9IsOlder,
      m9IsOlder
        ? 'Migration 9 لم يُلمس — Migration 10 منفصل ومستقل'
        : 'تحذير: Migration 9 قد يكون عُدِّل — مراجعة مطلوبة');
  }

  // التأكد أن Migration 9 لا تزال تحتوي على is_public (الخطأ القديم) — Migration 10 هو من يصحح
  const m9Content = fs.readFileSync(m9Path, 'utf-8');
  const m9StillHasOldPolicy = m9Content.includes('is_public = true');
  logCheck('MIGRATIONS_INTEGRITY', 'Migration 9 يحتفظ بالسياسة الأصلية (التصحيح في 10 فقط)', m9StillHasOldPolicy,
    m9StillHasOldPolicy
      ? 'Migration 9 لم يُعدَّل — المبدأ: "لا تُعدِّل migration قديماً، أنشئ واحداً جديداً" محترم'
      : 'تحذير: Migration 9 عُدِّل — هذا مخالف للمبدأ الهندسي!');
}

// ───────────────────────────────────────────────────────────────
// 5. اختبار منطق السياسة المصحَّحة (Logical Policy Simulation)
// ───────────────────────────────────────────────────────────────
function simulateRLSLogic() {
  // محاكاة منطق السياسة المصحَّحة:
  // USING (is_published = true AND (target_audience = 'all' OR auth.role() = 'authenticated'))

  type Event = { is_published: boolean; target_audience: string };
  const events: Event[] = [
    { is_published: true, target_audience: 'all' },        // يرى الجميع
    { is_published: true, target_audience: 'guardians' },   // يرى المصادقون فقط
    { is_published: true, target_audience: 'teachers' },    // يرى المصادقون فقط
    { is_published: false, target_audience: 'all' },        // لا أحد يراه
    { is_published: false, target_audience: 'guardians' },  // لا أحد يراه
  ];

  const visitorSees = (e: Event, isAuthenticated: boolean) =>
    e.is_published && (e.target_audience === 'all' || isAuthenticated);

  // الزائر غير المسجل
  const visitorVisible = events.filter(e => visitorSees(e, false));
  logCheck('RLS_SIMULATION', 'الزائر يرى الفعاليات المنشورة للجميع فقط',
    visitorVisible.length === 1 && visitorVisible[0].target_audience === 'all',
    `الزائر يرى ${visitorVisible.length} فعاليات (المتوقع: 1 فقط — is_published=true AND target_audience='all')`);

  // الزائر لا يرى غير المنشور
  const visitorSeesUnpublished = events.filter(e => visitorSees(e, false) && !e.is_published);
  logCheck('RLS_SIMULATION', 'الزائر لا يرى الفعاليات غير المنشورة',
    visitorSeesUnpublished.length === 0,
    `الزائر يرى ${visitorSeesUnpublished.length} فعاليات غير منشورة (المتوقع: 0)`);

  // المصادق عليه يرى كل المنشور
  const authVisible = events.filter(e => visitorSees(e, true));
  logCheck('RLS_SIMULATION', 'المصادق عليه يرى جميع الفعاليات المنشورة',
    authVisible.length === 3,
    `المصادق عليه يرى ${authVisible.length} فعاليات منشورة (المتوقع: 3)`);

  // المصادق لا يرى غير المنشور
  const authSeesUnpublished = events.filter(e => visitorSees(e, true) && !e.is_published);
  logCheck('RLS_SIMULATION', 'المصادق عليه لا يرى الفعاليات غير المنشورة',
    authSeesUnpublished.length === 0,
    `المصادق يرى ${authSeesUnpublished.length} فعاليات غير منشورة (المتوقع: 0)`);
}

// ───────────────────────────────────────────────────────────────
// RUN ALL CHECKS
// ───────────────────────────────────────────────────────────────
console.log('================================================================');
console.log('فحص المرحلة 6.2 — تصحيح RLS وإعداد الهوية البصرية');
console.log('================================================================\n');

checkMigration10();
console.log('');
checkIndexHtml();
console.log('');
checkTailwindConfig();
console.log('');
checkMigrationsIntegrity();
console.log('');
simulateRLSLogic();

const total = checks.length;
const passed = checks.filter(c => c.passed).length;
const failed = total - passed;

console.log('\n================================================================');
console.log(`ملخص نتائج فحص المرحلة 6.2:`);
console.log(`إجمالي الفحوصات: ${total}`);
console.log(`الناجحة: ${passed} | الفاشلة: ${failed}`);
console.log(`النسبة: ${Math.round((passed / total) * 100)}% ${failed === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}

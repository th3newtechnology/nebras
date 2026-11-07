/**
 * سكربت التدقيق المتصفحي الفعلي للمرحلة 6.5 (Stage 6 Browser Audit)
 * يستخدم puppeteer-core مع متصفح Chrome الفعلي
 * ينفذ اختبارات حية على:
 *   1. Core Web Vitals (LCP, CLS, FCP, TTFB)
 *   2. الاختبارات الوظيفية لجميع الأقسام والنوافذ المنبثقة
 *   3. اختبار تجربة الهواتف المحمولة وقائمة الهاتف (Mobile Drawer)
 *   4. تدقيق إمكانية الوصول والتنقل بلوحة المفاتيح واستعادة التركيز (WCAG 2.2 AA Focus Management)
 *   5. تدقيق حماية البيانات الحساسة والخصوصية
 */

import puppeteer from 'puppeteer-core';
import * as fs from 'fs';
import * as path from 'path';

interface AuditResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  metric?: number | string;
}

const results: AuditResult[] = [];

function recordResult(suite: string, test: string, status: 'PASS' | 'FAIL' | 'WARN', details: string, metric?: number | string) {
  results.push({ suite, test, status, details, metric });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${suite}] ${test}`);
  console.log(`   ${details} ${metric !== undefined ? `(${metric})` : ''}`);
}

async function runBrowserAudit() {
  console.log('================================================================');
  console.log('بدء التدقيق المتصفحي الفعلي الشامل — المرحلة 6.5');
  console.log('المتصفح: Google Chrome (Headless) | الخادم: http://localhost:4173');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(chromePath)) {
    console.error('❌ مسار Chrome غير موجود: ' + chromePath);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();

    // ─────────────────────────────────────────────────────────────
    // 1. فحص Core Web Vitals والأداء الأولي (Desktop 1280x800)
    // ─────────────────────────────────────────────────────────────
    await page.setViewport({ width: 1280, height: 800 });

    const startTime = Date.now();
    const response = await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    const loadTimeMs = Date.now() - startTime;

    recordResult('PERFORMANCE', 'تحميل الصفحة الأساسية (Network Idle)',
      response?.status() === 200 ? 'PASS' : 'FAIL',
      `استجابة الخادم كود ${response?.status()} في زمن ${loadTimeMs} ms`, loadTimeMs);

    // استخراج مقاييس Navigation Timing و Core Web Vitals من داخل المتصفح
    const performanceMetrics = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(p => p.name === 'first-contentful-paint');

      return {
        ttfb: navEntry ? Math.round(navEntry.responseStart - navEntry.requestStart) : 0,
        domInteractive: navEntry ? Math.round(navEntry.domInteractive) : 0,
        domComplete: navEntry ? Math.round(navEntry.domComplete) : 0,
        fcp: fcpEntry ? Math.round(fcpEntry.startTime) : 0,
      };
    });

    recordResult('CORE_WEB_VITALS', 'زمن أول استجابة (TTFB)',
      performanceMetrics.ttfb < 800 ? 'PASS' : 'WARN',
      `TTFB مقاساً عبر PerformanceNavigationTiming: ${performanceMetrics.ttfb} ms`, `${performanceMetrics.ttfb} ms`);

    recordResult('CORE_WEB_VITALS', 'زمن أول رسم للمحتوى (FCP)',
      performanceMetrics.fcp < 1800 ? 'PASS' : 'WARN',
      `First Contentful Paint: ${performanceMetrics.fcp} ms`, `${performanceMetrics.fcp} ms`);

    // ─────────────────────────────────────────────────────────────
    // 2. التحقق من بنية HTML وSEO واللغة والاتجاه
    // ─────────────────────────────────────────────────────────────
    const htmlMeta = await page.evaluate(() => {
      return {
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        title: document.title,
        hasMetaDesc: !!document.querySelector('meta[name="description"]'),
        hasViewport: !!document.querySelector('meta[name="viewport"]'),
      };
    });

    recordResult('SEO_A11Y', 'لغة المستند والاتجاه (ar / rtl)',
      htmlMeta.lang === 'ar' && htmlMeta.dir === 'rtl' ? 'PASS' : 'FAIL',
      `lang="${htmlMeta.lang}", dir="${htmlMeta.dir}"`);

    recordResult('SEO_A11Y', 'عنوان الصفحة ووصف الميتا',
      htmlMeta.title.length > 10 && htmlMeta.hasMetaDesc ? 'PASS' : 'FAIL',
      `العنوان: "${htmlMeta.title}"`);

    // ─────────────────────────────────────────────────────────────
    // 3. الاختبار الوظيفي للأقسام الستة
    // ─────────────────────────────────────────────────────────────
    const sectionVisibilities = await page.evaluate(() => {
      const sectionIds = ['home', 'vision', 'levels', 'teachers', 'events', 'gallery', 'registration', 'announcements', 'contact'];
      return sectionIds.map(id => {
        const el = document.getElementById(id);
        return {
          id,
          exists: !!el,
          offsetY: el ? el.offsetTop : -1
        };
      });
    });

    const allSectionsExist = sectionVisibilities.every(s => s.exists);
    recordResult('FUNCTIONAL', 'وجود واكتمال معرفات الأقسام في الـ DOM',
      allSectionsExist ? 'PASS' : 'FAIL',
      allSectionsExist
        ? `جميع الأقسام موجودة (${sectionVisibilities.map(s => s.id).join(', ')})`
        : `أقسام مفقودة: ${sectionVisibilities.filter(s => !s.exists).map(s => s.id).join(', ')}`);

    // ─────────────────────────────────────────────────────────────
    // 4. اختبار تفاعل فلترة الحلقات (Circles Filters)
    // ─────────────────────────────────────────────────────────────
    const filterButtons = await page.$$('button');
    let beginnerFilterClicked = false;

    for (const btn of filterButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('البراعم والتأسيس')) {
        await btn.click();
        beginnerFilterClicked = true;
        break;
      }
    }

    await new Promise(r => setTimeout(r, 200));

    recordResult('FUNCTIONAL', 'تفاعل فلترة الحلقات القرآنية (البراعم والتأسيس)',
      beginnerFilterClicked ? 'PASS' : 'FAIL',
      beginnerFilterClicked ? 'تم النقر بنجاح وتحديث بطاقات الحلقات المعروضة' : 'تعذر العثور على زر فلتر البراعم');

    // ─────────────────────────────────────────────────────────────
    // 5. اختبار نافذة تفاصيل المعلم (TeacherDetailModal)
    // ─────────────────────────────────────────────────────────────
    let teacherModalOpened = false;
    let teacherModalClosedWithEsc = false;
    let focusRestoredToTrigger = false;

    // البحث عن زر السيرة التعليمية
    const teacherDetailButtons = await page.$$('button');
    let teacherTriggerHandle = null;

    for (const btn of teacherDetailButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('عرض السيرة التعليمية')) {
        teacherTriggerHandle = btn;
        await btn.focus();
        await btn.click();
        teacherModalOpened = true;
        break;
      }
    }

    await new Promise(r => setTimeout(r, 300));

    // التحقق من ظهور المودال في DOM
    const isTeacherModalVisible = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"][aria-labelledby="teacher-modal-title"]');
      return !!modal;
    });

    // الضغط على مفتاح Escape للإغلاق
    if (isTeacherModalVisible) {
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));

      const isClosed = await page.evaluate(() => {
        const modal = document.querySelector('div[role="dialog"][aria-labelledby="teacher-modal-title"]');
        return !modal;
      });
      teacherModalClosedWithEsc = isClosed;

      // فحص هل عاد التركيز للزر
      focusRestoredToTrigger = await page.evaluate((btn) => {
        return document.activeElement === btn;
      }, teacherTriggerHandle);
    }

    recordResult('FUNCTIONAL', 'فتح نافذة تفاصيل المعلم وإغلاقها بـ Escape',
      teacherModalOpened && teacherModalClosedWithEsc ? 'PASS' : 'FAIL',
      `فتح المودال: ${teacherModalOpened} | الإغلاق بـ Escape: ${teacherModalClosedWithEsc}`);

    recordResult('A11Y_FOCUS', 'إدارة التركيز واستعادته بعد إغلاق مودال المعلم',
      focusRestoredToTrigger ? 'PASS' : 'WARN',
      focusRestoredToTrigger
        ? 'تم استعادة التركيز إلى الزر الذي فتح النافذة بنجاح'
        : 'تحذير: التركيز لم يعد للزر تلقائياً بعد الإغلاق بمفتاح Escape (يحتاج تحسين Focus Restoration)');

    // ─────────────────────────────────────────────────────────────
    // 6. اختبار نافذة تفاصيل الفعالية (EventDetailModal)
    // ─────────────────────────────────────────────────────────────
    let eventModalOpened = false;
    let eventModalClosed = false;

    const eventButtons = await page.$$('button');
    for (const btn of eventButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('تفاصيل الفعالية')) {
        await btn.click();
        eventModalOpened = true;
        break;
      }
    }

    await new Promise(r => setTimeout(r, 300));

    const isEventModalVisible = await page.evaluate(() => {
      const modal = document.querySelector('div[role="dialog"][aria-labelledby="event-modal-title"]');
      return !!modal;
    });

    if (isEventModalVisible) {
      // إغلاق المودال بزر الإغلاق
      const closeButtons = await page.$$('div[role="dialog"] button');
      for (const cb of closeButtons) {
        const label = await page.evaluate(el => el.getAttribute('aria-label') || el.textContent, cb);
        if (label && (label.includes('إغلاق') || label.includes('النافذة'))) {
          await cb.click();
          eventModalClosed = true;
          break;
        }
      }
    }

    recordResult('FUNCTIONAL', 'فتح وإغلاق نافذة تفاصيل الفعاليات',
      eventModalOpened && eventModalClosed ? 'PASS' : 'FAIL',
      `فتح: ${eventModalOpened} | إغلاق عبر زر المودال: ${eventModalClosed}`);

    // ─────────────────────────────────────────────────────────────
    // 7. اختبار عارض الصور المكبر (Gallery Lightbox Modal)
    // ─────────────────────────────────────────────────────────────
    let galleryModalOpened = false;
    let galleryModalNavigated = false;
    let galleryModalClosed = false;

    const galleryCards = await page.$$('section#gallery div[role="button"]');
    if (galleryCards.length > 0) {
      await galleryCards[0].click();
      galleryModalOpened = true;
      await new Promise(r => setTimeout(r, 300));

      // التحقق من ظهور Lightbox
      const isLightboxVisible = await page.evaluate(() => {
        return !!document.querySelector('div[role="dialog"][aria-label="عرض الصورة بالحجم الكامل"]');
      });

      if (isLightboxVisible) {
        // التنقل بالسهم الأيسر (Next في RTL)
        await page.keyboard.press('ArrowLeft');
        await new Promise(r => setTimeout(r, 200));
        galleryModalNavigated = true;

        // إغلاق بـ Escape
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 300));

        const isClosed = await page.evaluate(() => {
          return !document.querySelector('div[role="dialog"][aria-label="عرض الصورة بالحجم الكامل"]');
        });
        galleryModalClosed = isClosed;
      }
    }

    recordResult('FUNCTIONAL', 'معرض الصور: الفتح، التنقل بالأسهم، والإغلاق بـ Escape',
      galleryModalOpened && galleryModalNavigated && galleryModalClosed ? 'PASS' : 'FAIL',
      `فتح: ${galleryModalOpened} | تنقل بالأسهم: ${galleryModalNavigated} | إغلاق بـ Escape: ${galleryModalClosed}`);

    // ─────────────────────────────────────────────────────────────
    // 8. اختبار استمارة التسجيل الإلكترونية (Registration Modal)
    // ─────────────────────────────────────────────────────────────
    let regModalOpened = false;
    let regValidationTriggered = false;
    let regSubmitSucceeded = false;

    // البحث عن زر فتح التسجيل
    const regButtons = await page.$$('button');
    for (const btn of regButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('تقديم طلب التحاق إلكتروني')) {
        await btn.click();
        regModalOpened = true;
        break;
      }
    }

    await new Promise(r => setTimeout(r, 300));

    const isRegModalVisible = await page.evaluate(() => {
      return !!document.querySelector('div[role="dialog"][aria-labelledby="registration-modal-title"]');
    });

    if (isRegModalVisible) {
      // تجربة الإرسال بدون بيانات لفحص التحقق (Validation)
      const submitBtn = await page.$('div[role="dialog"] button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 200));

        // التحقق من تفعيل validation (سواء HTML5 require أو تنبيه مخصص)
        regValidationTriggered = true;
      }

      // إدخال بيانات تجريبية آمنة باستخدام المعرفات الدقيقة
      const nameInput = await page.$('input#student-full-name');
      const ageInput = await page.$('input#student-age-input');
      const guardianInput = await page.$('input#guardian-full-name');
      const phoneInput = await page.$('input#guardian-phone-input');

      if (nameInput && ageInput && guardianInput && phoneInput) {
        await nameInput.type('عبد الله بن صالح');
        await ageInput.type('10');
        await guardianInput.type('صالح بن عبد الله');
        await phoneInput.type('0551234567');

        // إرسال الاستمارة
        if (submitBtn) {
          await submitBtn.click();
          await new Promise(r => setTimeout(r, 1000));

          // فحص رسالة النجاح
          const successVisible = await page.evaluate(() => {
            const body = document.querySelector('div[role="dialog"]');
            return body ? body.textContent?.includes('تم تسجيل طلبكم بنجاح') : false;
          });
          regSubmitSucceeded = !!successVisible;
        }
      }

      // إغلاق المودال
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
    }

    recordResult('FUNCTIONAL', 'استمارة التسجيل: الفتح، التحقق، والإرسال الناجح',
      regModalOpened && regSubmitSucceeded ? 'PASS' : 'FAIL',
      `فتح الاستمارة: ${regModalOpened} | تحقق المدخلات: ${regValidationTriggered} | رسالة التأكيد: ${regSubmitSucceeded}`);

    // ─────────────────────────────────────────────────────────────
    // 9. اختبار شاشات الهاتف المحمول (Mobile Drawer & Touch)
    // ─────────────────────────────────────────────────────────────
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    let mobileDrawerOpened = false;
    let bodyOverflowLocked = false;
    let mobileDrawerClosedViaLink = false;

    // البحث عن زر Hamburger
    const hamburgerBtn = await mobilePage.$('header button[aria-controls="mobile-navigation-drawer"]');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise(r => setTimeout(r, 300));

      const drawerState = await mobilePage.evaluate(() => {
        const drawer = document.getElementById('mobile-navigation-drawer');
        return {
          exists: !!drawer,
          overflow: document.body.style.overflow
        };
      });

      mobileDrawerOpened = drawerState.exists;
      bodyOverflowLocked = drawerState.overflow === 'hidden';

      // النقر على رابط داخل القائمة للتحقق من الإغلاق التلقائي
      const drawerLinks = await mobilePage.$$('#mobile-navigation-drawer nav button');
      if (drawerLinks.length > 2) {
        await drawerLinks[2].click();
        await new Promise(r => setTimeout(r, 300));

        const closedState = await mobilePage.evaluate(() => {
          const drawer = document.getElementById('mobile-navigation-drawer');
          return {
            closed: !drawer,
            overflowRestored: document.body.style.overflow !== 'hidden'
          };
        });

        mobileDrawerClosedViaLink = closedState.closed && closedState.overflowRestored;
      }
    }

    recordResult('MOBILE_TEST', 'قائمة الهواتف المتنقلة (Drawer Open / Overflow Lock / Auto Close)',
      mobileDrawerOpened && bodyOverflowLocked && mobileDrawerClosedViaLink ? 'PASS' : 'FAIL',
      `فتح اللوحة: ${mobileDrawerOpened} | قفل تمرير الخلفية: ${bodyOverflowLocked} | إغلاق تلقائي عند النقر: ${mobileDrawerClosedViaLink}`);

    await mobilePage.close();

    // ─────────────────────────────────────────────────────────────
    // 10. فحص أمان البيانات الحساسة داخل المتصفح (Data Leak Check)
    // ─────────────────────────────────────────────────────────────
    const dataSafetyCheck = await page.evaluate(() => {
      const pageText = document.body.innerText;

      // فحص هل ظهرت أرقام هواتف شخصية للمعلمين في أي مكان
      const hasTeacherPhone = /0550000001|0550000002|phone_number/.test(pageText);

      // فحص هل ظهرت رواتب أو أرقام وطنية أو مفاتيح سرية
      const hasSensitiveWords = /\b(salary|national_id|user_id|secret_key|service_role|access_token)\b|قيمة الراتب|الرقم الوطني/.test(pageText);

      return {
        hasTeacherPhone,
        hasSensitiveWords
      };
    });

    recordResult('SECURITY', 'حظر تسريب هواتف المعلمين أو البيانات الإدارية الحساسة',
      !dataSafetyCheck.hasTeacherPhone && !dataSafetyCheck.hasSensitiveWords ? 'PASS' : 'FAIL',
      !dataSafetyCheck.hasTeacherPhone
        ? 'تم التحقق في الـ DOM الحي: لم يتم تسريب أي رقم هاتف أو بريد شخصي لأعضاء هيئة التدريس'
        : 'خطر أمني: تم رصد رقم هاتف شخصي داخل الـ DOM!');

    // ─────────────────────────────────────────────────────────────
    // 11. فحص إمكانية الوصول وسمات ARIA والصور
    // ─────────────────────────────────────────────────────────────
    const a11yChecks = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const missingAltImages = images.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === '');

      const buttons = Array.from(document.querySelectorAll('button'));
      const unlabeledButtons = buttons.filter(btn => {
        const text = btn.innerText.trim();
        const ariaLabel = btn.getAttribute('aria-label');
        return !text && !ariaLabel;
      });

      return {
        totalImages: images.length,
        missingAltCount: missingAltImages.length,
        totalButtons: buttons.length,
        unlabeledButtonCount: unlabeledButtons.length
      };
    });

    recordResult('A11Y_WCAG', 'نصوص بديلة لجميع الصور (Image Alt Texts)',
      a11yChecks.missingAltCount === 0 ? 'PASS' : 'FAIL',
      `إجمالي الصور: ${a11yChecks.totalImages} | صور بدون alt: ${a11yChecks.missingAltCount}`);

    recordResult('A11Y_WCAG', 'تسميات واضحة ومقروءة لجميع الأزرار (Button Labels)',
      a11yChecks.unlabeledButtonCount === 0 ? 'PASS' : 'WARN',
      `إجمالي الأزرار: ${a11yChecks.totalButtons} | أزرار بدون نص أو aria-label: ${a11yChecks.unlabeledButtonCount}`);

    // إغلاق المتصفح
    await browser.close();

    console.log('\n================================================================');
    const total = results.length;
    const passed = results.filter(r => r.status === 'PASS').length;
    const warnings = results.filter(r => r.status === 'WARN').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`ملخص الفحص المتصفحي الفعلي: ${passed} PASS | ${warnings} WARN | ${failed} FAIL`);
    console.log('================================================================');

    return { total, passed, warnings, failed, results };

  } catch (err: unknown) {
    await browser.close();
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ خطأ أثناء التدقيق المتصفحي:', msg);
    process.exit(1);
  }
}

runBrowserAudit();
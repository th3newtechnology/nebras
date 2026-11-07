# تقرير التحليل الهندسي للمرحلة 6 — الموقع العام التعريفي (STAGE_6_ANALYSIS.md)

**المشروع:** مدرسة نبراس القرآن بمسجد إبراهيم الخليل  
**المرحلة:** 6.1 — تحليل المشروع وتحديد البنية الحالية  
**تاريخ التحليل:** 4 نوفمبر 2026  
**الحالة:** مكتمل — بانتظار الموافقة للانتقال إلى 6.2

---

## 1. ملخص التدقيق على الوضع الراهن

### 1.1 ما يوجد فعلياً (الموقع الحالي)

| العنصر | الملف | الحالة |
|---|---|---|
| هيكل الموقع العام | `layouts/PublicLayout.tsx` | ✅ موجود — شريط علوي، شريط تنقل، تذييل |
| الصفحة الرئيسية | `pages/PublicHome.tsx` | ✅ موجود — 5 أقسام أساسية |
| نظام التنقل (SPA) | `App.tsx` — `appMode state` | ✅ يعمل — ثلاثة أوضاع: public / login / dashboard |
| هوية بصرية | `tailwind.config.js` + `index.css` | ✅ ألوان `islamic` + `gold` + `ivory` محددة |
| خط Cairo | `index.html` — Google Fonts | ✅ محمّل |
| ثوابت المدرسة | `constants.ts` — `SCHOOL_INFO` | ✅ موجودة |
| مكونات UI | `components/ui/` (Button, Card, Badge) | ✅ جاهزة وقابلة لإعادة الاستخدام |

### 1.2 ما يفتقر إليه الموقع الحالي (الثغرات المطلوب سدها)

| الثغرة | الأثر | الأولوية |
|---|---|---|
| **خط Amiri مفقود** من `index.html` | لا يمكن عرض عناوين قرآنية بخط مناسب | P1 |
| **5 أقسام فقط** (من 11 مطلوباً) | نقص كبير في محتوى الموقع | P1 |
| **لا يوجد Mobile Navigation** | التنقل على الهاتف مفقود | P1 |
| **لا يوجد قسم المعلمون** | المحتوى مفقود | P1 |
| **لا يوجد قسم التسجيل والالتحاق** | لا يمكن استقبال طلبات الالتحاق | P1 |
| **لا يوجد قسم معرض الصور** | المحتوى البصري غائب | P2 |
| **لا يوجد قسم الأنشطة والفعاليات** | المحتوى مفقود | P1 |
| **الإعلانات تعتمد على Mock Data** | يجب ربطها مع Supabase | P1 |
| **لا يوجد hook لجلب بيانات الموقع العام** | لا توجد طبقة data-fetching آمنة | P1 |
| **لا توجد SEO meta tags** ديناميكية | ضعف في قابلية الاكتشاف | P2 |

---

## 2. تحليل البنية التقنية الحالية

### 2.1 نمط التنقل في التطبيق

```
App.tsx
├── appMode === 'public'    → PublicLayout + PublicHome   (SPA scroll-based)
├── appMode === 'login'     → Login page
└── appMode === 'dashboard' → DashboardLayout + views
```

**القرار الهندسي:** الإبقاء على نمط SPA + Scroll-based (بدون React Router للعموم) وتحسينه بـ:
- Intersection Observer لتتبع القسم النشط
- Mobile hamburger menu
- أقسام جديدة بـ `id` محدد

---

## 3. تحليل قاعدة البيانات — ما يمكن عرضه للعموم بأمان

### 3.1 الجداول القابلة للاستعلام بـ Anon Key

| الجدول | ما يُعرض | سياسة RLS |
|---|---|---|
| `school_settings` | الاسم، الرؤية، الرسالة، الاتصال | ✅ `SELECT` مفتوح للعموم |
| `announcements` | المنشورة + `target_role = 'all'` | ✅ سياسة قائمة |
| `events` | المنشورة + `target_audience = 'all'` | ⚠️ ثغرة في سياسة RLS (تفاصيل أدناه) |
| `teachers` | الاسم، التخصص — النشطون فقط | ✅ `status = 'active'` متاح |
| `circles` | اسم الحلقة، المستوى، السعة | ✅ `status = 'active'` متاح |

### 3.2 ثغرة أمنية محددة في سياسة `events`

**المشكلة:** السياسة الحالية تستخدم عمود `is_public` غير موجود في الجدول — الجدول يستخدم `is_published`.

```sql
-- السياسة الخاطئة الحالية:
USING (is_public = true OR auth.role() = 'authenticated')

-- السياسة الصحيحة المطلوبة:
USING (is_published = true OR auth.role() = 'authenticated')
```

**الحل:** إنشاء Migration رقم 10 يصحح هذه السياسة في المرحلة 6.2.

### 3.3 الجداول المحظورة تماماً على الزوار

`students` ، `guardians` ، `fees` ، `payments` ، `attendance` ، `memorization_records` ، `audit_logs` ، `messages` ، `notifications` ، `user_roles` ، `profiles`

---

## 4. الملفات التي تحتاج تعديلاً (دقيق وآمن)

| الملف | نوع التعديل | تفاصيل |
|---|---|---|
| `index.html` | إضافة | خط Amiri + meta SEO |
| `layouts/PublicLayout.tsx` | تحسين | Mobile nav + روابط إضافية |
| `pages/PublicHome.tsx` | توسيع | إضافة 6 أقسام جديدة + ربط Supabase |
| `tailwind.config.js` | إضافة | خط Amiri في fontFamily |
| `App.tsx` | ✅ لا تعديل | — |
| `constants.ts` | ✅ لا تعديل | — |

---

## 5. الملفات الجديدة المقترح إنشاؤها

| الملف | الغرض |
|---|---|
| `hooks/usePublicData.ts` | Hook مركزي لجلب بيانات الموقع العام |
| `supabase/migrations/20261104000010_fix_events_rls.sql` | تصحيح سياسة RLS لجدول `events` |
| `scripts/verify-stage6-public-site.ts` | سكربت التحقق الهندسي |
| `project-docs/STAGE_6_PROGRESS.md` | سجل التقدم |
| `project-docs/STAGE_6_REPORT.md` | التقرير النهائي |

---

## 6. خطة التنفيذ التفصيلية

| المرحلة الفرعية | المهام | نقاط التحقق |
|---|---|---|
| **6.2** — الهوية البصرية | خط Amiri ، meta SEO ، تصحيح RLS events | tsc + build |
| **6.3** — المكونات المشتركة | Mobile Nav ، `usePublicData` hook | tsc + build |
| **6.4** — الصفحات العامة | 6 أقسام جديدة في `PublicHome` | tsc + build |
| **6.5** — ربط Supabase | استبدال Mock بالبيانات الحقيقية | tsc + build |
| **6.6** — التسجيل والتواصل | قسم التسجيل + نموذج اتصل بنا | tsc + build |
| **6.7** — SEO والأداء | Intersection Observer + smooth scroll | tsc + build |
| **6.8** — الاختبارات والتوثيق | verify script + تقارير + تحديث الحالة | 100% PASS |

---

## 7. قرار التحليل

✅ **التحليل مكتمل هندسياً.**

- البنية التقنية سليمة وقابلة للتوسع بأمان.
- توجد ثغرة واحدة واضحة في RLS تُصحح في المرحلة 6.2 قبل أي ربط ببيانات.
- الموقع الحالي يمثل ~45% مما هو مطلوب.
- لا مخاطر هندسية كبيرة.

**ننتظر موافقتك الصريحة للانتقال إلى المرحلة 6.2.**

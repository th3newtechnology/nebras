# دليل الإعداد والنشر السحابي على Cloudflare Pages & Supabase
**مدرسة نبراس القرآنية — مسجد إبراهيم الخليل عليه السلام**

---

## 1. نظرة عامة على المعمارية السحابية (Cloud Architecture)

تعتمد منصة مدرسة نبراس القرآنية على معمارية سحابية حديثة موزعة على الحافة (Edge-First Architecture):
- **الواجهة الأمامية (Frontend):** مستضافة على شبكة **Cloudflare Pages** العالمية، توفر سرعة تحميل فائقة عبر أكثر من 300 مركز بيانات، مع حماية مجانية من هجمات DDoS وشهادات SSL/TLS تلقائية.
- **الخلفية وقاعدة البيانات (Backend & Database):** سحابة **Supabase** المعتمدة على PostgreSQL 15 مع محرك مصادقة متكامل وحماية على مستوى الصفوف (Row Level Security - RLS) وتخزين للملفات والشهادات.
- **التوجيه ورؤوس الأمان (Routing & Headers):** ملفا `_redirects` و `_headers` في مجلد `public/` يضمنان توجيه مسارات SPA بسلاسة دون أخطاء 404، مع رؤوس حماية صارمة (CSP و HSTS).

---

## 2. خطوات النشر عبر لوحة تحكم Cloudflare Pages

### الخطوة 1: ربط المستودع البرمجي (GitHub Repository)
1. تسجيل الدخول إلى [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. التوجه إلى قائمة **Workers & Pages** -> الضغط على **Create application** -> اختيار تبويب **Pages**.
3. اختيار **Connect to Git** وتحديد مستودع المشروع `nebras`.

### الخطوة 2: ضبط إعدادات البناء (Build Configuration)
- **Project name:** `nebras-quran`
- **Production branch:** `main`
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/`

### الخطوة 3: تعيين متغيرات البيئة (Environment Variables)
في قسم **Environment variables (Production)**، أضف المتغيرات التالية:
| اسم المتغير | القيمة | الوصف |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` | رابط مشروع Supabase الخاص بك |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_xxxx` | المفتاح العمومي الآمن لـ Supabase |
| `VITE_GEMINI_API_KEY` | `AIzaxxxx` | مفتاح Google Gemini للذكاء الاصطناعي (اختياري) |
| `NODE_VERSION` | `20.18.0` | إصدار بيئة Node.js لبناء الحزم |

---

## 3. إعداد النطاق المخصص وشهادة الأمان (Custom Domain & SSL)

1. في لوحة مشروع Cloudflare Pages، انتقل إلى تبويب **Custom domains**.
2. اضغط **Set up a custom domain** وأدخل نطاق المدرسة (مثل `quran.nebras.edu` أو `nebras.ibrahim-alkhalil.dz`).
3. إذا كان النطاق مُداراً عبر Cloudflare DNS، سيتم ربط سجل CNAME تلقائياً وتفعيل شهادة الأمان SSL/TLS المجانية بنقرة واحدة (Full / Strict SSL).

---

## 4. تدقيق التوجيه والرؤوس (SPA Fallback & Security Headers)

- **ملف `_redirects`:**
  ```text
  /*    /index.html   200
  ```
  هذا التوجيه يضمن أنه عند تحديث المستخدم لصفحة مثل `/students` أو `/messages`، لن يعرض المتصفح خطأ 404، بل سيتم تقديم `index.html` مع كود الحالة 200 لتتولى واجهة React SPA معالجة المسار.

- **ملف `_headers`:**
  يحتوي على سياسات `X-Frame-Options: DENY` لمنع هجمات Clickjacking، و `X-Content-Type-Options: nosniff`، وتخزين مؤقت لملفات `/assets/*` لمدة سنة كاملة مع وسم `immutable` لتسريع التصفح اللحظي.

---

## 5. صيانة وترقية قاعدة بيانات Supabase في الإنتاج

1. **ترحيل المخططات والجداول (Migrations):**
   ملفات الترحيل الـ 8 موجودة في مجلد `supabase/migrations/`. لتطبيقها على خادم الإنتاج:
   ```bash
   npx supabase db push
   # أو تشغيل محتوى ملفات SQL عبر SQL Editor في لوحة تحكم Supabase
   ```
2. **التحقق من تفعيل RLS:**
   التأكد من أن جميع الجداول الـ 22 مُفعّل عليها نظام `Row Level Security` لحماية بيانات المدرسة ومحطة الإقراء وخصوصية الطلاب وأولياء الأمور.

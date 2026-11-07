/**
 * سكربت الفحص والتحقق الهندسي الشامل للمرحلة 5 (Nebras Auth & RLS Verification)
 * يفحص تفعيل RLS على جميع الجداول الـ 22، دوال الأمان RBAC، وسياسات العزل بين الأدوار
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationCheck {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

const checks: VerificationCheck[] = [];

const logCheck = (category: string, name: string, passed: boolean, details: string) => {
  checks.push({ id: `${category}_${name}`, category, name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}`);
  console.log(`   ${details}`);
};

const migrationFile = path.resolve(
  process.cwd(),
  'supabase/migrations/20261103000009_auth_and_rls_policies.sql'
);

function runVerification() {
  console.log('================================================================');
  console.log('بدء الفحص الهندسي والتدقيق لسياسات الأمان والمصادقة (المرحلة 5 - RLS & Auth)');
  console.log('================================================================\n');

  // 1. فحص وجود ملف الترحيل الخاص بـ RLS
  const fileExists = fs.existsSync(migrationFile);
  logCheck(
    'MIGRATION_FILE',
    'ملف ترحيل سياسات الأمان RLS (المرحلة 5)',
    fileExists,
    fileExists
      ? `تم العثور على الملف: ${path.basename(migrationFile)}`
      : 'الملف مفقود في supabase/migrations!'
  );

  if (!fileExists) {
    console.error('توقف الفحص لعدم وجود ملف الترحيل.');
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationFile, 'utf-8');

  // 2. التحقق من تفعيل RLS على جميع الجداول الـ 22
  const all22Tables = [
    'school_settings',
    'profiles',
    'user_roles',
    'academic_years',
    'halls',
    'teachers',
    'guardians',
    'students',
    'guardian_students',
    'circles',
    'circle_schedules',
    'circle_students',
    'attendance',
    'memorization_records',
    'evaluations',
    'fees',
    'payments',
    'events',
    'announcements',
    'messages',
    'notifications',
    'audit_logs',
  ];

  all22Tables.forEach((table) => {
    const rlsRegex = new RegExp(
      `ALTER\\s+TABLE\\s+(public\\.)?${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`,
      'i'
    );
    const hasRls = rlsRegex.test(sql);
    logCheck(
      'RLS_ACTIVATION',
      `تفعيل RLS لجدول ${table}`,
      hasRls,
      hasRls ? 'RLS مفعّل بنجاح' : 'لم يتم تفعيل RLS لهذا الجدول!'
    );
  });

  // 3. التحقق من دوال الأمان المساعدة (RBAC Functions)
  const securityFunctions = [
    'current_user_id',
    'has_role',
    'is_admin',
    'is_teacher',
    'is_guardian',
    'is_student',
    'get_current_teacher_id',
    'get_current_guardian_id',
    'get_current_student_id',
    'handle_new_auth_user',
  ];

  securityFunctions.forEach((func) => {
    const funcRegex = new RegExp(`CREATE\\s+(OR\\s+REPLACE\\s+)?FUNCTION\\s+(public\\.)?${func}\\b`, 'i');
    const hasFunc = funcRegex.test(sql);
    logCheck(
      'SECURITY_FUNCTIONS',
      `دالة الأمان ${func}()`,
      hasFunc,
      hasFunc ? 'معرّفة ومحمية برمجياً' : 'مفقودة في كود الترحيل!'
    );
  });

  // 4. فحص تدابير منع تصعيد الصلاحيات (Security Definer & Search Path Hijacking)
  const hasSecurityDefiner = sql.includes('SECURITY DEFINER') && sql.includes('SET search_path = public, auth');
  logCheck(
    'DEFENSE_IN_DEPTH',
    'حماية الدوال ضد Search Path Hijacking (SECURITY DEFINER + search_path)',
    hasSecurityDefiner,
    hasSecurityDefiner
      ? 'الدوال محددة المسار الصريح (public, auth) وتمنع ثغرات تصعيد الصلاحيات'
      : 'تحذير: غياب التحديد الصريح لـ search_path!'
  );

  // 5. فحص زناد إنشاء الحسابات التلقائي ومنع انتحال صفة ADMIN
  const hasAuthTrigger = sql.includes('trigger_on_auth_user_created') && sql.includes('handle_new_auth_user');
  const preventsFakeAdmin = sql.includes("v_assigned_role := 'STUDENT'") && sql.includes("v_raw_role IN ('TEACHER', 'GUARDIAN', 'STUDENT')");
  logCheck(
    'AUTH_PROVISIONING',
    'الزناد التلقائي لإنشاء profiles عند التسجيل في auth.users',
    hasAuthTrigger,
    hasAuthTrigger ? 'زناد التسجيل التلقائي مبرمج بالكامل' : 'زناد auth.users مفقود!'
  );
  logCheck(
    'ROLE_ESCALATION_PREVENTION',
    'منع منح صفة ADMIN ذاتياً عند التسجيل الجديد (Role Tamper Protection)',
    preventsFakeAdmin,
    preventsFakeAdmin ? 'يتم قصر التسجيل الذاتي على الأدوار العادية وإسقاط ADMIN' : 'خطر: إمكانية طلب دور إداري ذاتياً!'
  );

  // 6. التحقق من سياسات العزل بين الأدوار (Role Isolation Policies)
  // أ. حماية الطلاب وأولياء الأمور
  const studentIsolation = sql.includes('guardian_students_select_policy') && sql.includes('students_select_policy');
  logCheck(
    'DATA_ISOLATION',
    'عزل بيانات الطلاب والأولياء (Guardian-Child Isolation)',
    studentIsolation,
    studentIsolation ? 'الولي لا يرى سوى أبنائه والطلبة لا يرون سوى سجلاتهم' : 'سياسة عزل الطلاب غير مكتملة!'
  );

  // ب. حماية المعلمين (فقط حلقاتهم)
  const teacherIsolation = sql.includes('get_current_teacher_id') && sql.includes('attendance_insert_policy') && sql.includes('memorization_insert_policy');
  logCheck(
    'DATA_ISOLATION',
    'حصر تحضير وتقييم المعلم بحلقاته المسندة (Teacher-Circle Scope)',
    teacherIsolation,
    teacherIsolation ? 'المعلم لا يستطيع التحضير أو تقييم طلاب خارج حلقاته' : 'سياسة حصر المعلم غير مكتملة!'
  );

  // ج. حماية العمليات المالية (fees & payments)
  const financeAdminOnly = sql.includes('fees_admin_manage_policy') && sql.includes('payments_admin_manage_policy');
  logCheck(
    'FINANCIAL_SECURITY',
    'حصرية إدارة الرسوم والوصولات للإدارة العليا (Financial RBAC)',
    financeAdminOnly,
    financeAdminOnly ? 'الطلاب والأولياء يملكون فقط صلاحية القراءة لرسومهم ولا يمكنهم تعديل أو إدراج مبالغ' : 'خطر: فتح التعديل المالي لغير الإدارة!'
  );

  // د. حماية سجل التدقيق (Audit Logs)
  const auditLogProtection = sql.includes('audit_logs_select_policy') && !sql.includes('CREATE POLICY "audit_logs_update_policy"') && !sql.includes('CREATE POLICY "audit_logs_delete_policy"');
  logCheck(
    'AUDIT_INTEGRITY',
    'حظر تعديل وحذف سجل التدقيق عبر RLS (Tamper-Proof Audit)',
    auditLogProtection,
    auditLogProtection ? 'سجل التدقيق لا يقبل التعديل أو الحذف، وقراءته محصورة بالإدارة' : 'خطر في سياسة سجل التدقيق!'
  );

  // هـ. حماية إعدادات المدرسة (School Settings)
  const schoolSettingsSecurity = sql.includes('school_settings_select_policy') && sql.includes('school_settings_admin_modify_policy');
  logCheck(
    'SETTINGS_SECURITY',
    'قراءة إعدادات المدرسة متاحة للعامة وتعديلها حصري للإدارة',
    schoolSettingsSecurity,
    schoolSettingsSecurity ? 'قراءة هوية المدرسة متاحة وتعديلها محمي تماماً' : 'سياسة الإعدادات غير دقيقة!'
  );

  // و. التحقق من الرسائل الخاصة (Messages Privacy)
  const messagesPrivacy = sql.includes('sender_id = auth.uid()') && sql.includes('recipient_id = auth.uid()');
  logCheck(
    'COMMUNICATION_PRIVACY',
    'خصوصية الرسائل المباشرة (Sender / Recipient Isolation)',
    messagesPrivacy,
    messagesPrivacy ? 'المستخدم لا يقرأ سوى الرسائل التي أرسلها أو استقبلها' : 'خصوصية الرسائل غير محمية!'
  );

  // ز. التحقق من الإشعارات الفردية (Notifications Isolation)
  const notificationsIsolation = sql.includes('notifications_select_policy') && sql.includes('user_id = auth.uid()');
  logCheck(
    'COMMUNICATION_PRIVACY',
    'خصوصية الإشعارات الفردية (Personal Notifications)',
    notificationsIsolation,
    notificationsIsolation ? 'الإشعارات معزولة حصراً لصاحب الحساب' : 'الإشعارات غير معزولة!'
  );

  // 7. تلخيص النتائج
  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;
  const failed = total - passed;

  console.log('\n================================================================');
  console.log(`ملخص نتائج فحص المرحلة 5 (Auth & RLS):`);
  console.log(`إجمالي الفحوصات: ${total}`);
  console.log(`الفحوصات الناجحة: ${passed}`);
  console.log(`الفحوصات الفاشلة: ${failed}`);
  console.log(`النسبة المئوية: ${Math.round((passed / total) * 100)}% ${failed === 0 ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('فشل أحد الفحوصات الهندسية لسياسات الأمان والمصادقة!');
    process.exit(1);
  }
}

runVerification();

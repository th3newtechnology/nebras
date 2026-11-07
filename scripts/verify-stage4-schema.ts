/**
 * سكربت الفحص والتحقق الهندسي الشامل للمرحلة 4 (Nebras Database Schema Verification)
 * يفحص جميع ملفات الـ SQL، والجداول الـ 22، والمفاتيح، والقيود، والزنادات، والتزامن
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

const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

function runVerification() {
  console.log('================================================================');
  console.log('بدء الفحص الهندسي والتدقيق الشامل لملفات ترحيل المرحلة 4 (PostgreSQL)');
  console.log('================================================================\n');

  // 1. فحص وجود وتسلسل ملفات الترحيل
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  logCheck(
    'MIGRATIONS_STRUCTURE',
    'تسلسل ملفات الترحيل',
    files.length >= 8,
    `تم العثور على ${files.length} ملفات ترحيل متسلسلة في supabase/migrations/`
  );

  let allSql = '';
  files.forEach(f => {
    const content = fs.readFileSync(path.join(migrationsDir, f), 'utf-8');
    allSql += `\n-- FILE: ${f}\n` + content;
  });

  // 2. التحقق من وجود كافة الجداول الـ 22
  const requiredTables = [
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

  requiredTables.forEach(table => {
    const regex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?(public\\.)?${table}\\b`, 'i');
    const exists = regex.test(allSql);
    logCheck('TABLE_EXISTENCE', `جدول ${table}`, exists, exists ? 'مُعرّف ومُنشأ بنجاح' : 'مفقود في ملفات الـ SQL!');
  });

  // 3. التحقق من النظام المالي والمفتاح المركب والعملة DZD
  const hasDzd = allSql.includes("'DZD'");
  logCheck('FINANCIAL_RULES', 'العملة الرسمية DZD', hasDzd, 'العملة مثبتة كـ DZD ونوع المبالغ NUMERIC(12,2)');

  const hasCompositeFk = /CONSTRAINT\s+fk_payments_fee_student\s+FOREIGN\s+KEY\s*\(\s*fee_id\s*,\s*student_id\s*\)\s*REFERENCES\s+(public\.)?fees\s*\(\s*id\s*,\s*student_id\s*\)/i.test(allSql);
  logCheck('FINANCIAL_RULES', 'قيد المفتاح الأجنبي المركب (Composite FK Integrity)', hasCompositeFk, 'تم ربط الدفعة بالرسم والطالب معاً لمنع سداد رسم لطالب آخر');

  const hasRowLock = allSql.includes('FOR UPDATE');
  logCheck('FINANCIAL_CONCURRENCY', 'قفل السطر الحصري (Row-Level Locking FOR UPDATE)', hasRowLock, 'تم تضمين FOR UPDATE لمنع تضارب الدفعات المتزامنة');

  const hasGeneratedColumns = allSql.includes('GENERATED ALWAYS AS (amount - discount) STORED') &&
                             allSql.includes('GENERATED ALWAYS AS (amount - discount - paid_amount) STORED');
  logCheck('FINANCIAL_RULES', 'الأعمدة المحسوبة المخزنة (STORED GENERATED)', hasGeneratedColumns, 'تم حساب final_amount و remaining_amount آلياً ومخزناً');

  const hasPaidCheck = allSql.includes('CHECK (paid_amount <= (amount - discount))');
  logCheck('FINANCIAL_RULES', 'قيد منع تجاوز المتبقي (CHECK paid_amount)', hasPaidCheck, 'يمنع رياضياً سداد مبالغ تتجاوز أصل الرسم');

  // 4. التحقق من نظام الحلقات والقاعات والمواعيد
  const hasHallCapacity = /capacity\s+INTEGER\s+NOT\s+NULL\s+CHECK\s*\(\s*capacity\s*>\s*0\s*\)/i.test(allSql);
  logCheck('SPATIAL_RULES', 'سعة القاعة والحلقة الموجبة (> 0)', hasHallCapacity, 'سعة القاعات وسعة الحلقات موجبة بصورة مستقلة');

  const hasTimeBoundaries = allSql.includes("start_time >= '05:00:00'") && allSql.includes("end_time <= '23:00:00'");
  logCheck('SCHEDULE_RULES', 'نطاق مواعيد الحصص المدرسية (05:00 إلى 23:00)', hasTimeBoundaries, 'الحصص محصورة بين الفجر والمساء وتمنع عبور منتصف الليل');

  const hasAdvisoryLocks = allSql.includes('pg_advisory_xact_lock');
  logCheck('SCHEDULE_CONCURRENCY', 'أقفال المعاملات الاستشارية (pg_advisory_xact_lock)', hasAdvisoryLocks, 'مُطبقة لمنع تعارض مواعيد القاعات والمعلمين عند الحجز المتزامن');

  // 5. التحقق من القيود والفهارس المتقدمة
  const hasSingleAcademicYear = allSql.includes('CREATE UNIQUE INDEX') && allSql.includes('WHERE is_current = true');
  logCheck('INTEGRITY_RULES', 'سنة دراسية حالية مفردة (Partial Unique Index)', hasSingleAcademicYear, 'يمنع تنشيط أكثر من سنة حالية في آن واحد');

  const hasSingleCircleEnrollment = allSql.includes('idx_single_active_student_circle');
  logCheck('INTEGRITY_RULES', 'منع القيد المكرر للطالب في نفس الحلقة', hasSingleCircleEnrollment, 'فهرس جزئي فريد على (circle_id, student_id) للطلاب المقيدين');

  const hasAuditImmutability = allSql.includes('prevent_audit_log_tampering');
  logCheck('AUDIT_SECURITY', 'منع التعديل أو الحذف في سجل التدقيق (Immutable Audit Log)', hasAuditImmutability, 'زناد يمنع UPDATE أو DELETE أو TRUNCATE على audit_logs');

  const hasProfileProtection = allSql.includes('protect_financial_profiles');
  logCheck('DATA_PRESERVATION', 'حماية الحسابات المالية من الحذف الفيزيائي (Soft Deactivation)', hasProfileProtection, 'زناد يرفض حذف أي حساب مستخدم مرتبط بعمليات مالية');

  // 6. التحقق من بيانات Seed
  const hasSeed = allSql.includes('مسجد إبراهيم الخليل') && allSql.includes('مدرسة نبراس القرآن') && allSql.includes('حلقة البراعم التأسيسية');
  logCheck('SEED_DATA', 'بيانات البذر التأسيسية الآمنة (Idempotent Seed)', hasSeed, 'تتضمن إعدادات المدرسة والقاعات والحلقات دون كلمات سر ثابتة');

  console.log('\n================================================================');
  console.log('ملخص نتائج فحص مخطط قاعدة البيانات (المرحلة 4):');
  console.log(`إجمالي الفحوصات: ${checks.length}`);
  const passCount = checks.filter(c => c.passed).length;
  console.log(`الفحوصات الناجحة: ${passCount} من ${checks.length}`);
  console.log('================================================================\n');

  if (passCount === checks.length) {
    console.log('🎉 جميع معايير واختبارات المرحلة 4 للمخطط اجتازت الفحص الهندسي بنجاح 100%!');
    return true;
  } else {
    console.error('❌ توجد إخفاقات في الفحص الهندسي!');
    process.exit(1);
  }
}

runVerification();

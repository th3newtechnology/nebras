/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.6:
 * التواصل الداخلي المنظم: المراسلات الآمنة بين المعلم والولي والإدارة
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  canUsersCommunicate,
  fetchChatContacts,
  fetchMessages,
  sendChatMessage,
  markMessagesAsRead,
  generateDraftMessage,
  PEDAGOGICAL_TEMPLATES,
} from '../lib/messagesService';
import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [نجاح] ${testName}`);
  } else {
    console.error(`  ❌ [فشل] ${testName}`);
    if (details) console.error(`     السبب: ${details}`);
  }
}

async function runVerification() {
  console.log('\n===============================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.6');
  console.log('   التواصل الداخلي المنظم: المراسلات الآمنة بين المعلم والولي والإدارة');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص ملف الترحيل وقواعد الأمان RLS في قاعدة البيانات
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص ملف الترحيل وقواعد الأمان RLS في Supabase ---');

  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261106000016_scoped_internal_communication.sql'
  );
  assert(fs.existsSync(migrationPath), 'وجود ملف ترحيل قاعدة البيانات الخاص بالتواصل المنظم 20261106000016_scoped_internal_communication.sql');

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  assert(
    migrationSql.includes('student_id UUID REFERENCES public.students(id)') &&
      migrationSql.includes('category TEXT NOT NULL DEFAULT \'general\''),
    'توسيع جدول messages بإضافة حقل ربط الطالب student_id والتصنيف category',
    'student_id & category columns present'
  );

  assert(
    migrationSql.includes('CREATE OR REPLACE FUNCTION public.can_communicate'),
    'تعريف دالة التحقق الأمني public.can_communicate للتحقق من صلاحية التراسل المتبادل',
    'can_communicate function defined'
  );

  assert(
    migrationSql.includes('v_sender_role = \'GUARDIAN\' AND v_recipient_role = \'GUARDIAN\' THEN') &&
      migrationSql.includes('RETURN FALSE;'),
    'العزل الأمني الصارم: حظر المراسلات بين أولياء الأمور وبعضهم تماماً لمنع الإزعاج وحفظ الخصوصية',
    'Zero Cross-Guardian Communication enforced'
  );

  assert(
    migrationSql.includes('public.circle_students cs') &&
      migrationSql.includes('public.guardian_students gs'),
    'التحقق من الرابط التربوي بين المعلم والولي عبر حلقة الطالب المعتمدة',
    'circle_students & guardian_students relational join checked'
  );

  assert(
    migrationSql.includes('messages_insert_policy') &&
      migrationSql.includes('public.can_communicate('),
    'سياسة RLS مشددة للإدراج تشترط موافقة دالة can_communicate قبل حفظ الرسالة',
    'RLS insert check policy configured'
  );

  assert(
    migrationSql.includes('handle_message_read_receipt') &&
      migrationSql.includes('NEW.read_at = now()'),
    'محفز (Trigger) أوتوماتيكي لتسجيل وقت القراءة read_at عند تغيير is_read إلى true',
    'Automatic read receipt trigger configured'
  );

  // -------------------------------------------------------------
  // المجموعة 2: فلترة جهات الاتصال وفق الدور والصلاحيات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: فلترة جهات الاتصال وفق الدور والصلاحيات ---');

  const guardianContacts = await fetchChatContacts('GUARDIAN', 'u-guardian-01');
  const hasOtherGuardianInGuardianList = guardianContacts.contacts.some(
    (c) => c.role === 'GUARDIAN' && c.id !== 'u-guardian-01'
  );
  assert(
    !hasOtherGuardianInGuardianList,
    'حظر ظهور أي ولي أمر آخر في قائمة جهات اتصال الولي (عزل خصوصية العائلات)',
    `عدد جهات الاتصال المتاحة للولي: ${guardianContacts.contacts.length} (فقط معلمون وإدارة)`
  );

  const guardianHasTeacherAndAdmin = guardianContacts.contacts.some((c) => c.role === 'TEACHER') &&
    guardianContacts.contacts.some((c) => c.role === 'ADMIN');
  assert(
    guardianHasTeacherAndAdmin,
    'ظهور المعلمين والإدارة المصرح بالتواصل معهم في قائمة الولي',
    'Teachers and Admin available for Guardian'
  );

  const teacherContacts = await fetchChatContacts('TEACHER', 'u-teacher-01');
  const teacherHasGuardiansAndColleagues = teacherContacts.contacts.some((c) => c.role === 'GUARDIAN') &&
    teacherContacts.contacts.some((c) => c.role === 'TEACHER') &&
    teacherContacts.contacts.some((c) => c.role === 'ADMIN');
  assert(
    teacherHasGuardiansAndColleagues,
    'ظهور أولياء أمور الطلاب وزملاء التحفيظ والإدارة في قائمة المعلم',
    'Guardians, Colleagues, and Admin available for Teacher'
  );

  const adminContacts = await fetchChatContacts('ADMIN', 'u-admin-01');
  assert(
    adminContacts.contacts.length >= 4,
    'ظهور كافة جهات الاتصال المصرح بها للإدارة العامة للمدرسة',
    `إجمالي جهات اتصال الإدارة: ${adminContacts.contacts.length}`
  );

  // -------------------------------------------------------------
  // المجموعة 3: اختبارات قواعد التراسل الأمني المتبادل
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: اختبارات قواعد التراسل الأمني المتبادل ---');

  const guardianToGuardianAllowed = await canUsersCommunicate('GUARDIAN', 'GUARDIAN');
  assert(
    guardianToGuardianAllowed === false,
    'دالة canUsersCommunicate: حظر تواصل الولي مع ولي آخر (رفض أمني)',
    `النتيجة: ${guardianToGuardianAllowed}`
  );

  const teacherToGuardianAllowed = await canUsersCommunicate('TEACHER', 'GUARDIAN');
  assert(
    teacherToGuardianAllowed === true,
    'دالة canUsersCommunicate: السماح بتواصل المعلم مع أولياء الأمور',
    `النتيجة: ${teacherToGuardianAllowed}`
  );

  const guardianToTeacherAllowed = await canUsersCommunicate('GUARDIAN', 'TEACHER');
  assert(
    guardianToTeacherAllowed === true,
    'دالة canUsersCommunicate: السماح بتواصل الولي مع معلمي أبنائه',
    `النتيجة: ${guardianToTeacherAllowed}`
  );

  const teacherToTeacherAllowed = await canUsersCommunicate('TEACHER', 'TEACHER');
  assert(
    teacherToTeacherAllowed === true,
    'دالة canUsersCommunicate: السماح بتواصل المعلمين فيما بينهم للتنسيق التربوي',
    `النتيجة: ${teacherToTeacherAllowed}`
  );

  const adminToAnyoneAllowed = (await canUsersCommunicate('ADMIN', 'GUARDIAN')) &&
    (await canUsersCommunicate('ADMIN', 'TEACHER')) &&
    (await canUsersCommunicate('GUARDIAN', 'ADMIN'));
  assert(
    adminToAnyoneAllowed,
    'دالة canUsersCommunicate: السماح للإدارة بمراسلة واستقبال رسائل جميع الفئات',
    'Admin omnidirectional communication allowed'
  );

  // محاولة إرسال رسالة غير مصرح بها (من ولي إلى ولي آخر)
  const unauthorizedSendAttempt = await sendChatMessage({
    senderId: 'u-guardian-01',
    senderRole: 'GUARDIAN',
    recipientId: 'u-guardian-02',
    recipientRole: 'GUARDIAN',
    content: 'رسالة غير مصرح بها بين أولياء الأمور',
  });
  assert(
    unauthorizedSendAttempt.success === false && unauthorizedSendAttempt.error !== undefined,
    'اعتراض وإفشال محاولة إرسال رسالة من ولي لولي آخر مع إرجاع رسالة خطأ أمنية واضحة',
    `رسالة الخطأ: ${unauthorizedSendAttempt.error}`
  );

  // -------------------------------------------------------------
  // المجموعة 4: ربط الرسائل بسياق الطالب والتصنيف والقوالب التربوية
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: ربط الرسائل بسياق الطالب والتصنيف والقوالب التربوية ---');

  const validSendResult = await sendChatMessage({
    senderId: 'u-teacher-01',
    senderRole: 'TEACHER',
    recipientId: 'u-guardian-01',
    recipientRole: 'GUARDIAN',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'compliment',
    content: 'ما شاء الله تبارك الله، تميز في حفظ وضبط سورة الكهف.',
  });
  assert(
    validSendResult.success === true && validSendResult.message !== undefined,
    'نجاح إرسال رسالة تربوية مشروعة من المعلم إلى الولي',
    `معرف الرسالة: ${validSendResult.message?.id}`
  );

  assert(
    validSendResult.message?.studentId === 's-001' &&
      validSendResult.message?.studentName === 'محمد ياسين درويش' &&
      validSendResult.message?.category === 'compliment',
    'ربط الرسالة ببيانات الطالب المعني والتصنيف التربوي (compliment)',
    `طالب: ${validSendResult.message?.studentName} • تصنيف: ${validSendResult.message?.category}`
  );

  // جلب المحادثة المفلترة بسياق الطالب
  const studentMessages = await fetchMessages('u-guardian-01', 'u-teacher-01', 's-001');
  const allBelongToStudent = studentMessages.messages.every((m) => m.studentId === 's-001');
  assert(
    studentMessages.messages.length > 0 && allBelongToStudent,
    'فلترة المحادثة واسترجاع رسائل خاصة بالطالب المحدد حصراً (Thread by Student)',
    `عدد رسائل الطالب s-001: ${studentMessages.messages.length}`
  );

  // فحص القوالب التربوية الجاهزة
  assert(
    PEDAGOGICAL_TEMPLATES.length >= 4,
    'توفر قوالب الرسائل التربوية الأربعة الأساسية (تهنئة، غياب، تذكير، لقاء تربوي)',
    `عدد القوالب: ${PEDAGOGICAL_TEMPLATES.length}`
  );

  const complimentDraft = generateDraftMessage('compliment', 'محمد ياسين');
  assert(
    complimentDraft.includes('محمد ياسين') && complimentDraft.includes('الإتقان المتميز'),
    'توليد نص قالب التهنئة بالتميز والإتقان بنجاح',
    `المعاينة: ${complimentDraft.slice(0, 50)}...`
  );

  const absenceDraft = generateDraftMessage('absence_notice', 'إبراهيم');
  assert(
    absenceDraft.includes('إبراهيم') && absenceDraft.includes('تغيب الطالب'),
    'توليد نص قالب تنبيه الغياب والحرص على تعويض الورد القرآني بنجاح',
    `المعاينة: ${absenceDraft.slice(0, 50)}...`
  );

  const meetingDraft = generateDraftMessage('meeting', 'يوسف');
  assert(
    meetingDraft.includes('يوسف') && meetingDraft.includes('لقاء تربوي'),
    'توليد نص قالب دعوة لقاء تربوي مع الشيخ المحفظ بنجاح',
    `المعاينة: ${meetingDraft.slice(0, 50)}...`
  );

  // -------------------------------------------------------------
  // المجموعة 5: التحقق من إشعارات القراءة والطابع الزمني (Read Receipts)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: التحقق من إشعارات القراءة والطابع الزمني (Read Receipts) ---');

  const beforeReadMessages = await fetchMessages('u-teacher-01', 'u-guardian-01');
  const hasUnreadBefore = beforeReadMessages.messages.some((m) => !m.isRead);

  // تحديث حالة القراءة
  const markResult = await markMessagesAsRead('u-teacher-01', 'u-guardian-01');
  assert(markResult === true, 'استدعاء دالة markMessagesAsRead بنجاح لتأكيد استلام وقراءة الرسائل');

  const afterReadMessages = await fetchMessages('u-teacher-01', 'u-guardian-01');
  const unreadCountAfter = afterReadMessages.messages.filter(
    (m) => m.senderId === 'u-teacher-01' && m.recipientId === 'u-guardian-01' && !m.isRead
  ).length;

  const readReceiptUpdated = afterReadMessages.messages.some(
    (m) => m.senderId === 'u-teacher-01' && m.recipientId === 'u-guardian-01' && m.isRead && m.readAt !== undefined
  );

  assert(
    unreadCountAfter === 0 && readReceiptUpdated,
    'تحديث حالة القراءة بنجاح وتوثيق الطابع الزمني readAt لجميع الرسائل المقروءة',
    'Read receipts with readAt timestamp verified'
  );

  // -------------------------------------------------------------
  // المجموعة 6: تكامل واجهة المستخدم Messages.tsx والرموز البصرية
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 6: تكامل واجهة المستخدم والرموز البصرية ---');

  const messagesPagePath = path.resolve(process.cwd(), 'pages/Messages.tsx');
  assert(fs.existsSync(messagesPagePath), 'وجود ملف صفحة المراسلات pages/Messages.tsx');

  const messagesPageCode = fs.readFileSync(messagesPagePath, 'utf-8');

  assert(
    messagesPageCode.includes('sendChatMessage') &&
      messagesPageCode.includes('PEDAGOGICAL_TEMPLATES') &&
      messagesPageCode.includes('markMessagesAsRead'),
    'استيراد الدوال الجديدة وعزل الصلاحيات والقوالب التربوية في صفحة المراسلات',
    'Services & templates imported in Messages.tsx'
  );

  assert(
    messagesPageCode.includes('user?.role') &&
      messagesPageCode.includes('fetchChatContacts(user?.role'),
    'تمرير دور المستخدم الحالي لخدمة جلب جهات الاتصال لعزل القائمة أمنياً',
    'User role passed to contacts loader'
  );

  assert(
    messagesPageCode.includes('studentName') &&
      messagesPageCode.includes('associatedStudentName'),
    'دعم ربط الطالب المعني وإظهار شارة اسم الطالب على فقاعات الرسائل',
    'Student association & badges in UI verified'
  );

  assert(
    messagesPageCode.includes('CheckCheck') &&
      messagesPageCode.includes('readAt'),
    'عرض مؤشرات القراءة (صحّين زرقاوين مع توقيت القراءة readAt)',
    'CheckCheck double checkmark and readAt time rendered'
  );

  // -------------------------------------------------------------
  // الخلاصة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 النتيجة النهائية لاختبارات المرحلة الفرعية 8.4.6:`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   - نسبة الإنجاز: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  if (passedTests === totalTests) {
    console.log('   🎉 تم اجتياز جميع اختبارات التواصل الداخلي المنظم بنجاح 100%!');
  } else {
    console.error('   ⚠️ توجد بعض الاختبارات التي لم تكتمل بنجاح، يرجى المراجعة.');
  }
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء الفحص:', err);
  process.exit(1);
});

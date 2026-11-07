/**
 * نصوص الفحص والتحقق الآلي للمرحلة الفرعية 8.4.7:
 * منظومة الإشعارات والتنبيهات المدرسية الميدانية (الحصص، التقارير، الغياب، والرسائل)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 */

import {
  fetchUserNotifications,
  createNotification,
  dispatchBulkNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllUserNotifications,
  fetchNotificationStats,
  notifyAbsence,
  notifyNewReport,
  notifyScheduleException,
  notifyNewMessage,
  notifyAchievement,
} from '../lib/notificationsService';
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
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.4.7');
  console.log('   منظومة الإشعارات والتنبيهات المدرسية الميدانية والعزل الأمني');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص ملف ترحيل Supabase وسياسات RLS والمحفزات
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص ملف ترحيل Supabase وسياسات RLS والمحفزات ---');

  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261106000017_notifications_and_alerts.sql'
  );
  assert(fs.existsSync(migrationPath), 'وجود ملف ترحيل Supabase الخاص بمنظومة الإشعارات 20261106000017_notifications_and_alerts.sql');

  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

  assert(
    migrationSql.includes('category TEXT NOT NULL DEFAULT \'system\'') &&
      migrationSql.includes('priority TEXT NOT NULL DEFAULT \'normal\'') &&
      migrationSql.includes('metadata JSONB') &&
      migrationSql.includes('action_label TEXT') &&
      migrationSql.includes('read_at TIMESTAMPTZ'),
    'ترقية جدول notifications بإضافة التصنيف والأولوية والبيانات الوصفية وزر الإجراء ووقت القراءة',
    'Category, Priority, Metadata, ActionLabel, ReadAt added'
  );

  assert(
    migrationSql.includes('category IN (\'session\', \'absence\', \'report\', \'message\', \'achievement\', \'system\')'),
    'تطبيق قيد الفحص (CHECK) على التصنيفات القرآنية الستة المعتمدة',
    'Category check constraint verified'
  );

  assert(
    migrationSql.includes('priority IN (\'urgent\', \'high\', \'normal\', \'low\')'),
    'تطبيق قيد الفحص (CHECK) على مستويات الأولوية الأربعة',
    'Priority check constraint verified'
  );

  assert(
    migrationSql.includes('notifications_select_policy') &&
      migrationSql.includes('user_id = auth.uid() OR public.is_admin()'),
    'سياسات RLS مشددة لعزل الإشعارات بحيث لا يرى المستخدم إلا تنبيهاته الخاصة',
    'RLS select isolation policy verified'
  );

  assert(
    migrationSql.includes('trigger_notify_report_to_guardian') &&
      migrationSql.includes('NEW.status = \'sent_to_guardian\''),
    'محفز آلي لتوليد إشعار فوري لولي الأمر عند اعتماد وإرسال تقرير المعلم الدوري',
    'Auto report sent trigger configured'
  );

  assert(
    migrationSql.includes('trigger_notify_schedule_exception') &&
      migrationSql.includes('public.schedule_exceptions'),
    'محفز آلي لإشعار أولياء الأمور والمعلم عند إلغاء أو تعديل موعد أو قاعة حصة تحفيظ',
    'Auto schedule exception trigger configured'
  );

  assert(
    migrationSql.includes('trigger_notify_new_message') &&
      migrationSql.includes('public.messages'),
    'محفز آلي لتوليد إشعار استلام رسالة جديدة موجهة للمستقبل',
    'Auto new message trigger configured'
  );

  assert(
    migrationSql.includes('handle_notification_read_timestamp') &&
      migrationSql.includes('NEW.read_at = now()'),
    'محفز توثيق الطابع الزمني read_at أوتوماتيكياً عند قراءة الإشعار',
    'Auto read timestamp trigger configured'
  );

  // -------------------------------------------------------------
  // المجموعة 2: استرجاع وتصفية الإشعارات متعددة التصنيفات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: استرجاع وتصفية الإشعارات متعددة التصنيفات ---');

  const guardianUserId = 'u-guardian-01';
  const { notifications: allGuardianNotifs } = await fetchUserNotifications(guardianUserId);
  assert(
    allGuardianNotifs.length > 0,
    'استرجاع قائمة إشعارات ولي الأمر بنجاح',
    `إجمالي الإشعارات المسترجعة: ${allGuardianNotifs.length}`
  );

  // تصفية حسب التصنيف: الغياب
  const { notifications: absenceNotifs } = await fetchUserNotifications(guardianUserId, {
    category: 'absence',
  });
  const allAbsence = absenceNotifs.every((n) => n.category === 'absence');
  assert(
    absenceNotifs.length > 0 && allAbsence,
    'تصفية الإشعارات حسب تصنيف الغياب (absence) بنجاح',
    `عدد إشعارات الغياب: ${absenceNotifs.length}`
  );

  // تصفية حسب التصنيف: التقارير
  const { notifications: reportNotifs } = await fetchUserNotifications(guardianUserId, {
    category: 'report',
  });
  const allReports = reportNotifs.every((n) => n.category === 'report');
  assert(
    reportNotifs.length > 0 && allReports,
    'تصفية الإشعارات حسب تصنيف التقارير التربوية (report) بنجاح',
    `عدد إشعارات التقارير: ${reportNotifs.length}`
  );

  // تصفية حسب الأولوية العاجلة
  const { notifications: urgentNotifs } = await fetchUserNotifications(guardianUserId, {
    priority: 'urgent',
  });
  const allUrgent = urgentNotifs.every((n) => n.priority === 'urgent');
  assert(
    urgentNotifs.length > 0 && allUrgent,
    'تصفية الإشعارات حسب الأولوية العاجلة (urgent) بنجاح',
    `عدد الإشعارات العاجلة: ${urgentNotifs.length}`
  );

  // تصفية الإشعارات غير المقروءة فقط
  const { notifications: unreadOnlyNotifs } = await fetchUserNotifications(guardianUserId, {
    unreadOnly: true,
  });
  const allUnread = unreadOnlyNotifs.every((n) => !n.isRead);
  assert(
    allUnread,
    'تصفية الإشعارات غير المقروءة فقط (unreadOnly: true) بنجاح',
    `عدد غير المقروء: ${unreadOnlyNotifs.length}`
  );

  // -------------------------------------------------------------
  // المجموعة 3: إنشاء وتوليد وحساب إحصائيات الإشعارات
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: إنشاء وتوليد وحساب إحصائيات الإشعارات ---');

  const customNotifRes = await createNotification({
    userId: guardianUserId,
    title: 'تنبيه اختباري ميداني',
    message: 'هذا إشعار تجريبي لاختبار محرك التنبيهات المدرسية',
    type: 'info',
    category: 'system',
    priority: 'normal',
    linkUrl: '/dashboard',
    actionLabel: 'الانتقال للرئيسية',
    metadata: { testKey: 'testVal' },
  });
  assert(
    customNotifRes.success && customNotifRes.notification !== undefined,
    'إنشاء إشعار جديد مخصص بنجاح عبر createNotification',
    `معرف الإشعار: ${customNotifRes.notification?.id}`
  );

  const bulkRes = await dispatchBulkNotifications([
    {
      userId: guardianUserId,
      title: 'إشعار جماعي 1',
      message: 'رسالة جماعية أولى',
      type: 'info',
      category: 'session',
      priority: 'high',
    },
    {
      userId: guardianUserId,
      title: 'إشعار جماعي 2',
      message: 'رسالة جماعية ثانية',
      type: 'success',
      category: 'achievement',
      priority: 'normal',
    },
  ]);
  assert(
    bulkRes.success && bulkRes.count === 2,
    'إرسال دفعة إشعارات جماعية بنجاح عبر dispatchBulkNotifications',
    `عدد الإشعارات المرسلة: ${bulkRes.count}`
  );

  // فحص الإحصائيات
  const stats = await fetchNotificationStats(guardianUserId);
  assert(
    stats.total > 0 &&
      stats.unreadCount >= 0 &&
      stats.byCategory.absence !== undefined &&
      stats.byCategory.report !== undefined &&
      stats.byCategory.session !== undefined,
    'حساب إحصائيات الإشعارات بدقة وتوزيعها على التصنيفات الستة',
    `إجمالي: ${stats.total} • غير مقروء: ${stats.unreadCount} • عاجل: ${stats.urgentCount}`
  );

  // -------------------------------------------------------------
  // المجموعة 4: دوال التوليد التلقائي لأحداث المدرسة القرآنية
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 4: دوال التوليد التلقائي لأحداث المدرسة القرآنية ---');

  // 1. تنبيه غياب
  const absenceEventRes = await notifyAbsence(
    guardianUserId,
    'محمد ياسين درويش',
    '2026-11-07',
    'حلقة الصديق للمتقنين'
  );
  assert(
    absenceEventRes.success &&
      absenceEventRes.notification?.category === 'absence' &&
      absenceEventRes.notification?.priority === 'urgent' &&
      absenceEventRes.notification?.title.includes('محمد ياسين'),
    'دالة notifyAbsence: توليد تنبيه غياب فوري للولي بأولوية عاجلة (urgent)',
    `عنوان: ${absenceEventRes.notification?.title}`
  );

  // 2. تنبيه تقرير جديد
  const reportEventRes = await notifyNewReport(
    guardianUserId,
    'إبراهيم بن خليل',
    'weekly',
    'rep-test-99'
  );
  assert(
    reportEventRes.success &&
      reportEventRes.notification?.category === 'report' &&
      reportEventRes.notification?.priority === 'high' &&
      reportEventRes.notification?.linkUrl === '/guardian-dashboard',
    'دالة notifyNewReport: توليد إشعار تقرير تربوي معتمد مع زر الانتقال للبوابة',
    `عنوان: ${reportEventRes.notification?.title}`
  );

  // 3. تنبيه استثناء حصة
  const exceptionEventRes = await notifyScheduleException(
    [guardianUserId, 'u-guardian-02'],
    'حلقة الفتح - أشبال القرآن',
    'cancelled',
    '2026-11-08',
    'أعمال صيانة بالمسجد'
  );
  assert(
    exceptionEventRes.success && exceptionEventRes.count === 2,
    'دالة notifyScheduleException: إشعار أولياء أمور الحلقة بإلغاء الحصة وتوثيق السبب',
    `تم إشعار ${exceptionEventRes.count} من أولياء الأمور`
  );

  // 4. تنبيه رسالة جديدة
  const messageEventRes = await notifyNewMessage(
    guardianUserId,
    'الشيخ عبد الرحمن السديس',
    'السلام عليكم، نرجو مراجعة ترقيق الراءات',
    'محمد ياسين'
  );
  assert(
    messageEventRes.success &&
      messageEventRes.notification?.category === 'message' &&
      messageEventRes.notification?.linkUrl === '/messages',
    'دالة notifyNewMessage: توليد إشعار رسالة جديدة مع ربط الطالب ومسار المحادثة',
    `رسالة: ${messageEventRes.notification?.message}`
  );

  // 5. تنبيه إنجاز قرآني
  const achievementEventRes = await notifyAchievement(
    guardianUserId,
    'محمد ياسين درويش',
    'ختم الجزء العاشر برواية ورش'
  );
  assert(
    achievementEventRes.success &&
      achievementEventRes.notification?.category === 'achievement' &&
      achievementEventRes.notification?.type === 'success',
    'دالة notifyAchievement: توليد إشعار تهنئة بإنجاز قرآني بنجاح',
    `عنوان: ${achievementEventRes.notification?.title}`
  );

  // -------------------------------------------------------------
  // المجموعة 5: دورة حياة التنبيهات وتوثيق القراءة ومسحها
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 5: دورة حياة التنبيهات وتوثيق القراءة ومسحها ---');

  const testTargetNotif = customNotifRes.notification!;
  assert(!testTargetNotif.isRead, 'الإشعار المنشأ حديثاً يبدأ بحالة غير مقروء (isRead: false)');

  // تحديد إشعار محدد كمقروء
  const readSingleRes = await markNotificationAsRead(testTargetNotif.id, guardianUserId);
  assert(readSingleRes, 'استدعاء markNotificationAsRead بنجاح لتحديد الإشعار كمقروء');

  const { notifications: updatedNotifs } = await fetchUserNotifications(guardianUserId);
  const foundUpdated = updatedNotifs.find((n) => n.id === testTargetNotif.id);
  assert(
    foundUpdated?.isRead === true && foundUpdated?.readAt !== undefined,
    'توثيق حالة القراءة وتعيين الطابع الزمني readAt بنجاح',
    `توقيت القراءة: ${foundUpdated?.readAt}`
  );

  // تحديد جميع الإشعارات كمقروءة
  const markAllRes = await markAllNotificationsAsRead(guardianUserId);
  assert(markAllRes, 'استدعاء markAllNotificationsAsRead بنجاح لتصفير الإشعارات غير المقروءة');

  const statsAfterMarkAll = await fetchNotificationStats(guardianUserId);
  assert(
    statsAfterMarkAll.unreadCount === 0,
    'تأكيد أن عدد الإشعارات غير المقروءة أصبح 0 بعد استدعاء قراءة الكل',
    `عدد غير المقروء: ${statsAfterMarkAll.unreadCount}`
  );

  // حذف إشعار محدد
  const deleteRes = await deleteNotification(testTargetNotif.id, guardianUserId);
  assert(deleteRes, 'استدعاء deleteNotification لحذف الإشعار بنجاح');

  // -------------------------------------------------------------
  // المجموعة 6: تكامل سياق التطبيق وواجهة المستخدم
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 6: تكامل سياق التطبيق وواجهة المستخدم ---');

  const contextPath = path.resolve(process.cwd(), 'context/NotificationContext.tsx');
  assert(fs.existsSync(contextPath), 'وجود ملف سياق الإشعارات context/NotificationContext.tsx');
  const contextCode = fs.readFileSync(contextPath, 'utf-8');

  assert(
    contextCode.includes('appNotifications') &&
      contextCode.includes('urgentCount') &&
      contextCode.includes('activeCategory') &&
      contextCode.includes('markAllAsRead'),
    'توسيع NotificationContext بدعم الإشعارات المصنفة، الأولويات، وقراءة الكل',
    'NotificationContext extended properties verified'
  );

  const dropdownPath = path.resolve(process.cwd(), 'components/NotificationDropdown.tsx');
  assert(fs.existsSync(dropdownPath), 'وجود مكون القائمة المنسدلة components/NotificationDropdown.tsx');
  const dropdownCode = fs.readFileSync(dropdownPath, 'utf-8');

  assert(
    dropdownCode.includes('CATEGORY_TABS') &&
      dropdownCode.includes('selectedCategory') &&
      dropdownCode.includes('filterUnreadOnly'),
    'اشتمال القائمة المنسدلة على تبويبات التصنيفات وتصفية غير المقروء',
    'Category tabs and unread filters verified'
  );

  assert(
    dropdownCode.includes('getCategoryIcon') &&
      dropdownCode.includes('urgentCount') &&
      dropdownCode.includes('actionLabel'),
    'عرض أيقونات التصنيفات، شارات الأولوية العاجلة، وأزرار الإجراء المباشر',
    'Visual badges and action buttons verified'
  );

  const layoutPath = path.resolve(process.cwd(), 'layouts/DashboardLayout.tsx');
  const layoutCode = fs.readFileSync(layoutPath, 'utf-8');
  assert(
    layoutCode.includes('NotificationDropdown') &&
      layoutCode.includes('onNavigate={onViewChange}'),
    'ربط NotificationDropdown بمحرك التنقل في DashboardLayout لنقل المستخدم للشاشة المعنية بضغطة زر',
    'DashboardLayout navigation connection verified'
  );

  // -------------------------------------------------------------
  // الخلاصة النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 النتيجة النهائية لاختبارات المرحلة الفرعية 8.4.7:`);
  console.log(`   - الاختبارات الناجحة: ${passedTests} من أصل ${totalTests}`);
  console.log(`   - نسبة الإنجاز: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  if (passedTests === totalTests) {
    console.log('   🎉 تم اجتياز جميع اختبارات منظومة الإشعارات والتنبيهات المدرسية بنجاح 100%!');
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

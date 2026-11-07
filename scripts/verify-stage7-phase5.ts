/**
 * سكريبت التحقق الشامل من المرحلة الفرعية 7.5
 * منظومة الفعاليات والإعلانات والمراسلات المدرسية (Events, Announcements & Messages)
 */

import fs from 'fs';
import path from 'path';
import { 
  fetchEvents, 
  createEvent, 
  updateEvent, 
  toggleEventPublished, 
  deleteEvent, 
  fetchAnnouncements, 
  createAnnouncement, 
  toggleAnnouncementPinned, 
  deleteAnnouncement 
} from '../lib/eventsService';
import { 
  fetchChatContacts, 
  fetchMessages, 
  sendChatMessage, 
  generateDraftMessage 
} from '../lib/messagesService';

let passed = 0;
let failed = 0;

function assert(condition: boolean, desc: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${desc}`);
    failed++;
  }
}

async function runStage7Phase5Verification() {
  console.log('===============================================================');
  console.log(' 🔍 بدء الفحص الشامل للمرحلة الفرعية 7.5: الفعاليات والإعلانات والمراسلات');
  console.log('===============================================================\n');

  // 1. فحص وجود الملفات الأساسية
  console.log('📂 1. التحقق من وجود ملفات المرحلة 7.5:');
  const requiredFiles = [
    'types/communication.types.ts',
    'lib/eventsService.ts',
    'lib/messagesService.ts',
    'components/communication/EventFormModal.tsx',
    'components/communication/AnnouncementFormModal.tsx',
    'pages/Events.tsx',
    'pages/Messages.tsx',
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.resolve(process.cwd(), relPath);
    assert(fs.existsSync(fullPath), `وجود الملف: ${relPath}`);
  }

  // 2. اختبار خدمة الفعاليات (Events Service)
  console.log('\n📅 2. التحقق من وظائف الفعاليات (Events CRUD & Visibility):');
  
  const { events: initialEvents } = await fetchEvents();
  assert(Array.isArray(initialEvents), 'جلب قائمة الفعاليات كمصفوفة');

  const newEventRes = await createEvent({
    title: 'مسابقة الأترجة للقرآن الكريم والترتيل',
    description: 'مسابقة سنوية تعقد في قاعة عمر بن الخطاب لتحفيز التلاوة العطرة.',
    eventDate: '2026-11-20',
    startTime: '09:00',
    endTime: '12:00',
    location: 'قاعة عمر بن الخطاب',
    targetAudience: 'all',
    isPublished: true,
  });

  assert(newEventRes.success && !!newEventRes.eventId, 'إنشاء فعالية جديدة بنجاح');
  const createdEventId = newEventRes.eventId || '';

  if (createdEventId) {
    const toggleRes = await toggleEventPublished(createdEventId, false);
    assert(toggleRes.success, 'تعديل حالة النشر في الموقع العام (إلغاء النشر)');

    const toggleBackRes = await toggleEventPublished(createdEventId, true);
    assert(toggleBackRes.success, 'إعادة تفعيل النشر في الموقع العام بنجاح');

    const updateRes = await updateEvent(createdEventId, {
      title: 'مسابقة الأترجة الكبرى للقرآن الكريم والترتيل',
    });
    assert(updateRes.success, 'تحديث بيانات الفعالية');

    const delRes = await deleteEvent(createdEventId);
    assert(delRes.success, 'حذف الفعالية بأمان');
  }

  // 3. اختبار خدمة الإعلانات الرسمية (Announcements Service)
  console.log('\n📢 3. التحقق من وظائف الإعلانات وتثبيت الأخبار (Announcements & Pinning):');

  const { announcements: initialAnnouncements } = await fetchAnnouncements();
  assert(Array.isArray(initialAnnouncements), 'جلب قائمة الإعلانات المدرسية كمصفوفة');

  const newAnnRes = await createAnnouncement({
    title: 'تحديد موعد اختبارات نصف الفصل القرآني',
    content: 'نحيطكم علماً بأن جلسات التسميع الشامل ستبدأ الأحد القادم بإذن الله.',
    announcementType: 'info',
    targetRole: 'all',
    isPinned: true,
  });

  assert(newAnnRes.success && !!newAnnRes.announcementId, 'إنشاء إعلان جديد ومثبت بنجاح');
  const createdAnnId = newAnnRes.announcementId || '';

  if (createdAnnId) {
    const togglePinRes = await toggleAnnouncementPinned(createdAnnId, false);
    assert(togglePinRes.success, 'إلغاء تثبيت الإعلان');

    const delAnnRes = await deleteAnnouncement(createdAnnId);
    assert(delAnnRes.success, 'حذف الإعلان بأمان');
  }

  // 4. اختبار خدمة مركز المراسلات (Messages & Contacts)
  console.log('\n💬 4. التحقق من وظائف مركز المراسلات الآمنة والمحادثات:');

  const { contacts } = await fetchChatContacts();
  assert(Array.isArray(contacts) && contacts.length > 0, `جلب جهات الاتصال المتاحة (العدد: ${contacts.length})`);

  const firstContact = contacts[0];
  const { messages: initialMessages } = await fetchMessages(firstContact.id, 'current-admin');
  assert(Array.isArray(initialMessages), 'جلب سجل الرسائل والمحادثة النشطة');

  const sendRes = await sendChatMessage({
    senderId: 'current-admin',
    recipientId: firstContact.id,
    content: 'السلام عليكم ورحمة الله، تم مراجعة تقرير الحلقة بارك الله فيكم.',
    messageType: 'text',
  });
  assert(sendRes.success && !!sendRes.message, 'إرسال رسالة نصية جديدة بنجاح وحفظها');

  // 5. اختبار المساعد الذكي وصياغة النماذج التربوية
  console.log('\n✨ 5. التحقق من قوالب المساعد الذكي والصياغة التربوية:');

  const reminderDraft = generateDraftMessage('reminder');
  assert(reminderDraft.includes('تذكير') && reminderDraft.includes('مسجد إبراهيم الخليل'), 'صياغة نموذج تذكير بموعد الحلقة');

  const complimentDraft = generateDraftMessage('compliment', 'محمد البشير');
  assert(complimentDraft.includes('محمد البشير') && complimentDraft.includes('التهاني'), 'صياغة نموذج تهنئة بإتقان الحفظ باسم الطالب');

  const absenceDraft = generateDraftMessage('absence_notice', 'أحمد زروقي');
  assert(absenceDraft.includes('أحمد زروقي') && absenceDraft.includes('تغيب'), 'صياغة نموذج إشعار غياب لولي الأمر');

  // 6. التحقق من تكامل المكونات في صفحة الفعاليات والمراسلات
  console.log('\n🖥️ 6. التحقق من واجهات المستخدم والتبويبات:');
  const eventsContent = fs.readFileSync(path.resolve(process.cwd(), 'pages/Events.tsx'), 'utf-8');
  assert(eventsContent.includes('toggleEventPublished') && eventsContent.includes('isPublished'), 'دعم تفعيل/إلغاء نشر الفعاليات في واجهة Events');
  assert(eventsContent.includes('toggleAnnouncementPinned') && eventsContent.includes('isPinned'), 'دعم تثبيت الإعلانات بالأعلى في واجهة Events');
  assert(eventsContent.includes('EventFormModal') && eventsContent.includes('AnnouncementFormModal'), 'تكامل نوافذ إضافة الفعاليات والإعلانات');

  const messagesContent = fs.readFileSync(path.resolve(process.cwd(), 'pages/Messages.tsx'), 'utf-8');
  assert(messagesContent.includes('fetchChatContacts') && messagesContent.includes('sendChatMessage'), 'ربط صفحة Messages بخدمة المراسلات الآمنة');
  assert(messagesContent.includes('generateDraftMessage') && messagesContent.includes('Sparkles'), 'تكامل المساعد الذكي والقوالب التربوية في واجهة Messages');

  console.log('\n===============================================================');
  console.log(` 📊 نتيجة الفحص للمرحلة 7.5: ${passed} نجح | ${failed} فشل`);
  console.log('===============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runStage7Phase5Verification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});

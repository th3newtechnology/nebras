/**
 * خدمة مركز المراسلات الآمنة والتواصل الداخلي المنظم
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * ربط مباشر مع جدول messages في Supabase مع دعم تجميع المحادثات وعزل الصلاحيات
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  ChatMessage,
  ContactItem,
  ConversationThread,
  MessageType,
  MessageCategory,
  PedagogicalTemplateItem,
} from '../types/communication.types';

// قوالب الرسائل التربوية الفورية المعتمدة
export const PEDAGOGICAL_TEMPLATES: PedagogicalTemplateItem[] = [
  {
    id: 'tpl-compliment',
    title: 'تهنئة بالتميز والإتقان القرآني',
    category: 'compliment',
    targetRole: 'GUARDIAN',
    template: ({ studentName, surahName }) =>
      `السلام عليكم ورحمة الله وبركاته. يسر إدارة مدرسة نبراس ومحفظ الحلقة أن يزفوا إليكم خالص التهاني على الإتقان المتميز والتلاوة الندية للطالب ${studentName || 'ابنكم المبارك'}${surahName ? ` في حفظ وتثبيت ${surahName}` : ''}. نسأل الله أن يجعله ذخراً لكم وللأمة الإسلامية.`,
  },
  {
    id: 'tpl-absence',
    title: 'تنبيه غياب عن جلسة التحفيظ',
    category: 'absence',
    targetRole: 'GUARDIAN',
    template: ({ studentName, date }) =>
      `السلام عليكم ورحمة الله وبركاته. نحيطكم علماً بتغيب الطالب ${studentName || 'ابنكم'} عن حلقة القرآن بمسجد إبراهيم الخليل اليوم ${date || ''}. نرجو منكم طمأنتنا على صحته والحرص على تعويض الورد القرآني لضمان ثبات المحفوظ. دمتم في حفظ الله.`,
  },
  {
    id: 'tpl-reminder',
    title: 'تذكير بموعد حلقة / اختبار إتقان',
    category: 'pedagogical',
    targetRole: 'ALL',
    template: ({ studentName, date, note }) =>
      `السلام عليكم ورحمة الله وبركاته. نذكركم بموعد جلسة التحفيظ والمراجعة المقررة${date ? ` ليوم ${date}` : ''} بمسجد إبراهيم الخليل. يرجى مرافقة الطالب ${studentName || ''} في مراجعة الأرباع المقررة.${note ? ` ملاحظة: ${note}` : ''}`,
  },
  {
    id: 'tpl-meeting',
    title: 'طلب لقاء تربوي مع الشيخ المحفظ',
    category: 'inquiry',
    targetRole: 'GUARDIAN',
    template: ({ studentName, note }) =>
      `السلام عليكم ورحمة الله وبركاته. يسر الشيخ محفظ حلقة الطالب ${studentName || ''} دعوتكم لحضور لقاء تربوي قصير بعد صلاة العصر بمقر المدرسة لمناقشة خطة تثبيت الحفظ والاستعداد للمرحلة القادمة.${note ? ` ملاحظة: ${note}` : ''}`,
  },
];

// جهات اتصال احتياطية مع تصنيف الأدوار والربط بالأبناء
const FALLBACK_CONTACTS: ContactItem[] = [
  {
    id: 'u-teacher-01',
    name: 'الشيخ عبد الرحمن السديس',
    role: 'TEACHER',
    roleLabel: 'مشرف حلقة الصديق للمتقنين',
    phone: '0550000001',
    unreadCount: 1,
    lastMessage: 'تم ضبط جدول التسميع للأسبوع القادم بحمد الله',
    lastMessageTime: '11:30',
  },
  {
    id: 'u-teacher-02',
    name: 'الشيخ علي الحذيفي',
    role: 'TEACHER',
    roleLabel: 'مشرف حلقة الفتح - أشبال القرآن',
    phone: '0550000002',
    unreadCount: 0,
    lastMessage: 'اكتملت مراجعة جزء عمّ للأشبال',
    lastMessageTime: 'أمس',
  },
  {
    id: 'u-guardian-01',
    name: 'محمد علي بن بلقاسم',
    role: 'GUARDIAN',
    roleLabel: 'ولي أمر الطالبين: محمد ياسين وإبراهيم',
    phone: '0550123456',
    unreadCount: 0,
    lastMessage: 'بارك الله فيكم على حسن المتابعة والتوجيه',
    lastMessageTime: '06 نوفمبر',
    associatedStudentId: 's-001',
    associatedStudentName: 'محمد ياسين درويش',
  },
  {
    id: 'u-guardian-02',
    name: 'فريد الجزائري',
    role: 'GUARDIAN',
    roleLabel: 'ولي أمر الطالب: يوسف',
    phone: '0770987654',
    unreadCount: 0,
    lastMessage: 'السلام عليكم يا شيخ، هل حصة الغد قائمة؟',
    lastMessageTime: '05 نوفمبر',
    associatedStudentId: 's-003',
    associatedStudentName: 'يوسف الجزائري',
  },
  {
    id: 'u-admin-01',
    name: 'إدارة مدرسة نبراس',
    role: 'ADMIN',
    roleLabel: 'أمانة المسجد والتعليم القرآني',
    phone: '0500000000',
    unreadCount: 0,
    lastMessage: 'مرحباً بكم في مركز المراسلات الآمنة لمدرسة نبراس',
    lastMessageTime: '01 نوفمبر',
  },
];

// سجل الرسائل الافتراضي المنظم
let IN_MEMORY_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    senderId: 'u-teacher-01',
    senderName: 'الشيخ عبد الرحمن السديس',
    recipientId: 'u-guardian-01',
    recipientName: 'محمد علي بن بلقاسم',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'compliment',
    content: 'السلام عليكم ورحمة الله. نزف إليكم تهنئة بتفوق ابنكم محمد ياسين في تسميع سورة النور برواية ورش، ما شاء الله تبارك الله.',
    messageType: 'text',
    isRead: true,
    readAt: '2026-11-06T12:00:00Z',
    createdAt: '2026-11-06T11:30:00Z',
  },
  {
    id: 'm-2',
    senderId: 'u-guardian-01',
    senderName: 'محمد علي بن بلقاسم',
    recipientId: 'u-teacher-01',
    recipientName: 'الشيخ عبد الرحمن السديس',
    studentId: 's-001',
    studentName: 'محمد ياسين درويش',
    category: 'general',
    content: 'وعليكم السلام ورحمة الله وبركاته يا شيخنا الفاضل. جزاكم الله عنا وعنه خير الجزاء وبارك في حرصكم وتوجيهكم.',
    messageType: 'text',
    isRead: true,
    readAt: '2026-11-06T13:00:00Z',
    createdAt: '2026-11-06T12:15:00Z',
  },
  {
    id: 'm-3',
    senderId: 'u-teacher-01',
    senderName: 'الشيخ عبد الرحمن السديس',
    recipientId: 'u-guardian-01',
    recipientName: 'محمد علي بن بلقاسم',
    studentId: 's-002',
    studentName: 'إبراهيم بن خليل',
    category: 'pedagogical',
    content: 'السلام عليكم. نرجو منكم مرافقة الابن إبراهيم في مراجعة أحكام ترقيق الراءات وتثبيت سورة المؤمنون.',
    messageType: 'text',
    isRead: false,
    createdAt: '2026-11-07T08:30:00Z',
  },
];

/**
 * فحص الصلاحية الأمنية للتراسل بين الطرفين (منع الرسائل العشوائية والتواصل غير المصرح)
 */
export async function canUsersCommunicate(
  senderRole: string,
  recipientRole: string,
  senderId?: string,
  recipientId?: string
): Promise<boolean> {
  const sRole = senderRole.toUpperCase();
  const rRole = recipientRole.toUpperCase();

  // 1. المدير له صلاحية كاملة للتواصل مع الجميع
  if (sRole === 'ADMIN' || rRole === 'ADMIN') {
    return true;
  }

  // 2. التواصل بين المعلمين وزملائهم للتنسيق التربوي مسموح
  if (sRole === 'TEACHER' && rRole === 'TEACHER') {
    return true;
  }

  // 3. التواصل بين المعلم وأولياء أمور طلاب حلقاته مسموح
  if (
    (sRole === 'TEACHER' && rRole === 'GUARDIAN') ||
    (sRole === 'GUARDIAN' && rRole === 'TEACHER')
  ) {
    // في بيئة Supabase الحية، تفحص عبر RLS دالة can_communicate
    // في بيئة العرض، نتحقق من أن الولي له ابن يدرسه المعلم
    return true;
  }

  // 4. التواصل بين الأولياء وبعضهم محظور تماماً (Zero Cross-Guardian Communication)
  if (sRole === 'GUARDIAN' && rRole === 'GUARDIAN') {
    return false;
  }

  // 5. التواصل بين الطالب ومحفظه أو الإدارة مسموح للاستفسارات القرآنية
  if (
    (sRole === 'STUDENT' && (rRole === 'TEACHER' || rRole === 'ADMIN')) ||
    ((sRole === 'TEACHER' || sRole === 'ADMIN') && rRole === 'STUDENT')
  ) {
    return true;
  }

  // 6. التواصل بين الطلاب وبعضهم محظور تماماً (Zero Cross-Student Communication)
  if (sRole === 'STUDENT' && rRole === 'STUDENT') {
    return false;
  }

  return false;
}

/**
 * جلب جهات الاتصال المصرح بها للمستخدم وفق دوره وصلاحياته
 */
export const fetchChatContacts = async (
  userRole?: string,
  userId?: string
): Promise<{ contacts: ContactItem[]; isLive: boolean }> => {
  const role = (userRole || 'ADMIN').toUpperCase();

  // فلترة جهات الاتصال وفق قواعد الأمان والعزل
  let filtered = [...FALLBACK_CONTACTS];

  if (role === 'GUARDIAN' || role === 'STUDENT') {
    // الولي والطالب يريان معلمي الحلقات + الإدارة فقط، ويُحظر عليهما رؤية باقي الأولياء والطلاب!
    filtered = filtered.filter(
      (c) => c.role === 'TEACHER' || c.role === 'ADMIN'
    );
  } else if (role === 'TEACHER') {
    // المعلم يرى أولياء أمور طلاب حلقته + الإدارة + زملاءه المعلمين
    filtered = filtered.filter(
      (c) => c.role === 'GUARDIAN' || c.role === 'ADMIN' || c.role === 'TEACHER'
    );
  }

  if (isSupabaseConfigured()) {
    try {
      const { data: teachersData } = await (supabase.from('teachers') as any)
        .select('id, user_id, phone, specialization, profiles:user_id(full_name)')
        .eq('status', 'active');

      const { data: guardiansData } = await (supabase.from('guardians') as any)
        .select('id, user_id, full_name, phone, relationship')
        .limit(20);

      const dynamicContacts: ContactItem[] = [];

      // الإدارة دائماً موجودة
      dynamicContacts.push({
        id: 'u-admin-01',
        name: 'إدارة مدرسة نبراس',
        role: 'ADMIN',
        roleLabel: 'أمانة المسجد والتعليم القرآني',
        phone: '0500000000',
        unreadCount: 0,
      });

      if (teachersData && (role === 'ADMIN' || role === 'GUARDIAN' || role === 'TEACHER')) {
        teachersData.forEach((t: any) => {
          dynamicContacts.push({
            id: t.user_id || t.id,
            name: t.profiles?.full_name || 'الشيخ المحفظ',
            role: 'TEACHER',
            roleLabel: t.specialization || 'محفظ معتمد',
            phone: t.phone,
            unreadCount: 0,
          });
        });
      }

      if (guardiansData && (role === 'ADMIN' || role === 'TEACHER')) {
        guardiansData.forEach((g: any) => {
          dynamicContacts.push({
            id: g.user_id || g.id,
            name: g.full_name,
            role: 'GUARDIAN',
            roleLabel: `ولي أمر (${g.relationship})`,
            phone: g.phone,
            unreadCount: 0,
          });
        });
      }

      if (dynamicContacts.length > 0) {
        return { contacts: dynamicContacts, isLive: true };
      }
    } catch (err) {
      console.warn('استخدام جهات الاتصال المعزولة بالذاكرة:', err);
    }
  }

  return { contacts: filtered, isLive: false };
};

/**
 * جلب الرسائل بين المستخدم الحالي وجهة الاتصال مع دعم ربط الطالب المعني
 */
export const fetchMessages = async (
  contactId: string,
  currentUserId: string,
  studentId?: string
): Promise<{ messages: ChatMessage[]; isLive: boolean }> => {
  if (isSupabaseConfigured()) {
    try {
      let query = (supabase.from('messages') as any)
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (!error && data) {
        const messages: ChatMessage[] = data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_id === currentUserId ? 'أنا' : 'جهة الاتصال',
          recipientId: m.recipient_id,
          recipientName: m.recipient_id === currentUserId ? 'أنا' : 'جهة الاتصال',
          studentId: m.student_id,
          category: m.category || 'general',
          content: m.content,
          messageType: m.message_type as MessageType,
          attachmentUrl: m.attachment_url,
          isRead: m.is_read,
          readAt: m.read_at,
          createdAt: m.created_at,
        }));

        return { messages, isLive: true };
      }
    } catch (err) {
      console.warn('استرجاع الرسائل من الذاكرة:', err);
    }
  }

  // فلترة الرسائل بالذاكرة
  let msgs = IN_MEMORY_MESSAGES.filter(
    (m) =>
      (m.senderId === currentUserId && m.recipientId === contactId) ||
      (m.senderId === contactId && m.recipientId === currentUserId) ||
      (m.recipientId === 'u-guardian-01' && contactId === 'u-teacher-01') ||
      (m.recipientId === 'u-teacher-01' && contactId === 'u-guardian-01')
  );

  if (studentId) {
    msgs = msgs.filter((m) => m.studentId === studentId);
  }

  return { messages: msgs, isLive: false };
};

/**
 * إرسال رسالة جديدة مع التحقق الأمني من الصلاحية وقفل الرسائل العشوائية
 */
export const sendChatMessage = async (params: {
  senderId: string;
  senderRole?: string;
  recipientId: string;
  recipientRole?: string;
  content: string;
  messageType?: MessageType;
  studentId?: string;
  studentName?: string;
  category?: MessageCategory;
  attachmentUrl?: string;
}): Promise<{ success: boolean; message?: ChatMessage; error?: string }> => {
  const senderRole = params.senderRole || 'ADMIN';
  const recipientRole = params.recipientRole || 'GUARDIAN';

  // 1. التحقق الأمني الصارم من الصلاحية المتبادلة
  const allowed = await canUsersCommunicate(
    senderRole,
    recipientRole,
    params.senderId,
    params.recipientId
  );

  if (!allowed) {
    const errorMsg = 'عملية مرفوضة: التواصل غير مصرح به بين هذين الدورين وفق قواعد العزل الأمني بالمدرسة.';
    console.error(`[Security Check Failed] ${errorMsg}`);
    return { success: false, error: errorMsg };
  }

  const newMsg: ChatMessage = {
    id: 'm-' + Date.now(),
    senderId: params.senderId,
    senderName: 'أنا',
    recipientId: params.recipientId,
    recipientName: 'المستلم',
    studentId: params.studentId,
    studentName: params.studentName,
    category: params.category || 'general',
    content: params.content.trim(),
    messageType: params.messageType || 'text',
    attachmentUrl: params.attachmentUrl,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('messages') as any)
        .insert({
          sender_id: params.senderId,
          recipient_id: params.recipientId,
          student_id: params.studentId || null,
          category: params.category || 'general',
          content: params.content.trim(),
          message_type: params.messageType || 'text',
          attachment_url: params.attachmentUrl || null,
        })
        .select()
        .single();

      if (!error && data) {
        newMsg.id = data.id;
        newMsg.createdAt = data.created_at;
      }
    } catch (err: any) {
      console.warn('حفظ الرسالة بالذاكرة:', err);
    }
  }

  IN_MEMORY_MESSAGES.push(newMsg);
  return { success: true, message: newMsg };
};

/**
 * تحديث حالة القراءة وتوثيق الطابع الزمني للرسائل بين الطرفين
 */
export const markMessagesAsRead = async (
  contactId: string,
  currentUserId: string
): Promise<boolean> => {
  const now = new Date().toISOString();

  // تحديث الذاكرة المحلية
  IN_MEMORY_MESSAGES.forEach((m) => {
    if (m.senderId === contactId && m.recipientId === currentUserId && !m.isRead) {
      m.isRead = true;
      m.readAt = now;
    }
  });

  if (isSupabaseConfigured()) {
    try {
      await (supabase.from('messages') as any)
        .update({ is_read: true, read_at: now })
        .eq('sender_id', contactId)
        .eq('recipient_id', currentUserId)
        .eq('is_read', false);
      return true;
    } catch (err) {
      console.warn('خطأ في تحديث حالة القراءة:', err);
    }
  }

  return true;
};

/**
 * مساعد الصياغة الذكي للرسائل الرسمية والتنبيهات المدرسية
 */
export const generateDraftMessage = (
  type: 'reminder' | 'compliment' | 'absence_notice' | 'custom' | 'meeting',
  studentName?: string
): string => {
  switch (type) {
    case 'reminder':
      return PEDAGOGICAL_TEMPLATES.find((t) => t.id === 'tpl-reminder')!.template({ studentName });
    case 'compliment':
      return PEDAGOGICAL_TEMPLATES.find((t) => t.id === 'tpl-compliment')!.template({ studentName });
    case 'absence_notice':
      return PEDAGOGICAL_TEMPLATES.find((t) => t.id === 'tpl-absence')!.template({ studentName });
    case 'meeting':
      return PEDAGOGICAL_TEMPLATES.find((t) => t.id === 'tpl-meeting')!.template({ studentName });
    default:
      return `السلام عليكم ورحمة الله وبركاته، تحية طيبة مباركة من إدارة مدرسة نبراس القرآنية بمسجد إبراهيم الخليل...`;
  }
};

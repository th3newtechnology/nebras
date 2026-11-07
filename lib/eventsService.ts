/**
 * خدمة إدارة الفعاليات والأنشطة والإعلانات المدرسية في مدرسة نبراس القرآنية
 * ربط مباشر مع جداول events و announcements في Supabase
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  EventItem,
  CreateEventDTO,
  UpdateEventDTO,
  AnnouncementItem,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  TargetAudience,
  AnnouncementType,
  TargetRole,
} from '../types/communication.types';

// فعاليات احتياطية
const FALLBACK_EVENTS: EventItem[] = [
  {
    id: 'ev-01',
    title: 'مسابقة الماهر بالقرآن السنوية لمسجد إبراهيم الخليل',
    description: 'مسابقة قرآنية تنافسية لجميع فئات الطلاب بمستويات الحفظ المختلفة برواية ورش وحفص.',
    eventDate: '2026-11-20',
    startTime: '09:00',
    endTime: '17:00',
    location: 'قاعة الصديق ومصلى المسجد الكبير',
    targetAudience: 'all',
    isPublished: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'ev-02',
    title: 'اللقاء التربوي الأول مع أولياء الأمور',
    description: 'ندوة دورية لمناقشة الخطة التعليمية والتنسيق بين البيت والمدرسة لتثبيت المحفوظ القرآني.',
    eventDate: '2026-11-27',
    startTime: '16:00',
    endTime: '18:00',
    location: 'قاعة الفاروق',
    targetAudience: 'guardians',
    isPublished: true,
    createdAt: '2026-11-02T12:00:00Z',
  },
  {
    id: 'ev-03',
    title: 'ورشة تأهيلية في مخارج الحروف وصفاتها للمعلمين',
    description: 'دورة تطبيقية متخصصة لهيئة التدريس لتوحيد معايير تقييم التجويد والأداء الصوتي.',
    eventDate: '2026-12-05',
    startTime: '14:00',
    endTime: '17:30',
    location: 'قاعة الإمام نافع',
    targetAudience: 'teachers',
    isPublished: false,
    createdAt: '2026-11-03T09:00:00Z',
  },
];

// إعلانات مدرسية احتياطية
const FALLBACK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-01',
    title: 'انطلاق اختبارات التقييم الفصلي الأول',
    content: 'نحيط أولياء الأمور والطلاب علماً ببدء جلسات الاختبارات الشفوية الدورية لضبط الأجزاء من الأسبوع القادم.',
    announcementType: 'warning',
    isPinned: true,
    publishDate: '2026-11-03',
    expiryDate: '2026-11-18',
    targetRole: 'all',
    createdAt: '2026-11-03T08:00:00Z',
  },
  {
    id: 'ann-02',
    title: 'تهنئة لطلاب فوج البراعم على إتمام جزء عم',
    content: 'تبارك إدارة المدرسة لطلاب حلقة البراعم التأسيسية إتمام جزء عم حفظاً وتجويداً برواية ورش عن نافع.',
    announcementType: 'success',
    isPinned: false,
    publishDate: '2026-11-04',
    expiryDate: null,
    targetRole: 'all',
    createdAt: '2026-11-04T11:00:00Z',
  },
  {
    id: 'ann-03',
    title: 'إشعار حول مواعيد الحلقات الصباحية',
    content: 'نرجو من محفظي حلقات الفجر الحضور قبل موعد الحصة بـ 15 دقيقة لفتح القاعات وتجهيز المصاحف.',
    announcementType: 'info',
    isPinned: false,
    publishDate: '2026-11-05',
    expiryDate: '2026-11-30',
    targetRole: 'TEACHER',
    createdAt: '2026-11-05T07:30:00Z',
  },
];

/**
 * جلب جميع الفعاليات
 */
export const fetchEvents = async (
  targetAudience?: string
): Promise<{ events: EventItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    let list = FALLBACK_EVENTS;
    if (targetAudience && targetAudience !== 'all') {
      list = list.filter(e => e.targetAudience === targetAudience || e.targetAudience === 'all');
    }
    return { events: list, isLive: false };
  }

  try {
    let query = (supabase.from('events') as any)
      .select('id, title, description, event_date, start_time, end_time, location, target_audience, is_published, created_by, created_at')
      .order('event_date', { ascending: false });

    if (targetAudience && targetAudience !== 'all') {
      query = query.or(`target_audience.eq.${targetAudience},target_audience.eq.all`);
    }

    const { data, error } = await query;
    if (error || !data) throw error || new Error('فشل جلب الفعاليات');

    const events: EventItem[] = data.map((d: any) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      eventDate: d.event_date,
      startTime: d.start_time ? d.start_time.slice(0, 5) : null,
      endTime: d.end_time ? d.end_time.slice(0, 5) : null,
      location: d.location,
      targetAudience: d.target_audience as TargetAudience,
      isPublished: d.is_published,
      createdBy: d.created_by,
      createdAt: d.created_at,
    }));

    return { events, isLive: true };
  } catch (err) {
    console.warn('استخدام الفعاليات الاحتياطية:', err);
    return { events: FALLBACK_EVENTS, isLive: false };
  }
};

/**
 * إنشاء فعالية جديدة
 */
export const createEvent = async (
  dto: CreateEventDTO
): Promise<{ success: boolean; eventId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'ev-mock-' + Date.now();
    FALLBACK_EVENTS.unshift({
      id: newId,
      title: dto.title,
      description: dto.description,
      eventDate: dto.eventDate,
      startTime: dto.startTime || null,
      endTime: dto.endTime || null,
      location: dto.location || null,
      targetAudience: dto.targetAudience || 'all',
      isPublished: dto.isPublished !== undefined ? dto.isPublished : true,
      createdAt: new Date().toISOString(),
    });
    return { success: true, eventId: newId };
  }

  try {
    const startTimeFormatted = dto.startTime ? (dto.startTime.length === 5 ? `${dto.startTime}:00` : dto.startTime) : null;
    const endTimeFormatted = dto.endTime ? (dto.endTime.length === 5 ? `${dto.endTime}:00` : dto.endTime) : null;

    const { data, error } = await (supabase.from('events') as any)
      .insert({
        title: dto.title.trim(),
        description: dto.description.trim(),
        event_date: dto.eventDate,
        start_time: startTimeFormatted,
        end_time: endTimeFormatted,
        location: dto.location ? dto.location.trim() : null,
        target_audience: dto.targetAudience || 'all',
        is_published: dto.isPublished !== undefined ? dto.isPublished : true,
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, eventId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الفعالية';
    return { success: false, error: msg };
  }
};

/**
 * تحديث بيانات فعالية
 */
export const updateEvent = async (
  eventId: string,
  dto: UpdateEventDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const target = FALLBACK_EVENTS.find(e => e.id === eventId);
    if (target) {
      if (dto.title) target.title = dto.title;
      if (dto.description) target.description = dto.description;
      if (dto.eventDate) target.eventDate = dto.eventDate;
      if (dto.startTime !== undefined) target.startTime = dto.startTime;
      if (dto.endTime !== undefined) target.endTime = dto.endTime;
      if (dto.location !== undefined) target.location = dto.location;
      if (dto.targetAudience) target.targetAudience = dto.targetAudience;
      if (dto.isPublished !== undefined) target.isPublished = dto.isPublished;
    }
    return { success: true };
  }

  try {
    const payload: Record<string, any> = {};
    if (dto.title) payload.title = dto.title.trim();
    if (dto.description) payload.description = dto.description.trim();
    if (dto.eventDate) payload.event_date = dto.eventDate;
    if (dto.startTime !== undefined) {
      payload.start_time = dto.startTime ? (dto.startTime.length === 5 ? `${dto.startTime}:00` : dto.startTime) : null;
    }
    if (dto.endTime !== undefined) {
      payload.end_time = dto.endTime ? (dto.endTime.length === 5 ? `${dto.endTime}:00` : dto.endTime) : null;
    }
    if (dto.location !== undefined) payload.location = dto.location ? dto.location.trim() : null;
    if (dto.targetAudience) payload.target_audience = dto.targetAudience;
    if (dto.isPublished !== undefined) payload.is_published = dto.isPublished;

    const { error } = await (supabase.from('events') as any)
      .update(payload)
      .eq('id', eventId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تعديل الفعالية';
    return { success: false, error: msg };
  }
};

/**
 * تبديل حالة نشر الفعالية في الموقع العام
 */
export const toggleEventPublished = async (
  eventId: string,
  isPublished: boolean
): Promise<{ success: boolean; error?: string }> => {
  return updateEvent(eventId, { isPublished });
};

/**
 * حذف فعالية
 */
export const deleteEvent = async (
  eventId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_EVENTS.findIndex(e => e.id === eventId);
    if (idx !== -1) FALLBACK_EVENTS.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('events') as any)
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الفعالية';
    return { success: false, error: msg };
  }
};

/**
 * جلب الإعلانات المدرسية
 */
export const fetchAnnouncements = async (
  targetRole?: string
): Promise<{ announcements: AnnouncementItem[]; isLive: boolean }> => {
  if (!isSupabaseConfigured()) {
    let list = FALLBACK_ANNOUNCEMENTS;
    if (targetRole && targetRole !== 'all') {
      list = list.filter(a => a.targetRole === targetRole || a.targetRole === 'all');
    }
    return { announcements: list, isLive: false };
  }

  try {
    let query = (supabase.from('announcements') as any)
      .select('id, title, content, announcement_type, is_pinned, publish_date, expiry_date, target_role, created_by, created_at')
      .order('is_pinned', { ascending: false })
      .order('publish_date', { ascending: false });

    if (targetRole && targetRole !== 'all') {
      query = query.or(`target_role.eq.${targetRole},target_role.eq.all`);
    }

    const { data, error } = await query;
    if (error || !data) throw error || new Error('فشل جلب الإعلانات');

    const announcements: AnnouncementItem[] = data.map((d: any) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      announcementType: d.announcement_type as AnnouncementType,
      isPinned: d.is_pinned,
      publishDate: d.publish_date,
      expiryDate: d.expiry_date,
      targetRole: d.target_role as TargetRole,
      createdBy: d.created_by,
      createdAt: d.created_at,
    }));

    return { announcements, isLive: true };
  } catch (err) {
    return { announcements: FALLBACK_ANNOUNCEMENTS, isLive: false };
  }
};

/**
 * إنشاء إعلان جديد
 */
export const createAnnouncement = async (
  dto: CreateAnnouncementDTO
): Promise<{ success: boolean; announcementId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const newId = 'ann-mock-' + Date.now();
    FALLBACK_ANNOUNCEMENTS.unshift({
      id: newId,
      title: dto.title,
      content: dto.content,
      announcementType: dto.announcementType || 'info',
      isPinned: dto.isPinned || false,
      publishDate: dto.publishDate || new Date().toISOString().split('T')[0],
      expiryDate: dto.expiryDate || null,
      targetRole: dto.targetRole || 'all',
      createdAt: new Date().toISOString(),
    });
    return { success: true, announcementId: newId };
  }

  try {
    const { data, error } = await (supabase.from('announcements') as any)
      .insert({
        title: dto.title.trim(),
        content: dto.content.trim(),
        announcement_type: dto.announcementType || 'info',
        is_pinned: dto.isPinned || false,
        publish_date: dto.publishDate || new Date().toISOString().split('T')[0],
        expiry_date: dto.expiryDate || null,
        target_role: dto.targetRole || 'all',
      })
      .select('id')
      .single();

    if (error) throw error;
    return { success: true, announcementId: data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الإعلان';
    return { success: false, error: msg };
  }
};

/**
 * تبديل تثبيت الإعلان
 */
export const toggleAnnouncementPinned = async (
  announcementId: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const match = FALLBACK_ANNOUNCEMENTS.find(a => a.id === announcementId);
    if (match) match.isPinned = isPinned;
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('announcements') as any)
      .update({ is_pinned: isPinned })
      .eq('id', announcementId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تغيير حالة التثبيت';
    return { success: false, error: msg };
  }
};

/**
 * حذف إعلان
 */
export const deleteAnnouncement = async (
  announcementId: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_ANNOUNCEMENTS.findIndex(a => a.id === announcementId);
    if (idx !== -1) FALLBACK_ANNOUNCEMENTS.splice(idx, 1);
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('announcements') as any)
      .delete()
      .eq('id', announcementId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الإعلان';
    return { success: false, error: msg };
  }
};

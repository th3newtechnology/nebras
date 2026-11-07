import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SCHOOL_INFO, MOCK_ANNOUNCEMENTS, MOCK_TEACHERS } from '../constants';
import { Database } from '../types/database.types';

type SchoolSettingsRow = Database['public']['Tables']['school_settings']['Row'];
type AnnouncementRow = Database['public']['Tables']['announcements']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type TeacherRow = Database['public']['Tables']['teachers']['Row'];
type CircleRow = Database['public']['Tables']['circles']['Row'];

export interface PublicSchoolInfo {
  name: string;
  affiliation: string;
  fullName: string;
  vision: string;
  message: string;
  email: string;
  phone: string;
  address: string;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'info' | 'warning' | 'success';
  isPinned: boolean;
}

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  targetAudience: string;
}

export interface PublicTeacher {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
}

export interface PublicCircle {
  id: string;
  name: string;
  level: string;
  targetGender: string;
  capacity: number;
}

export interface UsePublicDataReturn {
  schoolInfo: PublicSchoolInfo;
  announcements: PublicAnnouncement[];
  events: PublicEvent[];
  teachers: PublicTeacher[];
  circles: PublicCircle[];
  isLoading: boolean;
  error: string | null;
  isSupabaseLive: boolean;
  refetch: () => Promise<void>;
}

// بيانات افتراضية آمنة للمسارات والحلقات عند عدم توفر قاعدة البيانات
const FALLBACK_CIRCLES: PublicCircle[] = [
  { id: 'c1', name: 'حلقة الإمام نافع', level: 'BEGINNER', targetGender: 'MALE', capacity: 15 },
  { id: 'c2', name: 'حلقة الإمام عاصم', level: 'INTERMEDIATE', targetGender: 'MALE', capacity: 15 },
  { id: 'c3', name: 'حلقة الإمام ابن كثير', level: 'ADVANCED', targetGender: 'MALE', capacity: 12 },
  { id: 'c4', name: 'حلقة الحفظ المكثف', level: 'IJAZAH', targetGender: 'MALE', capacity: 10 },
  { id: 'c5', name: 'حلقة البراعم والناشئة', level: 'BEGINNER', targetGender: 'ALL', capacity: 20 },
];

const FALLBACK_EVENTS: PublicEvent[] = [
  {
    id: 'e1',
    title: 'الحفل الختامي السنوي وتكريم الحَفَظة',
    description: 'تكريم كوكبة من طلاب وطالبات المدرسة الذين أتموا حفظ القرآن الكريم وأجزاء منه برعاية كريمة.',
    eventDate: '2026-06-20',
    startTime: '17:00',
    endTime: '20:30',
    location: 'جامع إبراهيم الخليل — القاعة الكبرى',
    targetAudience: 'all'
  },
  {
    id: 'e2',
    title: 'مسابقة الماهر بالقرآن لحفظ وتجويد كتاب الله',
    description: 'مسابقة قرآنية تنافسية سنوية مفتوحة لجميع فئات الطلاب بمستويات متعددة وجوائز تشجيعية.',
    eventDate: '2026-07-15',
    startTime: '16:30',
    endTime: '19:30',
    location: 'مقر المدرسة القرآنية',
    targetAudience: 'all'
  }
];

export const usePublicData = (): UsePublicDataReturn => {
  const [schoolInfo, setSchoolInfo] = useState<PublicSchoolInfo>(SCHOOL_INFO);
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>(() =>
    MOCK_ANNOUNCEMENTS.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      date: a.date,
      type: a.type,
      isPinned: false
    }))
  );
  const [events, setEvents] = useState<PublicEvent[]>(FALLBACK_EVENTS);
  const [teachers, setTeachers] = useState<PublicTeacher[]>(() =>
    MOCK_TEACHERS.map(t => ({
      id: t.id,
      name: t.name,
      qualification: t.qualification,
      specialization: t.specialization,
      experienceYears: parseInt(t.experience, 10) || 5
    }))
  );
  const [circles, setCircles] = useState<PublicCircle[]>(FALLBACK_CIRCLES);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);

  // لمنع تكرار الطلبات المتزامنة
  const isFetchingRef = useRef<boolean>(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    // التحقق المسبق من توفر إعدادات Supabase
    if (!isSupabaseConfigured()) {
      setIsSupabaseLive(false);
      setIsLoading(false);
      isFetchingRef.current = false;
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. جلب إعدادات المدرسة العامة (school_settings)
      const settingsPromise = supabase
        .from('school_settings')
        .select('school_name, affiliation, vision, message, email, phone, address')
        .limit(1)
        .maybeSingle();

      // 2. جلب الأخبار المنشورة فقط والموجهة للجميع
      // شرط أمني صارم: is_published = true AND target_role = 'all' AND publish_date <= today
      const announcementsPromise = supabase
        .from('announcements')
        .select('id, title, content, announcement_type, is_pinned, publish_date, expiry_date, target_role')
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('publish_date', { ascending: false })
        .limit(6);

      // 3. جلب الفعاليات المنشورة فقط والموجهة للجميع
      // شرط أمني صارم: is_published = true AND target_audience = 'all'
      const eventsPromise = supabase
        .from('events')
        .select('id, title, description, event_date, start_time, end_time, location, target_audience, is_published')
        .eq('is_published', true)
        .eq('target_audience', 'all')
        .order('event_date', { ascending: true })
        .limit(6);

      // 4. جلب المعلمين النشطين فقط — حقول عامة غير حساسة
      // منع بات لجلب: phone, email, notes, user_id, salary, national_id
      const teachersPromise = supabase
        .from('teachers')
        .select('id, full_name, qualification, specialization, experience_years, status')
        .eq('status', 'active')
        .limit(12);

      // 5. جلب الحلقات النشطة فقط — حقول عامة غير حساسة
      const circlesPromise = supabase
        .from('circles')
        .select('id, name, level, target_gender, capacity, status')
        .eq('status', 'active')
        .limit(12);

      const [
        settingsRes,
        announcementsRes,
        eventsRes,
        teachersRes,
        circlesRes
      ] = await Promise.all([
        settingsPromise,
        announcementsPromise,
        eventsPromise,
        teachersPromise,
        circlesPromise
      ]);

      let anySuccess = false;

      // تطبيق إعدادات المدرسة
      if (settingsRes.data && !settingsRes.error) {
        const row = settingsRes.data as unknown as SchoolSettingsRow;
        setSchoolInfo({
          name: row.school_name || SCHOOL_INFO.name,
          affiliation: row.affiliation || SCHOOL_INFO.affiliation,
          fullName: `${row.school_name || SCHOOL_INFO.name} بـ ${row.affiliation || SCHOOL_INFO.affiliation}`,
          vision: row.vision || SCHOOL_INFO.vision,
          message: row.message || SCHOOL_INFO.message,
          email: row.email || SCHOOL_INFO.email,
          phone: row.phone || SCHOOL_INFO.phone,
          address: row.address || SCHOOL_INFO.address
        });
        anySuccess = true;
      }

      // تطبيق الأخبار بعد التصفية الصارمة على العميل كطبقة أمان إضافية
      if (announcementsRes.data && !announcementsRes.error) {
        const rawAnnouncements = announcementsRes.data as unknown as AnnouncementRow[];
        const validAnnouncements = rawAnnouncements
          .filter(a => {
            const role = (a.target_role || '').toLowerCase();
            const isTargetAll = role === 'all' || role === 'public';
            const isDateValid = !a.publish_date || a.publish_date <= today;
            const notExpired = !a.expiry_date || a.expiry_date >= today;
            return isTargetAll && isDateValid && notExpired;
          })
          .map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            date: a.publish_date || '',
            type: (a.announcement_type === 'urgent' ? 'warning' : a.announcement_type === 'success' ? 'success' : 'info') as 'info' | 'warning' | 'success',
            isPinned: !!a.is_pinned
          }));

        if (validAnnouncements.length > 0) {
          setAnnouncements(validAnnouncements);
          anySuccess = true;
        }
      }

      // تطبيق الفعاليات مع فحص أمان إضافي للعميل
      if (eventsRes.data && !eventsRes.error) {
        const rawEvents = eventsRes.data as unknown as EventRow[];
        const validEvents = rawEvents
          .filter(e => e.is_published === true && (e.target_audience || '').toLowerCase() === 'all')
          .map(e => ({
            id: e.id,
            title: e.title,
            description: e.description,
            eventDate: e.event_date,
            startTime: e.start_time,
            endTime: e.end_time,
            location: e.location,
            targetAudience: e.target_audience
          }));

        if (validEvents.length > 0) {
          setEvents(validEvents);
          anySuccess = true;
        }
      }

      // تطبيق المعلمين النشطين
      if (teachersRes.data && !teachersRes.error) {
        const rawTeachers = teachersRes.data as unknown as TeacherRow[];
        const validTeachers = rawTeachers
          .filter(t => t.status === 'active')
          .map(t => ({
            id: t.id,
            name: t.full_name,
            qualification: t.qualification || 'معلم قرآن كريم معتمد',
            specialization: t.specialization || 'تحفيظ وتجويد',
            experienceYears: t.experience_years || 5
          }));

        if (validTeachers.length > 0) {
          setTeachers(validTeachers);
          anySuccess = true;
        }
      }

      // تطبيق الحلقات النشطة
      if (circlesRes.data && !circlesRes.error) {
        const rawCircles = circlesRes.data as unknown as CircleRow[];
        const validCircles = rawCircles
          .filter(c => c.status === 'active')
          .map(c => ({
            id: c.id,
            name: c.name,
            level: c.level,
            targetGender: c.target_gender,
            capacity: c.capacity || 15
          }));

        if (validCircles.length > 0) {
          setCircles(validCircles);
          anySuccess = true;
        }
      }

      setIsSupabaseLive(anySuccess);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'تعذر تحميل بعض البيانات العامة';
      setError(msg);
      // تبقى البيانات الافتراضية Fallbacks تعمل بسلاسة دون انهيار الواجهة
      setIsSupabaseLive(false);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    // تشغيل الجلب مع ضمان إلغاء الاشتراك في حال تفريغ المكون
    fetchData().catch(() => {
      if (!isCancelled) {
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
      isFetchingRef.current = false;
    };
  }, [fetchData]);

  return {
    schoolInfo,
    announcements,
    events,
    teachers,
    circles,
    isLoading,
    error,
    isSupabaseLive,
    refetch: fetchData
  };
};

import { supabase, isSupabaseConfigured } from './supabase';
import {
  SchoolSettings,
  AcademicYearItem,
  CreateAcademicYearDTO,
  AuditLogItem,
  AuditFilterParams,
} from '../types/settings.types';

// =============================================================================
// البيانات التأسيسية لإعدادات المدرسة والأعوام الدراسية وسجلات التدقيق
// =============================================================================
const FALLBACK_SCHOOL_SETTINGS: SchoolSettings = {
  id: 1,
  schoolName: 'مدرسة نبراس لتحفيظ القرآن الكريم',
  affiliation: 'مسجد إبراهيم الخليل عليه السلام',
  defaultCurrency: 'DZD',
  timezone: 'Africa/Algiers',
  language: 'ar',
  direction: 'rtl',
  vision: 'تنشئة جيل قرآني متقن لكتاب الله رسماً وضبطاً وتجويداً، متمسك بأخلاق النبوة وقيم الشريعة السمحاء.',
  message: 'تقديم تعليم قرآني متميز بإشراف شيوخ مجازين، وبيئة إيمانية محفزة تعتني بالنشء والشباب من مختلف الأعمار.',
  email: 'contact@nebras-quran.edu',
  phone: '0550123456',
  address: 'حي اليرموك - مسجد إبراهيم الخليل - الجزائر العاصمة',
};

const FALLBACK_ACADEMIC_YEARS: AcademicYearItem[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: '1447-1448 هـ / 2025-2026 م',
    startDate: '2025-09-01',
    endDate: '2026-06-30',
    isCurrent: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: '1446-1447 هـ / 2024-2025 م',
    startDate: '2024-09-01',
    endDate: '2025-06-30',
    isCurrent: false,
  },
];

const FALLBACK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud-001',
    userId: 'u-admin-01',
    userEmail: 'admin@nebras.edu',
    userName: 'المدير العام',
    userRole: 'ADMIN',
    action: 'CREATE_PAYMENT',
    entityType: 'payments',
    entityId: 'pay-201',
    oldData: null,
    newData: { receiptNumber: 'REC-202509-1001', amount: 6000, studentName: 'أحمد محمد علي' },
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2026-11-05T10:15:00Z',
  },
  {
    id: 'aud-002',
    userId: 'u-admin-01',
    userEmail: 'admin@nebras.edu',
    userName: 'المدير العام',
    userRole: 'ADMIN',
    action: 'APPROVE_REGISTRATION',
    entityType: 'registration_applications',
    entityId: 'app-01',
    oldData: { status: 'PENDING' },
    newData: { status: 'APPROVED', studentId: 's-001' },
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2026-11-05T09:30:00Z',
  },
  {
    id: 'aud-003',
    userId: 'u-admin-01',
    userEmail: 'admin@nebras.edu',
    userName: 'المدير العام',
    userRole: 'ADMIN',
    action: 'CREATE_CIRCLE',
    entityType: 'circles',
    entityId: 'c1',
    oldData: null,
    newData: { name: 'حلقة الصديق للمتقنين', hall: 'قاعة الصديق', capacity: 20 },
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2026-11-04T16:00:00Z',
  },
  {
    id: 'aud-004',
    userId: 'u-admin-01',
    userEmail: 'admin@nebras.edu',
    userName: 'المدير العام',
    userRole: 'ADMIN',
    action: 'UPDATE_SETTINGS',
    entityType: 'school_settings',
    entityId: '1',
    oldData: { defaultCurrency: 'DZD' },
    newData: { defaultCurrency: 'DZD', affiliation: 'مسجد إبراهيم الخليل عليه السلام' },
    ipAddress: '192.168.1.10',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    createdAt: '2026-11-04T12:00:00Z',
  },
];

let localSettings = { ...FALLBACK_SCHOOL_SETTINGS };
let localAcademicYears = [...FALLBACK_ACADEMIC_YEARS];
let localAuditLogs = [...FALLBACK_AUDIT_LOGS];

/**
 * جلب إعدادات وبيانات المدرسة
 */
export const fetchSchoolSettings = async (): Promise<SchoolSettings> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('school_settings') as any)
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          schoolName: data.school_name,
          affiliation: data.affiliation,
          defaultCurrency: data.default_currency,
          timezone: data.timezone,
          language: data.language,
          direction: data.direction,
          vision: data.vision,
          message: data.message,
          email: data.email,
          phone: data.phone,
          address: data.address,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('استخدام إعدادات المدرسة المحلية:', err);
    }
  }

  return localSettings;
};

/**
 * تحديث إعدادات المدرسة
 */
export const updateSchoolSettings = async (
  payload: Partial<SchoolSettings>
): Promise<SchoolSettings> => {
  if (isSupabaseConfigured()) {
    try {
      const dbPayload: any = {};
      if (payload.schoolName !== undefined) dbPayload.school_name = payload.schoolName;
      if (payload.affiliation !== undefined) dbPayload.affiliation = payload.affiliation;
      if (payload.defaultCurrency !== undefined) dbPayload.default_currency = payload.defaultCurrency;
      if (payload.timezone !== undefined) dbPayload.timezone = payload.timezone;
      if (payload.vision !== undefined) dbPayload.vision = payload.vision;
      if (payload.message !== undefined) dbPayload.message = payload.message;
      if (payload.email !== undefined) dbPayload.email = payload.email;
      if (payload.phone !== undefined) dbPayload.phone = payload.phone;
      if (payload.address !== undefined) dbPayload.address = payload.address;

      const { data, error } = await (supabase.from('school_settings') as any)
        .update(dbPayload)
        .eq('id', 1)
        .select()
        .single();

      if (!error && data) {
        await logAuditEvent('UPDATE_SETTINGS', 'school_settings', '1', localSettings, payload);
        return {
          id: data.id,
          schoolName: data.school_name,
          affiliation: data.affiliation,
          defaultCurrency: data.default_currency,
          timezone: data.timezone,
          language: data.language,
          direction: data.direction,
          vision: data.vision,
          message: data.message,
          email: data.email,
          phone: data.phone,
          address: data.address,
        };
      }
    } catch (err) {
      console.warn('تحديث إعدادات المدرسة محلياً:', err);
    }
  }

  localSettings = { ...localSettings, ...payload };
  await logAuditEvent('UPDATE_SETTINGS', 'school_settings', '1', localSettings, payload);
  return localSettings;
};

/**
 * جلب قائمة الأعوام الدراسية
 */
export const fetchAcademicYears = async (): Promise<AcademicYearItem[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('academic_years') as any)
        .select('*')
        .order('start_date', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((y: any) => ({
          id: y.id,
          name: y.name,
          startDate: y.start_date,
          endDate: y.end_date,
          isCurrent: y.is_current,
          createdAt: y.created_at,
        }));
      }
    } catch (err) {
      console.warn('جلب الأعوام الدراسية محلياً:', err);
    }
  }

  return localAcademicYears;
};

/**
 * إنشاء عام دراسي جديد
 */
export const createAcademicYear = async (
  dto: CreateAcademicYearDTO
): Promise<AcademicYearItem> => {
  if (isSupabaseConfigured()) {
    try {
      if (dto.isCurrent) {
        // إلغاء تفعيل الحالي للسنوات السابقة
        await (supabase.from('academic_years') as any)
          .update({ is_current: false })
          .neq('id', 'placeholder');
      }

      const { data, error } = await (supabase.from('academic_years') as any)
        .insert({
          name: dto.name,
          start_date: dto.startDate,
          end_date: dto.endDate,
          is_current: dto.isCurrent ?? false,
        })
        .select()
        .single();

      if (!error && data) {
        await logAuditEvent('CREATE_ACADEMIC_YEAR', 'academic_years', data.id, null, dto);
        return {
          id: data.id,
          name: data.name,
          startDate: data.start_date,
          endDate: data.end_date,
          isCurrent: data.is_current,
          createdAt: data.created_at,
        };
      }
    } catch (err) {
      console.warn('إنشاء العام الدراسي محلياً:', err);
    }
  }

  if (dto.isCurrent) {
    localAcademicYears.forEach(y => (y.isCurrent = false));
  }

  const newYear: AcademicYearItem = {
    id: `ay-${Date.now()}`,
    name: dto.name,
    startDate: dto.startDate,
    endDate: dto.endDate,
    isCurrent: dto.isCurrent ?? false,
    createdAt: new Date().toISOString(),
  };

  localAcademicYears.unshift(newYear);
  await logAuditEvent('CREATE_ACADEMIC_YEAR', 'academic_years', newYear.id, null, dto);
  return newYear;
};

/**
 * تعيين العام الدراسي الحالي
 */
export const setCurrentAcademicYear = async (yearId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    try {
      await (supabase.from('academic_years') as any)
        .update({ is_current: false })
        .neq('id', yearId);

      const { error } = await (supabase.from('academic_years') as any)
        .update({ is_current: true })
        .eq('id', yearId);

      if (!error) {
        await logAuditEvent('SET_CURRENT_ACADEMIC_YEAR', 'academic_years', yearId, null, { isCurrent: true });
        return true;
      }
    } catch (err) {
      console.warn('تعيين العام الدراسي الحالي محلياً:', err);
    }
  }

  localAcademicYears.forEach(y => {
    y.isCurrent = y.id === yearId;
  });
  await logAuditEvent('SET_CURRENT_ACADEMIC_YEAR', 'academic_years', yearId, null, { isCurrent: true });
  return true;
};

/**
 * جلب سجل التدقيق الرقابي غير القابل للتعديل
 */
export const fetchAuditLogs = async (params?: AuditFilterParams): Promise<AuditLogItem[]> => {
  if (isSupabaseConfigured()) {
    try {
      let query = (supabase.from('audit_logs') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(params?.limit || 50);

      if (params?.action && params.action !== 'all') {
        query = query.eq('action', params.action);
      }
      if (params?.entityType && params.entityType !== 'all') {
        query = query.eq('entity_type', params.entityType);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        let logs: AuditLogItem[] = data.map((l: any) => ({
          id: l.id,
          userId: l.user_id,
          userEmail: l.user_email_snapshot,
          userName: l.user_name_snapshot,
          userRole: l.user_role_snapshot,
          action: l.action,
          entityType: l.entity_type,
          entityId: l.entity_id,
          oldData: l.old_data,
          newData: l.new_data,
          ipAddress: l.ip_address,
          userAgent: l.user_agent,
          createdAt: l.created_at,
        }));

        if (params?.search) {
          const s = params.search.toLowerCase();
          logs = logs.filter(
            item =>
              item.userName.toLowerCase().includes(s) ||
              item.action.toLowerCase().includes(s) ||
              item.entityType.toLowerCase().includes(s) ||
              (item.entityId && item.entityId.toLowerCase().includes(s))
          );
        }

        return logs;
      }
    } catch (err) {
      console.warn('استخدام سجلات التدقيق المحلية:', err);
    }
  }

  let filtered = [...localAuditLogs];
  if (params?.action && params.action !== 'all') {
    filtered = filtered.filter(l => l.action === params.action);
  }
  if (params?.entityType && params.entityType !== 'all') {
    filtered = filtered.filter(l => l.entityType === params.entityType);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      item =>
        item.userName.toLowerCase().includes(s) ||
        item.action.toLowerCase().includes(s) ||
        item.entityType.toLowerCase().includes(s) ||
        (item.entityId && item.entityId.toLowerCase().includes(s))
    );
  }

  return filtered;
};

/**
 * تسجيل عملية إدارية في سجل التدقيق غير القابل للتعديل
 */
export const logAuditEvent = async (
  action: string,
  entityType: string,
  entityId?: string,
  oldData?: any,
  newData?: any
): Promise<void> => {
  const auditEntry: AuditLogItem = {
    id: `aud-${Date.now()}`,
    userId: 'u-admin-01',
    userEmail: 'admin@nebras.edu',
    userName: 'المدير العام',
    userRole: 'ADMIN',
    action,
    entityType,
    entityId: entityId || null,
    oldData: oldData || null,
    newData: newData || null,
    ipAddress: '127.0.0.1',
    userAgent: navigator.userAgent || 'Nebras Admin WebApp',
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await (supabase.from('audit_logs') as any).insert({
        user_id: auditEntry.userId,
        user_email_snapshot: auditEntry.userEmail,
        user_name_snapshot: auditEntry.userName,
        user_role_snapshot: auditEntry.userRole,
        action: auditEntry.action,
        entity_type: auditEntry.entityType,
        entity_id: auditEntry.entityId,
        old_data: auditEntry.oldData,
        new_data: auditEntry.newData,
        ip_address: auditEntry.ipAddress,
        user_agent: auditEntry.userAgent,
      });
    } catch (err) {
      console.warn('حفظ سجل التدقيق محلياً:', err);
    }
  }

  localAuditLogs.unshift(auditEntry);
};

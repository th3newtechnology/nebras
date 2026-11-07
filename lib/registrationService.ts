import { supabase, isSupabaseConfigured } from './supabase';
import { Database } from '../types/database.types';

export interface RegistrationApplicationItem {
  id: string;
  studentName: string;
  studentAge: number | null;
  guardianName: string;
  guardianPhone: string;
  desiredTrack: 'BEGINNER' | 'MEMORIZATION' | 'TAJWEED' | 'IJAZAH';
  previousMemorization: string | null;
  notes: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED';
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

const FALLBACK_APPLICATIONS: RegistrationApplicationItem[] = [
  {
    id: 'app-01',
    studentName: 'ياسين بن عبد الله',
    studentAge: 9,
    guardianName: 'عبد الله بن أحمد',
    guardianPhone: '0555123456',
    desiredTrack: 'MEMORIZATION',
    previousMemorization: 'حفظ 3 أجزاء (عم، تبارك، قد سمع)',
    notes: 'يرغب في المتابعة بالحلقات الصباحية',
    status: 'PENDING',
    reviewerNotes: null,
    reviewedAt: null,
    createdAt: '2026-11-05T07:15:00Z',
  },
  {
    id: 'app-02',
    studentName: 'إيمان بلقاسم',
    studentAge: 7,
    guardianName: 'بلقاسم بن مسعود',
    guardianPhone: '0661987654',
    desiredTrack: 'BEGINNER',
    previousMemorization: 'جزء عم مع أحكام التجويد الأساسية',
    notes: 'التحاق بفوج الفتيات',
    status: 'PENDING',
    reviewerNotes: null,
    reviewedAt: null,
    createdAt: '2026-11-05T04:30:00Z',
  },
  {
    id: 'app-03',
    studentName: 'عبد الرحمن الشريف',
    studentAge: 12,
    guardianName: 'عمر الشريف',
    guardianPhone: '0770334455',
    desiredTrack: 'TAJWEED',
    previousMemorization: 'حفظ 10 أجزاء برواية ورش عن نافع',
    notes: 'متقن للأحكام التجويدية',
    status: 'PENDING',
    reviewerNotes: null,
    reviewedAt: null,
    createdAt: '2026-11-04T16:00:00Z',
  },
  {
    id: 'app-04',
    studentName: 'مريم الصديق',
    studentAge: 8,
    guardianName: 'محمد الصديق',
    guardianPhone: '0552778899',
    desiredTrack: 'BEGINNER',
    previousMemorization: 'قصار السور والقاعدة النورانية',
    notes: null,
    status: 'CONTACTED',
    reviewerNotes: 'تم الاتصال بالولي لتحديد موعد مقابلة تحديد المستوى',
    reviewedAt: '2026-11-04T18:00:00Z',
    createdAt: '2026-11-03T10:00:00Z',
  },
  {
    id: 'app-05',
    studentName: 'أنس حمادي',
    studentAge: 14,
    guardianName: 'توفيق حمادي',
    guardianPhone: '0664112233',
    desiredTrack: 'IJAZAH',
    previousMemorization: 'حفظ القرآن كاملاً ويرغب في نيل الإجازة',
    notes: null,
    status: 'APPROVED',
    reviewerNotes: 'تم اجتياز المقابلة بنجاح وقيده بحلقة الإتقان',
    reviewedAt: '2026-11-03T12:00:00Z',
    createdAt: '2026-11-02T09:00:00Z',
  },
];

/**
 * جلب طلبات التسجيل من Supabase
 */
export const fetchApplications = async (): Promise<{
  applications: RegistrationApplicationItem[];
  isLive: boolean;
}> => {
  if (!isSupabaseConfigured()) {
    return { applications: FALLBACK_APPLICATIONS, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from('registration_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return { applications: FALLBACK_APPLICATIONS, isLive: false };
    }

    const items: RegistrationApplicationItem[] = data.map((d: any) => ({
      id: d.id,
      studentName: d.student_name,
      studentAge: d.student_age,
      guardianName: d.guardian_name,
      guardianPhone: d.guardian_phone,
      desiredTrack: d.desired_track,
      previousMemorization: d.previous_memorization,
      notes: d.notes,
      status: d.status,
      reviewerNotes: d.reviewer_notes,
      reviewedAt: d.reviewed_at,
      createdAt: d.created_at,
    }));

    return { applications: items, isLive: true };
  } catch (err) {
    return { applications: FALLBACK_APPLICATIONS, isLive: false };
  }
};

/**
 * تحويل طلب التسجيل إلى طالب مقيد رسمياً مع منع التكرار
 */
export const convertApplicationToStudent = async (params: {
  applicationId: string;
  circleId?: string;
  birthDate?: string;
  gender: 'male' | 'female';
  notes?: string;
}): Promise<{ success: boolean; studentId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    // محاكاة محلية
    const target = FALLBACK_APPLICATIONS.find(a => a.id === params.applicationId);
    if (target) {
      target.status = 'APPROVED';
      target.reviewerNotes = params.notes || 'تم قبول الطلب محلياً';
      target.reviewedAt = new Date().toISOString();
    }
    return { success: true, studentId: 's-mock-converted' };
  }

  try {
    // استدعاء دالة RPC الذرية الآمنة
    const { data, error } = await (supabase.rpc as any)('convert_registration_application', {
      p_application_id: params.applicationId,
      p_circle_id: params.circleId || null,
      p_birth_date: params.birthDate || null,
      p_gender: params.gender,
      p_notes: params.notes || null,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, studentId: (data as any)?.student_id };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل اعتماد الطلب وتحويله إلى طالب.',
    };
  }
};

/**
 * تحديث حالة طلب التسجيل (رفض أو اتصال أو انتظار)
 */
export const updateApplicationStatus = async (
  applicationId: string,
  newStatus: 'APPROVED' | 'REJECTED' | 'CONTACTED',
  reviewerNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const target = FALLBACK_APPLICATIONS.find(a => a.id === applicationId);
    if (target) {
      target.status = newStatus;
      target.reviewerNotes = reviewerNotes || null;
      target.reviewedAt = new Date().toISOString();
    }
    return { success: true };
  }

  try {
    const { error } = await (supabase.from('registration_applications') as any)
      .update({
        status: newStatus,
        reviewer_notes: reviewerNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'فشل تحديث حالة الطلب.',
    };
  }
};

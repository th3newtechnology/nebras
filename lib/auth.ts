import { Session, User as SupabaseAuthUser, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { User, UserRole } from '../types';
import { Database } from '../types/database.types';

export interface AuthOperationResult {
  success: boolean;
  error?: string;
  message?: string;
  session?: Session | null;
  user?: User | null;
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type TeacherRow = Database['public']['Tables']['teachers']['Row'];
export type GuardianRow = Database['public']['Tables']['guardians']['Row'];
export type StudentRow = Database['public']['Tables']['students']['Row'];
export type GuardianStudentRow = Database['public']['Tables']['guardian_students']['Row'];
export type CircleRow = Database['public']['Tables']['circles']['Row'];
export type CircleStudentRow = Database['public']['Tables']['circle_students']['Row'];

/**
 * تطبيع دور المستخدم لضمان التوافق بين تعريفات قاعدة البيانات ونظام الأدوار في الواجهة
 * دور المستخدم يؤخذ حصراً من الخادم ولا يمكن تغييره من المتصفح
 */
export const normalizeUserRole = (rawRole?: string | null): UserRole => {
  if (!rawRole) return UserRole.STUDENT;
  const lower = rawRole.toLowerCase();
  switch (lower) {
    case 'admin':
      return UserRole.ADMIN;
    case 'teacher':
      return UserRole.TEACHER;
    case 'guardian':
      return UserRole.GUARDIAN;
    case 'student':
      return UserRole.STUDENT;
    default:
      return UserRole.STUDENT;
  }
};

/**
 * جلب الملف الشخصي للمستخدم من جدول profiles وجدول user_roles
 * والتحقق من حالة الحساب (نشط / معطل) والصلاحيات المعينة من الخادم
 */
export const fetchUserProfile = async (
  userId: string
): Promise<{ profile: ProfileRow | null; role?: string | null; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return {
      profile: null,
      error: 'خادم المصادقة غير متصل.',
    };
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // إذا كان الجدول غير موجود بعد (خلال مرحلة التهيئة) نرجع كائن فارغ دون كسر النظام
      return { profile: null, error: error.message };
    }

    // جلب الدور المعتمد من جدول user_roles
    let userRole: string | null = null;
    const { data: roleRecord } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (roleRecord) {
      userRole = (roleRecord as { role?: string }).role || null;
    }

    return { profile, role: userRole, error: undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ أثناء جلب الملف الشخصي';
    return { profile: null, error: msg };
  }
};

/**
 * تحويل جلسة Supabase ومستند Profile إلى كائن User المعتمد في التطبيق
 */
export const mapAuthUser = (
  authUser: SupabaseAuthUser,
  profile?: ProfileRow | null,
  roleFromDatabase?: string | null
): User => {
  const roleFromMetadata = (authUser.app_metadata?.role as string) || (authUser.user_metadata?.role as string);
  const finalRole = normalizeUserRole(roleFromDatabase || roleFromMetadata);

  return {
    id: authUser.id,
    email: authUser.email || '',
    displayName: profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'مستخدم',
    role: finalRole,
    avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
    username: authUser.user_metadata?.username,
  };
};

/**
 * تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
 * يتم استدعاء supabase.auth.signInWithPassword
 * في حال عدم وجود اتصال حقيقي، تفشل العملية فوراً مع توضيح صريح للمستخدم
 */
export const signInWithPassword = async (
  email: string,
  password: string
): Promise<AuthOperationResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'خادم المصادقة السحابي غير متصل (يرجى ضبط مفاتيح Supabase في .env.local). لا يمكن تسجيل الدخول في وضع عدم الاتصال حفاظاً على أمان البيانات.',
    };
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    return {
      success: false,
      error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      let friendlyMessage = 'بيانات الدخول غير صحيحة، يرجى التأكد والمحاولة ثانية.';
      if (error.message.includes('Invalid login credentials')) {
        friendlyMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (error.message.includes('Email not confirmed')) {
        friendlyMessage = 'البريد الإلكتروني لم يتم تأكيده بعد، يرجى مراجعة بريدك الإلكتروني.';
      } else if (error.message.includes('Too many requests')) {
        friendlyMessage = 'تم تجاوز عدد المحاولات المسموح بها، يرجى الانتظار قليلاً.';
      } else {
        friendlyMessage = error.message;
      }

      return {
        success: false,
        error: friendlyMessage,
      };
    }

    if (!data.user || !data.session) {
      return {
        success: false,
        error: 'لم يتم العثور على جلسة صالحة بعد التحقق.',
      };
    }

    // جلب ملف المستخدم للتحقق من التفعيل والدور
    const { profile, role } = await fetchUserProfile(data.user.id);
    if (profile && profile.is_active === false) {
      // الحساب معطل من قبل الإدارة
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'هذا الحساب معطل حالياً من قِبل إدارة المدرسة، يرجى مراجعة الإدارة.',
      };
    }

    const appUser = mapAuthUser(data.user, profile, role);

    return {
      success: true,
      session: data.session,
      user: appUser,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ غير متوقع أثناء تسجيل الدخول';
    return {
      success: false,
      error: `فشل تسجيل الدخول: ${msg}`,
    };
  }
};

/**
 * تسجيل الخروج وإنهاء الجلسة
 * يستدعي supabase.auth.signOut
 */
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ أثناء تسجيل الخروج';
    return { success: false, error: msg };
  }
};

/**
 * استعادة كلمة المرور عبر البريد الإلكتروني
 * يستدعي supabase.auth.resetPasswordForEmail
 */
export const resetPasswordForEmail = async (
  email: string,
  redirectTo?: string
): Promise<AuthOperationResult> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'خادم المصادقة السحابي غير متصل. لا يمكن إرسال رابط استعادة كلمة المرور بدون ربط مشروع Supabase.',
    };
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return {
      success: false,
      error: 'يرجى إدخال البريد الإلكتروني الخاص بالحساب.',
    };
  }

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nebras.edu';
    const redirectUrl = redirectTo || `${origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      return {
        success: false,
        error: `تعذر إرسال رابط الاستعادة: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ غير متوقع';
    return {
      success: false,
      error: `فشلت العملية: ${msg}`,
    };
  }
};

/**
 * الحصول على الجلسة الحالية من Supabase Auth
 * يستدعي supabase.auth.getSession
 */
export const getActiveSession = async (): Promise<{ session: Session | null; user: User | null; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { session: null, user: null };
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return { session: null, user: null, error: error?.message };
    }

    const { profile, role } = await fetchUserProfile(session.user.id);
    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      return { session: null, user: null, error: 'الحساب معطل من قِبل الإدارة.' };
    }

    const appUser = mapAuthUser(session.user, profile, role);
    return { session, user: appUser };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ في جلب الجلسة';
    return { session: null, user: null, error: msg };
  }
};

/**
 * الاستماع لتغيرات حالة المصادقة
 * يستدعي supabase.auth.onAuthStateChange
 */
export const subscribeToAuthState = (
  callback: (event: AuthChangeEvent, session: Session | null, user: User | null) => void
) => {
  if (!isSupabaseConfigured()) {
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!session) {
      callback(event, null, null);
      return;
    }

    const { profile, role } = await fetchUserProfile(session.user.id);
    const appUser = mapAuthUser(session.user, profile, role);
    callback(event, session, appUser);
  });

  return {
    unsubscribe: () => {
      subscription.unsubscribe();
    },
  };
};

/**
 * التحقق البرمجي من دور المستخدم عبر دوال الأمان (RBAC) في قاعدة البيانات
 */
export const checkUserRole = async (role: UserRole): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;

  try {
    const { data, error } = await (supabase.rpc as any)('has_role', {
      checked_role: role.toUpperCase(),
    });

    if (error) {
      // احتياطي: الفحص عبر الجلسة الحالية
      const session = await getActiveSession();
      return session.user?.role === role;
    }

    return Boolean(data);
  } catch {
    return false;
  }
};

/**
 * استرجاع معرف وسجل المعلم المرتبط بالمستخدم الموثق حالياً
 */
export const getCurrentTeacherRecord = async (): Promise<{ id: string; fullName: string } | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const teacher = data as TeacherRow | null;
    if (error || !teacher) return null;
    return { id: teacher.id, fullName: teacher.full_name };
  } catch {
    return null;
  }
};

/**
 * استرجاع معرف وسجل ولي الأمر المرتبط بالمستخدم الموثق حالياً
 */
export const getCurrentGuardianRecord = async (): Promise<{ id: string; fullName: string } | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from('guardians')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const guardian = data as GuardianRow | null;
    if (error || !guardian) return null;
    return { id: guardian.id, fullName: guardian.full_name };
  } catch {
    return null;
  }
};

/**
 * استرجاع معرف وسجل الطالب المرتبط بالمستخدم الموثق حالياً
 */
export const getCurrentStudentRecord = async (): Promise<{
  id: string;
  registrationNumber: string;
  fullName: string;
} | null> => {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    const student = data as StudentRow | null;
    if (error || !student) return null;
    return {
      id: student.id,
      registrationNumber: student.registration_number,
      fullName: student.full_name,
    };
  } catch {
    return null;
  }
};

/**
 * استرجاع معرفات الطلاب المصرح للمستخدم بالاطلاع عليهم (أبناء للولي، أو طلاب الحلقة للمعلم، أو الكل للمدير)
 */
export const getAuthorizedStudentIds = async (): Promise<string[]> => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return [];

    const { role } = await fetchUserProfile(session.user.id);
    const userRole = normalizeUserRole(role);

    if (userRole === UserRole.ADMIN) {
      const { data } = await supabase.from('students').select('*');
      const students = (data as StudentRow[] | null) || [];
      return students.map((s) => s.id);
    }

    if (userRole === UserRole.GUARDIAN) {
      const guardian = await getCurrentGuardianRecord();
      if (!guardian) return [];
      const { data } = await supabase
        .from('guardian_students')
        .select('*')
        .eq('guardian_id', guardian.id);
      const rows = (data as GuardianStudentRow[] | null) || [];
      return rows.map((row) => row.student_id);
    }

    if (userRole === UserRole.TEACHER) {
      const teacher = await getCurrentTeacherRecord();
      if (!teacher) return [];
      const { data } = await supabase
        .from('circles')
        .select('*')
        .eq('teacher_id', teacher.id);

      const circles = (data as CircleRow[] | null) || [];
      const circleIds = circles.map((c) => c.id);
      if (circleIds.length === 0) return [];

      const { data: circleStudents } = await supabase
        .from('circle_students')
        .select('*')
        .in('circle_id', circleIds);

      const enrolled = (circleStudents as CircleStudentRow[] | null) || [];
      return Array.from(new Set(enrolled.map((cs) => cs.student_id)));
    }

    if (userRole === UserRole.STUDENT) {
      const student = await getCurrentStudentRecord();
      return student ? [student.id] : [];
    }

    return [];
  } catch {
    return [];
  }
};

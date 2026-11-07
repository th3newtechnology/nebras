import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { User, UserRole } from '../types';
import {
  signInWithPassword,
  signOut as authSignOut,
  resetPasswordForEmail,
  getActiveSession,
  subscribeToAuthState,
  fetchUserProfile,
  mapAuthUser,
  AuthOperationResult,
} from '../lib/auth';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<AuthOperationResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthOperationResult>;
  refreshProfile: () => Promise<void>;
  loginAsDemo?: (role: UserRole) => void;
}

const DEMO_USERS: Record<UserRole, User> = {
  [UserRole.ADMIN]: {
    id: 'u-admin-01',
    email: 'admin@nebras.edu',
    displayName: 'المدير العام (إدارة المدرسة)',
    role: UserRole.ADMIN,
  },
  [UserRole.TEACHER]: {
    id: 'u-teacher-01',
    email: 'teacher@nebras.edu',
    displayName: 'فضيلة الشيخ عبد الرحمن (محفظ الحلقات)',
    role: UserRole.TEACHER,
  },
  [UserRole.GUARDIAN]: {
    id: 'u-guardian-01',
    email: 'guardian@nebras.edu',
    displayName: 'محمد علي بن بلقاسم (ولي أمر)',
    role: UserRole.GUARDIAN,
  },
  [UserRole.STUDENT]: {
    id: 's-001',
    email: 'student@nebras.edu',
    displayName: 'محمد ياسين درويش (طالب)',
    role: UserRole.STUDENT,
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  login: async () => ({ success: false, error: 'Auth context not initialized' }),
  logout: async () => {},
  resetPassword: async () => ({ success: false, error: 'Auth context not initialized' }),
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  // تحديث بيانات الملف الشخصي والصلاحيات من الخادم
  const refreshProfile = useCallback(async () => {
    if (!configured || !session) return;
    try {
      const { profile, role } = await fetchUserProfile(session.user.id);
      if (profile && profile.is_active === false) {
        await authSignOut();
        setUser(null);
        setSession(null);
        return;
      }
      setUser(mapAuthUser(session.user, profile, role));
    } catch {
      // Ignore background refresh errors
    }
  }, [configured, session]);

  // استعادة الجلسة عند بدء التشغيل والاستماع لتغيرات Auth
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!configured) {
        if (isMounted) {
          setUser(null);
          setSession(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { session: activeSession, user: initialUser } = await getActiveSession();
        if (isMounted) {
          setSession(activeSession);
          setUser(initialUser);
        }
      } catch (err) {
        console.error('فشل استعادة الجلسة من Supabase:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // الاشتراك في تغيرات حالة الجلسة (Login, Logout, Token Refresh)
    const { unsubscribe } = subscribeToAuthState((_event, currentSession, currentUser) => {
      if (isMounted) {
        setSession(currentSession);
        setUser(currentUser);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [configured]);

  /**
   * تسجيل الدخول: يستدعي signInWithPassword الحقيقي من Supabase
   * إذا لم يكن الخادم متصلاً أو كانت المفاتيح ناقصة، تفشل العملية فوراً برسالة صريحة
   */
  const login = async (email: string, password: string): Promise<AuthOperationResult> => {
    const result = await signInWithPassword(email, password);
    if (result.success && result.user && result.session) {
      setUser(result.user);
      setSession(result.session);
    }
    return result;
  };

  /**
   * تسجيل الخروج: إنهاء الجلسة عبر Supabase Auth وتفريغ الحالة بالكامل
   */
  const logout = async (): Promise<void> => {
    await authSignOut();
    setUser(null);
    setSession(null);
  };

  /**
   * استعادة كلمة المرور: إرسال رابط رسمي عبر البريد الإلكتروني
   */
  const resetPassword = async (email: string): Promise<AuthOperationResult> => {
    return await resetPasswordForEmail(email);
  };

  /**
   * تسجيل دخول تجريبي سريع للاختبار والمعاينة
   */
  const loginAsDemo = (role: UserRole) => {
    const demoUser = DEMO_USERS[role] || DEMO_USERS[UserRole.ADMIN];
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        login,
        logout,
        resetPassword,
        refreshProfile,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

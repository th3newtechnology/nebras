import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  BookOpen,
  LogIn,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { SCHOOL_INFO } from '../constants';

interface LoginProps {
  onBackToPublic?: () => void;
}

const Login: React.FC<LoginProps> = ({ onBackToPublic }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');

  const { login, resetPassword, isConfigured, loginAsDemo } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    // في حال عدم توفر اتصال Supabase المباشر، تمكين الدخول التجريبي
    if (!isConfigured && loginAsDemo) {
      const trimmed = email.trim().toLowerCase();
      if (trimmed.includes('admin')) {
        loginAsDemo(UserRole.ADMIN);
        return;
      } else if (trimmed.includes('teacher')) {
        loginAsDemo(UserRole.TEACHER);
        return;
      } else if (trimmed.includes('guardian')) {
        loginAsDemo(UserRole.GUARDIAN);
        return;
      } else if (trimmed.includes('student')) {
        loginAsDemo(UserRole.STUDENT);
        return;
      }
    }

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
      }
    } catch {
      setError('حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: UserRole, demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Nebras@2026');
    if (loginAsDemo) {
      loginAsDemo(role);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        setSuccessMessage(result.message || 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.');
      } else {
        setError(result.error || 'تعذر إرسال رابط الاستعادة.');
      }
    } catch {
      setError('حدث خطأ أثناء محاولة إرسال رابط الاستعادة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-islamic-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 animate-in zoom-in-95 duration-500 relative">
        {/* العودة للموقع العام */}
        {onBackToPublic && (
          <button
            type="button"
            onClick={onBackToPublic}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-islamic-800 transition-colors mb-6 group"
          >
            <ArrowRight className="w-4 h-4 text-gold-600 group-hover:-translate-x-1 transition-transform" />
            <span>العودة إلى الموقع العام للمدرسة</span>
          </button>
        )}

        {/* رأس الصفحة مع هوية المدرسة القرآنية */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-islamic-800 p-5 rounded-[1.75rem] shadow-xl shadow-islamic-800/30 mb-5 text-gold-300">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-islamic-950 tracking-tight">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-gold-600 text-xs mt-1 font-bold">
            {SCHOOL_INFO.affiliation}
          </p>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            {mode === 'login' ? 'بوابة تسجيل الدخول للنظام الموحد' : 'استعادة كلمة المرور عبر البريد'}
          </p>
        </div>

        {/* تنبيه غياب تهيئة السحابة الحقيقية (Strict Fallback Warning) */}
        {!isConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong className="block font-black mb-1">خادم المصادقة غير متصل</strong>
              لم يتم ضبط مفاتيح Supabase في <code className="font-mono bg-white px-1 rounded border border-amber-200">.env.local</code> بعد. لن يُقبل أي تسجيل دخول وهمي حفاظاً على سلامة البيانات.
            </div>
          </div>
        )}

        {/* رسائل الخطأ والنجاح */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-bold leading-relaxed">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-800 animate-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <p className="text-xs font-bold leading-relaxed">{successMessage}</p>
          </div>
        )}

        {mode === 'login' ? (
          /* نموذج تسجيل الدخول */
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-wider">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-islamic-700 transition-colors" />
                <input
                  type="email"
                  className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-islamic-600 focus:ring-4 focus:ring-islamic-600/10 transition-all outline-none"
                  placeholder="admin@nebras.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mr-2">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setSuccessMessage('');
                    setResetEmail(email);
                    setMode('reset');
                  }}
                  className="text-xs text-gold-600 hover:text-gold-700 font-bold transition-colors"
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-islamic-700 transition-colors" />
                <input
                  type="password"
                  className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-islamic-600 focus:ring-4 focus:ring-islamic-600/10 transition-all outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-islamic-800 text-white py-4 rounded-2xl font-black text-base hover:bg-islamic-900 transition-all shadow-xl shadow-islamic-800/30 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول (Supabase Auth)</span>
                  <LogIn className="w-5 h-5 text-gold-300 group-hover:translate-x-[-3px] transition-transform" />
                </>
              )}
            </button>

            {/* أزرار الدخول التجريبي السريع للمعانية والتطوير */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[11px] font-black text-slate-400 block mb-2 text-center">
                ✨ تجربة سريعة للبوابات (وضع التطوير):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo(UserRole.ADMIN, 'admin@nebras.edu')}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-black border border-emerald-200 transition-colors text-right flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>👑 مدير النظام</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo(UserRole.TEACHER, 'teacher@nebras.edu')}
                  className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-black border border-teal-200 transition-colors text-right flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span>🕌 الشيخ المعلم</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo(UserRole.GUARDIAN, 'guardian@nebras.edu')}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-black border border-amber-200 transition-colors text-right flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  <span>👨‍👩‍👧 ولي الأمر</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo(UserRole.STUDENT, 'student@nebras.edu')}
                  className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl font-black border border-indigo-200 transition-colors text-right flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>🎓 الطالب</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* نموذج استعادة كلمة المرور */
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-wider">
                البريد الإلكتروني المسجل في النظام
              </label>
              <div className="relative group">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-islamic-700 transition-colors" />
                <input
                  type="email"
                  className="w-full pr-12 pl-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-islamic-600 focus:ring-4 focus:ring-islamic-600/10 transition-all outline-none"
                  placeholder="user@nebras.edu"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 text-white py-4 rounded-2xl font-black text-base hover:bg-gold-700 transition-all shadow-xl shadow-gold-600/30 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-5 h-5 text-white" />
                  <span>إرسال رابط إعادة التعيين</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setSuccessMessage('');
                setMode('login');
              }}
              className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 py-2 transition-colors"
            >
              العودة إلى تسجيل الدخول
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold">
            {SCHOOL_INFO.fullName} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogIn, User, Lock, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, setDemoUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (!success) {
        setError('بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.');
      }
    } catch (err) {
      setError('حدث خطأ أثناء محاولة تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setLoading(true);
    setTimeout(() => {
      setDemoUser(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 animate-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="bg-cyan-600 p-5 rounded-[1.5rem] shadow-xl shadow-cyan-600/30 mb-6">
            <GraduationCap className="text-white w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نبراس التعليمي</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">نظام إدارة حلقات تحفيظ القرآن الكريم</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">اسم المستخدم / البريد</label>
            <div className="relative group">
              <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-cyan-600 transition-colors" />
              <input 
                type="text" 
                className="w-full pr-14 pl-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-cyan-500 focus:ring-8 focus:ring-cyan-500/5 transition-all outline-none"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">كلمة المرور</label>
            <div className="relative group">
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-cyan-600 transition-colors" />
              <input 
                type="password" 
                className="w-full pr-14 pl-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-cyan-500 focus:ring-8 focus:ring-cyan-500/5 transition-all outline-none"
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
            className="w-full bg-cyan-600 text-white py-5 rounded-[1.5rem] font-black text-lg hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                تسجيل الدخول
                <LogIn className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white px-5 text-slate-400 font-black uppercase tracking-[0.2em]">أو الدخول السريع</span>
          </div>
        </div>

        <button 
          onClick={handleDemoAccess}
          disabled={loading}
          className="w-full bg-slate-50 text-slate-600 py-4 rounded-[1.25rem] font-bold hover:bg-slate-100 transition-all border border-slate-200 flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
          تجربة النظام كمدير
        </button>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">منصة نبراس الموحدة © ٢٠٢٤</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

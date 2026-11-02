
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Database, Save, Download, Upload, Trash2, UserPlus, Key, Eye, EyeOff, UserCheck, Trash, GraduationCap, UserSquare2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
// Fixed: Removed missing importFullDB import
import { exportFullDB, useLocalCollection } from '../hooks/useLocalDB';
import Modal from '../components/Modal';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [schoolInfo, setSchoolInfo] = useState({
    name: 'نبراس لتحفيظ القرآن',
    manager: 'عبد الرحمن آل الشيخ',
    email: 'info@nebras.edu',
    phone: '920001234'
  });
  const { addNotification } = useNotifications();
  const { data: students } = useLocalCollection('students');
  const { data: teachers } = useLocalCollection('teachers');
  const [guardians, setGuardians] = useState<any[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<any[]>([]);
  const [teacherAccounts, setTeacherAccounts] = useState<any[]>([]);
  const [isGuardianModalOpen, setIsGuardianModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('nebras_settings');
    if (savedSettings) setSchoolInfo(JSON.parse(savedSettings));
    
    const savedGuardians = localStorage.getItem('nebras_guardians');
    if (savedGuardians) setGuardians(JSON.parse(savedGuardians));
    
    const savedStudentsAcc = localStorage.getItem('nebras_student_accounts');
    if (savedStudentsAcc) setStudentAccounts(JSON.parse(savedStudentsAcc));
    
    const savedTeacherAcc = localStorage.getItem('nebras_teachers_accounts');
    if (savedTeacherAcc) setTeacherAccounts(JSON.parse(savedTeacherAcc));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('nebras_settings', JSON.stringify(schoolInfo));
    addNotification('تم الحفظ', 'تم تحديث بيانات المدرسة بنجاح.', 'success');
  };

  const handleCreateGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const newGuardian = {
      id: Math.random().toString(36).substr(2, 9),
      guardianName: formData.get('guardianName'),
      username: formData.get('username'),
      password: formData.get('password'),
      studentIds: [formData.get('studentId')],
      createdAt: new Date().toISOString()
    };

    const updated = [...guardians, newGuardian];
    setGuardians(updated);
    localStorage.setItem('nebras_guardians', JSON.stringify(updated));
    
    setIsGuardianModalOpen(false);
    addNotification('تم إنشاء الحساب', `تم توليد حساب لولي الأمر ${newGuardian.guardianName} بنجاح.`, 'success');
  };

  const deleteGuardian = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      const updated = guardians.filter(g => g.id !== id);
      setGuardians(updated);
      localStorage.setItem('nebras_guardians', JSON.stringify(updated));
      addNotification('تم الحذف', 'تم مسح حساب ولي الأمر نهائياً.', 'info');
    }
  };
  
  const handleCreateStudentAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const studentId = formData.get('studentId') as string;
    const student = students.find(s => s.id === studentId);

    const newAccount = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: student?.name || 'طالب جديد',
      username: formData.get('username'),
      password: formData.get('password'),
      studentId: studentId,
      createdAt: new Date().toISOString()
    };

    const updated = [...studentAccounts, newAccount];
    setStudentAccounts(updated);
    localStorage.setItem('nebras_student_accounts', JSON.stringify(updated));
    
    setIsStudentModalOpen(false);
    addNotification('تم إنشاء الحساب', `تم توليد حساب للطالب ${newAccount.studentName} بنجاح.`, 'success');
  };

  const deleteStudentAccount = (id: string) => {
    if (confirm('هل أنت متأكد من حذف حساب هذا الطالب؟')) {
      const updated = studentAccounts.filter(a => a.id !== id);
      setStudentAccounts(updated);
      localStorage.setItem('nebras_student_accounts', JSON.stringify(updated));
      addNotification('تم الحذف', 'تم مسح حساب الطالب نهائياً.', 'info');
    }
  };

  const handleCreateTeacherAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    const teacherId = formData.get('teacherId') as string;
    const teacher = teachers.find(t => t.id === teacherId);

    const newAccount = {
      id: Math.random().toString(36).substr(2, 9),
      teacherName: teacher?.name || 'معلم جديد',
      username: formData.get('username'),
      password: formData.get('password'),
      teacherId: teacherId,
      createdAt: new Date().toISOString()
    };

    const updated = [...teacherAccounts, newAccount];
    setTeacherAccounts(updated);
    localStorage.setItem('nebras_teachers_accounts', JSON.stringify(updated));
    
    setIsTeacherModalOpen(false);
    addNotification('تم إنشاء الحساب', `تم توليد حساب للمعلم ${newAccount.teacherName} بنجاح.`, 'success');
  };

  const deleteTeacherAccount = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب التعليمي؟')) {
      const updated = teacherAccounts.filter(a => a.id !== id);
      setTeacherAccounts(updated);
      localStorage.setItem('nebras_teachers_accounts', JSON.stringify(updated));
      addNotification('تم الحذف', 'تم مسح حساب المعلم نهائياً.', 'info');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">إعدادات النظام</h2>
        <p className="text-slate-500 mt-2 font-medium">تخصيص المنصة، إدارة الصلاحيات، والنسخ الاحتياطي</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* 1. Database & Security Controls */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3">
              <Shield className="w-5 h-5 text-rose-500" /> إدارة أمن البيانات
            </h3>
            <div className="space-y-4">
              <button onClick={exportFullDB} className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-cyan-50 rounded-2xl transition-all group border border-transparent hover:border-cyan-100">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                  <span className="text-sm font-black text-slate-700">تصدير قاعدة البيانات</span>
                </div>
              </button>
              <button onClick={() => confirm('سيتم حذف كافة البيانات!') && localStorage.clear()} className="w-full flex items-center justify-between p-5 bg-rose-50/50 hover:bg-rose-50 rounded-2xl transition-all group border border-transparent hover:border-rose-100">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-rose-300 group-hover:text-rose-600 transition-colors" />
                  <span className="text-sm font-black text-rose-700">تصفير النظام بالكامل</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-12 -mt-12"></div>
             <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10">
               <UserCheck className="w-5 h-5 text-indigo-500" /> حسابات أولياء الأمور
             </h3>
             <div className="space-y-3 relative z-10">
               {guardians.map(g => (
                 <div key={g.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-700 truncate">{g.guardianName}</p>
                      <p className="text-[10px] text-slate-400 font-bold font-mono">@{g.username}</p>
                    </div>
                    <button onClick={() => deleteGuardian(g.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash className="w-4 h-4" />
                    </button>
                 </div>
               ))}
               <button 
                onClick={() => setIsGuardianModalOpen(true)}
                className="w-full py-4 border-2 border-dashed border-indigo-100 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all mt-4"
               >
                 + إضافة حساب ولي أمر
               </button>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -mr-12 -mt-12"></div>
             <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10">
               <GraduationCap className="w-5 h-5 text-teal-500" /> حسابات الطلاب
             </h3>
             <div className="space-y-3 relative z-10">
               {studentAccounts.map(a => (
                 <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-700 truncate">{a.studentName}</p>
                      <p className="text-[10px] text-slate-400 font-bold font-mono">@{a.username}</p>
                    </div>
                    <button onClick={() => deleteStudentAccount(a.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash className="w-4 h-4" />
                    </button>
                 </div>
               ))}
               <button 
                onClick={() => setIsStudentModalOpen(true)}
                className="w-full py-4 border-2 border-dashed border-teal-100 text-teal-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 transition-all mt-4"
               >
                 + إضافة حساب طالب
               </button>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-12 -mt-12"></div>
             <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 relative z-10">
               <UserSquare2 className="w-5 h-5 text-emerald-500" /> حسابات المعلمين
             </h3>
             <div className="space-y-3 relative z-10">
               {teacherAccounts.map(a => (
                 <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-700 truncate">{a.teacherName}</p>
                      <p className="text-[10px] text-slate-400 font-bold font-mono">@{a.username}</p>
                    </div>
                    <button onClick={() => deleteTeacherAccount(a.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash className="w-4 h-4" />
                    </button>
                 </div>
               ))}
               <button 
                onClick={() => setIsTeacherModalOpen(true)}
                className="w-full py-4 border-2 border-dashed border-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all mt-4"
               >
                 + إضافة حساب معلم
               </button>
             </div>
          </div>
        </div>

        {/* 2. Main Config Form */}
        <div className="xl:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10">
          <form onSubmit={handleSave} className="space-y-10">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
               <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600">
                 <SettingsIcon className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-800">بيانات المنشأة الرسمية</h3>
                 <p className="text-xs text-slate-400 font-bold mt-1 tracking-tight">تحكم في هوية المدرسة والمراسلات الصادرة</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم المنشأة</label>
                <input type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10" value={schoolInfo.name} onChange={e => setSchoolInfo({...schoolInfo, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مدير المدرسة</label>
                <input type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10" value={schoolInfo.manager} onChange={e => setSchoolInfo({...schoolInfo, manager: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="px-12 py-5 bg-cyan-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-cyan-600/30 hover:bg-cyan-700 transition-all active:scale-95">حفظ الإعدادات</button>
          </form>
        </div>
      </div>

      {/* Guardian Account Creation Modal */}
      <Modal 
        isOpen={isGuardianModalOpen} 
        onClose={() => setIsGuardianModalOpen(false)} 
        title="إنشاء حساب لولي أمر"
      >
        <form onSubmit={handleCreateGuardian} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اسم ولي الأمر</label>
            <input name="guardianName" type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold" placeholder="أدخل اسم الأب أو الأم" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اسم المستخدم (Username)</label>
              <input name="username" type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl font-mono text-sm" placeholder="user_123" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  className="w-full p-4 bg-slate-50 border-none rounded-xl font-mono text-sm" 
                  placeholder="pass123" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">ربط بحساب طالب</label>
            <select name="studentId" className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold" required>
              <option value="">اختر ابناً من القائمة...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
             <Key className="w-5 h-5 text-amber-600 shrink-0" />
             <p className="text-[10px] text-amber-800 font-bold leading-relaxed">تنبيه: ولي الأمر سيتمكن من مشاهدة سجلات الطالب المربوط بحسابه فقط، ولن يملك أي صلاحيات للحذف أو التعديل.</p>
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all">توليد بيانات الدخول</button>
        </form>
      </Modal>

      {/* Student Account Creation Modal */}
      <Modal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        title="إنشاء حساب لطالب"
      >
        <form onSubmit={handleCreateStudentAccount} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اختيار الطالب</label>
            <select name="studentId" className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold" required>
              <option value="">اختر طالباً من القائمة...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اسم المستخدم (Username)</label>
              <input name="username" type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl font-mono text-sm" placeholder="stud_123" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  className="w-full p-4 bg-slate-50 border-none rounded-xl font-mono text-sm" 
                  placeholder="pass123" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 flex items-start gap-3">
             <Key className="w-5 h-5 text-teal-600 shrink-0" />
             <p className="text-[10px] text-teal-800 font-bold leading-relaxed">تنبيه: سيتمكن الطالب من الدخول لمتابعة سجلاته الشخصية فقط، دون صلاحيات تعديل أو اطلاع على بيانات زملائه.</p>
          </div>

          <button type="submit" className="w-full py-5 bg-teal-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-teal-600/30 hover:bg-teal-700 transition-all">إنشاء حساب الطالب</button>
        </form>
      </Modal>

      {/* Teacher Account Creation Modal */}
      <Modal 
        isOpen={isTeacherModalOpen} 
        onClose={() => setIsTeacherModalOpen(false)} 
        title="إنشاء حساب لمعلم"
      >
        <form onSubmit={handleCreateTeacherAccount} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اختيار المعلم</label>
            <select name="teacherId" className="w-full p-4 bg-slate-50 border-none rounded-xl font-bold" required>
              <option value="">اختر معلماً من القائمة...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اسم المستخدم (Username)</label>
              <input name="username" type="text" className="w-full p-4 bg-slate-50 border-none rounded-xl font-mono text-sm" placeholder="teacher_123" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  className="w-full p-4 bg-slate-50 border-none rounded-xl font-mono text-sm" 
                  placeholder="pass123" 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
             <Key className="w-5 h-5 text-emerald-600 shrink-0" />
             <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">تنبيه: سيملك المعلم صلاحيات تعديل ومتابعة الطلاب المسجلين في حلقاته فقط، ولن يملك صلاحيات تعديل إعدادات النظام.</p>
          </div>

          <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all">إنشاء حساب المعلم</button>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;

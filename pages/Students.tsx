
import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Loader2,
  History,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  UserPlus,
  GraduationCap,
  X,
  Save,
  Edit2,
  Check,
  Hash,
  ArrowRightCircle,
  Clock3,
  AlertTriangle,
  Users,
  CreditCard,
  ExternalLink,
  ChevronLeft,
  Circle,
  MapPin,
  User,
  Phone,
  Cake,
  Star,
  Printer,
  MessageCircle,
  Award,
  IdCard,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Student, Teacher, Classroom, PaymentStatus, ProgressEntry, UserRole } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLocalCollection, addLocalData, deleteLocalData, updateLocalData } from '../hooks/useLocalDB';
import { useAuth } from '../context/AuthContext';

// Exported for reuse in Dashboard.tsx
export const StudentDetailsContent: React.FC<{
  student: Student;
  teachers: Teacher[];
  halls?: Classroom[]; // Added halls prop
  onRefresh: () => void;
  onNavigateToFees?: (name: string) => void;
  readOnly?: boolean;
}> = ({ student, teachers, halls = [], onRefresh, onNavigateToFees, readOnly = false }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<ProgressEntry>({
    date: new Date().toISOString().split('T')[0],
    surah: '',
    fromAyah: 1,
    toAyah: 1,
    type: 'hifz',
    grade: 'A'
  });

  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Student>(student);

  const { addNotification } = useNotifications();
  const progressPercentage = (student.hifzLevel / 30) * 100;
  const assignedTeacher = teachers.find(t => t.id === student.teacherId);

  // Find the hall assigned to this teacher (or just the first one they have)
  const teacherHallName = assignedTeacher?.assignedHalls?.[0];
  const assignedHall = halls.find(h => h.name === teacherHallName);

  const sortedHistory = useMemo(() => {
    return [...(student.progressHistory || [])].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [student.progressHistory]);

  const handleSaveNewEntry = () => {
    if (readOnly) return;
    if (!newEntry.surah) {
      addNotification('بيانات ناقصة', 'يرجى إدخال اسم السورة أولاً', 'warning');
      return;
    }
    const updatedHistory = [newEntry, ...(student.progressHistory || [])];
    const newHifzLevel = newEntry.type === 'hifz'
      ? Math.min(30, student.hifzLevel + 0.05)
      : student.hifzLevel;

    updateLocalData('students', student.id, {
      progressHistory: updatedHistory,
      hifzLevel: newHifzLevel,
      lastRevision: newEntry.surah
    });

    onRefresh();
    setShowAddForm(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      surah: '',
      fromAyah: 1,
      toAyah: 1,
      type: 'hifz',
      grade: 'A'
    });
    addNotification('تم الحفظ', `تم تسجيل إنجاز سورة ${newEntry.surah}`, 'success');
  };

  const handleSaveChanges = () => {
    updateLocalData('students', student.id, editedData);
    onRefresh();
    setIsEditing(false);
    addNotification('تم التحديث', 'تم حفظ التعديلات على ملف الطالب بنجاح', 'success');
  };

  if (isEditing) {
    return (
      <div className="space-y-8 bg-slate-50 p-6 rounded-3xl border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-800">تعديل بيانات الطالب</h3>
          <div className="flex gap-3">
            <button onClick={() => { setIsEditing(false); setEditedData(student); }} className="px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">إلغاء</button>
            <button onClick={handleSaveChanges} className="px-6 py-2.5 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg flex items-center gap-2">
              <Save className="w-5 h-5" /> حفظ التعديلات
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">اسم الطالب الرباعي</label>
            <input type="text" value={editedData.name} onChange={e => setEditedData({ ...editedData, name: e.target.value })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">المعلم المسؤول (الحلقة)</label>
            <select value={editedData.teacherId} onChange={e => setEditedData({ ...editedData, teacherId: e.target.value })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold">
              <option value="">لم يحدد عد</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.specialization}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">اسم ولي الأمر</label>
            <input type="text" value={editedData.guardianName} onChange={e => setEditedData({ ...editedData, guardianName: e.target.value })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">رقم جوال ولي الأمر</label>
            <input type="text" value={editedData.guardianPhone} onChange={e => setEditedData({ ...editedData, guardianPhone: e.target.value })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">تاريخ الميلاد</label>
            <input type="date" value={editedData.birthDate} onChange={e => setEditedData({ ...editedData, birthDate: e.target.value })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">مستوى الحفظ المنجز (بالأجزاء)</label>
            <input type="number" step="0.1" value={editedData.hifzLevel} onChange={e => setEditedData({ ...editedData, hifzLevel: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">السلوك التراكمي (0 - 100)</label>
            <input type="number" value={editedData.behaviorScore} onChange={e => setEditedData({ ...editedData, behaviorScore: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">نسبة الانضباط (0 - 100)</label>
            <input type="number" value={editedData.attendanceRate} onChange={e => setEditedData({ ...editedData, attendanceRate: parseInt(e.target.value) || 0 })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-500">الحالة المالية</label>
            <select value={editedData.paymentStatus} onChange={e => setEditedData({ ...editedData, paymentStatus: e.target.value as PaymentStatus })} className="w-full p-4 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 font-bold">
              {Object.values(PaymentStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="relative p-1 bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden group">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-cyan-600/5 -skew-x-12 translate-x-1/2 group-hover:bg-cyan-600/10 transition-all"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-10 p-8">
          <div className="relative">
            <div className={`w-40 h-40 rounded-[3rem] ${readOnly ? 'from-indigo-600 to-indigo-800' : 'from-cyan-600 to-cyan-800'} bg-gradient-to-br flex items-center justify-center text-6xl font-black text-white shadow-2xl border-8 border-slate-50 relative z-10 transition-transform hover:scale-105 duration-500`}>
              {student.name?.[0]}
            </div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-slate-50 z-20">
              <ShieldCheck className={`w-6 h-6 ${readOnly ? 'text-indigo-500' : 'text-emerald-500'}`} />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{student.name}</h4>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black border border-slate-200 uppercase tracking-widest">
                  ID: #{student.id.slice(0, 8).toUpperCase()}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${student.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                  {student.paymentStatus}
                </span>
              </div>
            </div>
            {!readOnly && (
              <div className="flex gap-4">
                {isAdmin && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-50 text-amber-700 border-2 border-amber-100 rounded-2xl font-black text-sm hover:bg-amber-100 transition-all shadow-sm active:scale-95">
                    <Edit2 className="w-5 h-5" /> تعديل الملف
                  </button>
                )}
                <button onClick={() => onNavigateToFees?.(student.name)} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-sm hover:border-cyan-500 hover:text-cyan-600 transition-all shadow-sm active:scale-95">
                  <CreditCard className="w-5 h-5" /> السجل المالي
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                  <Printer className="w-5 h-5" /> طباعة الملف
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-cyan-200 transition-all">
          <div className="w-16 h-16 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">نسبة الحفظ</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{Math.round(progressPercentage)}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-emerald-200 transition-all">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الانضباط العام</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{student.attendanceRate}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-amber-200 transition-all">
          <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
            <Star className="w-8 h-8" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">السلوك التراكمي</p>
            <p className="text-3xl font-black text-slate-900 leading-none">{student.behaviorScore}/100</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h5 className="font-black text-slate-800 flex items-center gap-2 tracking-tight">
                <IdCard className="w-5 h-5 text-cyan-600" /> الهوية التعليمية
              </h5>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ولي الأمر</p>
                  <p className="text-sm font-black text-slate-800">{student.guardianName}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">جوال التواصل</p>
                  <p className="text-sm font-black text-slate-800 font-mono tracking-tight">{student.guardianPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <Cake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">تاريخ الميلاد</p>
                  <p className="text-sm font-black text-slate-800 font-mono">{student.birthDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${readOnly ? 'from-indigo-900 to-indigo-800' : 'from-slate-900 to-slate-800'} p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group`}>
            <GraduationCap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <h5 className="font-black flex items-center gap-2 opacity-60 uppercase tracking-[0.2em] text-[10px]">الإشراف التعليمي</h5>

              <div className="space-y-4">
                {/* Teacher Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black">{assignedTeacher?.name || 'لم يحدد بعد'}</p>
                    <p className="text-[10px] font-bold opacity-70">معلم الحلقة المعتمد</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-white/10"></div>

                {/* Hall Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black">{teacherHallName || 'غير مسند لقاعة'}</p>
                    <p className="text-[10px] font-bold opacity-70">مقر المقرأة / القاعة الدراسية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between px-4">
            <div>
              <h5 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                <History className={`w-7 h-7 ${readOnly ? 'text-indigo-600' : 'text-cyan-600'}`} /> سجل المتابعة الرقمي
              </h5>
              <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">تتبع الإنجاز اليومي والتقييمات</p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-8 py-4 bg-cyan-600 text-white rounded-2xl hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-600/30 active:scale-95 font-black text-sm flex items-center gap-2"
              >
                {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showAddForm ? 'إلغاء' : 'تسجيل إنجاز جديد'}
              </button>
            )}
          </div>

          {showAddForm && !readOnly && (
            <div className="bg-white border-2 border-dashed border-cyan-100 rounded-[3rem] p-10 space-y-8 animate-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">اسم السورة</label>
                  <input type="text" value={newEntry.surah} onChange={e => setNewEntry({ ...newEntry, surah: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-sm border-none focus:ring-4 focus:ring-cyan-500/10" placeholder="مثال: البقرة" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">من آية</label>
                  <input type="number" value={newEntry.fromAyah} onChange={e => setNewEntry({ ...newEntry, fromAyah: +e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-sm border-none focus:ring-4 focus:ring-cyan-500/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إلى آية</label>
                  <input type="number" value={newEntry.toAyah} onChange={e => setNewEntry({ ...newEntry, toAyah: +e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl font-black text-sm border-none focus:ring-4 focus:ring-cyan-500/10" />
                </div>
              </div>
              <button onClick={handleSaveNewEntry} className="w-full py-5 bg-cyan-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-cyan-600/30 hover:bg-cyan-700 transition-all">اعتماد الحصة اليومية</button>
            </div>
          )}

          <div className="relative space-y-6 max-h-[1000px] overflow-y-auto custom-scrollbar px-2 pb-20 pt-4">
            <div className="absolute top-4 bottom-12 right-12 w-1.5 bg-slate-100 hidden md:block rounded-full"></div>
            {sortedHistory.length > 0 ? sortedHistory.map((entry, idx) => (
              <div key={idx} className="relative md:pr-24 group animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className={`absolute top-10 right-[40px] w-8 h-8 rounded-full border-4 border-white shadow-xl z-10 hidden md:block ${entry.type === 'hifz' ? (readOnly ? 'bg-indigo-500' : 'bg-cyan-500') : 'bg-teal-500'
                  }`}></div>
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:border-cyan-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${entry.type === 'hifz' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                          {entry.type === 'hifz' ? 'تسميع جديد' : 'مراجعة دورية'}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold font-mono bg-slate-50 px-4 py-2 rounded-xl">
                          <Calendar className="w-4 h-4" /> {entry.date}
                        </div>
                      </div>
                      <h6 className="text-3xl font-black text-slate-800 tracking-tight leading-none">سورة {entry.surah}</h6>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-32 text-center text-slate-300 font-bold bg-white border-4 border-dashed border-slate-100 rounded-[3rem]">
                <History className="w-20 h-20 mx-auto mb-6 opacity-10" />
                <p>لا توجد بيانات متابعة مسجلة حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Students Page Main Component
const Students: React.FC<{ onNavigateToFees?: (name: string) => void }> = ({ onNavigateToFees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { addNotification } = useNotifications();
  const { data: students, loading, refreshData } = useLocalCollection('students');
  const { data: teachers } = useLocalCollection('teachers');
  const { data: halls } = useLocalCollection('halls'); // Fetch halls

  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredStudents = useMemo(() => {
    let result = students;
    if (user?.role === UserRole.TEACHER && user.teacherId) {
      result = result.filter(s => s.teacherId === user.teacherId);
    }
    return result.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm, user]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    addLocalData('students', {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: formData.get('name') as string,
      birthDate: formData.get('birthDate') as string,
      address: formData.get('address') as string,
      guardianName: formData.get('guardianName') as string,
      guardianPhone: formData.get('guardianPhone') as string,
      teacherId: formData.get('teacherId') as string,
      hifzLevel: parseFloat(formData.get('hifzLevel') as string) || 0,
      behaviorScore: 100,
      attendanceRate: 100,
      paymentStatus: PaymentStatus.PENDING,
      lastRevision: '',
      progressHistory: []
    });

    setIsModalOpen(false);
    refreshData();
    addNotification('تمت إضافة الطالب', `تم تسجيل الطالب ${formData.get('name')} بنجاح.`, 'success');
  };

  const columns = [
    {
      header: 'اسم الطالب والملف الشخصي', accessor: (s: Student) => (
        <div className="flex items-center gap-5 py-2">
          <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-cyan-600 to-cyan-700 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-white">
            {s.name?.[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 text-xl tracking-tight leading-none">{s.name}</span>
          </div>
        </div>
      )
    },
    {
      header: 'مستوى الحفظ', accessor: (s: Student) => (
        <div className="flex flex-col gap-2.5 w-48">
          <div className="flex justify-between items-end text-[10px] font-black uppercase">
            <span className="text-cyan-700">المنجز: {s.hifzLevel.toFixed(1)} جزء</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-50">
            <div className="h-full bg-gradient-to-l from-cyan-600 to-cyan-400 rounded-full" style={{ width: `${(s.hifzLevel / 30) * 100}%` }} />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة شؤون الطلاب</h2>
          <p className="text-slate-500 mt-2 font-medium">قاعدة بيانات شاملة لطلاب المدرسة القرآنية</p>
        </div>
        {isAdmin && (
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-3 px-10 py-5 bg-cyan-600 text-white rounded-[1.75rem] shadow-2xl font-black">
            <UserPlus className="w-6 h-6" /> تسجيل طالب جديد
          </button>
        )}
      </header>

      <div className="relative group">
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
        <input type="text" placeholder="ابحث عن طالب..." className="block w-full pr-16 pl-6 py-5 bg-white border rounded-[2.5rem]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <DataTable data={filteredStudents} columns={columns} onView={(s) => setSelectedStudent(s)} />

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title="الملف الرقمي للطالب" size="xl">
        {selectedStudent && <StudentDetailsContent student={selectedStudent} teachers={teachers} halls={halls} onRefresh={refreshData} onNavigateToFees={onNavigateToFees} />}
      </Modal>

      {/* Add New Student Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل طالب جديد">
        <form onSubmit={handleAddStudent} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">اسم الطالب الرباعي</label>
            <input name="name" type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">تاريخ الميلاد</label>
              <input name="birthDate" type="date" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الحفظ السابق (أجزاء)</label>
              <input name="hifzLevel" type="number" step="0.1" defaultValue={0} min={0} max={30} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">المعلم / الحلقة المبدئية</label>
            <select name="teacherId" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <option value="">تحديد لاحقاً</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم ولي الأمر</label>
              <input name="guardianName" type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">رقم جوال ولي الأمر</label>
              <input name="guardianPhone" type="tel" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2 pb-4">
            <label className="text-sm font-bold text-slate-700">العنوان السكني</label>
            <input name="address" type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" />
          </div>

          <button type="submit" className="w-full py-4 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700 transition-all">
            اعتماد تسجيل الطالب
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Students;

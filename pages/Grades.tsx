
import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Star,
  BookOpen,
  Save,
  CheckCircle,
  Loader2,
  Book,
  Calendar,
  User,
  ChevronLeft,
  CreditCard,
  History,
  Info
} from 'lucide-react';
import { Student, ProgressEntry, PaymentStatus, UserRole } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useLocalCollection, updateLocalData } from '../hooks/useLocalDB';
import { useAuth } from '../context/AuthContext';

const Grades: React.FC = () => {
  const { user } = useAuth();
  const { data: students, loading, refreshData } = useLocalCollection('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [behaviorRating, setBehaviorRating] = useState(5);
  const { addNotification } = useNotifications();

  const filteredStudents = useMemo(() => {
    let list = students;
    if (user?.role === UserRole.TEACHER) {
      list = students.filter(s => s.teacherId === user.teacherId);
    }
    return list.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm, user]);

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSaving(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const newEntry: ProgressEntry = {
      date: new Date().toISOString().split('T')[0],
      surah: formData.get('surah') as string,
      fromAyah: parseInt(formData.get('fromAyah') as string),
      toAyah: parseInt(formData.get('toAyah') as string),
      type: formData.get('type') as 'hifz' | 'revision',
      grade: 'A' // Can be mapped from stars in a real scenario
    };

    // Update student data
    const currentHifz = selectedStudent.hifzLevel;
    const increment = newEntry.type === 'hifz' ? 0.05 : 0.01; // Small logic increment

    updateLocalData('students', selectedStudent.id, {
      lastRevision: newEntry.surah,
      hifzLevel: Math.min(30, currentHifz + increment),
      behaviorScore: (selectedStudent.behaviorScore + behaviorRating * 5) / 2, // Rolling average
      progressHistory: [newEntry, ...(selectedStudent.progressHistory || [])]
    });

    setTimeout(() => {
      setIsSaving(false);
      refreshData();
      addNotification(
        'تم تسجيل التقييم',
        `تم حفظ سجل سورة ${newEntry.surah} للطالب ${selectedStudent.name}`,
        'success'
      );
      // Update local state to show change
      const updated = JSON.parse(localStorage.getItem('nebras_students') || '[]').find((s: any) => s.id === selectedStudent.id);
      setSelectedStudent(updated);
    }, 1000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-700 min-h-[85vh]">

      {/* 1. Main Evaluation Form Area */}
      <div className="flex-1 space-y-8">
        {selectedStudent ? (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-cyan-600 rounded-2xl shadow-xl shadow-cyan-600/20 flex items-center justify-center text-white">
                  <Book className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    تقييم {selectedStudent.name}
                  </h2>
                  <p className="text-slate-400 font-bold text-sm mt-1">
                    تاريخ اليوم: {new Date().toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>

              {/* Subscription Badge */}
              <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all ${selectedStudent.paymentStatus === PaymentStatus.PAID
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">حالة الاشتراك: {selectedStudent.paymentStatus}</span>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Hifz Data Card */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-600"></div>
                    <h3 className="text-xl font-black text-slate-800">بيانات الحفظ الجديد</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نوع المتابعة</label>
                      <select name="type" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10 transition-all">
                        <option value="hifz">تسميع جديد (حفظ)</option>
                        <option value="revision">مراجعة (تكرار)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">السورة</label>
                      <select name="surah" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10 transition-all">
                        <option>الفاتحة</option>
                        <option>البقرة</option>
                        <option>آل عمران</option>
                        <option>النساء</option>
                        <option>المائدة</option>
                        <option>الأنعام</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">من آية</label>
                        <input name="fromAyah" type="number" defaultValue="1" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10 transition-all text-center" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">إلى آية</label>
                        <input name="toAyah" type="number" defaultValue="10" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10 transition-all text-center" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Behavior Card */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 group hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <h3 className="text-xl font-black text-slate-800">التقييم السلوكي</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">درجة الحفظ والأداء</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setBehaviorRating(star)}
                            className="transition-transform active:scale-90"
                          >
                            <Star className={`w-10 h-10 ${star <= behaviorRating ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ملاحظات المعلم</label>
                      <textarea
                        name="notes"
                        className="w-full p-5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-cyan-500/10 transition-all min-h-[160px] leading-relaxed"
                        placeholder="مثال: مخارج الحروف ممتازة، يحتاج للتركيز على المدود..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full md:w-fit px-16 py-6 bg-cyan-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-cyan-600/30 hover:bg-cyan-700 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                حفظ التقييم وتحديث السجل
              </button>
            </form>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ClipboardCheck className="w-12 h-12 opacity-20" />
            </div>
            <p className="text-xl font-black">يرجى اختيار طالب من القائمة للبدء</p>
            <p className="text-sm font-bold mt-2 opacity-60">يمكنك البحث عن الطالب بالاسم أو رقم القيد</p>
          </div>
        )}
      </div>

      {/* 2. Student Selector Sidebar */}
      <div className="w-full xl:w-96 space-y-6">
        <div className="relative group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-cyan-600 transition-colors" />
          <input
            type="text"
            placeholder="ابحث عن طالب..."
            className="w-full pr-14 pl-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-sm font-black focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-600" /> قائمة الطلاب النشطين
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-200" /></div>
            ) : filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full p-5 rounded-[1.75rem] flex items-center gap-4 transition-all mb-2 text-right group ${selectedStudent?.id === student.id
                    ? 'bg-cyan-50 border-2 border-cyan-100 shadow-lg shadow-cyan-600/5 translate-x-[-4px]'
                    : 'hover:bg-slate-50 border-2 border-transparent'
                  }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-all ${selectedStudent?.id === student.id
                    ? 'bg-cyan-600 text-white border-white shadow-lg'
                    : 'bg-slate-100 text-slate-400 border-transparent'
                  }`}>
                  {student.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-black text-slate-800 text-sm truncate">{student.name}</p>
                    <span className="text-[10px] font-black text-cyan-700 bg-cyan-100/50 px-2 py-0.5 rounded-lg">
                      جـ {student.hifzLevel.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter truncate">
                    آخر سورة: {student.lastRevision || 'جديد'}
                  </p>
                </div>

                <ChevronLeft className={`w-4 h-4 transition-all ${selectedStudent?.id === student.id ? 'text-cyan-600 translate-x-[-4px]' : 'text-slate-200 opacity-0 group-hover:opacity-100'
                  }`} />
              </button>
            ))}

            {filteredStudents.length === 0 && (
              <div className="py-20 text-center text-slate-400 italic text-sm">لا توجد نتائج مطابقة</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

// Internal icon for student list header
const Users = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

export default Grades;

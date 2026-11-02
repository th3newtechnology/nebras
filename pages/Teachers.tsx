
import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  GraduationCap,
  Calendar,
  Briefcase,
  Loader2,
  DoorOpen,
  CheckCircle2,
  Trash2,
  Users,
  Layers
} from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Teacher, Classroom } from '../types';
import { useLocalCollection, addLocalData, deleteLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';

const hallColorVariants = [
  'bg-cyan-50 text-cyan-700 border-cyan-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
];

/**
 * خوارزمية لتوليد لون ثابت للقاعة بناءً على اسمها
 */
const getHallStyle = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % hallColorVariants.length;
  return hallColorVariants[index];
};

const Teachers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHalls, setSelectedHalls] = useState<string[]>([]);

  const { addNotification } = useNotifications();
  const { data: teachers, loading, refreshData } = useLocalCollection('teachers');
  const { data: halls } = useLocalCollection('halls');

  const filteredTeachers = teachers.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get('teacherName') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const teacherId = Math.random().toString(36).substr(2, 9);

    addLocalData('teachers', {
      id: teacherId,
      name,
      qualification: formData.get('qualification'),
      experience: formData.get('experience'),
      specialization: formData.get('specialization'),
      joinDate: new Date().toISOString().split('T')[0],
      assignedHalls: selectedHalls
    });

    // Save as teacher account
    const accounts = JSON.parse(localStorage.getItem('nebras_teachers_accounts') || '[]');
    accounts.push({
      id: Math.random().toString(36).substr(2, 9),
      teacherId,
      teacherName: name,
      username,
      password,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('nebras_teachers_accounts', JSON.stringify(accounts));

    setIsModalOpen(false);
    setSelectedHalls([]);
    refreshData();
    addNotification('تمت إضافة المعلم', `تم تسجيل المعلم ${name} وتعيين ${selectedHalls.length} قاعة له.`, 'success');
  };

  const toggleHallSelection = (hallName: string) => {
    setSelectedHalls(prev =>
      prev.includes(hallName)
        ? prev.filter(h => h !== hallName)
        : [...prev, hallName]
    );
  };

  const columns = [
    {
      header: 'المعلم', accessor: (t: Teacher) => (
        <div className="flex items-center gap-4 py-1">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-teal-600/20 border-2 border-white transition-transform group-hover:scale-105">
              {t.name?.[0] || '?'}
            </div>
            {t.assignedHalls && t.assignedHalls.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                {t.assignedHalls.length}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-slate-800 text-base leading-none">{t.name}</span>
            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3 text-slate-300" />
              تخصص: {t.specialization}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'المؤهلات والخبرة', accessor: (t: Teacher) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-slate-600">
            <GraduationCap className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-[11px] font-black truncate max-w-[140px]">{t.qualification}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold">{t.experience} من الخبرة</span>
          </div>
        </div>
      )
    },
    {
      header: 'القاعات المسندة', accessor: (t: Teacher) => (
        <div className="flex flex-wrap gap-2 max-w-[240px]">
          {t.assignedHalls && t.assignedHalls.length > 0 ? (
            t.assignedHalls.map((hall, idx) => (
              <div key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all hover:shadow-sm ${getHallStyle(hall)}`}>
                <DoorOpen className="w-3 h-3 opacity-70" />
                {hall}
              </div>
            ))
          ) : (
            <div className="text-[10px] text-slate-400 font-black italic bg-slate-50 px-3 py-1.5 rounded-xl border border-dashed border-slate-200">
              بانتظار الإسناد
            </div>
          )}
        </div>
      )
    },
    {
      header: 'تاريخ الالتحاق', accessor: (t: Teacher) => (
        <div className="flex items-center gap-2 text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-black font-mono tracking-tighter">{t.joinDate}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">شؤون المعلمين</h2>
          <p className="text-slate-500 mt-2 font-medium">إدارة الكادر التعليمي وتوزيع المهام والمسؤوليات</p>
        </div>
        <button
          onClick={() => {
            setSelectedHalls([]);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-[1.25rem] hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/30 font-black active:scale-95 group"
        >
          <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          إضافة معلم جديد
        </button>
      </header>

      <div className="relative group">
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="ابحث عن معلم بالاسم أو التخصص..."
          className="block w-full pr-14 pl-6 py-4.5 bg-white border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm text-base font-medium placeholder:text-slate-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-80 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <p className="font-black tracking-wide">جاري مزامنة بيانات الكادر التعليمي...</p>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <DataTable
            data={filteredTeachers}
            columns={columns}
            onDelete={(t) => {
              if (confirm(`هل أنت متأكد من حذف بيانات المعلم ${t.name} نهائياً؟`)) {
                // Delete teacher record
                deleteLocalData('teachers', t.id);
                // Delete teacher account
                const accounts = JSON.parse(localStorage.getItem('nebras_teachers_accounts') || '[]');
                const filteredAccounts = accounts.filter((acc: any) => acc.teacherId !== t.id);
                localStorage.setItem('nebras_teachers_accounts', JSON.stringify(filteredAccounts));

                refreshData();
                addNotification('تم حذف المعلم', `تمت إزالة سجل المعلم ${t.name} بنجاح.`, 'info');
              }
            }}
          />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تسجيل معلم جديد في الكادر">
        <form className="space-y-6" onSubmit={handleAddTeacher}>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-widest">اسم المعلم الكامل</label>
            <input name="teacherName" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" placeholder="أدخل الاسم الرباعي للمعلم" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-widest">اسم المستخدم لبيانات الدخول</label>
              <input name="username" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-teal-500/10 transition-all font-mono font-bold" placeholder="user_123" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-widest">كلمة المرور</label>
              <input name="password" type="password" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-teal-500/10 transition-all font-mono font-bold" placeholder="••••••••" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-widest">التخصص</label>
              <input name="specialization" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" placeholder="مثال: القراءات العشر" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-widest">سنوات الخبرة</label>
              <input name="experience" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" placeholder="مثال: 10 سنوات" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 mr-2 uppercase tracking-widest">المؤهلات العلمية</label>
            <textarea name="qualification" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm min-h-[100px] focus:ring-4 focus:ring-teal-500/10 transition-all font-bold" placeholder="أدخل الشهادات والإجازات الحاصل عليها المعلم" required></textarea>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-600 mr-2 flex items-center gap-2 uppercase tracking-widest">
              <DoorOpen className="w-4 h-4 text-teal-600" />
              تعيين القاعات الدراسية
            </label>
            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
              {halls.length > 0 ? halls.map((hall: Classroom) => (
                <button
                  key={hall.id}
                  type="button"
                  onClick={() => toggleHallSelection(hall.name)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-right transition-all group/item ${selectedHalls.includes(hall.name)
                    ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm'
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black">{hall.name}</span>
                    <span className="text-[9px] font-bold opacity-60 flex items-center gap-1 mt-1">
                      <Users className="w-2.5 h-2.5" />
                      سعة {hall.capacity} طالب
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedHalls.includes(hall.name) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-300'
                    }`}>
                    {selectedHalls.includes(hall.name) ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-1.5 h-1.5 bg-current rounded-full" />}
                  </div>
                </button>
              )) : (
                <div className="col-span-full py-6 text-center text-[10px] text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-bold">
                  لا توجد قاعات معرفة في النظام حالياً
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="w-full bg-teal-600 text-white py-5 rounded-[1.5rem] font-black hover:bg-teal-700 shadow-xl shadow-teal-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4">
            <CheckCircle2 className="w-5 h-5" />
            حفظ ملف المعلم واعتماد الإسناد
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Teachers;

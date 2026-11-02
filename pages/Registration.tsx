
import React, { useState, useMemo } from 'react';
import { 
  UserPlus2, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  History, 
  Loader2, 
  CheckSquare, 
  Users, 
  Trash2, 
  UserPlus, 
  FileSearch, 
  ChevronLeft, 
  ArrowUpRight,
  ClipboardList,
  Target,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import { useLocalCollection, addLocalData, updateLocalData, deleteLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import { Application, PaymentStatus } from '../types';
import Modal from '../components/Modal';

const Registration: React.FC = () => {
  const { data: applications, loading, refreshData } = useLocalCollection('applications');
  const { data: students, refreshData: refreshStudents } = useLocalCollection('students');
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'waiting_list' | 'rejected'>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const filteredApps = useMemo(() => {
    return applications
      .filter(app => {
        const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             app.guardianPhone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      waiting: applications.filter(a => a.status === 'waiting_list').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
    };
  }, [applications]);

  const handleCreateSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    addLocalData('applications', {
      studentName: formData.get('studentName'),
      birthDate: formData.get('birthDate'),
      guardianName: formData.get('guardianName'),
      guardianPhone: formData.get('guardianPhone'),
      address: formData.get('address'),
      status: 'pending',
      timestamp: new Date().toISOString(),
      notes: formData.get('notes')
    });

    setIsFormModalOpen(false);
    refreshData();
    addNotification('طلب جديد', 'تم استلام طلب تقديم جديد بنجاح.', 'success');
  };

  const handleUpdateStatus = (app: Application, newStatus: 'accepted' | 'rejected' | 'waiting_list') => {
    if (newStatus === 'accepted') {
      // Logic for accepting: Add to students collection
      addLocalData('students', {
        name: app.studentName,
        birthDate: app.birthDate,
        address: app.address,
        guardianName: app.guardianName,
        guardianPhone: app.guardianPhone,
        teacherId: '', // Unassigned initially
        hifzLevel: 0,
        behaviorScore: 100,
        attendanceRate: 100,
        paymentStatus: PaymentStatus.PENDING,
        lastRevision: 'جديد (مقبول)',
        progressHistory: []
      });
      refreshStudents();
      addNotification('تم القبول', `تم تحويل ${app.studentName} إلى سجل الطلاب بنجاح.`, 'success');
    }

    updateLocalData('applications', app.id, { status: newStatus });
    refreshData();
    setSelectedApp(null);
    if (newStatus !== 'accepted') {
      addNotification('تحديث الحالة', 'تم تحديث حالة الطلب بنجاح.', 'info');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
      deleteLocalData('applications', id);
      refreshData();
      addNotification('تم الحذف', 'تم مسح سجل الطلب من النظام.', 'info');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">التسجيل والقبول</h2>
          <p className="text-slate-500 mt-2 font-medium">إدارة طلبات الالتحاق الجديدة وعمليات الفرز والاعتماد</p>
        </div>
        <button 
          onClick={() => setIsFormModalOpen(true)}
          className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[2rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 font-black active:scale-95 group"
        >
          <UserPlus2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
          محاكاة تقديم طلب
        </button>
      </header>

      {/* Stats Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي الطلبات</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">قيد المراجعة</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.pending}</h3>
          </div>
          <div className="bg-amber-50 p-4 rounded-3xl text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-1">قائمة الانتظار</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.waiting}</h3>
          </div>
          <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-500">
            <History className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between border-b-4 border-b-emerald-500/30">
          <div>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">تم القبول</p>
            <h3 className="text-3xl font-black text-slate-800">{stats.accepted}</h3>
          </div>
          <div className="bg-emerald-50 p-4 rounded-3xl text-emerald-500">
            <BadgeCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ابحث عن اسم طالب أو رقم هاتف..." 
              className="w-full pr-14 pl-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 gap-1">
            {(['all', 'pending', 'waiting_list', 'accepted', 'rejected'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  statusFilter === f 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'الكل' : 
                 f === 'pending' ? 'مراجعة' : 
                 f === 'waiting_list' ? 'انتظار' : 
                 f === 'accepted' ? 'مقبول' : 'مرفوض'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">جاري فرز الطلبات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">اسم الطالب / الطلب</th>
                  <th className="px-10 py-6">ولي الأمر والتواصل</th>
                  <th className="px-10 py-6">تاريخ التقديم</th>
                  <th className="px-10 py-6">الحالة الحالية</th>
                  <th className="px-10 py-6 text-left">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredApps.map(app => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 border-white shadow-sm ${
                          app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' :
                          app.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {app.studentName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-lg leading-none">{app.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">رقم الطلب: #{app.id.slice(0, 6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="text-sm font-black text-slate-700">{app.guardianName}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{app.guardianPhone}</p>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                        {new Date(app.timestamp).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black border ${
                        app.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        app.status === 'waiting_list' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          app.status === 'pending' ? 'bg-amber-500' :
                          app.status === 'accepted' ? 'bg-emerald-500' :
                          app.status === 'waiting_list' ? 'bg-indigo-500' : 'bg-rose-500'
                        }`} />
                        {app.status === 'pending' ? 'تحت المراجعة' :
                         app.status === 'accepted' ? 'تم القبول' :
                         app.status === 'waiting_list' ? 'قائمة انتظار' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-left">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                        >
                          معالجة الطلب
                        </button>
                        <button 
                          onClick={() => handleDelete(app.id)}
                          className="p-2.5 text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-32 text-center text-slate-400 font-black italic">
                      <FileSearch className="w-12 h-12 mx-auto mb-4 opacity-10" />
                      لا توجد طلبات تقديم مطابقة حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Modal */}
      <Modal 
        isOpen={!!selectedApp} 
        onClose={() => setSelectedApp(null)} 
        title="معالجة طلب الالتحاق"
        size="md"
      >
        {selectedApp && (
          <div className="space-y-10">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-3xl font-black text-indigo-600">
                   {selectedApp.studentName[0]}
                 </div>
                 <div>
                   <h4 className="text-xl font-black text-slate-800">{selectedApp.studentName}</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">ولي الأمر: {selectedApp.guardianName}</p>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-black uppercase mb-1">تاريخ الميلاد</p>
                     <p className="text-sm font-black text-slate-700">{selectedApp.birthDate}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100">
                     <p className="text-[10px] text-slate-400 font-black uppercase mb-1">رقم الجوال</p>
                     <p className="text-sm font-black text-slate-700 font-mono">{selectedApp.guardianPhone}</p>
                  </div>
               </div>
               {selectedApp.notes && (
                 <div className="mt-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                   <p className="text-[10px] text-amber-600 font-black uppercase mb-1">ملاحظات التقديم</p>
                   <p className="text-xs font-bold text-slate-600 leading-relaxed">{selectedApp.notes}</p>
                 </div>
               )}
            </div>

            <div className="space-y-4">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">اتخاذ قرار بشأن الطلب</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp, 'accepted')}
                    className="flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all group"
                  >
                    <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-black">اعتماد وقبول</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp, 'waiting_list')}
                    className="flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all group"
                  >
                    <Clock className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-black">قائمة انتظار</span>
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedApp, 'rejected')}
                    className="flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all group"
                  >
                    <XCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-black">رفض الطلب</span>
                  </button>
               </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Simulation Form Modal */}
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)} 
        title="محاكاة نموذج تقديم خارجي"
      >
        <form onSubmit={handleCreateSimulation} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اسم الطالب المرشح</label>
              <input name="studentName" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="أدخل الاسم الكامل" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">تاريخ الميلاد</label>
              <input name="birthDate" type="date" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">اسم ولي الأمر</label>
              <input name="guardianName" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">رقم جوال التواصل</label>
              <input name="guardianPhone" type="tel" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black font-mono focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="05XXXXXXXX" required />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">عنوان السكن</label>
            <input name="address" type="text" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-500/10 transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest mr-2">ملاحظات إضافية</label>
            <textarea name="notes" className="w-full p-4.5 bg-slate-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[100px]" placeholder="أي تفاصيل أخرى تهم إدارة القبول..."></textarea>
          </div>
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[1.75rem] font-black text-lg shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98]">
            إرسال طلب التقديم للنظام
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Registration;

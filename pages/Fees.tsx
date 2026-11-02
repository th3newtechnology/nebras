
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Loader2, 
  DollarSign, 
  ChevronLeft,
  X,
  // Fix: Added missing Users import
  Users
} from 'lucide-react';
import DataTable from '../components/DataTable';
import { Student, PaymentStatus, NotificationType } from '../types';
import { useLocalCollection, updateLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';

const Fees: React.FC<{ initialSearch?: string; onSearchClear?: () => void }> = ({ initialSearch, onSearchClear }) => {
  const { data: students, loading, refreshData } = useLocalCollection('students');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.guardianPhone.includes(searchTerm)
  );

  const clearSearch = () => {
    setSearchTerm('');
    onSearchClear?.();
  };

  const setPaymentStatus = (student: Student, status: PaymentStatus) => {
    updateLocalData('students', student.id, { paymentStatus: status });
    refreshData();
    
    let notifyType: NotificationType = 'info';
    if (status === PaymentStatus.PAID) notifyType = 'success';
    if (status === PaymentStatus.OVERDUE) notifyType = 'error';

    addNotification(
      'تحديث الحالة المالية',
      `تم تحديث حالة الطالب ${student.name} إلى: ${status}`,
      notifyType
    );
  };

  const columns = [
    { header: 'اسم الطالب والرقم المرجعي', accessor: (s: Student) => (
      <div className="flex items-center gap-4 py-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 flex items-center justify-center font-black text-lg border-2 border-white shadow-sm">
          {s.name[0]}
        </div>
        <div className="flex flex-col">
          <span className="font-black text-slate-800 text-base leading-tight tracking-tight">{s.name}</span>
          <span className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">قيد: #{s.id.slice(0, 5).toUpperCase()}</span>
        </div>
      </div>
    )},
    { header: 'معلومات التواصل', accessor: (s: Student) => (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black text-slate-700">{s.guardianName}</span>
        <span className="text-[10px] text-slate-400 font-mono tracking-tighter bg-slate-50 w-fit px-2 py-1 rounded-lg border border-slate-100">{s.guardianPhone}</span>
      </div>
    )},
    { header: 'الحالة الحالية للسداد', accessor: (s: Student) => {
      const config = {
        [PaymentStatus.PAID]: { 
          color: 'text-emerald-800 bg-emerald-100 border-emerald-200 shadow-emerald-100/50', 
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 
        },
        [PaymentStatus.PENDING]: { 
          color: 'text-amber-800 bg-amber-100 border-amber-200 shadow-amber-100/50', 
          icon: <Clock className="w-5 h-5 text-amber-600" /> 
        },
        [PaymentStatus.OVERDUE]: { 
          color: 'text-rose-800 bg-rose-100 border-rose-200 shadow-rose-100/50', 
          icon: <AlertTriangle className="w-5 h-5 text-rose-600" /> 
        },
      }[s.paymentStatus] || { 
        color: 'text-slate-400 bg-slate-50 border-slate-100', 
        icon: <Clock className="w-5 h-5 text-slate-400" /> 
      };
      
      return (
        <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[11px] font-black border shadow-sm transition-all duration-300 ${config.color}`}>
          {config.icon}
          {s.paymentStatus}
        </div>
      );
    }},
    { header: 'إجراءات السداد', accessor: (s: Student) => (
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => setPaymentStatus(s, PaymentStatus.PAID)}
          className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 group relative ${
            s.paymentStatus === PaymentStatus.PAID 
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20' 
            : 'bg-white text-emerald-600 border-emerald-100 hover:bg-emerald-50'
          }`}
          title="تعيين كمدفوع"
        >
          <CheckCircle2 className="w-4.5 h-4.5" />
          <span className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">تسجيل سداد</span>
        </button>
        <button 
          onClick={() => setPaymentStatus(s, PaymentStatus.PENDING)}
          className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 group relative ${
            s.paymentStatus === PaymentStatus.PENDING 
            ? 'bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20' 
            : 'bg-white text-amber-600 border-amber-100 hover:bg-amber-50'
          }`}
          title="تعيين كمستحق"
        >
          <Clock className="w-4.5 h-4.5" />
          <span className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">قيد الانتظار</span>
        </button>
        <button 
          onClick={() => setPaymentStatus(s, PaymentStatus.OVERDUE)}
          className={`p-3 rounded-2xl border transition-all hover:scale-110 active:scale-95 group relative ${
            s.paymentStatus === PaymentStatus.OVERDUE 
            ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-600/20' 
            : 'bg-white text-rose-600 border-rose-100 hover:bg-rose-50'
          }`}
          title="تعيين كمتأخر"
        >
          <AlertTriangle className="w-4.5 h-4.5" />
          <span className="absolute bottom-full mb-3 right-1/2 translate-x-1/2 px-2.5 py-1.5 bg-slate-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl">تسجيل تأخير</span>
        </button>
      </div>
    )},
    { header: 'المبلغ المستحق', accessor: () => (
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1.5 text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <span className="font-black text-lg leading-none tracking-tighter">500</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ر.س</span>
        </div>
      </div>
    )},
  ];

  const totalPaid = students.filter(s => s.paymentStatus === PaymentStatus.PAID).length * 500;
  const totalPending = students.filter(s => s.paymentStatus !== PaymentStatus.PAID).length * 500;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">إدارة الشؤون المالية</h2>
          <p className="text-slate-500 mt-2 font-medium">متابعة تحصيل رسوم الدورات القرآنية والتدفقات المالية</p>
        </div>
        
        <div className="flex flex-wrap gap-5">
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="p-4 bg-emerald-50 rounded-[1.25rem] text-emerald-600 group-hover:rotate-12 transition-transform">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">إجمالي الإيرادات</p>
              <p className="text-2xl font-black text-emerald-700 leading-none">{totalPaid.toLocaleString()} <span className="text-sm font-bold opacity-60">ر.س</span></p>
            </div>
          </div>
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm group hover:border-amber-200 transition-all hover:shadow-xl hover:shadow-amber-500/5">
            <div className="p-4 bg-amber-50 rounded-[1.25rem] text-amber-600 group-hover:rotate-12 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">رسوم قيد التحصيل</p>
              <p className="text-2xl font-black text-amber-700 leading-none">{totalPending.toLocaleString()} <span className="text-sm font-bold opacity-60">ر.س</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-5">
        <div className="relative flex-1 group">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-cyan-600 transition-colors" />
          <input 
            type="text" 
            placeholder="ابحث عن طالب بالاسم أو رقم الجوال..."
            className="w-full pr-16 pl-8 py-5 bg-white border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-cyan-500/5 focus:border-cyan-500 outline-none transition-all shadow-sm text-lg font-medium placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={clearSearch}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-slate-200 text-slate-700 rounded-[2.5rem] hover:bg-slate-50 transition-all font-black text-sm shadow-sm active:scale-95 border-b-4 border-b-slate-100">
          <Filter className="w-5 h-5 text-slate-400" />
          تصفية النتائج
        </button>
      </div>

      {initialSearch && (
        <div className="bg-cyan-50 border border-cyan-100 px-6 py-3 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white rounded-xl shadow-sm">
                <Users className="w-4 h-4 text-cyan-600" />
             </div>
             <p className="text-sm font-black text-cyan-800">أنت تستعرض السجل المالي لـ: {initialSearch}</p>
          </div>
          <button onClick={clearSearch} className="text-xs font-black text-cyan-600 hover:underline">عرض جميع الطلاب</button>
        </div>
      )}

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <Loader2 className="w-20 h-20 animate-spin text-cyan-600/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-cyan-600" />
            </div>
          </div>
          <p className="text-slate-400 font-black tracking-widest uppercase text-xs">جاري مزامنة السجلات المالية...</p>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <DataTable 
            data={filteredStudents} 
            columns={columns}
          />
        </div>
      )}
    </div>
  );
};

export default Fees;

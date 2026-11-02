
import React, { useState } from 'react';
import { DoorOpen, Users, User, Plus, MoreVertical, Loader2, Trash2 } from 'lucide-react';
import { useLocalCollection, addLocalData, deleteLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import Modal from '../components/Modal';

const Halls: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotifications();
  const { data: halls, loading, refreshData } = useLocalCollection('halls');
  const { data: teachers } = useLocalCollection('teachers');

  const handleAddHall = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get('hallName') as string;
    
    addLocalData('halls', {
      name,
      teacherId: formData.get('teacherId'),
      studentCount: 0,
      capacity: parseInt(formData.get('capacity') as string) || 15
    });

    setIsModalOpen(false);
    refreshData();
    addNotification('تم إنشاء القاعة', `تمت إضافة القاعة ${name} بنجاح.`, 'success');
  };

  const handleDeleteHall = (id: string, name: string) => {
    if (confirm(`حذف القاعة ${name}؟`)) {
      deleteLocalData('halls', id);
      refreshData();
      addNotification('تم الحذف', 'تم حذف القاعة من النظام المحلي', 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">القاعات الدراسية</h2>
          <p className="text-slate-500 mt-1">توزيع الحلقات على القاعات المتاحة</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all font-bold shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" />
          إضافة قاعة
        </button>
      </header>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-cyan-600" />
          <p className="font-bold">جاري تحميل القاعات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => {
            const teacher = teachers.find(t => t.id === hall.teacherId);
            const occupancyRate = (hall.studentCount / hall.capacity) * 100;
            
            return (
              <div key={hall.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-cyan-50 p-3 rounded-xl">
                      <DoorOpen className="w-6 h-6 text-cyan-600" />
                    </div>
                    <button 
                      onClick={() => handleDeleteHall(hall.id, hall.name)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{hall.name}</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="w-4 h-4" />
                      <span className="text-sm">المعلم: <span className="text-slate-800 font-medium">{teacher?.name || 'غير معين'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">الطلاب: <span className="text-slate-800 font-medium">{hall.studentCount} / {hall.capacity}</span></span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>نسبة الإشغال</span>
                      <span>{Math.round(occupancyRate)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          occupancyRate > 90 ? 'bg-rose-500' : 'bg-cyan-600'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {halls.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              لا توجد قاعات مضافة حالياً.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة قاعة جديدة">
        <form className="space-y-5" onSubmit={handleAddHall}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">اسم القاعة</label>
            <input name="hallName" type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm" placeholder="مثال: قاعة النور" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">السعة الاستيعابية</label>
              <input name="capacity" type="number" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm" defaultValue="15" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600">المعلم المسؤول</label>
              <select name="teacherId" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm">
                <option value="">اختر معلماً...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-cyan-600 text-white py-3 rounded-2xl font-bold hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-600/20">تأكيد الإضافة</button>
        </form>
      </Modal>
    </div>
  );
};

export default Halls;

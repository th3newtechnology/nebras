
import React, { useState } from 'react';
import { Megaphone, Plus, Calendar, Bell, ShieldAlert, CheckCircle, Loader2, Trash2, Send } from 'lucide-react';
import { useLocalCollection, addLocalData, deleteLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import Modal from '../components/Modal';

const Events: React.FC = () => {
  const { data: announcements, loading, refreshData } = useLocalCollection('announcements');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNotification } = useNotifications();

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const title = formData.get('title') as string;

    addLocalData('announcements', {
      title,
      content: formData.get('content'),
      type: formData.get('type') || 'info',
      date: new Date().toISOString().split('T')[0]
    });

    setIsModalOpen(false);
    refreshData();
    addNotification('تم النشر', `تم نشر الإعلان: ${title}`, 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل تريد حذف هذا الإعلان؟')) {
      deleteLocalData('announcements', id);
      refreshData();
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">الأحداث والإعلانات</h2>
          <p className="text-slate-500 mt-1">مركز التواصل مع المجتمع المدرسي</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 font-bold"
        >
          <Plus className="w-4 h-4" />
          إعلان جديد
        </button>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
              <div className={`absolute top-0 right-0 w-1.5 h-full ${
                ann.type === 'info' ? 'bg-cyan-500' : ann.type === 'warning' ? 'bg-amber-500' : 'bg-green-500'
              }`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    ann.type === 'info' ? 'bg-cyan-50 text-cyan-600' : ann.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {ann.type === 'info' ? <Bell className="w-5 h-5" /> : ann.type === 'warning' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{ann.title}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {ann.date}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(ann.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {ann.content}
              </p>
              
              <div className="flex justify-end pt-4 border-t border-slate-50">
                <button className="flex items-center gap-2 text-[10px] font-bold text-cyan-600 hover:text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
                  <Send className="w-3 h-3" />
                  إرسال كرسالة SMS للجميع
                </button>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
              لا توجد إعلانات نشطة حالياً.
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء إعلان رسمي">
        <form onSubmit={handleAddAnnouncement} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">عنوان الإعلان</label>
            <input name="title" type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">نوع الإعلان</label>
            <select name="type" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm">
              <option value="info">إعلامي عام</option>
              <option value="warning">تنبيه هام</option>
              <option value="success">تهنئة / نجاح</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">نص الإعلان</label>
            <textarea name="content" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm min-h-[120px]" required></textarea>
          </div>
          <button type="submit" className="w-full bg-amber-500 text-white py-3.5 rounded-2xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20">نشر الإعلان الآن</button>
        </form>
      </Modal>
    </div>
  );
};

export default Events;


import React, { useState } from 'react';
import { CalendarDays, Clock, User, DoorOpen, Plus, Loader2, Trash2, Move } from 'lucide-react';
import { useLocalCollection, addLocalData, deleteLocalData, updateLocalData } from '../hooks/useLocalDB';
import { useNotifications } from '../context/NotificationContext';
import Modal from '../components/Modal';

const Timetable: React.FC = () => {
  const { data: timetable, loading, refreshData } = useLocalCollection('timetable');
  const { data: teachers } = useLocalCollection('teachers');
  const { data: halls } = useLocalCollection('halls');
  const { addNotification } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: string; time: string } | null>(null);

  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  const times = ['04:00', '05:00', '06:00', '07:00'];

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    addLocalData('timetable', {
      subject: formData.get('subject'),
      day: formData.get('day'),
      time: formData.get('time'),
      teacherId: formData.get('teacherId'),
      hallId: formData.get('hallId')
    });

    setIsModalOpen(false);
    refreshData();
    addNotification('تم تحديث الجدول', 'تمت إضافة الحصة الدراسية الجديدة بنجاح.', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الحصة؟')) {
      deleteLocalData('timetable', id);
      refreshData();
      addNotification('تم الحذف', 'تمت إزالة الحصة من الجدول الدراسي.', 'info');
    }
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('sessionId', id);
    e.dataTransfer.effectAllowed = 'move';
    // Visual feedback for the ghost image
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const onDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    setDraggedId(null);
    setDropTarget(null);
  };

  const onDragOver = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    setDropTarget({ day, time });
  };

  const onDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData('sessionId');
    if (!sessionId) return;

    // Update the session in local DB
    updateLocalData('timetable', sessionId, { day, time });
    
    setDraggedId(null);
    setDropTarget(null);
    refreshData();
    
    const session = timetable.find(s => s.id === sessionId);
    addNotification(
      'تم نقل الحصة', 
      `تم نقل "${session?.subject}" إلى يوم ${day} الساعة ${time}`, 
      'info'
    );
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">الجداول الدراسية</h2>
          <p className="text-slate-500 mt-1 font-medium">إدارة مواعيد الحلقات وتوزيع القاعات (اسحب الحصص لتغيير موعدها)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-8 py-3.5 bg-cyan-600 text-white rounded-[1.25rem] hover:bg-cyan-700 transition-all font-bold shadow-xl shadow-cyan-600/30 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          إضافة حصة جديدة
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-10 overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header Days Row */}
          <div className="grid grid-cols-6 mb-6">
            <div className="p-4"></div>
            {days.map(day => (
              <div key={day} className="p-4 text-center font-bold text-slate-800 bg-slate-50 rounded-2xl mx-1.5 border border-slate-100 shadow-sm flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4 text-cyan-600" />
                {day}
              </div>
            ))}
          </div>
          
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-600 mb-4" />
              <p className="font-bold">جاري تحميل الجدول الدراسي...</p>
            </div>
          ) : (
            times.map(time => (
              <div key={time} className="grid grid-cols-6 items-stretch border-b border-slate-50 last:border-0">
                {/* Time Label Column */}
                <div className="p-6 flex flex-col items-center justify-center bg-slate-50/30 rounded-l-3xl">
                  <span className="text-xs font-black text-slate-400 font-mono flex items-center gap-1.5 uppercase tracking-tighter">
                    <Clock className="w-4 h-4" />
                    {time} م
                  </span>
                </div>

                {/* Days Slots */}
                {days.map(day => {
                  const sessions = timetable.filter(s => s.day === day && s.time === time);
                  const isDropTarget = dropTarget?.day === day && dropTarget?.time === time;

                  return (
                    <div 
                      key={`${day}-${time}`} 
                      className={`p-3 min-h-[180px] transition-all duration-200 border-x border-slate-50/50 ${
                        isDropTarget ? 'bg-cyan-50/50 scale-[1.02] z-10' : ''
                      }`}
                      onDragOver={(e) => onDragOver(e, day, time)}
                      onDrop={(e) => onDrop(e, day, time)}
                    >
                      <div className="h-full flex flex-col gap-3">
                        {sessions.map(session => {
                          const teacher = teachers.find(t => t.id === session.teacherId);
                          const hall = halls.find(h => h.id === session.hallId);
                          const isBeingDragged = draggedId === session.id;

                          return (
                            <div 
                              key={session.id} 
                              draggable
                              onDragStart={(e) => onDragStart(e, session.id)}
                              onDragEnd={onDragEnd}
                              className={`bg-white border-2 border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all cursor-grab active:cursor-grabbing group relative ${
                                isBeingDragged ? 'opacity-30 scale-95 border-dashed' : ''
                              }`}
                            >
                              <div className="absolute top-2 left-2 flex gap-1">
                                <button 
                                  onClick={() => handleDelete(session.id)}
                                  className="p-1.5 bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                                  title="حذف الحصة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <div className="p-1.5 text-slate-300 opacity-0 group-hover:opacity-100">
                                  <Move className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              <p className="text-sm font-extrabold text-slate-800 leading-tight line-clamp-2 pl-6">
                                {session.subject}
                              </p>
                              
                              <div className="space-y-2 pt-1 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-[10px] text-cyan-700 font-bold bg-cyan-50/50 w-fit px-2 py-1 rounded-md">
                                  <User className="w-3 h-3" />
                                  {teacher?.name || 'بدون معلم'}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-teal-700 font-bold bg-teal-50/50 w-fit px-2 py-1 rounded-md">
                                  <DoorOpen className="w-3 h-3" />
                                  {hall?.name || 'بدون قاعة'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {sessions.length === 0 && (
                          <div className={`h-full rounded-2xl border-2 border-dashed transition-colors flex items-center justify-center group/empty ${
                            isDropTarget ? 'border-cyan-300 bg-cyan-100/30' : 'border-slate-50 hover:bg-slate-50/50'
                          }`}>
                            <Plus className={`w-5 h-5 opacity-0 group-hover/empty:opacity-20 text-slate-400 transition-opacity`} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة حصة جديدة للجدول">
        <form onSubmit={handleAddSession} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 mr-1">اسم المادة أو الحلقة</label>
            <input name="subject" type="text" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 shadow-inner" placeholder="مثال: مراجعة جزء تبارك" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 mr-1">اليوم الدراسي</label>
              <select name="day" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 shadow-inner appearance-none">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 mr-1">توقيت الحصة</label>
              <select name="time" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 shadow-inner appearance-none">
                {times.map(t => <option key={t} value={t}>{t} مساءً</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 mr-1">المعلم المشرف</label>
              <select name="teacherId" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 shadow-inner appearance-none">
                <option value="">اختر معلماً...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 mr-1">القاعة الدراسية</label>
              <select name="hallId" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-cyan-500/20 shadow-inner appearance-none">
                <option value="">اختر قاعة...</option>
                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-cyan-600 text-white py-4 rounded-2xl font-bold hover:bg-cyan-700 shadow-xl shadow-cyan-600/30 transition-all active:scale-[0.98]">
            اعتماد الحصة في الجدول
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Timetable;


import React from 'react';
import { Bell, Trash2, Check, Clock } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, clearAll } = useNotifications();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 origin-top-left duration-200">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">التنبيهات</h3>
          <button onClick={clearAll} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1">
            <Trash2 className="w-3 h-3" />
            مسح الكل
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 relative group ${!n.read ? 'bg-cyan-50/30' : ''}`}
                onClick={() => markAsRead(n.id)}
              >
                <div className={`w-2 h-2 rounded-full absolute top-5 right-2 ${!n.read ? 'bg-cyan-600' : 'bg-transparent'}`}></div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    {n.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {!n.read && (
                  <button className="opacity-0 group-hover:opacity-100 p-1 bg-white rounded-lg shadow-sm border border-slate-100 text-cyan-600">
                    <Check className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">لا توجد تنبيهات حالياً</p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
            <button className="text-[10px] font-bold text-cyan-700 hover:underline">عرض جميع الإشعارات</button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;

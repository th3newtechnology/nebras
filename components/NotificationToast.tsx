
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { NotificationType } from '../types';

interface ToastProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, title, message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    info: <Info className="w-5 h-5 text-cyan-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    warning: 'bg-amber-50 border-amber-100',
    error: 'bg-rose-50 border-rose-100',
    info: 'bg-cyan-50 border-cyan-100',
  };

  return (
    <div className={`flex items-start gap-4 p-4 mb-3 rounded-2xl border shadow-lg transition-all duration-300 ${bgColors[type]} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-600 mt-1">{message}</p>
      </div>
      <button onClick={() => onClose(id)} className="text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const NotificationContainer: React.FC<{ notifications: any[], onRemove: (id: string) => void }> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed bottom-6 left-6 z-[100] w-80 pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map(n => (
          <Toast key={n.id} {...n} onClose={onRemove} />
        ))}
      </div>
    </div>
  );
};

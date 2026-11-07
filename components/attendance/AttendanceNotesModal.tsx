import React, { useState, useEffect } from 'react';
import { X, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { AttendanceStatus } from '../../types/pedagogical.types';

interface AttendanceNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  status: AttendanceStatus;
  currentDelay: number;
  currentNotes: string;
  onSave: (delayMinutes: number, notes: string) => void;
}

export const AttendanceNotesModal: React.FC<AttendanceNotesModalProps> = ({
  isOpen,
  onClose,
  studentName,
  status,
  currentDelay,
  currentNotes,
  onSave,
}) => {
  const [delay, setDelay] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setDelay(currentDelay || 0);
    setNotes(currentNotes || '');
  }, [currentDelay, currentNotes, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(delay, notes);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-islamic-950 to-islamic-900 text-white flex items-center justify-between border-b border-gold-500/30">
          <div>
            <h3 className="text-base font-black font-amiri text-gold-300">
              تفاصيل {status === 'late' ? 'التأخر' : status === 'excused' ? 'الغياب بعذر' : 'الملاحظات'}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">الطالب: <strong>{studentName}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-bold">
          {status === 'late' && (
            <div className="space-y-1.5">
              <label className="text-slate-700 block">مدة التأخر بالدقائق</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={delay}
                  onChange={e => setDelay(parseInt(e.target.value) || 0)}
                  className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-700 block">
              {status === 'excused' ? 'سبب أو عذر الغياب' : 'ملاحظات إضافية'}
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="اكتب العذر أو الملاحظة هنا..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl font-black shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ التفاصيل</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

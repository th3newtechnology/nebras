import React from 'react';
import { X, Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { PublicEvent } from '../../hooks/usePublicData';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface EventDetailModalProps {
  event: PublicEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const containerRef = useFocusTrap(!!event, onClose);

  if (!event) return null;

  // تنسيق التاريخ للعربية
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-DZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الترويسة */}
        <div className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-950 text-white p-6 sm:p-8 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-ivory-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="إغلاق تفاصيل الفعالية"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="space-y-2">
            <span className="text-xs text-gold-400 font-bold bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20 inline-block">
              الأنشطة والفعاليات العامة
            </span>
            <h3 id="event-modal-title" className="text-xl sm:text-2xl font-black text-white font-amiri leading-tight">
              {event.title}
            </h3>
          </div>
        </div>

        {/* جسم النافذة */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* بيانات الموعد والمكان */}
          <div className="bg-ivory-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-xs text-slate-800">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gold-600 shrink-0" aria-hidden="true" />
              <span><strong>التاريخ:</strong> {formatDate(event.eventDate)}</span>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>
                  <strong>التوقيت:</strong> {event.startTime || 'مساءً'} {event.endTime ? `إلى ${event.endTime}` : ''}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-islamic-700 shrink-0" aria-hidden="true" />
              <span><strong>المكان:</strong> {event.location || 'جامع إبراهيم الخليل'}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-sky-700 shrink-0" aria-hidden="true" />
              <span><strong>الفئة المستهدفة:</strong> متاح لجميع أولياء الأمور والطلاب والمهتمين</span>
            </div>
          </div>

          {/* الوصف والبرنامج */}
          <div className="space-y-2">
            <h4 className="text-sm font-black text-slate-900">نبذة عن النشاط والبرنامج</h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {event.description}
            </p>
          </div>

          {/* تنويه الحضور والالتزام */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5 text-[11px] text-emerald-950 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>
              الدعوة عامة لحضور الفعالية وتكريم أهل القرآن، يرجى الحضور قبل الموعد بـ ١٥ دقيقة لضمان حسن التنظيم.
            </span>
          </div>

          {/* زر الإغلاق */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-islamic-800 text-white text-xs font-bold hover:bg-islamic-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
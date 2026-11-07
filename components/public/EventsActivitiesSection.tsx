import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Award,
  ChevronLeft,
  Users,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { PublicEvent } from '../../hooks/usePublicData';
import { Badge } from '../ui/Badge';

const EventDetailModal = React.lazy(() =>
  import('./EventDetailModal').then((m) => ({ default: m.EventDetailModal }))
);

interface EventsActivitiesSectionProps {
  events: PublicEvent[];
  isLoading?: boolean;
}

export const EventsActivitiesSection: React.FC<EventsActivitiesSectionProps> = ({
  events,
  isLoading = false
}) => {
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null);

  // تصفية أمنية صارمة إضافية: الفعاليات العامة للجميع فقط
  const publicEvents = events.filter(
    (e) => (e.targetAudience || '').toLowerCase() === 'all'
  );

  // استخراج اليوم والشهر للتصميم التقويمي
  const parseDateParts = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const monthName = d.toLocaleDateString('ar-DZ', { month: 'short' });
      const year = d.getFullYear();
      return { day: day.toString(), monthName, year: year.toString() };
    } catch {
      return { day: '١٥', monthName: 'شعبان', year: '١٤٤٧' };
    }
  };

  return (
    <section id="events" className="py-24 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold" size="md">
            الأنشطة والمسابقات
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-islamic-950 font-amiri leading-tight">
            فعاليات ومسابقات مدرسة نبراس القرآن
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            أنشطة قرآنية متجددة، مسابقات تنافسية سنوية، وحفلات تكريم دورية لتحفيز الطلاب والطالبات وربطهم بروح المنافسة الشريفة.
          </p>
        </div>

        {/* شبكة الفعاليات */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((n) => (
              <div key={n} className="bg-ivory-50 rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-8 bg-slate-200 rounded w-3/4" />
                <div className="h-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : publicEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publicEvents.map((event) => {
              const { day, monthName, year } = parseDateParts(event.eventDate);
              return (
                <div
                  key={event.id}
                  className="bg-ivory-50/70 rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-gold-300 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-5">
                    {/* الكتلة العلوية: كتلة التاريخ المشرقة وشارة الفعالية */}
                    <div className="flex items-start justify-between gap-4">
                      {/* كتلة التقويم */}
                      <div className="bg-gradient-to-b from-islamic-900 to-islamic-950 text-white rounded-2xl p-3 text-center min-w-[70px] shadow-md shadow-islamic-900/20 shrink-0">
                        <span className="block font-amiri text-2xl font-black text-gold-300 leading-none">
                          {day}
                        </span>
                        <span className="block text-[11px] font-bold text-ivory-200 mt-1 uppercase">
                          {monthName}
                        </span>
                        <span className="block text-[9px] text-ivory-300/80">
                          {year}
                        </span>
                      </div>

                      {/* شارة النشاط */}
                      <div className="text-left">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-100 text-gold-900 text-xs font-bold border border-gold-200">
                          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                          <span>فعالية عامة</span>
                        </span>
                      </div>
                    </div>

                    {/* عنوان ووصف الفعالية */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-amiri leading-tight group-hover:text-islamic-800 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                    </div>

                    {/* بيانات المكان والوقت */}
                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                      {event.location && (
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                          <span>{event.location}</span>
                        </span>
                      )}

                      {(event.startTime || event.endTime) && (
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{event.startTime || ''} {event.endTime ? `— ${event.endTime}` : ''}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* زر عرض التفاصيل */}
                  <div className="pt-6 mt-4 border-t border-slate-200/60 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>الدعوة عامة للحضور</span>
                    </span>

                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="inline-flex items-center gap-1 text-xs font-black text-islamic-800 hover:text-gold-600 transition-colors"
                    >
                      <span>تفاصيل الفعالية</span>
                      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-ivory-50 rounded-3xl p-12 text-center space-y-4 border border-slate-200 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gold-100 text-gold-800 mx-auto flex items-center justify-center">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 font-amiri">
              لا توجد فعاليات معلنة حالياً
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ترقبوا قريباً الإعلان عن مواعيد المسابقات القرآنية الدورية وحفلات تكريم الحفظة للموسم القادم.
            </p>
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الفعالية */}
      {selectedEvent && (
        <React.Suspense fallback={null}>
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        </React.Suspense>
      )}
    </section>
  );
};
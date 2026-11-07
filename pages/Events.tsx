import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Calendar,
  Plus,
  Loader2,
  Trash2,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Bell,
  Pin,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users,
} from 'lucide-react';
import {
  EventItem,
  AnnouncementItem,
  TargetAudience,
  AnnouncementType,
} from '../types/communication.types';
import {
  fetchEvents,
  fetchAnnouncements,
  toggleEventPublished,
  deleteEvent,
  deleteAnnouncement,
  toggleAnnouncementPinned,
} from '../lib/eventsService';
import { EventFormModal } from '../components/communication/EventFormModal';
import { AnnouncementFormModal } from '../components/communication/AnnouncementFormModal';
import { useNotifications } from '../context/NotificationContext';

const AUDIENCE_LABEL: Record<TargetAudience, string> = {
  all: 'الجميع',
  guardians: 'أولياء الأمور',
  teachers: 'المحفظون',
  students: 'الطلاب',
};

const ANNOUNCEMENT_TYPE_CONFIG: Record<
  AnnouncementType,
  { label: string; badgeStyle: string; icon: any }
> = {
  info: { label: 'معلومات', badgeStyle: 'bg-sky-50 text-sky-800 border-sky-200', icon: Info },
  warning: { label: 'تنبيه هام', badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200', icon: AlertTriangle },
  success: { label: 'بشارة / إنجاز', badgeStyle: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  urgent: { label: 'عاجل', badgeStyle: 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse', icon: Bell },
};

const Events: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');

  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const { addNotification } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [eventsRes, annRes] = await Promise.all([
        fetchEvents(),
        fetchAnnouncements(),
      ]);
      setEvents(eventsRes.events);
      setAnnouncements(annRes.announcements);
      setIsLive(eventsRes.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(
      e =>
        !searchTerm ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [events, searchTerm]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(
      a =>
        !searchTerm ||
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [announcements, searchTerm]);

  // Toggle Event Published Status
  const handleTogglePublished = async (event: EventItem) => {
    const nextState = !event.isPublished;
    const res = await toggleEventPublished(event.id, nextState);
    if (res.success) {
      setEvents(prev =>
        prev.map(e => (e.id === event.id ? { ...e, isPublished: nextState } : e))
      );
      addNotification(
        'تم تحديث النشر',
        `تم ${nextState ? 'نشر الفعالية في الموقع العام' : 'إخفاء الفعالية من الموقع العام'}.`,
        'success'
      );
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف الفعالية "${title}"؟`)) {
      const res = await deleteEvent(id);
      if (res.success) {
        addNotification('تم الحذف', 'تم حذف الفعالية بنجاح.', 'info');
        loadData();
      }
    }
  };

  // Toggle Announcement Pin
  const handleTogglePin = async (announcement: AnnouncementItem) => {
    const nextPin = !announcement.isPinned;
    const res = await toggleAnnouncementPinned(announcement.id, nextPin);
    if (res.success) {
      setAnnouncements(prev =>
        prev.map(a => (a.id === announcement.id ? { ...a, isPinned: nextPin } : a))
      );
      loadData();
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف الإعلان "${title}"؟`)) {
      const res = await deleteAnnouncement(id);
      if (res.success) {
        addNotification('تم الحذف', 'تمت إزالة الإعلان بنجاح.', 'info');
        loadData();
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>مركز الأنشطة والإعلام المدرسي</span>
              </span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {isLive ? '● متصل بقاعدة البيانات' : '○ وضع العرض المحلي'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black font-amiri text-gold-300">
              إدارة الفعاليات والأنشطة والإعلانات
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              جدولة مسابقات الحفظ السنوية والندوات، التحكم بنشر الأنشطة في الموقع العام لمسجد إبراهيم الخليل، وبث التنبيهات والإعلانات للمجتمع المدرسي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            {activeTab === 'events' ? (
              <button
                onClick={() => {
                  setEventToEdit(null);
                  setIsEventModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة فعالية جديدة</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAnnouncementModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>نشر إعلان جديد</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'events'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-gold-400" />
          <span>الفعاليات والأنشطة القرآنية ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'announcements'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4 text-gold-400" />
          <span>الإعلانات المدرسية والتنبيهات ({announcements.length})</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'events'
                ? 'ابحث باسم الفعالية، الوصف، أو المكان...'
                : 'ابحث في عنوان الإعلان أو نصه...'
            }
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-islamic-800"
          />
        </div>
      </section>

      {/* Content: TAB 1 (Events) */}
      {activeTab === 'events' && (
        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل الفعاليات والأنشطة...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-2 text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد فعاليات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-islamic-700/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group p-6 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {AUDIENCE_LABEL[event.targetAudience]}
                      </span>

                      <button
                        onClick={() => handleTogglePublished(event)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-all ${
                          event.isPublished
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title="انقر لتغيير حالة النشر في الموقع العام"
                      >
                        {event.isPublished ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            <span>منشورة بالموقع العام</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>مسودة داخلية</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h3 className="font-black text-slate-900 font-amiri text-lg group-hover:text-islamic-900 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {event.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-islamic-800" />
                        <span className="font-mono text-slate-700">{event.eventDate}</span>
                        {event.startTime && (
                          <span className="font-mono text-slate-500 text-[11px]">
                            ({event.startTime} - {event.endTime || 'نهاية الحفل'})
                          </span>
                        )}
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gold-600" />
                          <span className="text-slate-700 truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <button
                      onClick={() => {
                        setEventToEdit(event);
                        setIsEventModalOpen(true);
                      }}
                      className="text-islamic-800 hover:underline text-[11px]"
                    >
                      تعديل التفاصيل
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                      title="حذف الفعالية"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Content: TAB 2 (Announcements) */}
      {activeTab === 'announcements' && (
        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل الإعلانات المدرسية...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-2 text-slate-400">
              <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد إعلانات منشورة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAnnouncements.map(ann => {
                const typeCfg = ANNOUNCEMENT_TYPE_CONFIG[ann.announcementType];
                const TypeIcon = typeCfg.icon;

                return (
                  <div
                    key={ann.id}
                    className={`bg-white rounded-3xl border shadow-xs hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between relative overflow-hidden group ${
                      ann.isPinned ? 'border-gold-400 ring-2 ring-gold-400/20' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 ${typeCfg.badgeStyle}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeCfg.label}</span>
                          </span>

                          {ann.isPinned && (
                            <span className="px-2 py-0.5 rounded-lg bg-gold-50 text-gold-800 border border-gold-300 font-bold text-[10px] flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              <span>مثبت بأعلى اللوحة</span>
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleTogglePin(ann)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            ann.isPinned
                              ? 'text-gold-600 bg-gold-50'
                              : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={ann.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </div>

                      <h3 className="font-black text-slate-900 font-amiri text-lg group-hover:text-islamic-900 transition-colors">
                        {ann.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
                      <span className="font-mono text-[11px]">
                        نشر في: {ann.publishDate}
                        {ann.expiryDate && ` — ينتهي في: ${ann.expiryDate}`}
                      </span>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                        className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                        title="حذف الإعلان"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={loadData}
        eventToEdit={eventToEdit}
      />

      <AnnouncementFormModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Events;

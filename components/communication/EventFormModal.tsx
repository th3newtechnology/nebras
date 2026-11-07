import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  EventItem,
  CreateEventDTO,
  UpdateEventDTO,
  TargetAudience,
} from '../../types/communication.types';
import { createEvent, updateEvent } from '../../lib/eventsService';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: EventItem | null;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  eventToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description);
      setEventDate(eventToEdit.eventDate);
      setStartTime(eventToEdit.startTime || '09:00');
      setEndTime(eventToEdit.endTime || '12:00');
      setLocation(eventToEdit.location || '');
      setTargetAudience(eventToEdit.targetAudience);
      setIsPublished(eventToEdit.isPublished);
    } else {
      setTitle('');
      setDescription('');
      setEventDate(new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('12:00');
      setLocation('مسجد إبراهيم الخليل');
      setTargetAudience('all');
      setIsPublished(true);
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('يرجى إدخال عنوان ووصف الفعالية');
      return;
    }
    if (!eventDate) {
      setError('يرجى تحديد تاريخ الفعالية');
      return;
    }

    setLoading(true);

    try {
      if (eventToEdit) {
        const dto: UpdateEventDTO = {
          title,
          description,
          eventDate,
          startTime,
          endTime,
          location: location.trim() || undefined,
          targetAudience,
          isPublished,
        };

        const res = await updateEvent(eventToEdit.id, dto);
        if (!res.success) {
          setError(res.error || 'فشل تحديث بيانات الفعالية');
          setLoading(false);
          return;
        }
      } else {
        const dto: CreateEventDTO = {
          title,
          description,
          eventDate,
          startTime,
          endTime,
          location: location.trim() || undefined,
          targetAudience,
          isPublished,
        };

        const res = await createEvent(dto);
        if (!res.success) {
          setError(res.error || 'فشل إنشاء الفعالية');
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">
                {eventToEdit ? 'تعديل الفعالية القرآنية' : 'إضافة فعالية قرآنية جديدة'}
              </h3>
              <p className="text-xs text-slate-300">
                تنظيم الندوات والمسابقات وحفلات التكريم بمسجد إبراهيم الخليل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-bold">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">عنوان الفعالية *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: الحفل السنوي لتكريم حفظة القرآن الكريم"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">وصف الفعالية والبرنامج *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="تفاصيل الفعالية، فقرات البرنامج، وشروط المشاركة..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 leading-relaxed"
            />
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">تاريخ إقامة الفعالية *</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">المكان / القاعة</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="مثال: المسجد الكبير - قاعة الصديق"
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">وقت البداية</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">وقت النهاية</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Target Audience & Publishing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">الجمهور المستهدف</label>
              <select
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value as TargetAudience)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="all">عام لجميع رواد المسجد والطلاب</option>
                <option value="guardians">أولياء الأمور خاصة</option>
                <option value="teachers">هيئة التحفيظ والتدريس</option>
                <option value="students">الطلاب والطالبات</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">حالة النشر في الموقع العام</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={e => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-700">
                  {isPublished ? 'منشورة بالموقع العام للمسجد' : 'مسودة داخلية (غير منشورة)'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 font-black"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{eventToEdit ? 'حفظ التعديلات' : 'نشر الفعالية'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

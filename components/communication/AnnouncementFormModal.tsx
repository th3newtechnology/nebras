import React, { useState, useEffect } from 'react';
import {
  X,
  Megaphone,
  Pin,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  AnnouncementItem,
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementType,
  TargetRole,
} from '../../types/communication.types';
import { createAnnouncement } from '../../lib/eventsService';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('info');
  const [isPinned, setIsPinned] = useState(false);
  const [publishDate, setPublishDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [targetRole, setTargetRole] = useState<TargetRole>('all');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle('');
    setContent('');
    setAnnouncementType('info');
    setIsPinned(false);
    setPublishDate(new Date().toISOString().split('T')[0]);
    setExpiryDate('');
    setTargetRole('all');
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('يرجى كتابة عنوان ونص الإعلان');
      return;
    }

    setLoading(true);

    try {
      const dto: CreateAnnouncementDTO = {
        title,
        content,
        announcementType,
        isPinned,
        publishDate: publishDate || new Date().toISOString().split('T')[0],
        expiryDate: expiryDate || null,
        targetRole,
      };

      const res = await createAnnouncement(dto);
      if (!res.success) {
        setError(res.error || 'فشل نشر الإعلان');
        setLoading(false);
        return;
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
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">نشر إعلان مدرسي جديد</h3>
              <p className="text-xs text-slate-300">
                بث التنبيهات والإشعارات الهامة للمجتمع المدرسي
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
            <label className="text-slate-700 block">عنوان الإعلان *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: موعد اختبارات التقييم الفصلي"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">نص الإعلان والتفاصيل *</label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب نص الإعلان والتوجيهات بدقة..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 leading-relaxed"
            />
          </div>

          {/* Type & Target Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">تصنيف الإعلان</label>
              <select
                value={announcementType}
                onChange={e => setAnnouncementType(e.target.value as AnnouncementType)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="info">معلومات عامة (أزرق)</option>
                <option value="warning">تنبيه هام (برتقالي)</option>
                <option value="success">بشارة / تهنئة (أخضر)</option>
                <option value="urgent">عاجل وفوري (أحمر)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">الفئة المستهدفة</label>
              <select
                value={targetRole}
                onChange={e => setTargetRole(e.target.value as TargetRole)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="all">كافة المستخدمين (الجميع)</option>
                <option value="TEACHER">هيئة التحفيظ خاصة</option>
                <option value="GUARDIAN">أولياء الأمور فقط</option>
                <option value="STUDENT">الطلاب</option>
              </select>
            </div>
          </div>

          {/* Dates & Pinned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">تاريخ النشر</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={publishDate}
                  onChange={e => setPublishDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">تاريخ الانتهاء (اختياري)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Pin in top */}
          <div className="pt-2 flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
            </label>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-gold-600" />
              <span>تثبيت الإعلان في أعلى اللوحة</span>
            </span>
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
              <span>نشر الإعلان</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

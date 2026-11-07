import React, { useCallback, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Calendar, ShieldCheck } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'CIRCLES' | 'MOSQUE' | 'HONOR' | 'LIBRARY';
  categoryLabel: string;
  description: string;
  date: string;
  imageUrl: string;
  aspectRatio?: 'square' | 'wide' | 'tall';
}

interface GalleryLightboxModalProps {
  item: GalleryItem | null;
  items: GalleryItem[];
  onClose: () => void;
  onNavigate: (newItem: GalleryItem) => void;
}

export const GalleryLightboxModal: React.FC<GalleryLightboxModalProps> = ({
  item,
  items,
  onClose,
  onNavigate
}) => {
  const containerRef = useFocusTrap(!!item, onClose);
  const currentIndex = items.findIndex((i) => i.id === item?.id);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(items[currentIndex - 1]);
    } else {
      onNavigate(items[items.length - 1]);
    }
  }, [currentIndex, items, onNavigate]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate(items[currentIndex + 1]);
    } else {
      onNavigate(items[0]);
    }
  }, [currentIndex, items, onNavigate]);

  // التحكم بمفاتيح الأسهم
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePrev(); // في نمط RTL السهم الأيمن يرجع للسابق
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNext(); // والسهم الأيسر يتقدم للتالي
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="عرض الصورة بالحجم الكامل"
    >
      <div ref={containerRef} className="contents">
        {/* زر الإغلاق العلوي */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 left-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="إغلاق المعرض"
        >
          <X className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* زر الصورة السابقة (يمين في RTL) */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="الصورة السابقة"
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* زر الصورة التالية (يسار في RTL) */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          aria-label="الصورة التالية"
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* المحتوى المركزي */}
        <div
          className="relative max-w-4xl w-full bg-islamic-950/90 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* الصورة الرئيسية */}
          <div className="w-full md:w-3/5 bg-black/40 flex items-center justify-center min-h-[300px] md:min-h-[460px] max-h-[70vh] p-4">
            <img
              src={item.imageUrl}
              alt={item.title}
              decoding="async"
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-lg"
              onError={(e) => {
                // استبدال آمن عند فشل تحميل الصورة الخارجية
                e.currentTarget.onerror = null;
                e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23064e3b'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fbbf24' font-size='26' font-family='sans-serif'%3Eمدرسة نبراس القرآن%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* لوحة المعلومات الجانبية */}
          <div className="w-full md:w-2/5 p-6 sm:p-8 text-white space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30">
                  {item.categoryLabel}
                </span>
                <span className="text-xs text-ivory-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-400" aria-hidden="true" />
                  {item.date}
                </span>
              </div>

              <h3 className="text-2xl font-black font-amiri text-white leading-snug">
                {item.title}
              </h3>

              <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-ivory-300">
              <div className="flex items-center gap-1.5 text-gold-400">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>معتمدة ضمن الضوابط التربوية والشرعية</span>
              </div>
              <p className="text-slate-300">
                صورة {currentIndex + 1} من {items.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Camera,
  Eye,
  ShieldCheck,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { GalleryItem } from './GalleryLightboxModal';

const GalleryLightboxModal = React.lazy(() =>
  import('./GalleryLightboxModal').then((m) => ({ default: m.GalleryLightboxModal }))
);

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'المصحف الشريف وكرسي التلاوة',
    category: 'CIRCLES',
    categoryLabel: 'أجواء الحلقات',
    description: 'المصاحف الشريفة بروايتي ورش وقالون وحفص مهيأة لطلاب الحلقات في رحاب المسجد.',
    date: 'الموسم القرآني الحالي',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'square'
  },
  {
    id: 'g2',
    title: 'محراب ومصلى جامع إبراهيم الخليل',
    category: 'MOSQUE',
    categoryLabel: 'معالم المسجد والصرح',
    description: 'العمارة الإسلامية الروحانية الهادئة التي توفر بيئة خشوع وطمأنينة لحلقات التحفيظ اليومية.',
    date: 'المقر العام للمدرسة',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'wide'
  },
  {
    id: 'g3',
    title: 'دروع وشهادات تكريم الحفظة والخاتمين',
    category: 'HONOR',
    categoryLabel: 'التكريم والجوائز',
    description: 'تكريم كوكبة من الطلاب الحافظين لكتاب الله في الحفل السنوي لختام الموسم الدراسي.',
    date: 'حفل التكريم السنوي',
    imageUrl: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'square'
  },
  {
    id: 'g4',
    title: 'المكتبة القرآنية ومتون التجويد والقراءات',
    category: 'LIBRARY',
    categoryLabel: 'المكتبة والمتون',
    description: 'مجموعة قيمة من كتب التفسير، رسم المصحف، ومنظومات التجويد (الجزرية وتحفة الأطفال).',
    date: 'المكتبة المرجعية',
    imageUrl: 'https://images.unsplash.com/photo-1507842229458-57790e1c2789?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'tall'
  },
  {
    id: 'g5',
    title: 'حلقات الذكر والمدارسة المسائية',
    category: 'CIRCLES',
    categoryLabel: 'أجواء الحلقات',
    description: 'جلسات التسميع الفردي والمراجعة الجماعية في هدوء المسجد بعد صلاة العصر.',
    date: 'أفواج الناشئة والبراعم',
    imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'wide'
  },
  {
    id: 'g6',
    title: 'الزخرفة الإسلامية والخط العربي الشريف',
    category: 'MOSQUE',
    categoryLabel: 'معالم المسجد والصرح',
    description: 'نقوش قرآنية وبديع الخط الكوفي والثلث الذي يزين جدران وأروقة مسجد إبراهيم الخليل.',
    date: 'أروقة المسجد',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'square'
  }
];

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'ALL') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-ivory-50 via-white to-ivory-50 border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="islamic" size="md">
            المعرض البصري
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-islamic-950 font-amiri leading-tight">
            معرض الصور وأجواء الصرح القرآني
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            لقطات بصرية حية تنقل عبق الحلقات القرآنية، وأروقة مسجد إبراهيم الخليل، ومناسبات تكريم أهل القرآن وخاصته.
          </p>
        </div>

        {/* أزرار التصفية البصرية */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: 'ALL', label: 'كافة الصور' },
            { id: 'CIRCLES', label: 'أجواء الحلقات' },
            { id: 'MOSQUE', label: 'معالم المسجد والصرح' },
            { id: 'HONOR', label: 'التكريم والجوائز' },
            { id: 'LIBRARY', label: 'المكتبة والمتون' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-islamic-800 text-white shadow-md shadow-islamic-800/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* شبكة الصور المتجاوبة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group cursor-pointer bg-white rounded-[2rem] border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-300 transition-all duration-300 flex flex-col"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxItem(item);
                }
              }}
              aria-label={item.title}
            >
              {/* حاوية الصورة */}
              <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  width="400"
                  height="300"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // استبدال احترافي بنمط هندسي إسلامي ناعم في حال انقطاع الشبكة
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23065f46'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fbbf24' font-size='20' font-family='sans-serif'%3Eمدرسة نبراس القرآن%3C/text%3E%3C/svg%3E";
                  }}
                />

                {/* طبقة تظليل وتحويم لطيفة */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* شارة الفئة أعلى الصورة */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/90 text-islamic-950 shadow-sm backdrop-blur-sm">
                    {item.categoryLabel}
                  </span>
                </div>

                {/* أيقونة المعاينة عند التحويم */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-gold-500 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>

                {/* عنوان الصورة فوق الطبقة المظللة */}
                <div className="absolute bottom-4 right-4 left-4 text-white z-10">
                  <h3 className="text-base sm:text-lg font-black font-amiri leading-tight text-white drop-shadow-md">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-ivory-200 mt-0.5 line-clamp-1">
                    {item.date}
                  </p>
                </div>
              </div>

              {/* وصف مختصر أسفل البطاقة */}
              <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-islamic-800">
                  <span>انقر لعرض الصورة بالحجم الكامل</span>
                  <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* تنويه حماية خصوصية الطلاب */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-600 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-islamic-50 text-islamic-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="space-y-0.5 text-center sm:text-right">
            <h4 className="font-bold text-slate-900">ضوابط الخصوصية والصور في مدرسة نبراس</h4>
            <p className="text-slate-500 leading-relaxed">
              تلتزم المدرسة بالضوابط الشرعية والنظامية الصارمة لحماية خصوصية الطلاب والناشئة، وجميع الصور المنشورة تعكس البيئة التعليمية العامة للمسجد والأنشطة المعتمدة دون كشف أي بيانات شخصية.
            </p>
          </div>
        </div>
      </div>

      {/* نافذة العرض المكبرة (Lightbox) */}
      {lightboxItem && (
        <React.Suspense fallback={null}>
          <GalleryLightboxModal
            item={lightboxItem}
            items={filteredItems}
            onClose={() => setLightboxItem(null)}
            onNavigate={(newItem) => setLightboxItem(newItem)}
          />
        </React.Suspense>
      )}
    </section>
  );
};
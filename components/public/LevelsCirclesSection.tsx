import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  UserCheck,
  Award
} from 'lucide-react';
import { PublicCircle } from '../../hooks/usePublicData';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface LevelsCirclesSectionProps {
  circles: PublicCircle[];
  isLoading?: boolean;
  onSelectRegister?: () => void;
}

type FilterCategory = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'IJAZAH';

export const LevelsCirclesSection: React.FC<LevelsCirclesSectionProps> = ({
  circles,
  isLoading = false,
  onSelectRegister
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('ALL');

  // الترجمة الموحدة للمستويات
  const translateLevel = (levelStr: string) => {
    const l = levelStr.toUpperCase();
    if (l.includes('BEGINNER') || l.includes('براعم') || l.includes('مبتدئ')) return 'مستوى البراعم والتأسيس';
    if (l.includes('INTERMEDIATE') || l.includes('متوسط')) return 'مستوى الحفظ المتدرج';
    if (l.includes('ADVANCED') || l.includes('متقدم') || l.includes('خاتم')) return 'مستوى الإتقان والتثبيت';
    if (l.includes('IJAZAH') || l.includes('إجازة') || l.includes('سند')) return 'مسار الإجازة بالسند المتصل';
    return levelStr;
  };

  const translateGender = (genderStr: string) => {
    const g = (genderStr || '').toUpperCase();
    if (g === 'MALE' || g === 'بنين') return 'بنين (ذكور)';
    if (g === 'FEMALE' || g === 'بنات') return 'بنات (إناث)';
    return 'متاح لجميع الفئات';
  };

  // تصفية الحلقات المعروضة
  const filteredCircles = useMemo(() => {
    if (selectedFilter === 'ALL') return circles;
    return circles.filter((c) => {
      const lvl = (c.level || '').toUpperCase();
      if (selectedFilter === 'BEGINNER') return lvl.includes('BEGINNER') || lvl.includes('مبتدئ') || lvl.includes('براعم');
      if (selectedFilter === 'INTERMEDIATE') return lvl.includes('INTERMEDIATE') || lvl.includes('متوسط');
      if (selectedFilter === 'ADVANCED') return lvl.includes('ADVANCED') || lvl.includes('متقدم');
      if (selectedFilter === 'IJAZAH') return lvl.includes('IJAZAH') || lvl.includes('إجازة') || lvl.includes('سند');
      return true;
    });
  }, [circles, selectedFilter]);

  // المسارات الأربعة المعتمدة للمدرسة
  const educationalTracks = [
    {
      id: 'track-1',
      title: 'مسار البراعم والناشئة',
      age: 'من ٥ إلى ١٠ سنوات',
      focus: 'التلقين وتصحيح النطق',
      curriculum: 'جزء عم وجزء تبارك مع آداب المسجد والقرآن',
      color: 'border-t-emerald-600',
      badgeVariant: 'success' as const,
      icon: Sparkles
    },
    {
      id: 'track-2',
      title: 'مسار الحفظ المرحلي المتدرج',
      age: 'من ١١ إلى ١٥ سنة',
      focus: 'الحفظ المنهجي والتجويد العملي',
      curriculum: 'حفظ من ٥ إلى ١٥ جزءاً مع أحكام النون والميم والمدود',
      color: 'border-t-gold-500',
      badgeVariant: 'gold' as const,
      icon: BookOpen
    },
    {
      id: 'track-3',
      title: 'مسار الحفظ المكثف والخاتمين',
      age: '١٦ سنة فما فوق',
      focus: 'إتمام المصحف وضبط المتشابهات',
      curriculum: 'حفظ القرآن كاملاً ومراجعة حزبين يومياً مع اختبارات الأجزاء',
      color: 'border-t-islamic-800',
      badgeVariant: 'islamic' as const,
      icon: GraduationCap
    },
    {
      id: 'track-4',
      title: 'مسار الإتقان والإجازة بالسند',
      age: 'للحَفَظة المتقنين',
      focus: 'العرض غيباً ونيل السند المتصل',
      curriculum: 'ختمة كاملة برواية ورش أو حفص ودراسة متن الجزرية',
      color: 'border-t-amber-600',
      badgeVariant: 'warning' as const,
      icon: Award
    }
  ];

  return (
    <section id="levels" className="py-24 bg-white border-y border-slate-100 relative">
      {/* مرساة بديلة للتوافق مع الروابط القديمة */}
      <span id="programs" className="sr-only" tabIndex={-1} aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold" size="md">
            الهيكلية التعليمية
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-islamic-950 font-amiri leading-tight">
            المستويات والأقسام والحلقات القرآنية
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            منهجية تربوية متدرجة تضمن ارتقاء الطالب خطوة بخطوة من التلقين الأولي إلى إتمام حفظ كتاب الله ونيل الإجازة بالسند المتصل.
          </p>
        </div>

        {/* 1. خريطة المسارات المعتمدة (Educational Tracks) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-amiri">
              المسارات التعليمية المعتمدة في مدرسة نبراس
            </h3>
            <span className="text-xs text-slate-500 font-bold hidden sm:inline-block">
              تدرج مدروس يناسب جميع الفئات العمرية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {educationalTracks.map((track, idx) => {
              const TrackIcon = track.icon;
              return (
                <div
                  key={track.id}
                  className={`bg-ivory-50/60 rounded-3xl p-6 border border-slate-200/70 border-t-4 ${track.color} shadow-sm hover:shadow-md transition-all duration-300 space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700">
                        <TrackIcon className="w-5 h-5 text-gold-600" />
                      </div>
                      <Badge variant={track.badgeVariant} size="sm">
                        المرحلة {idx + 1}
                      </Badge>
                    </div>

                    <div>
                      <h4 className="text-lg font-black text-slate-900 font-amiri leading-tight">
                        {track.title}
                      </h4>
                      <p className="text-xs font-bold text-gold-700 mt-1">{track.age}</p>
                    </div>

                    <div className="pt-2 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-start gap-1.5 font-bold text-slate-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>التركيز: {track.focus}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed pr-5">
                        {track.curriculum}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>متابعة يومية دقيقة</span>
                    <span>اختبارات مرحلية</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. جدول الحلقات النشطة الفعلية (Live Circles) */}
        <div className="bg-ivory-50/80 rounded-[3rem] p-6 sm:p-10 border border-slate-200/80 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black text-islamic-800 uppercase">الحلقات المقامة في المسجد</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-amiri">
                دليل الحلقات القرآنية النشطة
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                تقام الحلقات يومياً بقاعات ومصليات مسجد إبراهيم الخليل
              </p>
            </div>

            {/* أزرار الفلترة السريعة */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-islamic-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                جميع الحلقات ({circles.length})
              </button>
              <button
                onClick={() => setSelectedFilter('BEGINNER')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'BEGINNER'
                    ? 'bg-islamic-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                البراعم والتأسيس
              </button>
              <button
                onClick={() => setSelectedFilter('INTERMEDIATE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'INTERMEDIATE'
                    ? 'bg-islamic-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                المتوسط
              </button>
              <button
                onClick={() => setSelectedFilter('ADVANCED')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'ADVANCED'
                    ? 'bg-islamic-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                المتقدم والخاتمون
              </button>
              <button
                onClick={() => setSelectedFilter('IJAZAH')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedFilter === 'IJAZAH'
                    ? 'bg-islamic-800 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                الإجازات والسند
              </button>
            </div>
          </div>

          {/* شبكة الحلقات */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
                  <div className="h-6 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-16 bg-slate-50 rounded" />
                </div>
              ))}
            </div>
          ) : filteredCircles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCircles.map((circle) => (
                <div
                  key={circle.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-gold-300 transition-all duration-300 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {translateLevel(circle.level)}
                      </span>
                      <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-islamic-700" />
                        {translateGender(circle.targetGender)}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-slate-900 font-amiri">
                      {circle.name}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      حلقة قرآنية منتظمة تعتني بضبط الأداء والمتابعة الفردية للطالب مع إشراف شيخ الحلقة.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gold-600" />
                        <span>سعة الحلقة المقررة:</span>
                      </span>
                      <span className="font-bold text-slate-900">{circle.capacity || 15} مقعداً كحد أقصى</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-islamic-700" />
                        <span>أوقات الانعقاد:</span>
                      </span>
                      <span className="font-bold text-slate-700">يومياً بعد صلاة العصر</span>
                    </div>

                    {onSelectRegister && (
                      <button
                        onClick={onSelectRegister}
                        className="w-full mt-2 py-2.5 rounded-xl bg-islamic-50 text-islamic-900 hover:bg-islamic-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>الاستفسار والتسجيل في هذه الحلقة</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center space-y-4 border border-slate-200 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gold-50 text-gold-700 mx-auto flex items-center justify-center">
                <Layers className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 font-amiri">
                لا توجد حلقات معروضة حالياً ضمن هذا التصنيف
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                يجري تجهيز مواعيد وتوزيعات الحلقات للموسم القرآني القادم. يمكنكم اختيار تصنيف آخر أو التواصل مع الإدارة.
              </p>
              <button
                onClick={() => setSelectedFilter('ALL')}
                className="px-5 py-2 rounded-xl bg-islamic-800 text-white text-xs font-bold hover:bg-islamic-900 transition-colors"
              >
                عرض كافة الحلقات
              </button>
            </div>
          )}

          {/* تنويه تنظيمي */}
          <div className="p-4 rounded-2xl bg-gold-50/70 border border-gold-200/80 flex items-center gap-3 text-xs text-gold-900 font-medium">
            <ShieldCheck className="w-5 h-5 text-gold-700 shrink-0" />
            <span>
              نظام المدرسة يحدد السعة القصوى بـ ١٥ طالباً للحلقة الواحدة ضماناً لأعلى مستويات الرعاية والإتقان الفردي.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
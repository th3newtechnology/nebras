import React, { useState } from 'react';
import {
  UserPlus,
  Sparkles,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  ChevronLeft,
  MapPin,
  Phone
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SCHOOL_INFO } from '../../constants';

const RegistrationModal = React.lazy(() =>
  import('./RegistrationModal').then((m) => ({ default: m.RegistrationModal }))
);

interface RegistrationSectionProps {
  onDirectRegistration?: () => void;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({
  onDirectRegistration
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const steps = [
    {
      number: '١',
      title: 'اختيار المسار القرآني',
      description: 'الاطلاع على مستويات الحلقات (براعم، حفظ مرحلي، خاتمون، إجازة) وتحديد المسار الملائم لعمر الطالب.',
      icon: Sparkles
    },
    {
      number: '٢',
      title: 'تعبئة استمارة الالتحاق',
      description: 'تقديم الطلب المبدئي إلكترونياً أو الحضور لمكتب شؤون الطلاب بمسجد إبراهيم الخليل.',
      icon: FileText
    },
    {
      number: '٣',
      title: 'مقابلة تحديد المستوى',
      description: 'جلسة تقييم هادئة مع شيخ الحلقة لقياس مخارج الحروف ومقدار الحفظ السابق وتحديد الفوج المناسب.',
      icon: Calendar
    },
    {
      number: '٤',
      title: 'بدء رحلة الحفظ المباركة',
      description: 'استلام المصحف المعتمد وبطاقة الطالب والبدء الفعلي في الحلقات مع المتابعة اليومية عبر البوابة.',
      icon: CheckCircle2
    }
  ];

  const requirements = [
    'ألا يقل عمر الطالب عن ٥ سنوات عند بدء التسجيل.',
    'الالتزام بالحضور اليومي والانضباط بآداب المسجد والمصحف الشريف.',
    'إحضار شهادة ميلاد الطالب وصورة عن بطاقة هوية ولي الأمر عند المقابلة.',
    'التعهد بالتعاون والمتابعة المنزلية المستمرة عبر دفتر المتابعة والبوابة.'
  ];

  return (
    <section id="registration" className="py-24 bg-white border-b border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="gold" size="md">
            الانضمام للصرح القرآني
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-islamic-950 font-amiri leading-tight">
            التسجيل والالتحاق بمدرسة نبراس القرآن
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            نفتح أبوابنا للطلاب والطالبات الراغبين في حفظ كتاب الله وإتقانه في رحاب {SCHOOL_INFO.affiliation}، وفق خطة تربوية متكاملة ترعى كل طالب.
          </p>
        </div>

        {/* 1. خريطة الخطوات الأربع للتسجيل */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-black text-slate-900 font-amiri">
              مراحل وخطوات القبول والالتحاق
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              إجراءات ميسرة وواضحة لضمان انضمام الطالب إلى الفوج الأنسب لقدراته
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => {
              const IconComponent = st.icon;
              return (
                <div
                  key={i}
                  className="bg-ivory-50/70 rounded-3xl p-6 border border-slate-200/80 hover:border-gold-300 hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-islamic-800 text-gold-300 flex items-center justify-center font-amiri text-2xl font-black shadow-md shadow-islamic-800/20">
                        {st.number}
                      </div>
                      <IconComponent className="w-5 h-5 text-gold-600" />
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 font-amiri leading-tight">
                      {st.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {st.description}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-bold text-islamic-800 border-t border-slate-200/40">
                    <span>المرحلة {st.number} من ٤</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. شروط القبول وضوابط الحلقات */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-gold-600 uppercase">الضوابط والشروط</span>
              <h3 className="text-2xl sm:text-3xl font-black text-islamic-950 font-amiri">
                شروط القبول والتسجيل في الحلقات
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                وضعت هذه الشروط لضمان بيئة تعليمية قرآنية منتظمة تعود بالنفع الأكبر على الطالب.
              </p>
            </div>

            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* بطاقة الدعوة للتسجيل المباشر */}
          <div className="bg-gradient-to-br from-islamic-950 via-islamic-900 to-islamic-950 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 text-gold-300 text-xs font-bold border border-gold-400/30">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>المقاعد محدودة لكل فوج</span>
              </div>

              <h4 className="text-2xl sm:text-3xl font-black font-amiri text-white leading-tight">
                ابدأ رحلة ابنك مع كتاب الله اليوم
              </h4>

              <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed">
                سارع بتقديم طلب الالتحاق إلكترونياً لحجز مقعد الطالب في الحلقات القرآنية بمسجد إبراهيم الخليل.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full text-xs font-black shadow-lg"
                >
                  <UserPlus className="w-4 h-4 ml-1.5" />
                  <span>تقديم طلب التحاق إلكتروني</span>
                </Button>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gold-300">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>مكتب التسجيل بالمسجد</span>
                </span>
                <span>يومياً بعد صلاة العصر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة التسجيل الإلكتروني */}
      {isModalOpen && (
        <React.Suspense fallback={null}>
          <RegistrationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </React.Suspense>
      )}
    </section>
  );
};
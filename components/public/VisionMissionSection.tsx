import React from 'react';
import {
  Compass,
  HeartHandshake,
  Award,
  Sparkles,
  BookOpen,
  Target,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin
} from 'lucide-react';
import { PublicSchoolInfo } from '../../hooks/usePublicData';
import { Badge } from '../ui/Badge';

interface VisionMissionSectionProps {
  schoolInfo: PublicSchoolInfo;
}

export const VisionMissionSection: React.FC<VisionMissionSectionProps> = ({ schoolInfo }) => {
  const values = [
    {
      title: 'الإخلاص',
      subtitle: 'ابتغاء وجه الله تعالى',
      description: 'نجعل إخلاص النية لله أساس كل حرف يُتلى، وكل جهد يُبذل في خدمة كتاب الله الكريم.',
      icon: HeartHandshake,
      color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700 border-emerald-200'
    },
    {
      title: 'الإتقان',
      subtitle: 'الضبط والتجويد المتصل بالسند',
      description: 'الالتزام التام بضوابط التلاوة وأحكام التجويد ومخارج الحروف على نهج أئمة الإقراء المتقنين.',
      icon: Award,
      color: 'from-gold-500/10 to-gold-600/5 text-gold-700 border-gold-200'
    },
    {
      title: 'القدوة الحسنة',
      subtitle: 'التخلق بأخلاق القرآن',
      description: 'ربط حفظ الألفاظ بتطبيق المعاني، ليكون الطالب قرآناً يمشي على الأرض في سلوكه وأخلاقه.',
      icon: ShieldCheck,
      color: 'from-islamic-500/10 to-islamic-600/5 text-islamic-800 border-islamic-200'
    },
    {
      title: 'التطوير المستمر',
      subtitle: 'مواكبة الوسائل التربوية الحديثة',
      description: 'توظيف أفضل المناهج والمنظومات الإلكترونية في المتابعة اليومية والتواصل مع أولياء الأمور.',
      icon: Sparkles,
      color: 'from-amber-500/10 to-amber-600/5 text-amber-800 border-amber-200'
    }
  ];

  const objectives = [
    {
      number: '٠١',
      title: 'تخريج حفظة متقنين',
      text: 'تخريج أجيال تحفظ كتاب الله كاملاً مجوداً وفق القواعد والأصول المعتمدة.'
    },
    {
      number: '٠٢',
      title: 'منح الإجازات القرآنية بالسند',
      text: 'تأهيل المتميزين لعرض القرآن ونيل الإجازة بالسند المتصل إلى رسول الله ﷺ بروايتي ورش وحفص.'
    },
    {
      number: '٠٣',
      title: 'غرس الهدي النبوي والسمت الصالح',
      text: 'تنشئة الطلاب على تعظيم شعائر الله، وبر الوالدين، والأدب الرفيع في بيئة المسجد والمجتمع.'
    },
    {
      number: '٠٤',
      title: 'الشراكة التربوية مع الأسرة',
      text: 'تفعيل المتابعة الإلكترونية المستمرة مع أولياء الأمور لتكامل أثر المدرسة والبيت.'
    }
  ];

  return (
    <section id="vision" className="relative py-24 bg-gradient-to-b from-ivory-50 via-white to-ivory-50/50">
      {/* مرساة بديلة للتوافق مع الروابط القديمة */}
      <span id="about" className="sr-only" tabIndex={-1} aria-hidden="true" />

      {/* خلفية زخرفية هندسية إسلامية هادئة */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#065f46_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* الترويسة العلوية للقسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="islamic" size="md">
            الهوية والرسالة الخالدة
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-islamic-950 font-amiri leading-tight">
            رؤية استراتيجية راسخة، ورسالة قرآنية مباركة
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            تأسست <strong>{schoolInfo.fullName}</strong> لتكون بيئة قرآنية وإيمانية فريدة، تنهل من بركة المسجد وتعتمد أحدث الأساليب في التعليم والمتابعة.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-50 border border-gold-200/80 text-gold-900 font-amiri text-base sm:text-lg shadow-sm">
            <span>﴿ بَلْ هُوَ آيَاتٌ بَيِّنَاتٌ فِي صُدُورِ الَّذِينَ أُوتُوا الْعِلْمَ ﴾</span>
          </div>
        </div>

        {/* بطاقتا الرؤية والرسالة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* بطاقة الرؤية */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-islamic-100 shadow-sm hover:shadow-xl hover:border-islamic-300 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-32 h-32 bg-islamic-50 rounded-br-[100px] -z-0 transition-all group-hover:scale-110" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-islamic-800 text-gold-300 flex items-center justify-center shadow-lg shadow-islamic-800/20">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-black tracking-wider text-islamic-800 uppercase">
                  الرؤية المستقبلية
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-amiri">
                  ريادة في تعليم كتاب الله
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {schoolInfo.vision || 'ريادة في تعليم القرآن الكريم وتخريج جيل متخلق بأخلاق القرآن يتصدر مجتمعه علماً وعملاً وخلقاً.'}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-islamic-800">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>إتقان التلاوة والرسم</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>شمولية التربية الإيمانية</span>
              </span>
            </div>
          </div>

          {/* بطاقة الرسالة */}
          <div className="bg-gradient-to-br from-islamic-950 via-islamic-900 to-islamic-950 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="relative z-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border border-gold-400/30 text-gold-300 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-gold-400" />
              </div>
              <div className="space-y-3">
                <span className="text-xs font-black tracking-wider text-gold-400 uppercase">
                  رسالتنا التعليمية
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-amiri">
                  تعليم متقن وتربية واعية
                </h3>
                <p className="text-ivory-200 leading-relaxed text-sm sm:text-base">
                  {schoolInfo.message || 'تقديم تعليم قرآني متميز يجمع بين الإتقان في الحفظ والتجويد والتربية الإيمانية على يد نخبة من المشايخ المتقنين.'}
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-gold-300 font-bold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                <span>{schoolInfo.affiliation}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-400" />
                <span>عناية فردية بكل طالب</span>
              </span>
            </div>
          </div>
        </div>

        {/* قيم المدرسة الأربعة */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-amiri">
              القيم الجوهرية التي تحكم مسيرتنا
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm">
              مبادئ سامية يتوارثها المعلمون والطلاب في كافة الحلقات والأنشطة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg space-y-4 ${val.color}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-current shadow-sm">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 font-amiri">{val.title}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{val.subtitle}</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* الأهداف الاستراتيجية الأربعة */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="text-xs font-black text-gold-600 uppercase">غاياتنا التعليمية</span>
              <h3 className="text-2xl font-black text-islamic-950 font-amiri">الأهداف الاستراتيجية للمدرسة</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Target className="w-4 h-4 text-gold-500" />
              <span>مخرجات تعليمية قابلة للقياس والتقويم</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <span className="font-amiri text-2xl font-bold text-gold-600 shrink-0 w-10 text-center">
                  {obj.number}
                </span>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-base">{obj.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{obj.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
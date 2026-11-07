import React from 'react';
import {
  BookOpen,
  Award,
  Users,
  Calendar,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  GraduationCap,
  ShieldCheck,
  UserPlus,
  Radio,
  LogIn
} from 'lucide-react';
import { usePublicData } from '../hooks/usePublicData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { VisionMissionSection } from '../components/public/VisionMissionSection';
import { LevelsCirclesSection } from '../components/public/LevelsCirclesSection';
import { TeachersSection } from '../components/public/TeachersSection';
import { EventsActivitiesSection } from '../components/public/EventsActivitiesSection';
import { GallerySection } from '../components/public/GallerySection';
import { RegistrationSection } from '../components/public/RegistrationSection';

interface PublicHomeProps {
  onEnterPortal: () => void;
  onNavigateRegistration?: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onEnterPortal,
  onNavigateRegistration,
}) => {
  const {
    schoolInfo,
    announcements,
    events,
    teachers,
    circles,
    isLoading,
    isSupabaseLive
  } = usePublicData();

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-0 pb-16 selection:bg-islamic-100 selection:text-islamic-900" dir="rtl">
      {/* ========================================================================= */}
      {/* 1. Hero Section — الواجهة الترحيبية والهوية القرآنية                        */}
      {/* ========================================================================= */}
      <section id="home" className="relative overflow-hidden pt-12 md:pt-20 pb-20 md:pb-32 bg-gradient-to-b from-islamic-950 via-islamic-900 to-islamic-950 text-white">
        {/* خلفية زخرفية ناعمة */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* شارة الانتماء للمسجد وحالة الاتصال */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-islamic-800/80 border border-gold-500/30 text-gold-300 text-xs font-bold backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>صرح تعليمي قرآني مبارك في رحاب {schoolInfo.affiliation}</span>
              {isSupabaseLive && (
                <span className="flex items-center gap-1 mr-2 pr-2 border-r border-gold-400/40 text-[10px] text-emerald-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  محدّث لحظياً
                </span>
              )}
            </div>

            {/* الاسم والشعار الرئيسي */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight font-amiri text-white">
              {schoolInfo.name}
            </h1>

            <p className="text-lg sm:text-xl text-ivory-200/90 font-medium leading-relaxed max-w-2xl mx-auto">
              {schoolInfo.message}
            </p>

            {/* أزرار الإجراءات السريعة في البانر */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="gold"
                size="lg"
                onClick={onEnterPortal}
                className="w-full sm:w-auto text-base font-black px-8 py-4 shadow-xl shadow-gold-500/20"
              >
                <span>دخول البوابات المدرسية</span>
                <ChevronLeft className="w-5 h-5 mr-1" />
              </Button>

              <button
                onClick={() => scrollToSection('registration')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-gold-400/30 text-white font-bold transition-all text-base flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5 text-gold-300" />
                <span>التسجيل والالتحاق</span>
              </button>

              <button
                onClick={() => scrollToSection('vision')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl border border-ivory-200/20 text-ivory-200 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
              >
                التعريف بالرؤية والرسالة
              </button>
            </div>
          </div>

          {/* بطاقات الإحصائيات السريعة — متصلة بالبيانات العامة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl lg:text-4xl font-black text-gold-400 font-amiri">
                {circles.length > 0 ? `${circles.length}+` : '١٥+'}
              </p>
              <p className="text-xs text-ivory-200 mt-1 font-bold">حلقة قرآنية يومية</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl lg:text-4xl font-black text-gold-400 font-amiri">
                ٢٥٠+
              </p>
              <p className="text-xs text-ivory-200 mt-1 font-bold">طالب وطالبة ملتحقين</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl lg:text-4xl font-black text-gold-400 font-amiri">
                {teachers.length > 0 ? teachers.length : '١٢'}
              </p>
              <p className="text-xs text-ivory-200 mt-1 font-bold">شيخ ومقرئ مجاز بالسند</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors">
              <p className="text-3xl lg:text-4xl font-black text-gold-400 font-amiri">
                ١٠٠٪
              </p>
              <p className="text-xs text-ivory-200 mt-1 font-bold">متابعة إلكترونية متصلة</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. القسم الأول: الرؤية والرسالة والقيم والأهداف                           */}
      {/* ========================================================================= */}
      <VisionMissionSection schoolInfo={schoolInfo} />

      {/* ========================================================================= */}
      {/* 3. القسم الثاني: المستويات والأقسام والحلقات القرآنية                      */}
      {/* ========================================================================= */}
      <LevelsCirclesSection
        circles={circles}
        isLoading={isLoading}
        onSelectRegister={() => scrollToSection('registration')}
      />

      {/* ========================================================================= */}
      {/* 4. القسم الثالث: المعلمون والشيوخ المقرئون                                 */}
      {/* ========================================================================= */}
      <TeachersSection
        teachers={teachers}
        isLoading={isLoading}
      />

      {/* ========================================================================= */}
      {/* 5. القسم الرابع: الأنشطة والمسابقات والفعاليات                             */}
      {/* ========================================================================= */}
      <EventsActivitiesSection
        events={events}
        isLoading={isLoading}
      />

      {/* ========================================================================= */}
      {/* 6. القسم الخامس: معرض الصور البصري المتجاوب                                */}
      {/* ========================================================================= */}
      <GallerySection />

      {/* ========================================================================= */}
      {/* 7. القسم السادس: التسجيل والالتحاق                                         */}
      {/* ========================================================================= */}
      <RegistrationSection
        onDirectRegistration={onNavigateRegistration}
      />

      {/* ========================================================================= */}
      {/* 8. الأخبار والإعلانات المدرسية — من usePublicData                          */}
      {/* ========================================================================= */}
      <section id="announcements" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Badge variant="islamic" size="md">لوحة الأخبار والتعاميم</Badge>
            <h2 className="text-3xl font-black text-islamic-950 font-amiri mt-2">
              الأخبار والإعلانات المدرسية
            </h2>
          </div>
          <Button variant="secondary" size="sm" onClick={onEnterPortal}>
            الدخول للنظام لمشاهدة كافة التعاميم
          </Button>
        </div>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:border-gold-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    item.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : item.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-gold-50 text-gold-700 border-gold-200'
                  }`}>
                    {item.type === 'warning' ? 'تنبيه مهم' : item.type === 'success' ? 'بشارة وتكريم' : 'إعلان عام'}
                  </span>
                  <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-amiri">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center text-xs text-slate-500 border border-slate-100">
            لا توجد إعلانات عامة منشورة حالياً.
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 9. مقر المسجد وبيانات التواصل الرسمية                                     */}
      {/* ========================================================================= */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-islamic-900 text-white rounded-[3rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <Badge variant="gold" size="md">مقر المدرسة والمسجد</Badge>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight font-amiri">
                نسعد بزيارتكم في {schoolInfo.affiliation}
              </h2>
              <p className="text-ivory-200 text-sm leading-relaxed">
                تقام الحلقات القرآنية يومياً بعد صلاة العصر وحتى صلاة العشاء. نرحب باستفسارات أولياء الأمور وتسجيل الطلاب الجدد طوال أيام الأسبوع.
              </p>

              <div className="space-y-3 text-sm text-ivory-200 pt-2">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gold-400" />
                  <span>الموقع: {schoolInfo.address || schoolInfo.affiliation}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold-400" />
                  <span dir="ltr">{schoolInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gold-400" />
                  <span>{schoolInfo.email}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Button variant="gold" size="md" onClick={onEnterPortal}>
                  تسجيل الدخول إلى البوابة
                </Button>
                <button
                  onClick={() => scrollToSection('registration')}
                  className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                >
                  طلب الالتحاق بالحلقات
                </button>
              </div>
            </div>

            <div className="bg-white/10 rounded-3xl p-8 border border-white/15 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gold-500 text-white mx-auto flex items-center justify-center shadow-lg">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white font-amiri">{schoolInfo.affiliation}</h3>
              <p className="text-xs text-ivory-200">
                مقر إدارة الحلقات والمكتب التعليمي لـ {schoolInfo.name}
              </p>
              <div className="pt-4 text-xs text-gold-300 font-bold border-t border-white/10">
                أوقات الدوام: من الأحد إلى الخميس (04:00 م - 08:30 م)
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
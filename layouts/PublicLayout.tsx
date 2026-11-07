import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  LogIn,
  MapPin,
  Phone,
  Mail,
  Award,
  Compass,
  Menu,
  X,
  Sparkles,
  GraduationCap,
  Users,
  Calendar,
  Bell,
  ChevronLeft,
  Camera,
  UserPlus
} from 'lucide-react';
import { SCHOOL_INFO } from '../constants';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: BookOpen },
  { id: 'vision', label: 'الرؤية والرسالة', icon: Compass },
  { id: 'levels', label: 'الحلقات والمستويات', icon: Users },
  { id: 'teachers', label: 'الكادر التعليمي', icon: Award },
  { id: 'events', label: 'الأنشطة والفعاليات', icon: Calendar },
  { id: 'gallery', label: 'معرض الصور', icon: Camera },
  { id: 'registration', label: 'التسجيل والالتحاق', icon: UserPlus },
  { id: 'announcements', label: 'الأخبار', icon: Bell },
  { id: 'contact', label: 'تواصل معنا', icon: Phone },
];

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigateLogin?: () => void;
  currentSection?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  onNavigateLogin,
  currentSection = 'home',
  onNavigateSection
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const mobileDrawerRef = useFocusTrap(isMobileMenuOpen, () => setIsMobileMenuOpen(false));

  // إغلاق القائمة تلقائياً عند الضغط على مفتاح Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // منع التمرير في الخلفية أثناء فتح القائمة على الهواتف
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // التنقل وإغلاق القائمة فوراً
  const handleItemClick = useCallback((sectionId: string) => {
    setIsMobileMenuOpen(false);
    onNavigateSection?.(sectionId);
  }, [onNavigateSection]);

  const handleLoginClick = useCallback(() => {
    setIsMobileMenuOpen(false);
    onNavigateLogin?.();
  }, [onNavigateLogin]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 text-slate-800 selection:bg-islamic-100 selection:text-islamic-900" dir="rtl">
      {/* 1. الشريط العلوي — معلومات المسجد ورقم التواصل */}
      <div className="bg-islamic-950 text-ivory-200 text-xs py-2 px-4 border-b border-islamic-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" aria-hidden="true" />
              <span>{SCHOOL_INFO.affiliation}</span>
            </span>
            <span className="hidden sm:flex items-center gap-2 text-ivory-300">
              <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" aria-hidden="true" />
              <span dir="ltr">{SCHOOL_INFO.phone}</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gold-300 font-amiri text-sm">
            <span>﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾</span>
          </div>
        </div>
      </div>

      {/* 2. الترويسة الرئيسية — Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* الشعار واسم الصرح القرآني */}
          <button
            onClick={() => handleItemClick('home')}
            className="flex items-center gap-3 text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-2xl p-1"
            aria-label="العودة للصفحة الرئيسية"
          >
            <div className="w-12 h-12 rounded-2xl bg-islamic-800 flex items-center justify-center text-white shadow-lg shadow-islamic-800/30">
              <BookOpen className="w-7 h-7 text-gold-300" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-black text-islamic-950 leading-tight">
                {SCHOOL_INFO.name}
              </h1>
              <p className="text-xs text-gold-600 font-bold">
                {SCHOOL_INFO.affiliation}
              </p>
            </div>
          </button>

          {/* روابط سطح المكتب — Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`text-sm font-bold transition-all px-2.5 py-1.5 rounded-xl ${
                    isActive
                      ? 'text-islamic-800 bg-islamic-50 font-black'
                      : 'text-slate-600 hover:text-islamic-700 hover:bg-slate-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* أزرار الإجراءات — سطح المكتب والهواتف */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* زر الدخول الرئيسي */}
            <button
              onClick={handleLoginClick}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-islamic-800 text-white font-bold text-xs sm:text-sm hover:bg-islamic-900 transition-all shadow-md shadow-islamic-800/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <LogIn className="w-4 h-4 text-gold-300 shrink-0" aria-hidden="true" />
              <span>دخول البوابات</span>
            </button>

            {/* زر قائمة الهاتف (Hamburger) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl text-slate-700 hover:text-islamic-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label={isMobileMenuOpen ? 'إغلاق القائمة الرئيسية' : 'فتح القائمة الرئيسية'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 3. قائمة الهاتف المتجاوبة — Mobile Drawer (RTL) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="قائمة التنقل للهواتف"
          id="mobile-navigation-drawer"
        >
          {/* خلفية معتمة — Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* لوحة القائمة المنزلقة من اليمين (RTL Drawer) */}
          <div ref={mobileDrawerRef} className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* ترويسة اللوحة */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-islamic-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-islamic-800 flex items-center justify-center text-gold-300">
                  <BookOpen className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white">{SCHOOL_INFO.name}</h2>
                  <p className="text-[11px] text-gold-400 font-bold">{SCHOOL_INFO.affiliation}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-ivory-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* روابط التنقل في لوحة الهاتف */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5" aria-label="روابط الموقع العام">
              {NAV_ITEMS.map((item) => {
                const IconComponent = item.icon || ChevronLeft;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-right ${
                      isActive
                        ? 'bg-islamic-800 text-white shadow-md shadow-islamic-800/20'
                        : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? 'text-gold-300' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </div>
                    <ChevronLeft
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-gold-300' : 'text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </nav>

            {/* الجزء السفلي من اللوحة — زر الدخول ومعلومات التواصل */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-islamic-800 text-white font-bold text-sm hover:bg-islamic-900 transition-colors shadow-md shadow-islamic-800/20 active:scale-95"
              >
                <LogIn className="w-4 h-4 text-gold-300" aria-hidden="true" />
                <span>دخول البوابات المدرسية</span>
              </button>

              <div className="text-center text-[11px] text-slate-500 pt-1">
                <span>هاتف: </span>
                <span dir="ltr" className="font-bold text-slate-700">{SCHOOL_INFO.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. محتوى الصفحة — Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* 5. تذييل الصفحة — Public Footer */}
      <footer className="bg-islamic-950 text-ivory-100 border-t border-islamic-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-islamic-800/60">
            {/* العمود 1: هوية المدرسة */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-islamic-800 flex items-center justify-center text-gold-300">
                  <BookOpen className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">{SCHOOL_INFO.name}</h3>
                  <p className="text-xs text-gold-400 font-bold">{SCHOOL_INFO.affiliation}</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {SCHOOL_INFO.vision}
              </p>
            </div>

            {/* العمود 2: روابط سريعة */}
            <div>
              <h4 className="text-sm font-black text-gold-300 mb-4">روابط سريعة</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li><button onClick={() => handleItemClick('vision')} className="hover:text-gold-300 transition-colors text-right">الرؤية والرسالة</button></li>
                <li><button onClick={() => handleItemClick('levels')} className="hover:text-gold-300 transition-colors text-right">المستويات والحلقات</button></li>
                <li><button onClick={() => handleItemClick('teachers')} className="hover:text-gold-300 transition-colors text-right">شيوخ ومعلمو المدرسة</button></li>
                <li><button onClick={() => handleItemClick('events')} className="hover:text-gold-300 transition-colors text-right">الفعاليات والمسابقات</button></li>
                <li><button onClick={() => handleItemClick('gallery')} className="hover:text-gold-300 transition-colors text-right">معرض الصور</button></li>
                <li><button onClick={() => handleItemClick('registration')} className="hover:text-gold-300 transition-colors text-right">التسجيل والالتحاق</button></li>
                <li><button onClick={() => handleItemClick('announcements')} className="hover:text-gold-300 transition-colors text-right">لوحة الإعلانات</button></li>
                <li><button onClick={handleLoginClick} className="hover:text-gold-300 transition-colors text-right font-bold text-gold-400">بوابات الطلاب والمعلمين</button></li>
              </ul>
            </div>

            {/* العمود 3: المسارات القرآنية */}
            <div>
              <h4 className="text-sm font-black text-gold-300 mb-4">المسارات القرآنية</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li>حلقات البراعم والناشئة</li>
                <li>مسار الحفظ المكثف وتثبيت المحفوظ</li>
                <li>حلقات إتقان التلاوة وضبط التجويد</li>
                <li>دورات الإجازات القرآنية بالسند المتصل</li>
              </ul>
            </div>

            {/* العمود 4: معلومات التواصل والموقع */}
            <div>
              <h4 className="text-sm font-black text-gold-300 mb-4">الموقع والتواصل</h4>
              <div className="space-y-3 text-xs text-slate-300">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0" aria-hidden="true" />
                  <span>{SCHOOL_INFO.affiliation}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" aria-hidden="true" />
                  <span>{SCHOOL_INFO.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" aria-hidden="true" />
                  <span dir="ltr">{SCHOOL_INFO.phone}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>جميع الحقوق محفوظة © {new Date().getFullYear()} — {SCHOOL_INFO.fullName}</p>
            <p className="text-gold-400/80 font-amiri text-sm">خدمة كتاب الله شرف وأمانة</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

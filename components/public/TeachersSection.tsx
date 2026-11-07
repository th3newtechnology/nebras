import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Clock,
  Sparkles,
  ChevronLeft,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Users
} from 'lucide-react';
import { PublicTeacher } from '../../hooks/usePublicData';
import { Badge } from '../ui/Badge';

const TeacherDetailModal = React.lazy(() =>
  import('./TeacherDetailModal').then((m) => ({ default: m.TeacherDetailModal }))
);

interface TeachersSectionProps {
  teachers: PublicTeacher[];
  isLoading?: boolean;
}

export const TeachersSection: React.FC<TeachersSectionProps> = ({
  teachers,
  isLoading = false
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<PublicTeacher | null>(null);

  // استخراج الحرف الأول من الاسم للمونوغرام
  const getMonogramLetter = (name: string) => {
    return name.trim().replace(/^(الشيخ|الأستاذ|الأستاذة)\s+/, '')[0] || 'ن';
  };

  return (
    <section id="teachers" className="py-24 bg-gradient-to-b from-white via-ivory-50 to-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* ترويسة القسم */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="islamic" size="md">
            الكادر التعليمي والشيوخ المقرئون
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-islamic-950 font-amiri leading-tight">
            نخبة من المشايخ والمجازين بالسند المتصل
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            تضم مدرسة نبراس القرآن كوكبة مباركة من الشيوخ والمربين الحاصلين على أعلى الإجازات القرآنية بالسند المتصل إلى رسول الله ﷺ، والذين يجمعون بين غزارة العلم ودقة الإقراء وحسن التوجيه.
          </p>
        </div>

        {/* شبكة بطاقات المعلمين */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100" />
                <div className="h-6 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-12 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        ) : teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {teachers.map((teacher) => {
              const letter = getMonogramLetter(teacher.name);
              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-[2.5rem] p-7 sm:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-gold-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* شريط علوي ذهبي رفيع عند التحويم */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-islamic-800 via-gold-500 to-islamic-800 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-6">
                    {/* الشعار الزخرفي وشارات الاعتماد */}
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-islamic-800 to-islamic-950 text-gold-300 flex items-center justify-center font-amiri text-3xl font-black shadow-md shadow-islamic-800/20 group-hover:scale-105 transition-transform border border-gold-500/30">
                        {letter}
                      </div>

                      <span className="text-[11px] font-bold text-gold-800 bg-gold-50 px-3 py-1 rounded-full border border-gold-200/80 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-gold-600" />
                        <span>مجاز بالسند المتصل</span>
                      </span>
                    </div>

                    {/* بيانات المعلم العامة والآمنة تماماً */}
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-amiri leading-tight">
                        {teacher.name}
                      </h3>
                      <p className="text-xs font-bold text-islamic-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                        <span>{teacher.specialization}</span>
                      </p>
                    </div>

                    {/* تفاصيل المؤهل والخبرة */}
                    <div className="bg-ivory-50/70 rounded-2xl p-4 border border-slate-100/80 space-y-2.5 text-xs">
                      <div className="flex items-start gap-2 text-slate-700">
                        <GraduationCap className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong className="text-slate-900">المؤهل:</strong> {teacher.qualification}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700 pt-1 border-t border-slate-200/40">
                        <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong className="text-slate-900">الخبرة:</strong> {teacher.experienceYears} سنوات في تعليم القرآن
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* زر الاطلاع على النبذة الأكاديمية */}
                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-50 text-slate-800 hover:bg-islamic-50 hover:text-islamic-900 text-xs font-bold transition-all flex items-center justify-center gap-2 group-hover:border-islamic-200 border border-transparent"
                    >
                      <span>عرض السيرة التعليمية</span>
                      <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-islamic-50 text-islamic-800 mx-auto flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 font-amiri">
              هيئة الإقراء والتعليم القرآني
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              تضم المدرسة نخبة من المشايخ المتقنين والمجازين بالسند، يجري تحديث بيانات الحلقات الموكلة إليهم للموسم الحالي.
            </p>
          </div>
        )}

        {/* بطاقة الضمان الأكاديمي والشرعي */}
        <div className="bg-islamic-900 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-right">
              <h4 className="text-xl sm:text-2xl font-black font-amiri text-gold-300">
                سند قرآني متصل إلى الحبيب المصطفى ﷺ
              </h4>
              <p className="text-xs sm:text-sm text-ivory-200 max-w-2xl leading-relaxed">
                يخضع جميع معلمي المدرسة لاختبارات دقيقة في أحكام التجويد والرسم العثماني وطرق التدريس، لضمان صيانة لسان الطالب من اللحن وربطه بالسند الصحيح.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-gold-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-xs text-ivory-200">
                <span className="block font-bold text-white">إجازات معتمدة</span>
                <span>بروايتي ورش وحفص</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* نافذة تفاصيل المعلم */}
      {selectedTeacher && (
        <React.Suspense fallback={null}>
          <TeacherDetailModal
            teacher={selectedTeacher}
            onClose={() => setSelectedTeacher(null)}
          />
        </React.Suspense>
      )}
    </section>
  );
};
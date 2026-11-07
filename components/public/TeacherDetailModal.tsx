import React from 'react';
import { X, Award, BookOpen, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PublicTeacher } from '../../hooks/usePublicData';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface TeacherDetailModalProps {
  teacher: PublicTeacher | null;
  onClose: () => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({ teacher, onClose }) => {
  const containerRef = useFocusTrap(!!teacher, onClose);

  if (!teacher) return null;

  // استخراج الحرف الأول من الاسم للشعار الزخرفي
  const firstLetter = teacher.name.trim().replace(/^(الشيخ|الأستاذ|الأستاذة)\s+/, '')[0] || 'ن';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-modal-title"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الترويسة العلوية المزخرفة */}
        <div className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-950 text-white p-6 sm:p-8 relative">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-ivory-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="إغلاق نافذة السيرة التعليمية"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-slate-900 flex items-center justify-center font-amiri text-3xl font-black shadow-lg shadow-gold-500/20 shrink-0 border-2 border-white/20">
              {firstLetter}
            </div>
            <div>
              <span className="text-xs text-gold-400 font-bold tracking-wider">
                هيئة الإقراء والتعليم القرآني
              </span>
              <h3 id="teacher-modal-title" className="text-xl sm:text-2xl font-black text-white font-amiri leading-tight mt-0.5">
                {teacher.name}
              </h3>
              <p className="text-xs text-ivory-200 mt-1">
                {teacher.specialization}
              </p>
            </div>
          </div>
        </div>

        {/* جسم النافذة */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* المؤهل والخبرة */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-ivory-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gold-600" aria-hidden="true" />
                المؤهل القرآني
              </span>
              <p className="text-xs font-black text-slate-800 leading-relaxed">
                {teacher.qualification}
              </p>
            </div>

            <div className="bg-ivory-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-islamic-700" aria-hidden="true" />
                الخبرة في التدريس
              </span>
              <p className="text-xs font-black text-slate-800">
                {teacher.experienceYears} سنوات في خدمة كتاب الله
              </p>
            </div>
          </div>

          {/* منهجية الإقراء المعتمدة */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-600" aria-hidden="true" />
              <span>المحاور والمنهجية التعليمية</span>
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700 border border-slate-100">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>ضبط مخارج الحروف وصفاتها وتطبيق التجويد العملي بدقة.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>المتابعة التراكمية اليومية للحفظ الجديد وتثبيت المحفوظ السابق.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>غرس آداب حملة القرآن والتزام السمت والوقار الإسلامي في المسجد.</span>
              </div>
            </div>
          </div>

          {/* تنويه الأمان والخصوصية المهنية */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-[11px] text-amber-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>
              حفاظاً على خصوصية المعلمين، يتم التنسيق والتواصل المباشر مع أولياء الأمور عبر إدارة المدرسة وبوابة النظام.
            </span>
          </div>

          {/* زر الإغلاق */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-islamic-800 text-white text-xs font-bold hover:bg-islamic-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
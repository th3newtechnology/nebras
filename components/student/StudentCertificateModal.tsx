import React, { useEffect } from 'react';
import { Printer, X, Award, Sparkles, Building, CheckCircle2 } from 'lucide-react';
import { StudentCertificate } from '../../types/studentPortal.types';

interface StudentCertificateModalProps {
  isOpen: boolean;
  certificate: StudentCertificate | null;
  onClose: () => void;
}

export const StudentCertificateModal: React.FC<StudentCertificateModalProps> = ({
  isOpen,
  certificate,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-black font-amiri text-slate-900">
              معاينة وطباعة الشهادة القرآنية الرسمية
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوثيقة (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame (A4 Aspect Ratio Optimized) */}
        <div className="p-8 sm:p-12 bg-gradient-to-b from-[#FFFDF7] to-[#FBF8EF] rounded-3xl border-4 border-double border-gold-500/70 shadow-inner relative overflow-hidden space-y-8 text-center print:border-4 print:p-10">
          {/* Subtle Islamic Background Ornament */}
          <div className="absolute inset-4 border border-dashed border-amber-800/20 pointer-events-none rounded-2xl" />

          {/* Header */}
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600">
              <Building className="w-4 h-4 text-emerald-800" />
              <span>الجمهورية الجزائرية الديمقراطية الشعبية • ولاية الجزائر</span>
            </div>
            <h2 className="text-lg font-black font-amiri text-emerald-950">
              مدرسة نبراس القرآنية — مسجد إبراهيم الخليل عليه السلام
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-2" />
          </div>

          {/* Certificate Title */}
          <div className="space-y-2 relative z-10 pt-2">
            <span className="text-xs font-black uppercase tracking-widest text-gold-700 bg-gold-100/70 px-4 py-1 rounded-full border border-gold-300">
              شهادة تقدير وإتقان قرآني
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-amiri text-slate-900 mt-2">
              {certificate.title}
            </h1>
          </div>

          {/* Certificate Body Text */}
          <div className="space-y-4 max-w-xl mx-auto text-slate-800 relative z-10">
            <p className="text-sm text-slate-600 font-medium">
              تشهد إدارة مدرسة نبراس القرآنية بمسجد إبراهيم الخليل بأن الطالب المبارك:
            </p>
            <div className="font-amiri font-black text-2xl sm:text-3xl text-emerald-900 border-b-2 border-dashed border-gold-400 pb-2 inline-block px-8">
              {certificate.studentName}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              قد أتم بتوفيق الله تعالى وفضله:{' '}
              <strong className="text-slate-900 font-bold">{certificate.achievementText}</strong>
              ، مع العناية التامة بأحكام التجويد والضبط برواية ورش عن نافع من طريق الأزرق.
            </p>
          </div>

          {/* Signatures & Seal Box */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-amber-900/10 text-xs relative z-10">
            <div className="space-y-2">
              <span className="font-bold text-slate-500 block">الشيخ المحفظ المشرف:</span>
              <p className="font-black font-amiri text-base text-slate-900">
                {certificate.teacherName}
              </p>
              <span className="text-[10px] text-emerald-800 font-bold block">✓ توقيع معتمد</span>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-500 block">إدارة مدرسة نبراس القرآنية:</span>
              <p className="font-black font-amiri text-base text-slate-900">
                أمانة التعليم القرآني بالمسجد
              </p>
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-700/60 mx-auto flex items-center justify-center text-[9px] font-black font-mono text-emerald-900 uppercase rotate-12">
                ختم المسجد
              </div>
            </div>
          </div>

          {/* Date & Note */}
          <div className="text-[10px] text-slate-400 font-mono pt-2 relative z-10">
            تاريخ الإصدار: {certificate.issuedDate} • مسجد إبراهيم الخليل عليه السلام
          </div>
        </div>

        {/* Footer in Modal */}
        <div className="flex items-center justify-end pt-2 border-t border-slate-100 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

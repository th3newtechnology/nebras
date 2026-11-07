import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TeacherReport } from '../../../types/teacherReport.types';
import { SCHOOL_INFO } from '../../../constants';

interface TeacherReportPrintModalProps {
  isOpen: boolean;
  report: TeacherReport | null;
  onClose: () => void;
}

export const TeacherReportPrintModal: React.FC<TeacherReportPrintModalProps> = ({
  isOpen,
  report,
  onClose,
}) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const getRatingBadgeClass = (rating: string) => {
    switch (rating) {
      case 'ممتاز':
        return 'border-emerald-600 text-emerald-800 bg-emerald-50';
      case 'جيد جداً':
        return 'border-blue-600 text-blue-800 bg-blue-50';
      case 'جيد':
        return 'border-amber-600 text-amber-800 bg-amber-50';
      default:
        return 'border-rose-600 text-rose-800 bg-rose-50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      {/* Floating Action Header (Hidden on print) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full shadow-2xl border border-slate-200 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full font-bold text-xs transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة الوثيقة الرسمية (A4)</span>
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors"
        >
          <X className="w-4 h-4" />
          <span>إغلاق</span>
        </button>
      </div>

      {/* Printable Sheet Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 print:my-0 print:shadow-none print:w-full print:max-w-none print:rounded-none">
        <div className="p-8 md:p-12 space-y-6 text-slate-900 font-sans print:p-6 print:space-y-4">
          {/* Official Algerian Ministry & Mosque Header */}
          <div className="text-center border-b-2 border-emerald-900/40 pb-6 relative">
            <div className="text-xs font-bold text-slate-600 tracking-wider">
              الجمهورية الجزائرية الديمقراطية الشعبية
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              وزارة الشؤون الدينية والأوقاف • مديرية الشؤون الدينية والأوقاف
            </div>
            <div className="text-sm font-black text-emerald-950 font-amiri mt-1">
              {SCHOOL_INFO.affiliation} — {SCHOOL_INFO.name}
            </div>

            <div className="inline-block mt-4 px-6 py-1.5 border-2 border-emerald-900/60 rounded-full bg-emerald-50/50">
              <h2 className="text-xl md:text-2xl font-black font-amiri text-emerald-950">
                تقرير المتابعة التربوية والقرآنية الدورية
              </h2>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500 mt-4 px-2">
              <span>رقم التقرير: #{report.id}</span>
              <span>
                الفترة: من {report.periodStart} إلى {report.periodEnd} ({report.reportType === 'weekly' ? 'تقرير أسبوعي' : 'تقرير دوري'})
              </span>
              <span>تاريخ التحرير: {report.createdAt.split('T')[0]}</span>
            </div>
          </div>

          {/* Student & Circle Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">اسم الطالب:</span>
              <span className="text-sm font-black text-slate-900 font-amiri block mt-0.5">
                {report.studentName || 'محمد ياسين درويش'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">رقم القيد الرسمي:</span>
              <span className="text-xs font-mono font-bold text-emerald-800 block mt-0.5">
                {report.registrationNumber || 'NEB-2026-0001'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">الحلقة القرآنية:</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {report.circleName || 'حلقة الصديق'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">الشيخ المحفظ:</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">
                {report.teacherName || 'الشيخ المحفظ'}
              </span>
            </div>
          </div>

          {/* Section 1: Quantitative Indicators */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <h3 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>أولاً: مؤشرات المواظبة والتحصيل القرآني خلال الفترة</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-slate-500 font-bold block">نسبة الحضور</span>
                <span className="text-xl font-black font-mono text-emerald-800 mt-1 block">
                  {report.attendanceRate}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({report.sessionsAttended} من {report.sessionsTotal} حصص)
                </span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-[10px] text-slate-500 font-bold block">التقدير العام للفترة</span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black mt-2 border ${getRatingBadgeClass(report.overallRating)}`}>
                  {report.overallRating}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 text-right">
                <span className="text-[10px] text-slate-500 font-bold block">رواية ورش عن نافع</span>
                <p className="text-xs font-medium text-slate-700 mt-1 leading-relaxed">
                  {report.warshAdherence}
                </p>
              </div>
            </div>

            {/* Hifz and Revision Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-black text-emerald-900 block mb-1">
                  📖 الحفظ الجديد المقرر:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {report.newMemorizationProgress}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-black text-blue-900 block mb-1">
                  🔄 المراجعة والتثبيت:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {report.revisionProgress}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-[11px] font-black text-amber-900 block mb-1">
                🎙️ أحكام التجويد ومخارج الحروف:
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {report.tajweedLevel}
              </p>
            </div>
          </div>

          {/* Section 2: Qualitative Pedagogical Evaluation */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
            <h3 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>ثانياً: التقييم التربوي ونقاط القوة وفرص التحسين</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/60">
                <span className="text-[11px] font-black text-emerald-950 block mb-1">
                  ✨ أبرز نقاط القوة والتميز:
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {report.strengths}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/60">
                <span className="text-[11px] font-black text-amber-950 block mb-1">
                  🎯 مجالات التحسين والتطوير:
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {report.areasForImprovement}
                </p>
              </div>
            </div>

            {/* Recommendations for Guardian */}
            <div className="p-3.5 bg-blue-50/40 rounded-xl border border-blue-200/60 text-xs">
              <span className="text-[11px] font-black text-blue-950 block mb-1">
                🤝 توجيهات عملية ومقترحات لولي الأمر في البيت:
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                {report.recommendationsForGuardian}
              </p>
            </div>

            {/* Next Week Target */}
            {report.nextWeekGoals && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-black text-slate-900 block mb-1">
                  🎯 أهداف الخطة القرآنية للأسبوع القادم:
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {report.nextWeekGoals}
                </p>
              </div>
            )}
          </div>

          {/* Signatures & Seal Block */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="font-bold text-slate-600 block">إمضاء وختم الشيخ المحفظ</span>
              <div className="h-16 flex items-center justify-center text-slate-300 font-mono text-[10px]">
                [التوقيع والختم]
              </div>
              <span className="text-slate-800 font-bold">{report.teacherName || 'الشيخ المحفظ'}</span>
            </div>

            <div>
              <span className="font-bold text-slate-600 block">اطلع عليه ولي الأمر</span>
              <div className="h-16 flex items-center justify-center text-slate-300 font-mono text-[10px]">
                {report.guardianViewedAt ? `تم الاطلاع إلكترونياً (${report.guardianViewedAt.split('T')[0]})` : '[توقيع الولي]'}
              </div>
              <span className="text-slate-800 font-bold">{report.guardianName || 'ولي الأمر'}</span>
            </div>

            <div>
              <span className="font-bold text-slate-600 block">خاتم إدارة مدرسة نبراس</span>
              <div className="h-16 flex items-center justify-center text-slate-300 font-mono text-[10px]">
                [خاتم المدرسة الرسمي]
              </div>
              <span className="text-slate-800 font-bold">مسجد إبراهيم الخليل</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100">
            وثيقة تربوية رسمية صادرة آلياً عن منصة نبراس لإدارة المدارس القرآنية • مسجد إبراهيم الخليل
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { TeacherReport } from '../../types/teacherReport.types';
import { TeacherReportPrintModal } from '../teacher/reports/TeacherReportPrintModal';

interface ChildReportsTabProps {
  reports: TeacherReport[];
  studentName: string;
  onViewReport: (report: TeacherReport) => void;
}

export const ChildReportsTab: React.FC<ChildReportsTabProps> = ({
  reports,
  studentName,
  onViewReport,
}) => {
  const [printReport, setPrintReport] = useState<TeacherReport | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<TeacherReport | null>(null);

  const handleOpenDetail = (report: TeacherReport) => {
    setSelectedReportDetail(report);
    onViewReport(report);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            التقارير التربوية والدورية الصادرة عن المشايخ ({studentName})
          </h3>
          <p className="text-xs text-slate-500">
            تقارير معتمدة رسمياً ومقفلة أمنياً لضمان الدقة والنزاهة التعليمية
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          إجمالي التقارير: {reports.length}
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-600">
            لم يتم رفع تقارير دورية معتمدة لهذا الابن بعد.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-black text-slate-900 text-sm">
                      {report.reportType === 'weekly' ? 'تقرير المتابعة الأسبوعي' : 'تقرير المتابعة الدوري'}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {report.overallRating}
                    </span>
                    {!report.guardianViewedAt ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 animate-pulse">
                        جديد غير مقروء
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>تم الاطلاع ({report.guardianViewedAt.split('T')[0]})</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                    الفترة: من {report.periodStart} إلى {report.periodEnd} • المحفظ: {report.teacherName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDetail(report)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>قراءة التفاصيل</span>
                  </button>

                  <button
                    onClick={() => setPrintReport(report)}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة الوثيقة (A4)</span>
                  </button>
                </div>
              </div>

              {/* Quick Highlight of Report */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-emerald-900 block mb-0.5">
                    📖 إنجاز الحفظ والمراجعة:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {report.newMemorizationProgress} • {report.revisionProgress}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl">
                  <span className="font-bold text-blue-900 block mb-0.5">
                    🤝 توجيه عملي للأسرة في البيت:
                  </span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {report.recommendationsForGuardian}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Details Viewer Modal */}
      {selectedReportDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedReportDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-amiri text-slate-900">
                  تفاصيل تقرير المتابعة التربوية
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedReportDetail.overallRating}
                </span>
              </div>
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-800">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-1">✨ نقاط القوة والتميز:</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedReportDetail.strengths}
                </p>
              </div>

              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900 block mb-1">🎯 مجالات التحسين والتطوير:</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedReportDetail.areasForImprovement}
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-900 block mb-1">🤝 مقترحات وتوجيهات لولي الأمر:</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedReportDetail.recommendationsForGuardian}
                </p>
              </div>

              {selectedReportDetail.nextWeekGoals && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">🎯 أهداف الأسبوع القادم:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {selectedReportDetail.nextWeekGoals}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setPrintReport(selectedReportDetail);
                  setSelectedReportDetail(null);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الوثيقة الرسمية A4</span>
              </button>

              <button
                onClick={() => setSelectedReportDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable A4 Document Modal */}
      {printReport && (
        <TeacherReportPrintModal
          isOpen={Boolean(printReport)}
          report={printReport}
          onClose={() => setPrintReport(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import { Printer, X, ShieldCheck, Sparkles, Building, AlertTriangle, Award, CheckCircle2 } from 'lucide-react';
import {
  ExecutiveOversightMetrics,
  StrugglingStudentItem,
  StandoutStudentItem,
  RoomOccupancyConflict,
} from '../../types/oversight.types';
import { SCHOOL_INFO } from '../../constants';

interface ExecutiveOversightPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: ExecutiveOversightMetrics;
  strugglingStudents: StrugglingStudentItem[];
  standoutStudents: StandoutStudentItem[];
  hallsAudit: RoomOccupancyConflict[];
}

export const ExecutiveOversightPrintModal: React.FC<ExecutiveOversightPrintModalProps> = ({
  isOpen,
  onClose,
  metrics,
  strugglingStudents,
  standoutStudents,
  hallsAudit,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 print:shadow-none print:border-none print:max-h-none print:max-w-none">
        
        {/* شريط الإجراءات العلوي (يخفى أثناء الطباعة) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                معاينة تقرير الرقابة الإدارية والتربوية الشاملة
              </h3>
              <p className="text-[11px] text-slate-500">
                وثيقة رسمية مخصصة للناظر وإمام المسجد ومجلس الأمناء (A4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الوثيقة الرسمية (A4 / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* جسم الوثيقة الرسمية للطباعة */}
        <div className="p-8 md:p-12 space-y-6 text-slate-900 font-sans print:p-6 print:space-y-4">
          
          {/* 1. الترويسة الجزائرية الرسمية */}
          <div className="text-center space-y-1.5 border-b-2 border-slate-900/80 pb-5">
            <h4 className="text-sm font-bold text-slate-800 font-serif">الجمهورية الجزائرية الديمقراطية الشعبية</h4>
            <h5 className="text-xs font-bold text-slate-700">وزارة الشؤون الدينية والأوقاف</h5>
            <h6 className="text-xs font-semibold text-slate-600">
              مديرية الشؤون الدينية والأوقاف — ولاية الجزائر
            </h6>
            <div className="pt-2 flex items-center justify-center gap-2">
              <span className="text-base font-black text-emerald-900 font-amiri">
                مدرسة نبراس القرآنية
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                {SCHOOL_INFO.affiliation || 'مسجد إبراهيم الخليل'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 pt-0.5">
              العام الدراسي: {metrics.academicYear} • تحريراً بتاريخ: {metrics.todayDate}
            </p>
          </div>

          {/* 2. عنوان التقرير الرقابي */}
          <div className="text-center py-2 bg-slate-100 rounded-2xl border border-slate-300">
            <h2 className="text-lg font-black text-slate-900 font-amiri">
              تقرير الرقابة الإدارية والتربوية وضمان الجودة القرآنية
            </h2>
            <p className="text-[11px] font-bold text-slate-600 mt-0.5">
              ملخص المؤشرات الميدانية، نسب الحضور، رصد التعثر الدراسي، والتحقق من سلامة الحصص والقاعات
            </p>
          </div>

          {/* 3. شبكة المؤشرات الكلية (Executive KPI Matrix) */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">إجمالي الطلاب النشطين</span>
              <span className="text-xl font-black text-slate-900 font-amiri">{metrics.totalActiveStudents}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">نسبة المواظبة والانضباط</span>
              <span className="text-xl font-black text-emerald-700 font-amiri">{metrics.schoolAttendanceRate}%</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">الحلقات العاملة</span>
              <span className="text-xl font-black text-slate-900 font-amiri">{metrics.activeCirclesCount} حلقات</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block">حالة التعارضات بالقاعات</span>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md inline-block mt-1">
                {metrics.unresolvedConflictsCount === 0 ? 'خالية من التعارض 100%' : `${metrics.unresolvedConflictsCount} تعارض`}
              </span>
            </div>
          </div>

          {/* 4. تقرير الرقابة على القاعات وإشغال المسجد */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 border-r-4 border-emerald-600 pr-2">
              أولاً: جاهزية وإشغال قاعات مسجد إبراهيم الخليل
            </h3>
            <table className="w-full text-right text-xs border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-l border-slate-300">اسم القاعة</th>
                  <th className="p-2 border-l border-slate-300">الطاقة الاستيعابية</th>
                  <th className="p-2 border-l border-slate-300">الطلاب المقيدون</th>
                  <th className="p-2 border-l border-slate-300">نسبة الإشغال</th>
                  <th className="p-2">السلامة من التعارض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hallsAudit.map((hall) => (
                  <tr key={hall.hallId} className="hover:bg-slate-50">
                    <td className="p-2 font-bold border-l border-slate-200">{hall.hallName}</td>
                    <td className="p-2 border-l border-slate-200">{hall.capacity} مقعد</td>
                    <td className="p-2 border-l border-slate-200">{hall.currentEnrolled} طالب</td>
                    <td className="p-2 border-l border-slate-200 font-bold text-slate-800">{hall.occupancyPercent}%</td>
                    <td className="p-2">
                      <span className="text-[10px] font-black text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                        نظامية تماماً
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. رصد الطلاب المتعثرين وخطط التدخل الميداني */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 border-r-4 border-rose-600 pr-2 flex items-center gap-1.5">
              <span>ثانياً: سجل رصد الطلاب المتعثرين والمحتاجين إلى رعاية وتدخل تربوي</span>
              <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {strugglingStudents.length} طلاب
              </span>
            </h3>
            <table className="w-full text-right text-xs border border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-l border-slate-300">اسم الطالب</th>
                  <th className="p-2 border-l border-slate-300">الحلقة والمحفظ</th>
                  <th className="p-2 border-l border-slate-300">المواظبة / السلوك</th>
                  <th className="p-2 border-l border-slate-300">مؤشر التعثر والتنبيه</th>
                  <th className="p-2">إجراء التدخل الإداري المقترح</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {strugglingStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-2 font-bold text-slate-900 border-l border-slate-200">
                      {st.name}
                      <span className="block text-[10px] text-slate-500 font-normal">ولي الأمر: {st.guardianName} ({st.guardianPhone})</span>
                    </td>
                    <td className="p-2 border-l border-slate-200 text-slate-700">
                      {st.circleName}
                      <span className="block text-[10px] text-slate-500">{st.teacherName}</span>
                    </td>
                    <td className="p-2 border-l border-slate-200">
                      <span className="font-bold text-rose-700">{st.attendanceRate}%</span>
                      <span className="text-[10px] text-slate-500 block">سلوك: {st.behaviorScore}/100</span>
                    </td>
                    <td className="p-2 border-l border-slate-200 text-slate-700 text-[11px] leading-tight">
                      {st.primaryAlert}
                    </td>
                    <td className="p-2 text-slate-800 text-[11px] font-medium leading-tight">
                      {st.interventionPlan || 'متابعة دورية'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 6. قائمة الطلاب المتفوقين وأشبال الإتقان */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 border-r-4 border-gold-600 pr-2 flex items-center gap-1.5">
              <span>ثالثاً: لوحة شرف أشبال القرآن والمتميزين في الإتقان برواية ورش</span>
              <span className="text-[10px] text-gold-800 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-200">
                {standoutStudents.length} طلاب
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {standoutStudents.map((st) => (
                <div key={st.id} className="p-3 bg-gold-50/40 rounded-xl border border-gold-200/80 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-slate-900">{st.name}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {st.completedAjza} أجزاء
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600">{st.circleName} ({st.teacherName})</p>
                  <p className="text-[10px] text-slate-700 mt-1 italic leading-tight">"{st.commendation}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7. كتلة الاعتماد والتوقيع الرسمي */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">المشرف التربوي للحلقات</p>
              <p className="text-[11px] text-slate-400 mt-0.5">التوقيع والتأشيرة</p>
              <div className="h-16 mt-2 flex items-center justify-center text-slate-300 font-serif">
                [..........................]
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-700">ناظر مدرسة نبراس القرآنية</p>
              <p className="text-[11px] text-slate-400 mt-0.5">الاعتماد الإداري</p>
              <div className="h-16 mt-2 flex items-center justify-center text-slate-300 font-serif">
                [..........................]
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-700">إمام وخطيب مسجد إبراهيم الخليل</p>
              <p className="text-[11px] text-slate-400 mt-0.5">الختم الرسمي والتاريخ</p>
              <div className="h-16 mt-2 border-2 border-dashed border-emerald-700/30 rounded-2xl flex items-center justify-center text-emerald-800/40 font-black text-xs">
                ختم المدرسة والمسجد
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

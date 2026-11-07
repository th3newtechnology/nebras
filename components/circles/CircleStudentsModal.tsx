import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  BookOpen,
  Phone,
  Calendar,
  GraduationCap,
  Loader2,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { CircleItem, CircleStudentListItem } from '../../types/circle.types';
import { fetchCircleStudents } from '../../lib/circlesService';

interface CircleStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: CircleItem | null;
}

export const CircleStudentsModal: React.FC<CircleStudentsModalProps> = ({
  isOpen,
  onClose,
  circle,
}) => {
  const [students, setStudents] = useState<CircleStudentListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (circle && isOpen) {
      setLoading(true);
      fetchCircleStudents(circle.id)
        .then(data => setStudents(data))
        .finally(() => setLoading(false));
    }
  }, [circle, isOpen]);

  if (!isOpen || !circle) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border-2 border-gold-400 flex items-center justify-center text-gold-300">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-amiri text-gold-300">{circle.name}</h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 font-bold">
                  {circle.level}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                المشرف: <strong>{circle.teacherName}</strong> | القاعة: <strong>{circle.hallName || 'غير محددة'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="طباعة قائمة الطلاب"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-bold">
          {/* Summary Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">نسبة الإشغال</span>
              <p className="text-base font-black text-islamic-900 font-mono">
                {circle.enrolledStudentsCount} من {circle.capacity} مقعد ({circle.occupancyRate}%)
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">الفئة المستهدفة</span>
              <p className="text-slate-800">
                {circle.targetGender === 'male'
                  ? 'ذكور (طلاب)'
                  : circle.targetGender === 'female'
                  ? 'إناث (طالبات)'
                  : 'مختلط (براعم)'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block uppercase">العام الدراسي</span>
              <p className="text-slate-800 font-mono">{circle.academicYearName || 'العام الحالي'}</p>
            </div>
          </div>

          {/* Students Table */}
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-slate-500">جاري تحميل كشف طلاب الحلقة...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-slate-700 font-bold text-sm">لا يوجد طلاب مقيدون في هذه الحلقة حالياً</p>
              <p className="text-xs">يمكنك قيد طلاب جدد من خلال شاشة إدارة الطلاب</p>
            </div>
          ) : (
            <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">رقم القيد</th>
                    <th className="p-3.5">اسم الطالب</th>
                    <th className="p-3.5">المستوى القرآني</th>
                    <th className="p-3.5">ولي الأمر</th>
                    <th className="p-3.5">هاتف ولي الأمر</th>
                    <th className="p-3.5">تاريخ القيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{s.registrationNumber}</td>
                      <td className="p-3.5 font-black text-slate-900 font-amiri text-sm">{s.fullName}</td>
                      <td className="p-3.5 text-slate-600">{s.hifzLevel}</td>
                      <td className="p-3.5 text-slate-700">{s.guardianName}</td>
                      <td className="p-3.5">
                        <a
                          href={`tel:${s.guardianPhone}`}
                          dir="ltr"
                          className="font-mono text-islamic-800 hover:underline"
                        >
                          {s.guardianPhone}
                        </a>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{s.enrollmentDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">إجمالي الطلاب في الكشف: {students.length} طالب</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Printer, X, Sparkles, BookOpen, Clock, DoorOpen, User } from 'lucide-react';
import { TimetableSession } from '../../types/circle.types';

interface TimetablePrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: TimetableSession[];
  activeDays: { value: number; label: string }[];
  title?: string;
  subtitle?: string;
}

export const TimetablePrintView: React.FC<TimetablePrintViewProps> = ({
  isOpen,
  onClose,
  sessions,
  activeDays,
  title = 'الجدول الأسبوعي العام للحلقات القرآنية',
  subtitle = 'مسجد إبراهيم الخليل - مدرسة نبراس القرآنية للتعليم القرآني النموذجي',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('ar-DZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Top Control Bar (Hidden during printing) */}
        <div className="print:hidden p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Printer className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-bold font-amiri text-gold-300">
              معاينة الطباعة وتصدير مستند PDF الرسمي
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-black text-xs transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة المستند / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 Landscape / Portrait Styled) */}
        <div
          id="nebras-printable-timetable"
          className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-950 space-y-6 print:p-0 print:space-y-4 print:text-black"
        >
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-800 pb-5 text-center space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-bold border-b border-slate-200 pb-2">
              <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
              <span>وزارة الشؤون الدينية والأوقاف</span>
              <span>مديرية الشؤون الدينية - ولاية الجزائر</span>
            </div>

            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-black font-amiri text-slate-950">
                مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
              </h2>
              <h3 className="text-base font-bold font-amiri text-slate-700 mt-1">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle} • العام الدراسي 1447-1448 هـ / 2025-2026 م
              </p>
            </div>
          </div>

          {/* Timetable Table Grid */}
          <div className="overflow-x-auto border border-slate-400 rounded-xl">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b border-slate-400 font-bold">
                  <th className="p-3 border-l border-slate-300 w-28 text-center">اليوم</th>
                  <th className="p-3 border-l border-slate-300 w-32 text-center">التوقيت</th>
                  <th className="p-3 border-l border-slate-300">الحلقة القرآنية والمستوى</th>
                  <th className="p-3 border-l border-slate-300">المحفظ المسؤول</th>
                  <th className="p-3 border-l border-slate-300">القاعة المخصصة</th>
                  <th className="p-3 border-l border-slate-300 text-center w-20">الطلاب</th>
                  <th className="p-3 text-center w-36">ملاحظات / حالة الحصة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {activeDays.map((day) => {
                  const daySessions = sessions.filter((s) => s.dayOfWeek === day.value);

                  if (daySessions.length === 0) {
                    return (
                      <tr key={day.value} className="hover:bg-slate-50/50">
                        <td className="p-3 border-l border-slate-300 font-black font-amiri text-center bg-slate-50/70">
                          {day.label}
                        </td>
                        <td
                          colSpan={6}
                          className="p-3 text-center text-slate-400 italic text-[11px]"
                        >
                          لا توجد حصص مجدولة
                        </td>
                      </tr>
                    );
                  }

                  return daySessions.map((session, sIdx) => {
                    const isCancelled = session.activeException?.exceptionType === 'cancelled';
                    const isRescheduled = session.activeException?.exceptionType === 'rescheduled';

                    return (
                      <tr
                        key={session.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isCancelled ? 'bg-rose-50/40 text-rose-900' : ''
                        }`}
                      >
                        {sIdx === 0 ? (
                          <td
                            rowSpan={daySessions.length}
                            className="p-3 border-l border-slate-300 font-black font-amiri text-center bg-slate-50/70 align-middle text-sm"
                          >
                            {day.label}
                          </td>
                        ) : null}

                        <td className="p-3 border-l border-slate-300 text-center font-mono font-bold text-[11px]">
                          {isRescheduled && session.activeException
                            ? `${session.activeException.newStartTime} - ${session.activeException.newEndTime} (معدل)`
                            : `${session.startTime} - ${session.endTime}`}
                        </td>

                        <td className="p-3 border-l border-slate-300 font-bold">
                          <div className="font-amiri text-sm">{session.circleName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">
                            المستوى: {session.circleLevel} • {session.targetGender === 'male' ? 'بنين' : session.targetGender === 'female' ? 'بنات' : 'مشترك'}
                          </div>
                        </td>

                        <td className="p-3 border-l border-slate-300">
                          <div className="font-bold">{session.teacherName}</div>
                          {session.activeException?.substituteTeacherName && (
                            <div className="text-[10px] text-amber-700 font-bold">
                              بديل: {session.activeException.substituteTeacherName}
                            </div>
                          )}
                        </td>

                        <td className="p-3 border-l border-slate-300">
                          <div className="font-bold">
                            {session.activeException?.newHallName || session.hallName || 'غير محددة'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {session.hallLocation || 'مسجد إبراهيم الخليل'}
                          </div>
                        </td>

                        <td className="p-3 border-l border-slate-300 text-center font-mono font-bold">
                          {session.enrolledStudentsCount}
                        </td>

                        <td className="p-3 text-center text-[10px]">
                          {session.activeException ? (
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold ${
                                isCancelled
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isCancelled
                                ? `ملغاة (${session.activeException.reason})`
                                : session.activeException.reason}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-bold">حصة منتظمة</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>

          {/* Official Document Signatures & Stamp */}
          <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-700">
            <div className="text-right space-y-1">
              <div>تحريراً بالجزائر في: <strong className="font-mono">{currentDate}</strong></div>
              <div className="text-[10px] text-slate-500">مستند رسمي صادر عن أمانة مدرسة نبراس القرآنية</div>
            </div>

            <div className="text-center space-y-8">
              <div className="font-bold font-amiri text-sm">مشرف المدرسة وإمام المسجد</div>
              <div className="text-[11px] text-slate-400 italic">(التوقيع والختم الرسمي)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Calendar, Clock, MapPin, User, Sparkles } from 'lucide-react';

interface StudentScheduleTabProps {
  schedule: {
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    endTime: string;
    hallName: string;
  }[];
  circleName: string;
  teacherName: string;
}

export const StudentScheduleTab: React.FC<StudentScheduleTabProps> = ({
  schedule,
  circleName,
  teacherName,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-black font-amiri text-slate-900">
              جدول الحلقات والمواعيد الأسبوعية
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {circleName}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            مواعيد الحضور لجلسات التسميع بمحراب وقاعات مسجد إبراهيم الخليل عليه السلام
          </p>
        </div>

        <div className="text-xs text-slate-600 font-medium">
          المحفظ المشرف: <strong>{teacherName}</strong>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {schedule.map((session, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-slate-900">
                يوم {session.dayName}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-mono text-emerald-800 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{session.startTime} - {session.endTime}</span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.hallName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mosque Discipline Guidance */}
      <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/70 rounded-2xl border border-emerald-200/80 flex items-start gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-950 block">
            آداب وتوجيهات الحضور لحلقات القرآن بمسجد إبراهيم الخليل:
          </span>
          <p className="text-slate-700 leading-relaxed font-medium">
            يرجى الحضور بالوضوء والتطيب والجلوس بالسكينة والوقار في محراب المسجد قبل موعد الحلقة بخمس دقائق، مع إحضار المصحف الشريف ودفتر المتابعة التربوي.
          </p>
        </div>
      </div>
    </div>
  );
};

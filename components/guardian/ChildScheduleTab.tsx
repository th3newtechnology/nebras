import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  BookOpen,
} from 'lucide-react';

interface WeeklyScheduleItem {
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  hallName: string;
}

interface ChildScheduleTabProps {
  schedule: WeeklyScheduleItem[];
  circleName: string;
  teacherName: string;
}

export const ChildScheduleTab: React.FC<ChildScheduleTabProps> = ({
  schedule,
  circleName,
  teacherName,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            جدول الحصص الأسبوعية المعتمد لحلقة {circleName}
          </h3>
          <p className="text-xs text-slate-500">
            مواعيد وأيام التحفيظ بمسجد إبراهيم الخليل وفق التقويم الجزائري (السبت-الخميس) • المحفظ: {teacherName}
          </p>
        </div>
      </div>

      {schedule.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
          لا توجد حصص مجدولة لهذه الحلقة حالياً.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {schedule.map((session, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2 hover:border-emerald-300 transition-colors"
            >
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 inline-block">
                يوم {session.dayName}
              </span>
              <div className="text-sm font-black font-mono text-slate-800 pt-1 flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.startTime} ⬅️ {session.endTime}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{session.hallName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

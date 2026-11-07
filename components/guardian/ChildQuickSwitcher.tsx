import React from 'react';
import { GuardianChildOverview } from '../../types/guardianPortal.types';

interface ChildQuickSwitcherProps {
  childrenList: GuardianChildOverview[];
  selectedStudentId: string | null;
  onSelectChild: (studentId: string) => void;
}

export const ChildQuickSwitcher: React.FC<ChildQuickSwitcherProps> = ({
  childrenList,
  selectedStudentId,
  onSelectChild,
}) => {
  if (childrenList.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
          اختر الابن لاستعراض سجله القرآني والتربوي:
        </span>
        <span className="text-[11px] font-bold text-emerald-700">
          ({childrenList.length} أبناء مسجلين تحت حسابكم)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {childrenList.map((child) => {
          const isSelected = child.studentId === selectedStudentId;

          return (
            <button
              key={child.studentId}
              onClick={() => onSelectChild(child.studentId)}
              className={`p-4 rounded-2xl border text-right transition-all flex items-center justify-between relative overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
                  : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black font-amiri text-lg border transition-colors ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {child.fullName[0]}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-slate-900 text-sm">{child.fullName}</h4>
                    {child.unreadReportsCount > 0 && (
                      <span
                        className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"
                        title="يوجد تقرير جديد غير مقروء"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold block">
                    #{child.registrationNumber}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">
                    {child.circleName}
                  </span>
                </div>
              </div>

              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-400 font-bold block">المحفوظ</span>
                <span className="text-xs font-black text-slate-800">
                  جزء {child.currentJuz}/30
                </span>
                <span className="text-[10px] font-black text-gold-700 block mt-0.5">
                  ({child.completionPercentage}%)
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

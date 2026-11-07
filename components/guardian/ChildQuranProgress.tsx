import React, { useState } from 'react';
import {
  Target,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Heart,
  Info,
} from 'lucide-react';
import { GuardianChildDetail } from '../../types/guardianPortal.types';
import { JuzDetailModal } from './JuzDetailModal';
import { useNotifications } from '../../context/NotificationContext';

interface ChildQuranProgressProps {
  childDetail: GuardianChildDetail;
}

export const ChildQuranProgress: React.FC<ChildQuranProgressProps> = ({ childDetail }) => {
  const { overview, goals, timeline } = childDetail;
  const { addNotification } = useNotifications();

  // Juz Modal
  const [selectedJuzNumber, setSelectedJuzNumber] = useState<number | null>(null);

  // Recitation Filter & Expanded IDs
  const [recitationFilter, setRecitationFilter] = useState<'all' | 'new_memorization' | 'minor_review' | 'major_review'>('all');
  const [expandedRecitationIds, setExpandedRecitationIds] = useState<Record<string, boolean>>({});

  // Endorsed Goals (Home review confirmed by parent)
  const [endorsedGoals, setEndorsedGoals] = useState<Record<string, boolean>>({});

  const toggleExpandRecitation = (id: string) => {
    setExpandedRecitationIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleEndorseGoal = (goalId: string, goalTitle: string) => {
    setEndorsedGoals((prev) => ({
      ...prev,
      [goalId]: true,
    }));
    addNotification(
      'تأكيد المراجعة المنزلية',
      `تم توثيق إنجاز ومراجعة هدف "${goalTitle}" من طرف الأسرة بنجاح بارك الله فيكم.`,
      'success'
    );
  };

  const filteredTimeline = timeline.filter((entry) => {
    if (recitationFilter === 'all') return true;
    if (recitationFilter === 'new_memorization') return entry.category === 'new_memorization';
    if (recitationFilter === 'minor_review') return entry.category === 'minor_review';
    if (recitationFilter === 'major_review') return entry.category === 'major_review';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 30 Ajza Visual Grid */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>خريطة الأجزاء الثلاثين من القرآن الكريم (برواية ورش عن نافع):</span>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            الأخضر: مكتمل • الأصفر: قيد الحفظ • الأبيض: متبقٍ • (انقر لمعاينة السور والإرشادات)
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => {
            const isCompleted = juz < overview.currentJuz;
            const isCurrent = juz === overview.currentJuz;

            return (
              <button
                key={juz}
                onClick={() => setSelectedJuzNumber(juz)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs hover:bg-emerald-700'
                    : isCurrent
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400 font-black hover:bg-amber-200'
                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                }`}
                title={`انقر لعرض تفاصيل الجزء ${juz}`}
              >
                <div className="text-[10px] font-bold">جزء</div>
                <div className="text-sm font-black font-mono">{juz}</div>
                <div className="text-[8px] mt-0.5">
                  {isCompleted ? '✓ تم' : isCurrent ? 'جاري' : 'متبقٍ'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Goals with Parent Home Endorsement */}
      {goals.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-gold-600" />
            <span>الأهداف والمستهدفات القرآنية المحددة للابن:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.map((goal) => {
              const isEndorsed = endorsedGoals[goal.id];

              return (
                <div
                  key={goal.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{goal.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          goal.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {goal.status === 'completed' ? '✓ مكتمل بالحلقة' : '⏳ جاري'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">{goal.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      موعد الإنجاز المستهدف: {goal.targetDate}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    {isEndorsed ? (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تمت المراجعة المنزلية بنجاح ✓</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEndorseGoal(goal.id, goal.title)}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200 px-3 py-1 rounded-xl transition-colors flex items-center gap-1"
                      >
                        <Heart className="w-3 h-3 text-rose-500" />
                        <span>تأكيد المراجعة المنزلية مع الابن</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Recitation Sessions Feed */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>سجل جلسات التسميع والمراجعة بمحراب المسجد:</span>
          </h4>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setRecitationFilter('all')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-[11px] ${
                recitationFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setRecitationFilter('new_memorization')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-[11px] ${
                recitationFilter === 'new_memorization'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              حفظ جديد
            </button>
            <button
              onClick={() => setRecitationFilter('minor_review')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-[11px] ${
                recitationFilter === 'minor_review'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              مراجعة صغرى
            </button>
            <button
              onClick={() => setRecitationFilter('major_review')}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-[11px] ${
                recitationFilter === 'major_review'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              مراجعة كبرى
            </button>
          </div>
        </div>

        {filteredTimeline.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
            لا توجد جلسات تسميع مسجلة في هذا التصنيف.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTimeline.map((entry) => {
              const isExpanded = Boolean(expandedRecitationIds[entry.id]);

              return (
                <div
                  key={entry.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-2 transition-all hover:border-emerald-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{entry.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${entry.badgeColor}`}>
                          {entry.badge}
                        </span>
                      </div>
                      {entry.warshAdherence && (
                        <p className="text-[11px] text-emerald-800 font-medium mt-1">
                          <strong>رواية ورش:</strong> {entry.warshAdherence}
                        </p>
                      )}
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <span className="text-slate-400 text-[10px] block">{entry.date}</span>
                      {entry.grade && (
                        <span className="font-black text-emerald-700 text-xs block mt-0.5">
                          {entry.grade}
                        </span>
                      )}
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                      توجيه الشيخ: "{entry.notes}"
                    </p>
                  )}

                  {/* Expand/Collapse Button */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => toggleExpandRecitation(entry.id)}
                      className="text-slate-500 hover:text-emerald-800 font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>{isExpanded ? 'طي تفاصيل التقييم' : 'عرض تفاصيل التقييم والتجويد'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Evaluation Breakdown */}
                  {isExpanded && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 mt-2 animate-in fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block font-bold">الدرجة المقدرة</span>
                          <span className="font-black text-xs font-mono text-emerald-700">95/100</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block font-bold">المقياس الجزائري</span>
                          <span className="font-black text-xs font-mono text-emerald-800">19/20</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block font-bold">أخطاء الحفظ</span>
                          <span className="font-black text-xs font-mono text-slate-800">0</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block font-bold">ملاحظات التجويد</span>
                          <span className="font-black text-xs font-mono text-amber-700">1</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Juz Detail Modal */}
      {selectedJuzNumber !== null && (
        <JuzDetailModal
          isOpen={selectedJuzNumber !== null}
          juzNumber={selectedJuzNumber}
          currentStudentJuz={overview.currentJuz}
          studentName={overview.fullName}
          onClose={() => setSelectedJuzNumber(null)}
        />
      )}
    </div>
  );
};

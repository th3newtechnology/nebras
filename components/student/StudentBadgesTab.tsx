import React from 'react';
import {
  Award,
  Crown,
  Star,
  Flame,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Lock,
  Trophy,
} from 'lucide-react';
import { StudentBadge, StudentStreakData } from '../../types/studentPortal.types';

interface StudentBadgesTabProps {
  badges: StudentBadge[];
  streak: StudentStreakData;
  onOpenCertificateModal: () => void;
}

const BADGE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  award: Award,
  crown: Crown,
  star: Star,
  flame: Flame,
  sparkles: Sparkles,
  book: BookOpen,
  check: CheckCircle2,
};

export const StudentBadgesTab: React.FC<StudentBadgesTabProps> = ({
  badges,
  streak,
  onOpenCertificateModal,
}) => {
  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const lockedBadges = badges.filter((b) => !b.isUnlocked);

  const WEEK_DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

  return (
    <div className="space-y-6">
      {/* Streaks & Motivation Banner */}
      <div className="p-6 bg-gradient-to-r from-amber-500/10 via-gold-500/10 to-emerald-500/10 rounded-3xl border border-gold-300/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500 fill-rose-500 animate-bounce" />
            <h3 className="text-lg font-black font-amiri text-slate-900">
              سلسلة التتابع القرآني والمواظبة (Streak)
            </h3>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            حافظ على تلاوة وتسميع وردك اليومي دون انقطاع لزيادة نقاط الهمة وفتح الأوسمة الخاصة.
          </p>

          {/* 7-day Weekly Grid */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto">
            {WEEK_DAYS.map((day, idx) => {
              const isActive = streak.weeklyActivity[idx];
              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-center min-w-[55px] border transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="text-[10px] font-bold">{day}</div>
                  <div className="text-xs font-black mt-1">
                    {isActive ? '🔥' : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate CTA Card */}
        <div className="p-4 bg-white rounded-2xl border border-gold-200 shadow-sm space-y-3 shrink-0 text-center max-w-xs">
          <Trophy className="w-8 h-8 text-gold-500 mx-auto" />
          <div>
            <h4 className="text-xs font-black text-slate-900">شهادات التميز القرآنية</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              شهادات إلكترونية معتمدة من إدارة المدرسة وشيخ الحلقة
            </p>
          </div>
          <button
            onClick={onOpenCertificateModal}
            className="w-full py-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs"
          >
            معاينة وطباعة الشهادة
          </button>
        </div>
      </div>

      {/* Unlocked Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>الأوسمة والشارات المكتسبة ({unlockedBadges.length}):</span>
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            أوسمة فخرية معتمدة
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {unlockedBadges.map((badge) => {
            const IconComponent = BADGE_ICONS[badge.icon] || Award;

            return (
              <div
                key={badge.id}
                className="p-4 bg-white rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-slate-900 text-xs">{badge.title}</h4>
                    <span className="text-[10px] text-emerald-700 font-bold">✓ نلت الوسام</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      تاريخ المنح: {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked / Future Badges */}
      {lockedBadges.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>الأوسمة قيد الفتح والتحصيل ({lockedBadges.length}):</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lockedBadges.map((badge) => {
              const IconComponent = BADGE_ICONS[badge.icon] || Lock;

              return (
                <div
                  key={badge.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-start gap-3.5 opacity-80"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-200/80 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div className="space-y-2 w-full">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{badge.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {badge.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>نسبة الإنجاز:</span>
                        <span>{badge.progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

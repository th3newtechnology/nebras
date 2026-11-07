import React from 'react';
import {
  Flame,
  Award,
  Sparkles,
  BookOpen,
  MapPin,
  User,
  Star,
  Trophy,
} from 'lucide-react';
import { StudentProfileData, StudentStreakData } from '../../types/studentPortal.types';

interface StudentHeaderProps {
  profile: StudentProfileData;
  streak: StudentStreakData;
  onOpenCertificateModal: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  profile,
  streak,
  onOpenCertificateModal,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-islamic-950 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-emerald-700/40 relative overflow-hidden">
      {/* Decorative Islamic Background Ornament */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-radial from-emerald-500/10 to-transparent pointer-events-none -translate-x-20 -translate-y-20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-radial from-gold-500/10 to-transparent pointer-events-none translate-x-16 translate-y-16 rounded-full blur-xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Student Identity Spotlight */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gold-400 to-amber-600 p-1 shadow-lg shrink-0">
            <div className="w-full h-full rounded-[22px] bg-emerald-950 flex items-center justify-center font-amiri font-black text-3xl text-gold-300">
              {profile.fullName[0]}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black font-amiri tracking-wide text-ivory-100">
                مرحباً بك، يا {profile.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-800/80 text-emerald-200 border border-emerald-600/50">
                #{profile.registrationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/40">
                المستوى: {profile.hifzLevel}
              </span>
            </div>

            <p className="text-xs lg:text-sm text-emerald-200/90 font-medium mt-1.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gold-400" />
                <span>{profile.circleName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>{profile.hallName}</span>
              </span>
              <span>•</span>
              <span>المحفظ: <strong>{profile.teacherName}</strong></span>
            </p>
          </div>
        </div>

        {/* Motivational KPIs: Points, Streaks, Certificates */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Points Pill */}
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gold-500/30 text-gold-300 flex items-center justify-center font-bold">
              <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200/80 block">نقاط الهمة</span>
              <span className="text-base font-black font-mono text-gold-300">
                {profile.points.toLocaleString()} 💎
              </span>
            </div>
          </div>

          {/* Streaks Pill */}
          <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/30 text-rose-300 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200/80 block">تتابع الورد</span>
              <span className="text-base font-black font-mono text-white">
                {streak.currentStreakDays} يوماً 🔥
              </span>
            </div>
          </div>

          {/* Certificate Button */}
          <button
            onClick={onOpenCertificateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>شهاداتي القرآنية</span>
          </button>
        </div>
      </div>

      {/* Khatm Progress Bar */}
      <div className="mt-6 pt-5 border-t border-emerald-800/60 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>المسار المبارك نحو ختم القرآن الكريم (برواية ورش):</span>
            </span>
            <span className="font-black font-mono text-gold-300">
              الجزء {profile.currentJuz} من {profile.targetJuz} ({profile.completionPercentage}%)
            </span>
          </div>

          <div className="h-3 w-full bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-700/50">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-gold-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${profile.completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 text-xs font-medium text-emerald-200">
          <span>
            المتبقي للختمة: <strong className="text-white font-mono">{30 - profile.currentJuz} جزءاً</strong>
          </span>
          <span className="text-emerald-500">•</span>
          <span>
            الحزب الحالي: <strong className="text-gold-300 font-mono">الحزب {profile.currentHizb}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

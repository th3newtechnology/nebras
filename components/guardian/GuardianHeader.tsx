import React from 'react';
import {
  Heart,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { GuardianDashboardOverview } from '../../types/guardianPortal.types';
import { SCHOOL_INFO } from '../../constants';
import { ViewType } from '../../types';

interface GuardianHeaderProps {
  dashboardData: GuardianDashboardOverview | null;
  guardianName?: string;
  loading: boolean;
  onRefresh: () => void;
  onNavigateView?: (view: ViewType, param?: string) => void;
}

export const GuardianHeader: React.FC<GuardianHeaderProps> = ({
  dashboardData,
  guardianName,
  loading,
  onRefresh,
  onNavigateView,
}) => {
  return (
    <header className="bg-gradient-to-l from-islamic-950 via-islamic-900 to-islamic-800 rounded-3xl p-6 md:p-8 text-white shadow-xl border border-gold-500/30 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-gold-400" />
              <span>بوابة أولياء الأمور المعتمدة • {SCHOOL_INFO.affiliation}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>عزل أمني تام (Zero Leakage)</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black font-amiri text-white tracking-tight">
            أهلاً وسهلاً بك، {guardianName || dashboardData?.guardianName || 'ولي الأمر الكريم'}
          </h1>
          <p className="text-xs md:text-sm text-ivory-200/90 font-medium max-w-2xl leading-relaxed">
            متابعة مباشرة ومستمرة لمسار حفظ وتجويد ومواظبة أبنائكم بمحراب مسجد إبراهيم الخليل، مع الاطلاع على تقارير المشايخ وتوجيهاتهم التربوية وسندات الاشتراكات.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigateView?.('messages')}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs border border-white/15 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-gold-300" />
            <span>مراسلة المعلم</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors border border-white/10"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate Family KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
        <div>
          <span className="text-[11px] text-ivory-200 font-bold block">الأبناء المقيدون</span>
          <p className="text-2xl font-black font-mono mt-1 text-white">
            {dashboardData?.totalChildrenCount || 0}
          </p>
        </div>
        <div>
          <span className="text-[11px] text-ivory-200 font-bold block">مجموع الأجزاء المحفوظة</span>
          <p className="text-2xl font-black font-mono mt-1 text-gold-300">
            {dashboardData?.totalMemorizedAjza || 0} جزءاً
          </p>
        </div>
        <div>
          <span className="text-[11px] text-ivory-200 font-bold block">متوسط المواظبة والحضور</span>
          <p className="text-2xl font-black font-mono mt-1 text-emerald-300">
            {dashboardData?.averageAttendanceRate || 100}%
          </p>
        </div>
        <div>
          <span className="text-[11px] text-ivory-200 font-bold block">التقارير المستلمة</span>
          <p className="text-2xl font-black font-mono mt-1 text-teal-200">
            {dashboardData?.recentReports.length || 0} تقرير
          </p>
        </div>
      </div>
    </header>
  );
};

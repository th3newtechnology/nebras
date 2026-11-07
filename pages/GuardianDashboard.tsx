import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  CreditCard,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  GuardianDashboardOverview,
  GuardianChildDetail,
} from '../types/guardianPortal.types';
import {
  fetchGuardianDashboardData,
  fetchChildDetailForGuardian,
  markReportAsViewedByGuardian,
} from '../lib/guardianService';
import { TeacherReport } from '../types/teacherReport.types';
import { ViewType } from '../types';

// استيراد مكونات بوابة الولي المنفصلة
import { GuardianHeader } from '../components/guardian/GuardianHeader';
import { ChildQuickSwitcher } from '../components/guardian/ChildQuickSwitcher';
import { ChildQuranProgress } from '../components/guardian/ChildQuranProgress';
import { ChildReportsTab } from '../components/guardian/ChildReportsTab';
import { ChildAttendanceTab } from '../components/guardian/ChildAttendanceTab';
import { ChildFeesTab } from '../components/guardian/ChildFeesTab';
import { ChildScheduleTab } from '../components/guardian/ChildScheduleTab';

interface GuardianDashboardProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
}

export const GuardianDashboard: React.FC<GuardianDashboardProps> = ({ onNavigateView }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [dashboardData, setDashboardData] = useState<GuardianDashboardOverview | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedChildDetail, setSelectedChildDetail] = useState<GuardianChildDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'quran' | 'reports' | 'attendance' | 'fees' | 'timetable'>('quran');
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const guardianUserId = user?.id || 'u-guardian-01';

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await fetchGuardianDashboardData(guardianUserId);
      setDashboardData(data);

      if (data.children.length > 0) {
        const initialId = selectedStudentId || data.children[0].studentId;
        setSelectedStudentId(initialId);
        await loadChildDetail(initialId);
      }
    } catch (err) {
      console.error('فشل تحميل بيانات بوابة ولي الأمر:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildDetail = async (studentId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await fetchChildDetailForGuardian(studentId, guardianUserId);
      setSelectedChildDetail(detail);
    } catch (err: any) {
      addNotification(
        'تنبيه أمني',
        err.message || 'تعذر استرجاع بيانات الطالب',
        'error'
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [guardianUserId]);

  const handleSelectChild = (studentId: string) => {
    setSelectedStudentId(studentId);
    loadChildDetail(studentId);
  };

  const handleViewReport = async (report: TeacherReport) => {
    if (!report.guardianViewedAt) {
      await markReportAsViewedByGuardian(report.id, guardianUserId);
      if (selectedStudentId) {
        loadChildDetail(selectedStudentId);
      }
    }
  };

  const activeChild = dashboardData?.children.find((c) => c.studentId === selectedStudentId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" dir="rtl">
      {/* 1. Header & Aggregate KPIs */}
      <GuardianHeader
        dashboardData={dashboardData}
        guardianName={user?.displayName}
        loading={loading}
        onRefresh={loadDashboard}
        onNavigateView={onNavigateView}
      />

      {/* 2. Child Selector Tabs (Switcher) */}
      {dashboardData && (
        <ChildQuickSwitcher
          childrenList={dashboardData.children}
          selectedStudentId={selectedStudentId}
          onSelectChild={handleSelectChild}
        />
      )}

      {/* 3. Active Child Profile Spotlight & Overview */}
      {activeChild && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6 p-6">
          {/* Top Bar of Active Child */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100/70 border border-emerald-200 text-emerald-900 flex items-center justify-center font-black font-amiri text-2xl shadow-inner shrink-0">
                {activeChild.fullName[0]}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-black font-amiri text-slate-900">
                    {activeChild.fullName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                    #{activeChild.registrationNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    المستوى: {activeChild.hifzLevel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium mt-2">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>{activeChild.circleName}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{activeChild.hallName || 'قاعة الإمام مالك'}</span>
                  </span>
                  <span>•</span>
                  <span>المحفظ: <strong>{activeChild.teacherName}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Contact Teacher Buttons */}
            <div className="flex items-center gap-2 self-start lg:self-center">
              {activeChild.teacherPhone && (
                <>
                  <a
                    href={`tel:${activeChild.teacherPhone}`}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="اتصال هاتفي بالشيخ المحفظ"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline">اتصال بالشيخ</span>
                  </a>

                  <a
                    href={`https://wa.me/${activeChild.teacherPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                    title="محادثة واتساب مباشرة"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">واتساب</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar & Key Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 30 Juz Bar */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">مسار إتمام القرآن الكريم:</span>
                <span className="font-black font-mono text-emerald-950">
                  الجزء {activeChild.currentJuz} من {activeChild.targetJuz || 30} ({activeChild.completionPercentage}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all"
                  style={{ width: `${activeChild.completionPercentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">
                متبقي لإتمام الختمة المباركة: {30 - activeChild.currentJuz} جزءاً
              </span>
            </div>

            {/* Attendance Indicator */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-900 block">المواظبة والانضباط</span>
                <span className="text-xl font-black font-mono text-blue-950 mt-1 block">
                  {activeChild.attendanceRate}%
                </span>
                <span className="text-[10px] text-slate-500">
                  حضر {activeChild.presentSessions} • غياب {activeChild.absentSessions}
                </span>
              </div>
              <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Last Recitation */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
                <span>آخر تسميع مسجل:</span>
                <span className="font-black text-emerald-800">{activeChild.lastRecitationGrade || 'ممتاز'}</span>
              </div>
              <p className="text-xs font-black text-slate-800 truncate">
                {activeChild.lastRecitationSurah} ({activeChild.lastRecitationAyahs})
              </p>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                {activeChild.lastRecitationDate}
              </span>
            </div>
          </div>

          {/* Teacher's latest note */}
          {activeChild.lastTeacherNote && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">
                  توجيه المحفظ في آخر جلسة تسميع:
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  "{activeChild.lastTeacherNote}"
                </p>
              </div>
            </div>
          )}

          {/* Tab Navigation for Child Details */}
          <div className="flex items-center gap-2 border-b border-slate-200 pt-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('quran')}
              className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'quran'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>خريطة الأجزاء وسجل التسميع</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 relative whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>تقارير المحفظ الدورية</span>
              {selectedChildDetail && selectedChildDetail.reports.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                  {selectedChildDetail.reports.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'attendance'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>كشف المواظبة وتبرير الغياب</span>
            </button>

            <button
              onClick={() => setActiveTab('fees')}
              className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'fees'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>الاشتراكات وسندات القبض (DZD)</span>
            </button>

            <button
              onClick={() => setActiveTab('timetable')}
              className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'timetable'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>جدول الحصص الأسبوعية</span>
            </button>
          </div>

          {/* Tab Content */}
          {loadingDetail ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل سجل الابن...</p>
            </div>
          ) : selectedChildDetail ? (
            <div className="space-y-6 pt-2">
              {/* TAB 1: Quran 30 Juz Map & History */}
              {activeTab === 'quran' && (
                <ChildQuranProgress childDetail={selectedChildDetail} />
              )}

              {/* TAB 2: Teacher Reports */}
              {activeTab === 'reports' && (
                <ChildReportsTab
                  reports={selectedChildDetail.reports}
                  studentName={activeChild.fullName}
                  onViewReport={handleViewReport}
                />
              )}

              {/* TAB 3: Attendance & Excuses */}
              {activeTab === 'attendance' && (
                <ChildAttendanceTab
                  overview={activeChild}
                  attendanceLog={selectedChildDetail.attendanceLog}
                  excuses={selectedChildDetail.excuses}
                  guardianId={guardianUserId}
                  onRefresh={() => loadChildDetail(activeChild.studentId)}
                />
              )}

              {/* TAB 4: Fees & Receipts */}
              {activeTab === 'fees' && (
                <ChildFeesTab
                  feeSummary={selectedChildDetail.feeSummary}
                  studentName={activeChild.fullName}
                />
              )}

              {/* TAB 5: Timetable */}
              {activeTab === 'timetable' && (
                <ChildScheduleTab
                  schedule={selectedChildDetail.weeklySchedule}
                  circleName={activeChild.circleName}
                  teacherName={activeChild.teacherName}
                />
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GuardianDashboard;

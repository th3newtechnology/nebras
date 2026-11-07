import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  Sparkles,
  Clock,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  StudentDashboardData,
  StudentCertificate,
} from '../types/studentPortal.types';
import {
  fetchStudentDashboardData,
  toggleWirdSectionCompleted,
  fetchStudentCertificates,
} from '../lib/studentPortalService';
import { ViewType } from '../types';

// استيراد مكونات بوابة الطالب المعيارية
import { StudentHeader } from '../components/student/StudentHeader';
import { DailyWirdCard } from '../components/student/DailyWirdCard';
import { StudentJuzMap } from '../components/student/StudentJuzMap';
import { StudentBadgesTab } from '../components/student/StudentBadgesTab';
import { StudentScheduleTab } from '../components/student/StudentScheduleTab';
import { StudentMushafModal } from '../components/student/StudentMushafModal';
import { StudentCertificateModal } from '../components/student/StudentCertificateModal';

interface StudentDashboardProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateView }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'wird' | 'juz_map' | 'badges' | 'schedule' | 'recitations'>('wird');

  // Modals state
  const [isMushafOpen, setIsMushafOpen] = useState(false);
  const [mushafSurahNumber, setMushafSurahNumber] = useState<number>(1);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<StudentCertificate | null>(null);

  const studentId = user?.id || 's-001';

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentDashboardData(studentId);
      setDashboardData(data);
    } catch (err) {
      console.error('فشل تحميل بيانات بوابة الطالب:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const handleToggleWirdSection = async (sectionType: 'new' | 'minor' | 'major') => {
    try {
      const updatedWird = await toggleWirdSectionCompleted(studentId, sectionType);
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          wird: updatedWird,
        });
      }

      addNotification(
        'تقبل الله طاعتكم',
        'تم تسجيل إنجاز قسم من الورد اليومي بنجاح، زادك الله همة ونوراً.',
        'success'
      );
    } catch (err: any) {
      addNotification('خطأ', err.message || 'تعذر تحديث الورد', 'error');
    }
  };

  const handleOpenMushaf = (surahNumber: number) => {
    setMushafSurahNumber(surahNumber);
    setIsMushafOpen(true);
  };

  const handleOpenCertificate = async () => {
    const certs = await fetchStudentCertificates(studentId);
    if (certs.length > 0) {
      setSelectedCertificate(certs[0]);
      setIsCertificateOpen(true);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-700 mx-auto" />
        <p className="text-xs font-bold text-slate-500 font-amiri text-lg">
          جاري فتح محراب الطالب القرآني المبارك...
        </p>
      </div>
    );
  }

  const { profile, wird, streak, badges, juzMap, recentRecitations, weeklySchedule } = dashboardData;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" dir="rtl">
      {/* 1. Header & Hero Identity */}
      <StudentHeader
        profile={profile}
        streak={streak}
        onOpenCertificateModal={handleOpenCertificate}
      />

      {/* 2. Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center gap-2 overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('wird')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'wird'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ورد اليوم والمصحف</span>
        </button>

        <button
          onClick={() => setActiveTab('juz_map')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'juz_map'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>خريطة الأجزاء الـ 30</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gold-400 text-slate-950 font-mono font-bold">
            {profile.currentJuz}/30
          </span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>أوسمتي وإنجازاتي</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
            {badges.filter((b) => b.isUnlocked).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>جدول الحلقات بالمسجد</span>
        </button>

        <button
          onClick={() => setActiveTab('recitations')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'recitations'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>سجل جلساتي وتسميعي</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'wird' && (
        <DailyWirdCard
          wird={wird}
          onToggleSection={handleToggleWirdSection}
          onOpenMushafForSurah={handleOpenMushaf}
        />
      )}

      {activeTab === 'juz_map' && (
        <StudentJuzMap
          juzMap={juzMap}
          currentJuz={profile.currentJuz}
          onOpenMushafForSurah={handleOpenMushaf}
        />
      )}

      {activeTab === 'badges' && (
        <StudentBadgesTab
          badges={badges}
          streak={streak}
          onOpenCertificateModal={handleOpenCertificate}
        />
      )}

      {activeTab === 'schedule' && (
        <StudentScheduleTab
          schedule={weeklySchedule}
          circleName={profile.circleName}
          teacherName={profile.teacherName}
        />
      )}

      {activeTab === 'recitations' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black font-amiri text-slate-900">
                سجل جلسات التسميع والمراجعة السابقة
              </h3>
              <p className="text-xs text-slate-500">
                تفاصيل ما سمعته لدى الشيخ المحفظ ودرجات التجويد برواية ورش
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              إجمالي الجلسات: {recentRecitations.length}
            </span>
          </div>

          <div className="space-y-3">
            {recentRecitations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{rec.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rec.badgeColor}`}>
                      {rec.badge}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px]">{rec.date}</span>
                </div>

                {rec.warshAdherence && (
                  <p className="text-[11px] text-emerald-800 font-medium">
                    <strong>رواية ورش:</strong> {rec.warshAdherence}
                  </p>
                )}

                {rec.notes && (
                  <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    توجيه الشيخ: "{rec.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Modals */}
      <StudentMushafModal
        isOpen={isMushafOpen}
        initialSurahNumber={mushafSurahNumber}
        onClose={() => setIsMushafOpen(false)}
      />

      <StudentCertificateModal
        isOpen={isCertificateOpen}
        certificate={selectedCertificate}
        onClose={() => setIsCertificateOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;

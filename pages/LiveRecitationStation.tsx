import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  StopCircle,
  AlertCircle,
  Check,
  UserCheck,
  UserX,
  RefreshCw,
  FileText,
  Volume2,
  ArrowRight,
  Compass,
  MapPin,
  Flame,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  CheckCheck,
  Send,
  CalendarCheck,
  Columns,
  Layout,
  Eye,
  Wand2,
  Gauge,
  RotateCcw,
  HelpCircle,
  Cloud,
  CloudOff,
  Database,
  Archive,
  ShieldCheck,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LiveRecitationSession,
  LiveSessionStudent,
  LiveSessionStats,
  SessionStatus,
  StudentAttendanceStatus,
  StudentRecitationState,
  RecitationPriority,
  RecitationCategory,
  RecitationGrade,
  SessionArchiveResult,
} from '../types/liveSession.types';
import {
  initLiveSession,
  getActiveLiveSession,
  saveLiveSessionDraft,
  updateLiveSessionStatus,
  setActiveSessionStudent,
  calculateSessionStats,
  clearLiveSession,
  markAllStudentsAttendance,
  updateStudentAttendance,
  reorderStudentTurn,
  sortQueueByPriority,
  deferStudentTurn,
  syncSessionAttendanceToSupabase,
  archiveAndSyncLiveSession,
  getArchivedSessions,
} from '../lib/liveSessionService';
import {
  fetchTeacherCirclesWithDetails,
  QURAN_JUZ_NAMES,
} from '../lib/teacherPortalService';
import { TeacherCircleDetail } from '../types/teacherPortal.types';
import { ViewType } from '../types';
import {
  QURAN_SURAHS,
  getSurahByNumber,
  getSurahByName,
  validateAyahRange,
  getDefaultRecitationForStudent,
} from '../lib/quranMetadata';
import { WarshAssistantMushaf } from '../components/teacher/live/WarshAssistantMushaf';
import { LiveSessionReportModal } from '../components/teacher/live/LiveSessionReportModal';
import {
  calculateRecitationScore,
  formatScoreOutOf20,
  HIFZ_MISTAKE_TAGS,
  TAJWEED_MISTAKE_TAGS,
  DetailedMistakesInput,
  RecitationScoreResult,
} from '../lib/evaluationEngine';

interface LiveRecitationStationProps {
  onNavigateView?: (view: ViewType, param?: string) => void;
  preselectedCircleId?: string;
}

export const LiveRecitationStation: React.FC<LiveRecitationStationProps> = ({
  onNavigateView,
  preselectedCircleId,
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const teacherId = user?.teacherId || user?.id || 't-01';
  const teacherName = user?.displayName || 'فضيلة المحفظ المعتمد';

  // Circles and Session State
  const [circles, setCircles] = useState<TeacherCircleDetail[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>(preselectedCircleId || 'c1');
  const [session, setSession] = useState<LiveRecitationSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Field Focus Mode (Full Screen)
  const [isFieldMode, setIsFieldMode] = useState(false);

  // Active Mobile View (Queue vs Reciting)
  const [mobileTab, setMobileTab] = useState<'queue' | 'reciting'>('reciting');

  // Filter in Student Queue
  const [queueFilter, setQueueFilter] = useState<'all' | 'pending' | 'completed' | 'absent'>('all');

  // Active Workspace Layout Mode ('split' | 'mushaf' | 'evaluation')
  const [workspaceViewMode, setWorkspaceViewMode] = useState<'split' | 'mushaf' | 'evaluation'>('split');

  // Active Draft Recitation for Selected Student
  const [recitationCategory, setRecitationCategory] = useState<RecitationCategory>('new_memorization');
  const [surahNumber, setSurahNumber] = useState<number>(18);
  const [surahName, setSurahName] = useState<string>('الكهف');
  const [ayahFrom, setAyahFrom] = useState<number>(1);
  const [ayahTo, setAyahTo] = useState<number>(30);
  const [grade, setGrade] = useState<RecitationGrade>('ممتاز');
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [tajweedMistakesCount, setTajweedMistakesCount] = useState<number>(0);
  const [detailedMistakes, setDetailedMistakes] = useState<DetailedMistakesInput>({
    hesitation: 0,
    wordSubstitution: 0,
    verseSkip: 0,
    teacherPrompt: 0,
    nunMeemSakinah: 0,
    maddWarsh: 0,
    tarqeeqTaghleez: 0,
    taqleel: 0,
    naqlHamz: 0,
    makhrajSifah: 0,
  });
  const [isManualGradeOverride, setIsManualGradeOverride] = useState<boolean>(false);
  const [teacherNotes, setTeacherNotes] = useState('');

  // Auto-Save & Network Status States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedDisplay, setLastSavedDisplay] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // Archive Session Dialog States
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const [archiveResult, setArchiveResult] = useState<SessionArchiveResult | null>(null);

  // Performance Report Dialog States
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportTargetSession, setReportTargetSession] = useState<LiveRecitationSession | null>(null);

  // Online / Offline listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic Auto-Save every 25 seconds
  useEffect(() => {
    if (!session || session.status === 'completed') return;

    const interval = setInterval(() => {
      setIsSaving(true);
      saveLiveSessionDraft(session);
      setTimeout(() => {
        setIsSaving(false);
        setLastSavedDisplay(
          new Date().toLocaleTimeString('ar-DZ', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        );
      }, 400);
    }, 25000);

    return () => clearInterval(interval);
  }, [session]);

  // 0. Automatic Quranic Score & Grade Calculation
  const scoreResult: RecitationScoreResult = useMemo(() => {
    return calculateRecitationScore({
      ...detailedMistakes,
      generalHifzMistakes: mistakesCount,
      generalTajweedMistakes: tajweedMistakesCount,
    });
  }, [detailedMistakes, mistakesCount, tajweedMistakesCount]);

  // Synchronize grade with recommendedGrade when not manually overridden
  useEffect(() => {
    if (!isManualGradeOverride) {
      setGrade(scoreResult.recommendedGrade);
    }
  }, [scoreResult.recommendedGrade, isManualGradeOverride]);

  // 1. Initial Load of Circles and Active Session
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const loadedCircles = await fetchTeacherCirclesWithDetails(teacherId);
        setCircles(loadedCircles);

        const circleIdToUse = preselectedCircleId || (loadedCircles[0] ? loadedCircles[0].id : 'c1');
        setSelectedCircleId(circleIdToUse);

        // Check if there's already an active session saved
        const existingSession = getActiveLiveSession(teacherId);
        if (existingSession && existingSession.circleId === circleIdToUse) {
          setSession(existingSession);
        } else {
          // Initialize a new session
          const newSession = await initLiveSession(circleIdToUse, teacherId, teacherName);
          setSession(newSession);
        }
      } catch (err) {
        console.error('خطأ في تحميل جلسة محطة الإقراء:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [teacherId, preselectedCircleId]);

  // Active Student
  const activeStudent: LiveSessionStudent | null = useMemo(() => {
    if (!session || !session.activeStudentId) return null;
    return session.students.find((s) => s.studentId === session.activeStudentId) || null;
  }, [session]);

  // Session Stats
  const stats: LiveSessionStats = useMemo(() => {
    if (!session) {
      return { total: 0, present: 0, absent: 0, completed: 0, remaining: 0, progressPercentage: 0 };
    }
    return calculateSessionStats(session);
  }, [session]);

  // Filtered Students Queue
  const filteredQueue = useMemo(() => {
    if (!session) return [];
    return session.students.filter((s) => {
      if (queueFilter === 'pending') return s.recitationState === 'pending' || s.recitationState === 'reciting';
      if (queueFilter === 'completed') return s.recitationState === 'completed';
      if (queueFilter === 'absent') return s.attendance === 'absent' || s.attendance === 'excused';
      return true;
    });
  }, [session, queueFilter]);

  // Switch Circle
  const handleCircleChange = async (newCircleId: string) => {
    if (!session || session.circleId === newCircleId) return;

    if (session.status === 'in_progress') {
      const confirmSwitch = window.confirm('هناك جلسة إقراء جارية حالياً. هل ترغب في إنهاء مسودتها والبدء بحلقة أخرى؟');
      if (!confirmSwitch) return;
    }

    setLoading(true);
    try {
      setSelectedCircleId(newCircleId);
      const newSession = await initLiveSession(newCircleId, teacherId, teacherName);
      setSession(newSession);
      addNotification('تم تبديل الحلقة', `تم فتح محطة الإقراء للحلقة: ${newSession.circleName}`, 'info');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Change Session Status
  const handleStatusChange = (newStatus: SessionStatus) => {
    if (!session) return;

    if (newStatus === 'completed') {
      setShowArchiveModal(true);
      return;
    }

    const updated = updateLiveSessionStatus(session, newStatus);
    setSession(updated);

    if (newStatus === 'in_progress') {
      addNotification('بدء الجلسة', 'بدأت جلسة التسميع القرآني المباشر.', 'success');
    } else if (newStatus === 'paused') {
      addNotification('إيقاف مؤقت', 'تم إيقاف جلسة التسميع مؤقتاً.', 'info');
    }
  };

  // Confirm Archive and Final Sync
  const handleConfirmArchiveSession = async () => {
    if (!session) return;
    setIsArchiving(true);
    try {
      const res = await archiveAndSyncLiveSession(session);
      setArchiveResult(res);
      addNotification(
        'تم أرشفة الجلسة بنجاح',
        `تم حفظ وترحيل نتائج الجلسة لـ ${res.completedRecitations} تلميذاً أتموا التسميع (${res.syncStatus === 'synced' ? 'متصل سحابياً' : 'محفوظ محلياً'}).`,
        'success'
      );
      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed',
              syncStatus: res.syncStatus,
              archivedAt: res.archivedAt,
            }
          : null
      );
    } catch (err: any) {
      addNotification('خطأ في الأرشفة', err.message || 'تعذرت أرشفة الجلسة', 'error');
    } finally {
      setIsArchiving(false);
    }
  };

  // Reset Mistakes & Live Scoring
  const handleResetMistakes = () => {
    setDetailedMistakes({
      hesitation: 0,
      wordSubstitution: 0,
      verseSkip: 0,
      teacherPrompt: 0,
      nunMeemSakinah: 0,
      maddWarsh: 0,
      tarqeeqTaghleez: 0,
      taqleel: 0,
      naqlHamz: 0,
      makhrajSifah: 0,
    });
    setMistakesCount(0);
    setTajweedMistakesCount(0);
    setIsManualGradeOverride(false);
  };

  // Increment specific Hifz mistake tag
  const handleIncrementHifzTag = (tagKey: keyof DetailedMistakesInput) => {
    setDetailedMistakes((prev) => ({
      ...prev,
      [tagKey]: ((prev[tagKey] as number) || 0) + 1,
    }));
    setMistakesCount((c) => c + 1);
  };

  // Increment specific Tajweed mistake tag
  const handleIncrementTajweedTag = (tagKey: keyof DetailedMistakesInput) => {
    setDetailedMistakes((prev) => ({
      ...prev,
      [tagKey]: ((prev[tagKey] as number) || 0) + 1,
    }));
    setTajweedMistakesCount((c) => c + 1);
  };

  // Keyboard Shortcuts for Teacher (Rapid Classroom Operation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs or textareas
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement)?.tagName || ''
        )
      ) {
        return;
      }

      // Space: Toggle pause / resume session
      if (e.code === 'Space') {
        e.preventDefault();
        if (session) {
          if (session.status === 'in_progress') {
            handleStatusChange('paused');
          } else if (session.status === 'paused' || session.status === 'preparing') {
            handleStatusChange('in_progress');
          }
        }
      }

      // Alt + KeyN: Move to next student in queue
      if (e.altKey && e.code === 'KeyN') {
        e.preventDefault();
        handleNavigateStudent('next');
      }

      // Alt + KeyS: Save / submit current student recitation
      if (e.altKey && e.code === 'KeyS') {
        e.preventDefault();
        handleSubmitStudentRecitation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, activeStudent, mistakesCount, tajweedMistakesCount, grade]);

  // Select Active Student
  const handleSelectStudent = (studentId: string) => {
    if (!session) return;
    const updated = setActiveSessionStudent(session, studentId);
    setSession(updated);
    setMobileTab('reciting');

    const target = session.students.find((s) => s.studentId === studentId);
    if (target) {
      if (target.evaluation) {
        setRecitationCategory(target.evaluation.category);
        setSurahNumber(target.evaluation.surahNumber || 18);
        setSurahName(target.evaluation.surahName);
        setAyahFrom(target.evaluation.ayahFrom);
        setAyahTo(target.evaluation.ayahTo);
        setGrade(target.evaluation.grade);
        setMistakesCount(target.evaluation.mistakesCount);
        setTajweedMistakesCount(target.evaluation.tajweedMistakesCount);
        setDetailedMistakes(target.evaluation.detailedMistakes || {
          hesitation: 0,
          wordSubstitution: 0,
          verseSkip: 0,
          teacherPrompt: 0,
          nunMeemSakinah: 0,
          maddWarsh: 0,
          tarqeeqTaghleez: 0,
          taqleel: 0,
          naqlHamz: 0,
          makhrajSifah: 0,
        });
        setIsManualGradeOverride(target.evaluation.isManualGradeOverride || false);
        setTeacherNotes(target.evaluation.notes || '');
      } else {
        // Auto suggest recitation block based on student's current Juz
        const def = getDefaultRecitationForStudent(target.currentJuz, target.hifzLevel);
        setSurahNumber(def.surahNumber);
        setSurahName(def.surahName);
        setAyahFrom(def.fromAyah);
        setAyahTo(def.toAyah);
        handleResetMistakes();
        setTeacherNotes('');
      }
    }
  };

  // Surah and Range Navigation
  const handleSelectSurah = (newSurahNumber: number) => {
    const s = getSurahByNumber(newSurahNumber);
    if (!s) return;
    setSurahNumber(s.number);
    setSurahName(s.name);
    const validation = validateAyahRange(s.number, 1, Math.min(s.ayahsCount, 15));
    setAyahFrom(validation.correctedFrom);
    setAyahTo(validation.correctedTo);
  };

  const handleSelectRange = (from: number, to: number) => {
    const validation = validateAyahRange(surahNumber, from, to);
    setAyahFrom(validation.correctedFrom);
    setAyahTo(validation.correctedTo);
  };

  const handleAutoSuggestRecitation = () => {
    if (!activeStudent) return;
    const def = getDefaultRecitationForStudent(activeStudent.currentJuz, activeStudent.hifzLevel);
    setSurahNumber(def.surahNumber);
    setSurahName(def.surahName);
    setAyahFrom(def.fromAyah);
    setAyahTo(def.toAyah);
    addNotification(
      'اقتراح الورد الذكي',
      `تم ضبط المقرر على سورة ${def.surahName} (الآيات 1-${def.toAyah}) بحسب جزء الطالب (${activeStudent.currentJuz}).`,
      'info'
    );
  };

  // Toggle Attendance
  const handleSetAttendance = (studentId: string, attendance: StudentAttendanceStatus) => {
    if (!session) return;
    const updatedStudents = session.students.map((s) => {
      if (s.studentId === studentId) {
        return { ...s, attendance };
      }
      return s;
    });

    const updated: LiveRecitationSession = { ...session, students: updatedStudents };
    saveLiveSessionDraft(updated);
    setSession(updated);
  };

  // Toggle Priority
  const handleSetPriority = (studentId: string, priority: RecitationPriority) => {
    if (!session) return;
    const updatedStudents = session.students.map((s) => {
      if (s.studentId === studentId) {
        return { ...s, priority };
      }
      return s;
    });

    const updated: LiveRecitationSession = { ...session, students: updatedStudents };
    saveLiveSessionDraft(updated);
    setSession(updated);
  };

  // Next / Previous Student
  const handleNavigateStudent = (direction: 'next' | 'prev') => {
    if (!session || !activeStudent) return;
    const currentIndex = session.students.findIndex((s) => s.studentId === activeStudent.studentId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < session.students.length) {
      handleSelectStudent(session.students[targetIndex].studentId);
    }
  };

  // Fast Submit Current Student Recitation & Auto Advance
  const [isSyncingAttendance, setIsSyncingAttendance] = useState(false);

  const handleMarkAllPresent = () => {
    if (!session) return;
    const updated = markAllStudentsAttendance(session, 'present');
    setSession(updated);
    addNotification('التحضير الجماعي', 'تم تحضير جميع طلاب الحلقة بنجاح.', 'success');
  };

  const handleSortByPriority = () => {
    if (!session) return;
    const updated = sortQueueByPriority(session);
    setSession(updated);
    addNotification('ترتيب الطابور', 'تمت إعادة ترتيب الطابور وفق أولوية الحضور والاستعجال.', 'info');
  };

  const handleReorder = (e: React.MouseEvent, studentId: string, direction: 'up' | 'down') => {
    e.stopPropagation();
    if (!session) return;
    const updated = reorderStudentTurn(session, studentId, direction);
    setSession(updated);
  };

  const handleDefer = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    if (!session) return;
    const updated = deferStudentTurn(session, studentId);
    setSession(updated);
    addNotification('تأجيل الدور', 'تم تأجيل دور الطالب لمراجعة الحفظ ونقله لأسفل القائمة.', 'info');
  };

  const handleQuickAttendance = (e: React.MouseEvent, studentId: string, status: StudentAttendanceStatus) => {
    e.stopPropagation();
    if (!session) return;
    const updated = updateStudentAttendance(session, studentId, status);
    setSession(updated);
  };

  const handleSyncAttendance = async () => {
    if (!session) return;
    setIsSyncingAttendance(true);
    try {
      const res = await syncSessionAttendanceToSupabase(session);
      if (res.success) {
        addNotification('مزامنة كشف الحضور', `تم اعتماد ومزامنة حضور ${res.syncedCount} طالباً بنجاح في السجلات الرسمية.`, 'success');
      } else {
        addNotification('تنبيه المزامنة', res.error || 'تعذرت المزامنة المباشرة', 'warning');
      }
    } catch (err: any) {
      addNotification('خطأ', err.message || 'حدث خطأ أثناء المزامنة', 'error');
    } finally {
      setIsSyncingAttendance(false);
    }
  };

  const handleSubmitStudentRecitation = () => {
    if (!session || !activeStudent) return;

    // Validate Ayah Range
    const validation = validateAyahRange(surahNumber, ayahFrom, ayahTo);
    const validFrom = validation.correctedFrom;
    const validTo = validation.correctedTo;

    const updatedStudents = session.students.map((s) => {
      if (s.studentId === activeStudent.studentId) {
        return {
          ...s,
          recitationState: 'completed' as StudentRecitationState,
          evaluation: {
            category: recitationCategory,
            surahNumber,
            surahName: validation.surah.name,
            ayahFrom: validFrom,
            ayahTo: validTo,
            grade,
            mistakesCount,
            tajweedMistakesCount,
            score: scoreResult.score,
            scoreOutOf20: scoreResult.scoreOutOf20,
            detailedMistakes,
            isManualGradeOverride,
            notes: teacherNotes,
            completedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
          },
        };
      }
      return s;
    });

    // Find next pending student
    const nextPending = updatedStudents.find(
      (s) => s.recitationState === 'pending' && s.attendance === 'present'
    );

    const updated: LiveRecitationSession = {
      ...session,
      status: session.status === 'preparing' ? 'in_progress' : session.status,
      activeStudentId: nextPending ? nextPending.studentId : activeStudent.studentId,
      students: updatedStudents,
    };

    saveLiveSessionDraft(updated);
    setSession(updated);

    addNotification(
      'تم اعتماد التسميع',
      `تم رصد تسميع الطالب ${activeStudent.fullName} بتقدير (${grade}).`,
      'success'
    );

    // Reset draft fields
    handleResetMistakes();
    setTeacherNotes('');
  };

  if (loading || !session) {
    return (
      <div className="py-24 text-center space-y-4" dir="rtl">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-700 mx-auto" />
        <h3 className="text-lg font-black text-slate-800">جاري تجهيز محطة الإقراء المباشر بمحراب المسجد...</h3>
      </div>
    );
  }

  return (
    <div
      className={`space-y-6 animate-in fade-in duration-300 ${
        isFieldMode ? 'fixed inset-0 z-50 bg-ivory-50 p-4 md:p-6 overflow-y-auto' : ''
      }`}
      dir="rtl"
    >
      {/* ===================================================================== */}
      {/* 1. TOP LIVE HEADER: CIRCLE INFO + STATUS + CONTROLS */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 rounded-3xl p-6 text-white shadow-xl border border-emerald-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Right: Circle & Session Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-400/30 text-gold-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>محطة الإقراء والتسميع المباشر</span>
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                  session.status === 'in_progress'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : session.status === 'paused'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                    : session.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-white/10 text-slate-200 border-white/20'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    session.status === 'in_progress'
                      ? 'bg-emerald-400 animate-ping'
                      : session.status === 'paused'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span>
                  {session.status === 'in_progress'
                    ? 'جلسة إقراء جارية'
                    : session.status === 'paused'
                    ? 'الجلسة متوقفة مؤقتاً'
                    : session.status === 'completed'
                    ? 'الجلسة مكتملة ومؤرشفة'
                    : 'قيد التجهيز والتحضير'}
                </span>
              </span>

              {/* Simulation Transparency Badge */}
              {session.isSimulated && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  وضع المحاكاة الميدانية
                </span>
              )}

              {/* Auto-Save & Sync Status Indicator */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-emerald-200 border border-white/15 text-[11px] font-bold">
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-gold-300" />
                    <span>جاري الحفظ التلقائي...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span>
                      تم الحفظ {lastSavedDisplay ? `(${lastSavedDisplay})` : 'محلياً'}
                    </span>
                  </>
                )}
                <span className="text-white/30">•</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span className="text-[10px]">
                  {isOnline ? 'متصل سحابياً' : 'حفظ محلي مؤمن'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3">
              <h1 className="text-2xl md:text-3xl font-black font-amiri text-white tracking-tight">
                {session.circleName}
              </h1>
              <span className="text-xs text-emerald-200 font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                <span>{session.hallName}</span>
                <span className="text-emerald-400/60">•</span>
                <span>المحفظ: {session.teacherName}</span>
              </span>
            </div>
          </div>

          {/* Left: Circle Switcher & Session Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Circle Select Dropdown */}
            <select
              value={selectedCircleId}
              onChange={(e) => handleCircleChange(e.target.value)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-xs font-bold text-white outline-none cursor-pointer"
            >
              {circles.map((c) => (
                <option key={c.id} value={c.id} className="text-slate-800">
                  {c.name}
                </option>
              ))}
            </select>

            {/* Session Action Buttons */}
            {session.status === 'preparing' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 active:scale-95 text-emerald-950 font-black text-xs rounded-2xl transition-all shadow-lg shadow-gold-500/20 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-emerald-950" />
                <span>بدء جلسة الإقراء</span>
              </button>
            )}

            {session.status === 'in_progress' && (
              <button
                onClick={() => handleStatusChange('paused')}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" />
                <span>إيقاف مؤقت</span>
              </button>
            )}

            {session.status === 'paused' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-2xl transition-all flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>استئناف الجلسة</span>
              </button>
            )}

            {session.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="px-4 py-2.5 bg-rose-600/80 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5"
              >
                <StopCircle className="w-4 h-4" />
                <span>إنهاء الجلسة</span>
              </button>
            )}

            {/* Session Analytics & Report Button */}
            <button
              onClick={() => {
                setReportTargetSession(session);
                setShowReportModal(true);
              }}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-gold-300 font-bold text-xs rounded-2xl transition-all border border-gold-400/30 flex items-center gap-1.5 shadow-xs"
              title="عرض تقرير ومؤشرات أداء الجلسة"
            >
              <BarChart2 className="w-4 h-4 text-gold-400" />
              <span className="hidden sm:inline">تقرير الجلسة</span>
            </button>

            {/* Field Focus Mode Toggle */}
            <button
              onClick={() => setIsFieldMode(!isFieldMode)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors border border-white/15"
              title={isFieldMode ? 'الخروج من وضع ملء الشاشة' : 'وضع الشاشة الكاملة الميداني'}
            >
              {isFieldMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Progress Bar & Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-emerald-800/80">
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">إجمالي طلاب الحلقة</span>
            <p className="text-xl font-black font-mono text-white mt-0.5">{stats.total}</p>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">الحاضرون اليوم</span>
            <p className="text-xl font-black font-mono text-emerald-300 mt-0.5">{stats.present}</p>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">أتمّوا التسميع</span>
            <p className="text-xl font-black font-mono text-gold-300 mt-0.5">{stats.completed}</p>
          </div>
          <div>
            <span className="text-[11px] text-emerald-300 font-bold block">قيد الانتظار</span>
            <p className="text-xl font-black font-mono text-teal-200 mt-0.5">{stats.remaining}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[11px] text-emerald-300 font-bold block">إنجاز الحلقة</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progressPercentage}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-gold-300">{stats.progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-slate-200 p-1.5 rounded-2xl gap-1">
        <button
          onClick={() => setMobileTab('reciting')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            mobileTab === 'reciting' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
          }`}
        >
          منصة التسميع للطالب الحالي
        </button>
        <button
          onClick={() => setMobileTab('queue')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
            mobileTab === 'queue' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600'
          }`}
        >
          طابور الحلقة ({session.students.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 2. DUAL OPERATIONAL WORKSPACE (ROSTER QUEUE + ACTIVE HUB) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =================================================================== */}
        {/* RIGHT PANEL: LIVE CIRCLE ROSTER & QUEUE (35% on desktop) */}
        {/* =================================================================== */}
        <div
          className={`lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 ${
            mobileTab === 'queue' ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-800">طابور التسميع وترتيب الدور</h3>
              <p className="text-[11px] text-slate-400">انقر على أي طالب لفتحه في المنصة</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-700 font-mono">
              {filteredQueue.length}
            </span>
          </div>

          {/* Bulk Attendance & Sorting Toolbar */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-ivory-50 rounded-2xl border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-emerald-950 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-700" />
                <span>التحضير السريع للحلقة:</span>
              </span>
              <button
                onClick={handleSyncAttendance}
                disabled={isSyncingAttendance}
                className="text-[11px] font-black text-emerald-900 hover:text-emerald-950 flex items-center gap-1 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
                title="مزامنة الحضور مع السجلات الرسمية"
              >
                <Send className={`w-3 h-3 text-emerald-700 ${isSyncingAttendance ? 'animate-spin' : ''}`} />
                <span>مزامنة الكشف</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleMarkAllPresent}
                className="py-2 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-xl font-black transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>الكل حاضر</span>
              </button>

              <button
                onClick={handleSortByPriority}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>فرز الأولويات</span>
              </button>
            </div>
          </div>

          {/* Queue Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scroll-smooth whitespace-nowrap">
            <button
              onClick={() => setQueueFilter('all')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                queueFilter === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الكل ({session.students.length})
            </button>
            <button
              onClick={() => setQueueFilter('pending')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                queueFilter === 'pending'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              بالانتظار ({stats.remaining})
            </button>
            <button
              onClick={() => setQueueFilter('completed')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                queueFilter === 'completed'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              أتموا التسميع ({stats.completed})
            </button>
            <button
              onClick={() => setQueueFilter('absent')}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                queueFilter === 'absent'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              الغائبون ({stats.absent})
            </button>
          </div>

          {/* Student Queue Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueue.map((student) => {
              const isActive = activeStudent?.studentId === student.studentId;
              const isReciting = student.recitationState === 'reciting';
              const isCompleted = student.recitationState === 'completed';
              const isAbsent = student.attendance === 'absent' || student.attendance === 'excused';

              return (
                <div
                  key={student.studentId}
                  onClick={() => handleSelectStudent(student.studentId)}
                  className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                      : isCompleted
                      ? 'bg-slate-50/60 border-slate-200 hover:bg-slate-50'
                      : isAbsent
                      ? 'bg-rose-50/30 border-rose-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Turn Number Badge */}
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {student.turnOrder}
                      </span>

                      <div>
                        <h4 className="font-black text-xs text-slate-900">{student.fullName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          جزء {student.currentJuz} من {student.targetJuz}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isReciting && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>يُسمّع الآن</span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-gold-100 text-gold-900">
                          <Check className="w-3 h-3 text-gold-700" />
                          <span>{student.evaluation?.grade || 'أتمّ التسميع'}</span>
                        </span>
                      )}

                      {!isReciting && !isCompleted && !isAbsent && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          بالانتظار
                        </span>
                      )}

                      {isAbsent && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          {student.attendance === 'absent' ? 'غائب' : 'معذور'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Queue Control Toolbar per student */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs gap-2">
                    {/* Quick Attendance Selector */}
                    <div className="flex items-center gap-1">
                      {(['present', 'late', 'absent', 'excused'] as StudentAttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          onClick={(e) => handleQuickAttendance(e, student.studentId, status)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                            student.attendance === status
                              ? status === 'present'
                                ? 'bg-emerald-700 text-white'
                                : status === 'late'
                                ? 'bg-amber-600 text-white'
                                : 'bg-rose-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                          title={`تغيير الحالة إلى ${
                            status === 'present' ? 'حاضر' : status === 'late' ? 'متأخر' : status === 'absent' ? 'غائب' : 'معذور'
                          }`}
                        >
                          {status === 'present'
                            ? 'حاضر'
                            : status === 'late'
                            ? 'متأخر'
                            : status === 'absent'
                            ? 'غائب'
                            : 'معذور'}
                        </button>
                      ))}
                    </div>

                    {/* Turn Reordering Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleReorder(e, student.studentId, 'up')}
                        disabled={student.turnOrder === 1}
                        className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-30 rounded-md transition-colors"
                        title="تقديم الدور في الطابور"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleReorder(e, student.studentId, 'down')}
                        disabled={student.turnOrder === session.students.length}
                        className="p-1 hover:bg-slate-200 text-slate-500 disabled:opacity-30 rounded-md transition-colors"
                        title="تأخير الدور في الطابور"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDefer(e, student.studentId)}
                        className="p-1 hover:bg-amber-100 text-amber-700 rounded-md transition-colors"
                        title="تأجيل الدور للمراجعة"
                      >
                        <CornerDownLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* LEFT PANEL: ACTIVE STUDENT RECITATION HUB (65% on desktop) */}
        {/* =================================================================== */}
        <div
          className={`lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6 ${
            mobileTab === 'reciting' ? 'block' : 'hidden md:block'
          }`}
        >
          {activeStudent ? (
            <>
              {/* Active Student Top Info Card */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-ivory-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white font-black font-amiri text-2xl flex items-center justify-center shadow-md">
                    {activeStudent.fullName[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black font-amiri text-slate-900">
                        {activeStudent.fullName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black bg-gold-100 text-gold-900 border border-gold-200">
                        #{activeStudent.registrationNumber}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-bold mt-1">
                      المستوى: {activeStudent.hifzLevel} • الدور في الحلقة: رقم {activeStudent.turnOrder}
                    </p>
                  </div>
                </div>

                {/* Quick Navigation between students */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <button
                    onClick={() => handleNavigateStudent('prev')}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors shadow-xs"
                    title="الطالب السابق"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-500 px-2">
                    {activeStudent.turnOrder} / {session.students.length}
                  </span>

                  <button
                    onClick={() => handleNavigateStudent('next')}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors shadow-xs"
                    title="الطالب التالي"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Attendance and Priority Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Attendance Buttons */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-600 block">حالة الحضور للجلسة:</span>
                  <div className="flex items-center gap-1.5">
                    {(['present', 'late', 'absent', 'excused'] as StudentAttendanceStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleSetAttendance(activeStudent.studentId, st)}
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                          activeStudent.attendance === st
                            ? st === 'present'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : st === 'late'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {st === 'present'
                          ? 'حاضر'
                          : st === 'late'
                          ? 'متأخر'
                          : st === 'absent'
                          ? 'غائب'
                          : 'معذور'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-600 block">أولوية التسميع:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSetPriority(activeStudent.studentId, 'normal')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                        activeStudent.priority === 'normal'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      عادي
                    </button>
                    <button
                      onClick={() => handleSetPriority(activeStudent.studentId, 'priority_high')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                        activeStudent.priority === 'priority_high'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      مستعجل
                    </button>
                    <button
                      onClick={() => handleSetPriority(activeStudent.studentId, 'early_leave')}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                        activeStudent.priority === 'early_leave'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      خروج مبكر
                    </button>
                  </div>
                </div>
              </div>

              {/* Workspace View Mode Switcher Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setWorkspaceViewMode('split')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      workspaceViewMode === 'split'
                        ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5 text-emerald-700" />
                    <span>العرض المزدوج (المصحف + الرصد)</span>
                  </button>
                  <button
                    onClick={() => setWorkspaceViewMode('mushaf')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      workspaceViewMode === 'mushaf'
                        ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                    <span>المصحف المساعد فقط</span>
                  </button>
                  <button
                    onClick={() => setWorkspaceViewMode('evaluation')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      workspaceViewMode === 'evaluation'
                        ? 'bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-700" />
                    <span>لوحة الرصد فقط</span>
                  </button>
                </div>

                {/* Auto Suggest Recitation Button */}
                <button
                  onClick={handleAutoSuggestRecitation}
                  className="px-3 py-1.5 bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs"
                  title="اقتراح السورة والآيات تلقائياً بناءً على جزء الطالب ومستواه"
                >
                  <Wand2 className="w-3.5 h-3.5 text-gold-700" />
                  <span>اقتراح الورد الذكي (جزء {activeStudent.currentJuz})</span>
                </button>
              </div>

              {/* ============================================================= */}
              {/* MAIN CONTENT AREA ACCORDING TO VIEW MODE                      */}
              {/* ============================================================= */}
              <div
                className={
                  workspaceViewMode === 'split'
                    ? 'grid grid-cols-1 xl:grid-cols-12 gap-6'
                    : 'space-y-6'
                }
              >
                {/* 1. MUSHAF ASSISTANT PANEL */}
                {(workspaceViewMode === 'split' || workspaceViewMode === 'mushaf') && (
                  <div
                    className={
                      workspaceViewMode === 'split'
                        ? 'xl:col-span-7 h-[680px]'
                        : 'h-[620px]'
                    }
                  >
                    <WarshAssistantMushaf
                      surahNumber={surahNumber}
                      fromAyah={ayahFrom}
                      toAyah={ayahTo}
                      onSelectSurah={handleSelectSurah}
                      onSelectRange={handleSelectRange}
                      studentName={activeStudent.fullName}
                      isCompact={workspaceViewMode === 'split'}
                    />
                  </div>
                )}

                {/* 2. RECITATION EVALUATION PANEL */}
                {(workspaceViewMode === 'split' || workspaceViewMode === 'evaluation') && (
                  <div
                    className={`space-y-5 ${
                      workspaceViewMode === 'split'
                        ? 'xl:col-span-5 bg-slate-50/70 p-5 rounded-3xl border border-slate-200/80 shadow-xs'
                        : 'bg-slate-50/70 p-6 rounded-3xl border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        <span>رصد التسميع القرآني المباشر</span>
                      </h4>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        رواية ورش عن نافع
                      </span>
                    </div>

                    {/* Category Pills */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 block">
                        نوع التسميع القرآني:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['new_memorization', 'minor_review', 'major_review'] as RecitationCategory[]).map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setRecitationCategory(cat)}
                            className={`py-2 rounded-xl text-xs font-black transition-all ${
                              recitationCategory === cat
                                ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-800/20'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {cat === 'new_memorization'
                              ? 'حفظ جديد'
                              : cat === 'minor_review'
                              ? 'مراجعة صغرى'
                              : 'مراجعة كبرى'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Surah Selector & Verses Range */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-500">السورة المقررة:</label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {getSurahByNumber(surahNumber)?.ayahsCount || 0} آية • جزء {getSurahByNumber(surahNumber)?.startJuz}
                          </span>
                        </div>
                        <select
                          value={surahNumber}
                          onChange={(e) => handleSelectSurah(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
                        >
                          {QURAN_SURAHS.map((s) => (
                            <option key={s.number} value={s.number}>
                              {s.number}. سورة {s.name} ({s.ayahsCount} آية - جزء {s.startJuz})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ayah Range Inputs & Fast Presets */}
                      <div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">من الآية:</label>
                            <input
                              type="number"
                              min={1}
                              max={getSurahByNumber(surahNumber)?.ayahsCount || 286}
                              value={ayahFrom}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleSelectRange(val, Math.max(val, ayahTo));
                              }}
                              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 block mb-1">إلى الآية:</label>
                            <input
                              type="number"
                              min={ayahFrom}
                              max={getSurahByNumber(surahNumber)?.ayahsCount || 286}
                              value={ayahTo}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleSelectRange(ayahFrom, val);
                              }}
                              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Quick Range Presets */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              const s = getSurahByNumber(surahNumber);
                              if (s) handleSelectRange(1, s.ayahsCount);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold transition-colors"
                          >
                            كامل السورة
                          </button>
                          <button
                            onClick={() => {
                              const s = getSurahByNumber(surahNumber);
                              const max = s?.ayahsCount || 286;
                              handleSelectRange(ayahFrom, Math.min(ayahFrom + 4, max));
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold transition-colors"
                          >
                            +5 آيات
                          </button>
                          <button
                            onClick={() => {
                              const s = getSurahByNumber(surahNumber);
                              const max = s?.ayahsCount || 286;
                              handleSelectRange(ayahFrom, Math.min(ayahFrom + 9, max));
                            }}
                            className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold transition-colors"
                          >
                            +10 آيات
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* LIVE INTERACTIVE SCORE CARD */}
                    <div className="p-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-md space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-gold-300" />
                          <span className="text-xs font-bold text-slate-200">النتيجة والتقدير المباشر:</span>
                          {!isManualGradeOverride ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                              حساب آلي ذكي
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                              <span>تعديل يدوي</span>
                              <button
                                onClick={() => setIsManualGradeOverride(false)}
                                className="underline hover:text-white"
                                title="العودة للحساب التلقائي"
                              >
                                (إلغاء)
                              </button>
                            </span>
                          )}
                        </div>

                        {/* Reset Mistakes Button */}
                        {(mistakesCount > 0 || tajweedMistakesCount > 0) && (
                          <button
                            onClick={handleResetMistakes}
                            className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                            title="تصفير كافة العثرات والعودة إلى 100/100"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>تصفير</span>
                          </button>
                        )}
                      </div>

                      {/* Numbers & Grade Banner */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono font-black text-2xl text-gold-300">
                            {formatScoreOutOf20(scoreResult.scoreOutOf20)}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            ({scoreResult.score}% من 100)
                          </span>
                        </div>

                        {/* Grade Pill */}
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black shadow-xs ${scoreResult.gradeColor.bg} ${scoreResult.gradeColor.text}`}
                        >
                          {grade}
                        </span>
                      </div>

                      {/* Live Score Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden border border-white/10">
                          <div
                            className={`h-full transition-all duration-300 ${
                              scoreResult.score >= 90
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                                : scoreResult.score >= 80
                                ? 'bg-gradient-to-r from-teal-400 to-emerald-400'
                                : scoreResult.score >= 70
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
                                : 'bg-gradient-to-r from-rose-500 to-rose-400'
                            }`}
                            style={{ width: `${Math.max(5, scoreResult.score)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-300 font-medium">
                          {scoreResult.feedbackMessage}
                        </p>
                      </div>
                    </div>

                    {/* DUAL MISTAKES RECORDER: HIFZ & TAJWEED */}
                    <div className="space-y-3">
                      {/* 1. Hifz Mistakes (اللحن الجلي) */}
                      <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-rose-950 block">
                              عثرات الحفظ (اللحن الجلي)
                            </span>
                            <span className="text-[10px] text-rose-600 font-medium">
                              خصم {scoreResult.deductionsSummary.hifzPointsDeducted} نقطة
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setMistakesCount(Math.max(0, mistakesCount - 1))}
                              className="w-7 h-7 rounded-lg bg-white border border-rose-200 text-rose-900 font-bold flex items-center justify-center hover:bg-rose-50 active:scale-95 shadow-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-black text-base text-rose-950">
                              {mistakesCount}
                            </span>
                            <button
                              onClick={() => setMistakesCount(mistakesCount + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-rose-200 text-rose-900 font-bold flex items-center justify-center hover:bg-rose-50 active:scale-95 shadow-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Quick Tag Capsules for Hifz */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {HIFZ_MISTAKE_TAGS.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => handleIncrementHifzTag(tag.id as any)}
                              className="px-2 py-1 rounded-lg bg-white hover:bg-rose-100/60 active:scale-95 text-rose-900 border border-rose-200 text-[10px] font-bold transition-all shadow-xs flex items-center gap-1"
                            >
                              <span>+ {tag.label}</span>
                              <span className="text-[9px] text-rose-500 font-mono">
                                ({((detailedMistakes as any)[tag.id] || 0)})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Tajweed Mistakes & Warsh Rules (اللحن الخفي) */}
                      <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-black text-amber-950 block">
                              أحكام التجويد ورواية ورش (اللحن الخفي)
                            </span>
                            <span className="text-[10px] text-amber-600 font-medium">
                              خصم {scoreResult.deductionsSummary.tajweedPointsDeducted} نقطة
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setTajweedMistakesCount(Math.max(0, tajweedMistakesCount - 1))}
                              className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-900 font-bold flex items-center justify-center hover:bg-amber-50 active:scale-95 shadow-xs"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-mono font-black text-base text-amber-950">
                              {tajweedMistakesCount}
                            </span>
                            <button
                              onClick={() => setTajweedMistakesCount(tajweedMistakesCount + 1)}
                              className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-900 font-bold flex items-center justify-center hover:bg-amber-50 active:scale-95 shadow-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Quick Tag Capsules for Tajweed & Warsh */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {TAJWEED_MISTAKE_TAGS.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => handleIncrementTajweedTag(tag.id as any)}
                              className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100/60 active:scale-95 text-amber-900 border border-amber-200 text-[10px] font-bold transition-all shadow-xs flex items-center gap-1"
                            >
                              <span>+ {tag.label}</span>
                              <span className="text-[9px] text-amber-500 font-mono">
                                ({((detailedMistakes as any)[tag.id] || 0)})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Fast Grades Buttons (with manual override state) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-bold text-slate-500">تقدير التسميع:</label>
                        {isManualGradeOverride && (
                          <span className="text-[10px] font-bold text-amber-700">
                            تم تثبيت التقدير يدوياً
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(['ممتاز', 'جيد جداً', 'جيد', 'يحتاج مراجعة'] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => {
                              setGrade(g);
                              setIsManualGradeOverride(true);
                            }}
                            className={`py-2 rounded-xl text-xs font-black transition-all ${
                              grade === g
                                ? g === 'ممتاز'
                                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/20'
                                  : g === 'جيد جداً'
                                  ? 'bg-teal-600 text-white shadow-xs ring-2 ring-teal-600/20'
                                  : g === 'جيد'
                                  ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-600/20'
                                  : 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/20'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Teacher Notes */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        توجيه وملاحظة المحفظ للطالب (اختياري):
                      </label>
                      <input
                        type="text"
                        value={teacherNotes}
                        onChange={(e) => setTeacherNotes(e.target.value)}
                        placeholder="مثال: ركّز على ضبط ترقيق الراءات عند ورش ومراعاة الوقف..."
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-700 shadow-xs"
                      />
                    </div>

                    {/* Big Submit Button */}
                    <button
                      onClick={handleSubmitStudentRecitation}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 hover:to-teal-900 active:scale-[0.99] text-white font-black text-xs md:text-sm rounded-2xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gold-300" />
                      <span>اعتماد تسميع الطالب ({formatScoreOutOf20(scoreResult.scoreOutOf20)} - {grade}) والانتقال للتالي</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Quick Action Bar when in mushaf-only mode */}
              {workspaceViewMode === 'mushaf' && (
                <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Live score pill */}
                    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-[11px] text-slate-400 font-bold">النتيجة:</span>
                      <span className="font-mono font-black text-gold-400 text-sm">
                        {formatScoreOutOf20(scoreResult.scoreOutOf20)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${scoreResult.gradeColor.bg} text-white`}>
                        {grade}
                      </span>
                    </div>

                    {/* Hifz Mistake quick control */}
                    <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-xs text-rose-300 font-bold">عثرات جلي:</span>
                      <button
                        onClick={() => setMistakesCount(Math.max(0, mistakesCount - 1))}
                        className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-rose-400 w-4 text-center text-xs">
                        {mistakesCount}
                      </span>
                      <button
                        onClick={() => setMistakesCount(mistakesCount + 1)}
                        className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Tajweed Mistake quick control */}
                    <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
                      <span className="text-xs text-amber-300 font-bold">تجويد خفي:</span>
                      <button
                        onClick={() => setTajweedMistakesCount(Math.max(0, tajweedMistakesCount - 1))}
                        className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-amber-400 w-4 text-center text-xs">
                        {tajweedMistakesCount}
                      </span>
                      <button
                        onClick={() => setTajweedMistakesCount(tajweedMistakesCount + 1)}
                        className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitStudentRecitation}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gold-300" />
                    <span>اعتماد التسميع ({formatScoreOutOf20(scoreResult.scoreOutOf20)})</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-sm">حدد طالباً من طابور الحلقة للبدء بالتسميع</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Quick Action Bar for Mobile Viewports */}
      {activeStudent && mobileTab === 'reciting' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-gold-400 text-sm">
              {formatScoreOutOf20(scoreResult.scoreOutOf20)}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${scoreResult.gradeColor.bg} text-white`}>
              {grade}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMistakesCount(mistakesCount + 1)}
              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px] font-bold rounded-lg flex items-center gap-1"
            >
              <span>+ جلي</span>
              <span className="font-mono font-black text-white">({mistakesCount})</span>
            </button>
            <button
              onClick={() => setTajweedMistakesCount(tajweedMistakesCount + 1)}
              className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[11px] font-bold rounded-lg flex items-center gap-1"
            >
              <span>+ خفي</span>
              <span className="font-mono font-black text-white">({tajweedMistakesCount})</span>
            </button>
            <button
              onClick={handleSubmitStudentRecitation}
              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-300" />
              <span>اعتماد</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ARCHIVE AND SESSION COMPLETION MODAL                                 */}
      {/* ===================================================================== */}
      {showArchiveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          dir="rtl"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-400/30 flex items-center justify-center text-gold-300">
                  <Archive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-amiri text-white">
                    إنهاء جلسة الإقراء وأرشفة النتائج
                  </h3>
                  <p className="text-xs text-emerald-200 font-bold mt-0.5">
                    {session.circleName} • {session.hallName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {!archiveResult ? (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    سيتم اعتماد نتائج الجلسة وإغلاق المسودة، وترحيل كشوفات الحضور وتسميعات الطلاب المكتملة إلى السجل القرآني الدائم ومنع التكرار (Idempotent Sync).
                  </p>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">إجمالي الطلاب</span>
                      <span className="font-mono font-black text-lg text-slate-800">
                        {stats.total}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block">الحاضرون</span>
                      <span className="font-mono font-black text-lg text-emerald-900">
                        {stats.present}
                      </span>
                    </div>

                    <div className="p-3 bg-gold-50 rounded-2xl border border-gold-200">
                      <span className="text-[10px] text-gold-800 font-bold block">أتموا التسميع</span>
                      <span className="font-mono font-black text-lg text-gold-900">
                        {stats.completed}
                      </span>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                      <span className="text-[10px] text-rose-800 font-bold block">الغائبون</span>
                      <span className="font-mono font-black text-lg text-rose-900">
                        {stats.absent}
                      </span>
                    </div>
                  </div>

                  {/* Remaining Warning if any */}
                  {stats.remaining > 0 && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        تنبيه: يوجد <strong>{stats.remaining}</strong> طلاب حاضرين لم يكتمل رصد تسميعهم بعد في هذه الجلسة. هل تود إنهاء الجلسة الآن؟
                      </span>
                    </div>
                  )}

                  {/* Sync status note */}
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                    <Database className="w-4 h-4 text-emerald-700" />
                    <span>
                      {isOnline
                        ? 'سيتم ترحيل البيانات مباشرة إلى قاعدة بيانات Supabase.'
                        : 'أنت في وضع عدم الاتصال: سيتم حفظ البيانات بأمان محلياً وإرسالها فور عودة الاتصال.'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setShowArchiveModal(false)}
                      disabled={isArchiving}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                    >
                      إلغاء والعودة للجلسة
                    </button>

                    <button
                      onClick={handleConfirmArchiveSession}
                      disabled={isArchiving}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isArchiving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-gold-300" />
                          <span>جاري الأرشفة والترحيل...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-gold-300" />
                          <span>تأكيد الإنهاء والأرشفة</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Archive Success State */
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900">تمت أرشفة الجلسة بنجاح</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      تم حفظ {archiveResult.syncedRecitationsCount} تسميعاً قرآنياً و {archiveResult.syncedAttendanceCount} سجلاً للحضور.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold">
                    حالة المزامنة: {archiveResult.syncStatus === 'synced' ? 'متزامن مع Supabase ✅' : 'محفوظ محلياً في انتظار التزامن ⏳'}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowArchiveModal(false);
                        setArchiveResult(null);
                        handleCircleChange(selectedCircleId);
                      }}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      بدء جلسة جديدة
                    </button>

                    <button
                      onClick={() => {
                        setShowArchiveModal(false);
                        setReportTargetSession(session);
                        setShowReportModal(true);
                      }}
                      className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BarChart2 className="w-4 h-4" />
                      <span>عرض تقرير الجلسة</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowArchiveModal(false);
                        onNavigateView?.('dashboard');
                      }}
                      className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition-colors"
                    >
                      العودة للوحة التحكم
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SESSION REPORT AND PERFORMANCE ANALYTICS MODAL                       */}
      {/* ===================================================================== */}
      <LiveSessionReportModal
        isOpen={showReportModal}
        session={reportTargetSession || session}
        onClose={() => {
          setShowReportModal(false);
          setReportTargetSession(null);
        }}
        onSelectPastSession={(pastSess) => setReportTargetSession(pastSess)}
      />
    </div>
  );
};

export default LiveRecitationStation;

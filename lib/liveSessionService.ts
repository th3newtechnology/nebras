import {
  LiveRecitationSession,
  LiveSessionStudent,
  LiveSessionStats,
  SessionStatus,
  StudentAttendanceStatus,
  StudentRecitationState,
  RecitationPriority,
  RecitationEvaluationDraft,
  SessionArchiveResult,
  SessionSyncStatus,
} from '../types/liveSession.types';
import {
  fetchTeacherCirclesWithDetails,
  fetchTeacherStudents,
} from './teacherPortalService';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY_PREFIX = 'nebras_live_session_';
const memorySessionStore = new Map<string, string>();

/**
 * حساب إحصائيات الجلسة الحية تلقائياً
 */
export const calculateSessionStats = (
  session: LiveRecitationSession
): LiveSessionStats => {
  const total = session.students.length;
  const presentStudents = session.students.filter(
    (s) => s.attendance === 'present' || s.attendance === 'late'
  );
  const present = presentStudents.length;
  const absent = session.students.filter(
    (s) => s.attendance === 'absent' || s.attendance === 'excused'
  ).length;

  const completed = presentStudents.filter(
    (s) => s.recitationState === 'completed'
  ).length;

  const remaining = Math.max(0, present - completed);
  const progressPercentage = present > 0 ? Math.round((completed / present) * 100) : 0;

  return {
    total,
    present,
    absent,
    completed,
    remaining,
    progressPercentage,
  };
};

/**
 * بدء وتجهيز جلسة إقراء حية جديدة للحلقة المسندة للمعلم
 */
export const initLiveSession = async (
  circleId: string,
  teacherId: string = 't-01',
  teacherName: string = 'المحفظ المعتمد'
): Promise<LiveRecitationSession> => {
  // التحقق الأمني من انتساب الحلقة للمعلم
  const circles = await fetchTeacherCirclesWithDetails(teacherId);
  const circle = circles.find((c) => c.id === circleId);

  if (!circle) {
    throw new Error(`[SECURITY] المعلم ${teacherId} لا يملك صلاحية إدارة الحلقة ${circleId}`);
  }

  // استرجاع طلاب الحلقة
  const students = await fetchTeacherStudents(circleId, teacherId);

  // تشكيل طابور الطلاب للجلسة
  const sessionStudents: LiveSessionStudent[] = students.map((s, index) => ({
    studentId: s.id,
    fullName: s.fullName,
    registrationNumber: s.registrationNumber,
    circleId: s.circleId,
    circleName: s.circleName,
    currentJuz: s.currentJuz,
    targetJuz: s.targetJuz || 30,
    hifzLevel: s.hifzLevel,
    attendance: 'present',
    recitationState: 'pending',
    priority: 'normal',
    turnOrder: index + 1,
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const sessionId = `session-${circleId}-${Date.now()}`;

  const newSession: LiveRecitationSession = {
    id: sessionId,
    circleId: circle.id,
    circleName: circle.name,
    teacherId,
    teacherName,
    hallName: circle.hallName,
    date: todayStr,
    status: 'preparing',
    activeStudentId: sessionStudents.length > 0 ? sessionStudents[0].studentId : undefined,
    students: sessionStudents,
    isSimulated: circle.isSimulated,
  };

  saveLiveSessionDraft(newSession);
  return newSession;
};

/**
 * حفظ مسودة الجلسة الحية محلياً لمنع فقدان البيانات عند انقطاع الإنترنت أو التحديث
 */
export const saveLiveSessionDraft = (session: LiveRecitationSession): void => {
  session.lastSavedAt = new Date().toISOString();
  const key = `${STORAGE_KEY_PREFIX}${session.teacherId}`;
  const serialized = JSON.stringify(session);
  memorySessionStore.set(key, serialized);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn('تعذر حفظ مسودة الجلسة في التخزين المحلي:', err);
    }
  }
};

/**
 * استرجاع الجلسة الحية النشطة للمعلم (إن وجدت)
 */
export const getActiveLiveSession = (
  teacherId: string = 't-01'
): LiveRecitationSession | null => {
  const key = `${STORAGE_KEY_PREFIX}${teacherId}`;
  let raw: string | null = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      raw = window.localStorage.getItem(key);
    } catch (err) {
      console.warn('تعذر قراءة الجلسة المخزنة محلياً:', err);
    }
  }

  if (!raw) {
    raw = memorySessionStore.get(key) || null;
  }

  if (raw) {
    try {
      const session: LiveRecitationSession = JSON.parse(raw);
      if (session.status !== 'completed') {
        return session;
      }
    } catch (err) {
      console.warn('خطأ في معالجة مسودة الجلسة:', err);
    }
  }

  return null;
};

/**
 * تحديث حالة الجلسة (بدء، تعليق، استئناف، إنهاء)
 */
export const updateLiveSessionStatus = (
  session: LiveRecitationSession,
  status: SessionStatus
): LiveRecitationSession => {
  const updated: LiveRecitationSession = {
    ...session,
    status,
    startedAt: status === 'in_progress' && !session.startedAt ? new Date().toISOString() : session.startedAt,
    endedAt: status === 'completed' ? new Date().toISOString() : session.endedAt,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * تحديد الطالب النشط حالياً في محطة التسميع
 */
export const setActiveSessionStudent = (
  session: LiveRecitationSession,
  studentId: string
): LiveRecitationSession => {
  const student = session.students.find((s) => s.studentId === studentId);
  if (!student) return session;

  const updatedStudents = session.students.map((s) => {
    if (s.studentId === studentId && s.recitationState === 'pending') {
      return { ...s, recitationState: 'reciting' as StudentRecitationState };
    }
    return s;
  });

  const updated: LiveRecitationSession = {
    ...session,
    activeStudentId: studentId,
    students: updatedStudents,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * تنظيف وإنهاء مسودة الجلسة
 */
export const clearLiveSession = (teacherId: string = 't-01'): void => {
  const key = `${STORAGE_KEY_PREFIX}${teacherId}`;
  memorySessionStore.delete(key);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn('تعذر حذف مسودة الجلسة:', err);
    }
  }
};

/**
 * التحضير الجماعي لجميع طلاب الحلقة بنقرة واحدة
 */
export const markAllStudentsAttendance = (
  session: LiveRecitationSession,
  status: StudentAttendanceStatus
): LiveRecitationSession => {
  const updatedStudents = session.students.map((s) => ({
    ...s,
    attendance: status,
    recitationState: (status === 'absent' || status === 'excused') && s.recitationState === 'reciting'
      ? ('pending' as StudentRecitationState)
      : s.recitationState,
  }));

  const updated: LiveRecitationSession = {
    ...session,
    students: updatedStudents,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * تحديث حالة حضور طالب محدد مع معالجة حالة التسميع
 */
export const updateStudentAttendance = (
  session: LiveRecitationSession,
  studentId: string,
  status: StudentAttendanceStatus
): LiveRecitationSession => {
  const updatedStudents = session.students.map((s) => {
    if (s.studentId === studentId) {
      return {
        ...s,
        attendance: status,
        recitationState: (status === 'absent' || status === 'excused') && s.recitationState === 'reciting'
          ? ('pending' as StudentRecitationState)
          : s.recitationState,
      };
    }
    return s;
  });

  const updated: LiveRecitationSession = {
    ...session,
    students: updatedStudents,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * إعادة ترتيب دور الطالب في الطابور (تقديم أو تأخير)
 */
export const reorderStudentTurn = (
  session: LiveRecitationSession,
  studentId: string,
  direction: 'up' | 'down'
): LiveRecitationSession => {
  const index = session.students.findIndex((s) => s.studentId === studentId);
  if (index === -1) return session;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= session.students.length) return session;

  const newStudents = [...session.students];
  const temp = newStudents[index];
  newStudents[index] = newStudents[targetIndex];
  newStudents[targetIndex] = temp;

  // إعادة ترقيم turnOrder
  const reordered = newStudents.map((s, idx) => ({
    ...s,
    turnOrder: idx + 1,
  }));

  const updated: LiveRecitationSession = {
    ...session,
    students: reordered,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * إعادة فرز طابور الحلقة تلقائياً وفق الأولوية وحالة الحضور
 */
export const sortQueueByPriority = (
  session: LiveRecitationSession
): LiveRecitationSession => {
  const priorityWeight = (s: LiveSessionStudent): number => {
    if (s.attendance === 'absent' || s.attendance === 'excused') return 100;
    if (s.recitationState === 'completed') return 90;
    if (s.recitationState === 'deferred') return 50;
    if (s.priority === 'priority_high') return 1;
    if (s.priority === 'early_leave') return 2;
    return 10;
  };

  const sorted = [...session.students].sort((a, b) => {
    const diff = priorityWeight(a) - priorityWeight(b);
    if (diff !== 0) return diff;
    return a.turnOrder - b.turnOrder;
  });

  const reordered = sorted.map((s, idx) => ({
    ...s,
    turnOrder: idx + 1,
  }));

  const updated: LiveRecitationSession = {
    ...session,
    students: reordered,
    activeStudentId:
      reordered.find((s) => s.attendance === 'present' && s.recitationState !== 'completed')?.studentId ||
      session.activeStudentId,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * تأجيل دور الطالب مؤقتاً لمراجعة الحفظ ونقله لأسفل قائمة الحاضرين
 */
export const deferStudentTurn = (
  session: LiveRecitationSession,
  studentId: string
): LiveRecitationSession => {
  const targetStudent = session.students.find((s) => s.studentId === studentId);
  if (!targetStudent) return session;

  const others = session.students.filter((s) => s.studentId !== studentId);
  const updatedStudent: LiveSessionStudent = {
    ...targetStudent,
    recitationState: 'deferred',
  };

  const insertIndex = others.findIndex(
    (s) => s.recitationState === 'completed' || s.attendance === 'absent'
  );
  const newOrder =
    insertIndex === -1
      ? [...others, updatedStudent]
      : [...others.slice(0, insertIndex), updatedStudent, ...others.slice(insertIndex)];

  const reindexed = newOrder.map((s, idx) => ({
    ...s,
    turnOrder: idx + 1,
  }));

  const nextActive = reindexed.find(
    (s) => s.attendance === 'present' && s.recitationState === 'pending'
  );

  const updated: LiveRecitationSession = {
    ...session,
    students: reindexed,
    activeStudentId: nextActive ? nextActive.studentId : session.activeStudentId,
  };

  saveLiveSessionDraft(updated);
  return updated;
};

/**
 * مزامنة سجلات الحضور للجلسة مع قاعدة بيانات Supabase
 */
export const syncSessionAttendanceToSupabase = async (
  session: LiveRecitationSession
): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
  if (isSupabaseConfigured()) {
    try {
      const records = session.students.map((s) => ({
        circle_id: session.circleId,
        student_id: s.studentId,
        date: session.date,
        status: s.attendance,
      }));

      const { data, error } = await (supabase.from('attendance') as any)
        .upsert(records, { onConflict: 'circle_id,student_id,date' })
        .select();

      if (!error) {
        return { success: true, syncedCount: records.length };
      }
      return { success: false, syncedCount: 0, error: error.message };
    } catch (err: any) {
      return { success: false, syncedCount: 0, error: err.message || 'خطأ في الشبكة' };
    }
  }

  return { success: true, syncedCount: session.students.length };
};

const ARCHIVE_KEY_PREFIX = 'nebras_archived_sessions_';

/**
 * جلب قائمة الجلسات المؤرشفة للمعلم
 */
export const getArchivedSessions = (
  teacherId: string = 't-01'
): LiveRecitationSession[] => {
  const key = `${ARCHIVE_KEY_PREFIX}${teacherId}`;
  let raw: string | null = null;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      raw = window.localStorage.getItem(key);
    } catch (err) {
      console.warn('تعذر قراءة الجلسات المؤرشفة من التخزين المحلي:', err);
    }
  }

  if (!raw) {
    raw = memorySessionStore.get(key) || null;
  }

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('خطأ في معالجة الجلسات المؤرشفة:', err);
    }
  }

  return [];
};

/**
 * حفظ جلسة في سجل الجلسات المؤرشفة للمعلم
 */
export const saveToArchivedSessions = (
  session: LiveRecitationSession
): void => {
  const teacherId = session.teacherId || 't-01';
  const existing = getArchivedSessions(teacherId);
  const filtered = existing.filter((s) => s.id !== session.id);
  const updated = [session, ...filtered];

  const key = `${ARCHIVE_KEY_PREFIX}${teacherId}`;
  const serialized = JSON.stringify(updated);
  memorySessionStore.set(key, serialized);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn('تعذر حفظ الجلسة المؤرشفة محلياً:', err);
    }
  }
};

/**
 * إنهاء الجلسة القرآنية وأرشفة وتزامن التسميعات والحضور مع Supabase بدقة ومنع التكرار (Idempotent Sync)
 */
export const archiveAndSyncLiveSession = async (
  session: LiveRecitationSession
): Promise<SessionArchiveResult> => {
  const nowIso = new Date().toISOString();
  const completedStudents = session.students.filter(
    (s) => s.recitationState === 'completed' && s.evaluation
  );
  const attendedStudents = session.students.filter(
    (s) => s.attendance === 'present' || s.attendance === 'late'
  );

  let syncStatus: SessionSyncStatus = 'synced';
  let syncError: string | undefined = undefined;
  let syncedRecitationsCount = 0;
  let syncedAttendanceCount = 0;

  // 1. مزامنة Supabase إذا كانت الإعدادات متوفرة
  if (isSupabaseConfigured()) {
    try {
      // أ. مزامنة كشف الحضور (Upsert Idempotent)
      const attendanceRecords = session.students.map((s) => ({
        circle_id: session.circleId,
        student_id: s.studentId,
        date: session.date,
        status: s.attendance,
      }));

      const { error: attError } = await (supabase.from('attendance') as any)
        .upsert(attendanceRecords, { onConflict: 'circle_id,student_id,date' });

      if (attError) {
        throw new Error(`تعذر مزامنة الحضور: ${attError.message}`);
      }
      syncedAttendanceCount = attendanceRecords.length;

      // ب. مزامنة التسميعات المكتملة (Upsert Idempotent مع معرّف فريد لا يتكرر)
      if (completedStudents.length > 0) {
        const recitationRecords = completedStudents.map((s) => {
          const evalDraft = s.evaluation!;
          return {
            id: `rec-${session.id}-${s.studentId}`,
            student_id: s.studentId,
            circle_id: session.circleId,
            teacher_id: session.teacherId,
            date: session.date,
            category: evalDraft.category,
            surah_number: evalDraft.surahNumber,
            surah_name: evalDraft.surahName,
            ayah_from: evalDraft.ayahFrom,
            ayah_to: evalDraft.ayahTo,
            grade: evalDraft.grade,
            score: evalDraft.score ?? 100,
            score_out_of_20: evalDraft.scoreOutOf20 ?? 20,
            mistakes_count: evalDraft.mistakesCount,
            tajweed_mistakes_count: evalDraft.tajweedMistakesCount,
            notes: evalDraft.notes || null,
            created_at: evalDraft.completedAt || nowIso,
          };
        });

        const { error: recError } = await (supabase.from('recitations') as any)
          .upsert(recitationRecords, { onConflict: 'id' });

        if (recError) {
          throw new Error(`تعذر ترحيل التسميعات: ${recError.message}`);
        }
        syncedRecitationsCount = recitationRecords.length;
      }
    } catch (err: any) {
      console.warn('تنبيه المزامنة السحابية (سيتم الاعتماد على الحفظ المحلي المؤرشف):', err);
      syncStatus = 'pending_sync';
      syncError = err.message || 'انقطاع الاتصال بالسحابة';
    }
  } else {
    // وضع المحاكاة الميدانية / المحلي
    syncedRecitationsCount = completedStudents.length;
    syncedAttendanceCount = session.students.length;
  }

  // 2. تحديث كائن الجلسة وإغلاقها
  const finalizedSession: LiveRecitationSession = {
    ...session,
    status: 'completed',
    endedAt: nowIso,
    archivedAt: nowIso,
    lastSavedAt: nowIso,
    syncStatus,
    syncError,
  };

  // 3. أرشفة الجلسة محلياً وحذف مسودة الجلسة الجارية
  saveToArchivedSessions(finalizedSession);
  clearLiveSession(session.teacherId);

  return {
    success: true,
    sessionId: session.id,
    totalStudents: session.students.length,
    attendedStudents: attendedStudents.length,
    completedRecitations: completedStudents.length,
    syncStatus,
    syncedRecitationsCount,
    syncedAttendanceCount,
    archivedAt: nowIso,
    error: syncError,
  };
};

/**
 * محرك تحليلات ومؤشرات أداء الجلسات القرآنية
 * مدرسة نبراس القرآنية - مسجد إبراهيم الخليل
 */

import {
  LiveRecitationSession,
  SessionPerformanceAnalytics,
} from '../types/liveSession.types';

/**
 * حساب مؤشرات الأداء الشاملة للجلسة القرآنية الحية أو المؤرشفة
 */
export function calculateSessionAnalytics(
  session: LiveRecitationSession
): SessionPerformanceAnalytics {
  const totalStudents = session.students.length;

  const presentCount = session.students.filter((s) => s.attendance === 'present').length;
  const lateCount = session.students.filter((s) => s.attendance === 'late').length;
  const absentCount = session.students.filter(
    (s) => s.attendance === 'absent' || s.attendance === 'excused'
  ).length;

  const attendedTotal = presentCount + lateCount;
  const attendanceRate =
    totalStudents > 0 ? Math.round((attendedTotal / totalStudents) * 100) : 0;

  const completedStudents = session.students.filter(
    (s) => s.recitationState === 'completed' && s.evaluation
  );
  const completedCount = completedStudents.length;

  const completionRate =
    attendedTotal > 0 ? Math.round((completedCount / attendedTotal) * 100) : 0;

  // احتساب متوسط الدرجات
  let totalScore100 = 0;
  let totalScore20 = 0;
  let totalHifzMistakes = 0;
  let totalTajweedMistakes = 0;

  const gradeDistribution = {
    mumtaz: 0,
    jayyidJiddan: 0,
    jayyid: 0,
    needsReview: 0,
  };

  const categoryDistribution = {
    newMemorization: 0,
    minorReview: 0,
    majorReview: 0,
  };

  const notesSet = new Set<string>();

  completedStudents.forEach((s) => {
    const ev = s.evaluation!;
    const score100 = ev.score ?? 100;
    const score20 = ev.scoreOutOf20 ?? (score100 / 5);

    totalScore100 += score100;
    totalScore20 += score20;
    totalHifzMistakes += ev.mistakesCount || 0;
    totalTajweedMistakes += ev.tajweedMistakesCount || 0;

    // توزيع التقديرات
    if (ev.grade === 'ممتاز') gradeDistribution.mumtaz++;
    else if (ev.grade === 'جيد جداً') gradeDistribution.jayyidJiddan++;
    else if (ev.grade === 'جيد') gradeDistribution.jayyid++;
    else if (ev.grade === 'يحتاج مراجعة') gradeDistribution.needsReview++;

    // توزيع نوع التسميع
    if (ev.category === 'new_memorization') categoryDistribution.newMemorization++;
    else if (ev.category === 'minor_review') categoryDistribution.minorReview++;
    else if (ev.category === 'major_review') categoryDistribution.majorReview++;

    if (ev.notes && ev.notes.trim()) {
      notesSet.add(ev.notes.trim());
    }
  });

  const averageScoreOutOf100 =
    completedCount > 0 ? Math.round((totalScore100 / completedCount) * 10) / 10 : 0;
  const averageScoreOutOf20 =
    completedCount > 0 ? Math.round((totalScore20 / completedCount) * 10) / 10 : 0;

  // احتساب مدة الجلسة بالدقائق إن توفرت التواريخ
  let sessionDurationMinutes: number | undefined = undefined;
  if (session.startedAt && session.endedAt) {
    const start = new Date(session.startedAt).getTime();
    const end = new Date(session.endedAt).getTime();
    if (end > start) {
      sessionDurationMinutes = Math.round((end - start) / 60000);
    }
  }

  return {
    sessionId: session.id,
    circleId: session.circleId,
    circleName: session.circleName,
    date: session.date,
    teacherName: session.teacherName,
    hallName: session.hallName,
    totalStudents,
    presentCount,
    absentCount,
    lateCount,
    attendanceRate,
    completedCount,
    completionRate,
    averageScoreOutOf100,
    averageScoreOutOf20,
    gradeDistribution,
    categoryDistribution,
    totalHifzMistakes,
    totalTajweedMistakes,
    commonTajweedNotes: Array.from(notesSet),
    sessionDurationMinutes,
  };
}

/**
 * تحليل التطور التاريخي للحلقة عبر الجلسات المؤرشفة
 */
export function getCirclePerformanceHistory(
  archivedSessions: LiveRecitationSession[],
  circleId: string
): {
  totalSessions: number;
  averageAttendanceRate: number;
  averageScoreOutOf20: number;
  totalRecitationsArchived: number;
  recentSessions: SessionPerformanceAnalytics[];
} {
  const circleSessions = archivedSessions.filter((s) => s.circleId === circleId);

  if (circleSessions.length === 0) {
    return {
      totalSessions: 0,
      averageAttendanceRate: 0,
      averageScoreOutOf20: 0,
      totalRecitationsArchived: 0,
      recentSessions: [],
    };
  }

  const analyticsList = circleSessions.map(calculateSessionAnalytics);

  const sumAttendance = analyticsList.reduce((acc, a) => acc + a.attendanceRate, 0);
  const sumScores = analyticsList.reduce((acc, a) => acc + a.averageScoreOutOf20, 0);
  const sumRecitations = analyticsList.reduce((acc, a) => acc + a.completedCount, 0);

  return {
    totalSessions: circleSessions.length,
    averageAttendanceRate: Math.round(sumAttendance / circleSessions.length),
    averageScoreOutOf20: Math.round((sumScores / circleSessions.length) * 10) / 10,
    totalRecitationsArchived: sumRecitations,
    recentSessions: analyticsList.slice(0, 5),
  };
}

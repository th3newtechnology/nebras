/**
 * نصوص الفحص الآلي للمرحلة الفرعية 8.3.6:
 * التقارير ومؤشرات أداء الحلقة القرآنية (Session Reports & Quranic Analytics)
 */

import {
  calculateSessionAnalytics,
  getCirclePerformanceHistory,
} from '../lib/sessionAnalyticsEngine';
import { LiveRecitationSession } from '../types/liveSession.types';
import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [نجاح] ${testName}`);
  } else {
    console.error(`  ❌ [فشل] ${testName}`);
    if (details) console.error(`     السبب: ${details}`);
  }
}

async function runVerification() {
  console.log('\n===============================================================');
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.3.6');
  console.log('   التقارير ومؤشرات أداء الحلقة القرآنية (Session Analytics)');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص دقة محرك احتساب المؤشرات والتحليلات القرآنية
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص احتساب مؤشرات الجلسة (KPIs & Analytics) ---');

  const mockSession: LiveRecitationSession = {
    id: 'session-analytics-test-1',
    circleId: 'circle-1',
    circleName: 'حلقة الإمام ورش',
    teacherId: 'teacher-1',
    teacherName: 'الشيخ عبد الحميد',
    hallName: 'قاعة الشيخ ابن باديس',
    date: '2026-11-06',
    status: 'completed',
    startedAt: '2026-11-06T16:00:00.000Z',
    endedAt: '2026-11-06T17:30:00.000Z',
    students: [
      {
        studentId: 'std-1',
        fullName: 'أحمد محمود',
        registrationNumber: 'REG-001',
        circleId: 'circle-1',
        circleName: 'حلقة الإمام ورش',
        currentJuz: 12,
        targetJuz: 30,
        hifzLevel: 'متقدم',
        attendance: 'present',
        recitationState: 'completed',
        priority: 'normal',
        turnOrder: 1,
        evaluation: {
          category: 'new_memorization',
          surahNumber: 18,
          surahName: 'الكهف',
          ayahFrom: 1,
          ayahTo: 15,
          grade: 'ممتاز',
          score: 98,
          scoreOutOf20: 19.6,
          mistakesCount: 0,
          tajweedMistakesCount: 1,
          notes: 'ضبط ترقيق الراءات ممتاز',
        },
      },
      {
        studentId: 'std-2',
        fullName: 'إبراهيم خليل',
        registrationNumber: 'REG-002',
        circleId: 'circle-1',
        circleName: 'حلقة الإمام ورش',
        currentJuz: 5,
        targetJuz: 30,
        hifzLevel: 'متوسط',
        attendance: 'late',
        recitationState: 'completed',
        priority: 'normal',
        turnOrder: 2,
        evaluation: {
          category: 'minor_review',
          surahNumber: 4,
          surahName: 'النساء',
          ayahFrom: 20,
          ayahTo: 35,
          grade: 'جيد جداً',
          score: 86,
          scoreOutOf20: 17.2,
          mistakesCount: 2,
          tajweedMistakesCount: 2,
          notes: 'مراعاة مد البدل 4 حركات عند ورش',
        },
      },
      {
        studentId: 'std-3',
        fullName: 'حمزة بن عيسى',
        registrationNumber: 'REG-003',
        circleId: 'circle-1',
        circleName: 'حلقة الإمام ورش',
        currentJuz: 20,
        targetJuz: 30,
        hifzLevel: 'متقدم',
        attendance: 'present',
        recitationState: 'completed',
        priority: 'normal',
        turnOrder: 3,
        evaluation: {
          category: 'major_review',
          surahNumber: 2,
          surahName: 'البقرة',
          ayahFrom: 1,
          ayahTo: 25,
          grade: 'ممتاز',
          score: 95,
          scoreOutOf20: 19.0,
          mistakesCount: 1,
          tajweedMistakesCount: 0,
        },
      },
      {
        studentId: 'std-4',
        fullName: 'عمر الفاروق',
        registrationNumber: 'REG-004',
        circleId: 'circle-1',
        circleName: 'حلقة الإمام ورش',
        currentJuz: 8,
        targetJuz: 30,
        hifzLevel: 'مبتدئ',
        attendance: 'absent',
        recitationState: 'pending',
        priority: 'normal',
        turnOrder: 4,
      },
    ],
  };

  const analytics = calculateSessionAnalytics(mockSession);

  assert(analytics.totalStudents === 4, 'حصر إجمالي الطلاب في الجلسة: 4');
  assert(analytics.presentCount === 2, 'حصر الحاضرين: 2');
  assert(analytics.lateCount === 1, 'حصر المتأخرين: 1');
  assert(analytics.absentCount === 1, 'حصر الغائبين: 1');
  assert(analytics.attendanceRate === 75, 'نسبة الحضور: 75% (3 من 4)');
  assert(analytics.completedCount === 3, 'عدد التسميعات المكتملة: 3');
  assert(analytics.completionRate === 100, 'نسبة إتمام التسميع للحاضرين: 100% (3 من 3)');

  // متوسط الدرجات: (98 + 86 + 95) / 3 = 279 / 3 = 93.0
  assert(analytics.averageScoreOutOf100 === 93, `متوسط الدرجة المئوية: ${analytics.averageScoreOutOf100}%`);

  // متوسط الدرجة من 20: (19.6 + 17.2 + 19.0) / 3 = 55.8 / 3 = 18.6
  assert(analytics.averageScoreOutOf20 === 18.6, `متوسط الدرجة من 20: ${analytics.averageScoreOutOf20} / 20`);

  assert(analytics.gradeDistribution.mumtaz === 2, 'توزيع التقديرات: 2 ممتاز');
  assert(analytics.gradeDistribution.jayyidJiddan === 1, 'توزيع التقديرات: 1 جيد جداً');
  assert(analytics.gradeDistribution.jayyid === 0, 'توزيع التقديرات: 0 جيد');
  assert(analytics.gradeDistribution.needsReview === 0, 'توزيع التقديرات: 0 يحتاج مراجعة');

  assert(analytics.categoryDistribution.newMemorization === 1, 'نوع التسميع: 1 حفظ جديد');
  assert(analytics.categoryDistribution.minorReview === 1, 'نوع التسميع: 1 مراجعة صغرى');
  assert(analytics.categoryDistribution.majorReview === 1, 'نوع التسميع: 1 مراجعة كبرى');

  assert(analytics.totalHifzMistakes === 3, 'إجمالي عثرات الحفظ بالجلسة: 3');
  assert(analytics.totalTajweedMistakes === 3, 'إجمالي أخطاء التجويد بالجلسة: 3');
  assert(analytics.sessionDurationMinutes === 90, 'احتساب مدة الجلسة بدقة: 90 دقيقة');
  assert(analytics.commonTajweedNotes.length === 2, 'استخلاص توجيهات المحفظ بدقة');

  // -------------------------------------------------------------
  // المجموعة 2: فحص السجل التاريخي للحلقة
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: فحص السجل التاريخي وتطور أداء الحلقة ---');

  const history = getCirclePerformanceHistory([mockSession], 'circle-1');
  assert(history.totalSessions === 1, 'إجمالي الجلسات في التاريخ: 1');
  assert(history.averageAttendanceRate === 75, 'معدل الحضور التاريخي: 75%');
  assert(history.averageScoreOutOf20 === 18.6, 'معدل الدرجات التاريخي: 18.6 / 20');
  assert(history.totalRecitationsArchived === 3, 'إجمالي التسميعات المؤرشفة: 3');

  const emptyHistory = getCirclePerformanceHistory([], 'non-existent');
  assert(emptyHistory.totalSessions === 0 && emptyHistory.averageAttendanceRate === 0, 'معالجة السجل الفارغ دون أخطاء');

  // -------------------------------------------------------------
  // المجموعة 3: فحص تكامل مكون المودال وصفحة المحطة
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: فحص تكامل مكون تقرير الجلسة مع المحطة ---');

  const reportModalPath = path.resolve('components/teacher/live/LiveSessionReportModal.tsx');
  assert(fs.existsSync(reportModalPath), 'ملف مكون LiveSessionReportModal.tsx موجود');

  const modalContent = fs.readFileSync(reportModalPath, 'utf-8');
  assert(modalContent.includes('LiveSessionReportModal'), 'المكون يصدر LiveSessionReportModal بنجاح');
  assert(modalContent.includes('window.print'), 'المكون يدعم زر أمر الطباعة الرسمية');
  assert(modalContent.includes('كشف التسميعات والدرجات'), 'المكون يحتوي على كشف التسميعات والدرجات');
  assert(modalContent.includes('ختم إدارة المدرسة القرآنية'), 'المكون يحتوي على ترويسة وختم المدرسة القرآنية');

  const stationPagePath = path.resolve('pages/LiveRecitationStation.tsx');
  const stationContent = fs.readFileSync(stationPagePath, 'utf-8');
  assert(stationContent.includes('LiveSessionReportModal'), 'محطة الإقراء تدمج مكون LiveSessionReportModal');
  assert(stationContent.includes('showReportModal'), 'محطة الإقراء تحتوي على حالة عرض التقرير showReportModal');
  assert(stationContent.includes('تقرير الجلسة'), 'شريط أدوات المحطة يحتوي على زر استعراض تقرير الجلسة');

  // -------------------------------------------------------------
  // النتائج النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 ملخص نتائج الاختبارات للمرحلة 8.3.6: ${passedTests} / ${totalTests} اختبار ناجح`);
  if (passedTests === totalTests) {
    console.log('🎉 نجحت جميع فحوصات التقارير ومؤشرات أداء الحلقة القرآنية بنسبة 100%!');
  } else {
    console.error('⚠️ توجد اختبارات تحتاج إلى مراجعة قبل الاعتماد.');
  }
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('خطأ غير متوقع أثناء تشغيل الفحص:', err);
  process.exit(1);
});

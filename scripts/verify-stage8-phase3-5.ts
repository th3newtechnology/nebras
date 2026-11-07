/**
 * نصوص الفحص الآلي للمرحلة الفرعية 8.3.5:
 * الحفظ التلقائي والتزامن والأرشفة المباشرة (Auto-Save & Idempotent Archival Engine)
 */

import {
  initLiveSession,
  saveLiveSessionDraft,
  getActiveLiveSession,
  clearLiveSession,
  archiveAndSyncLiveSession,
  getArchivedSessions,
} from '../lib/liveSessionService';
import { LiveRecitationSession, LiveSessionStudent } from '../types/liveSession.types';
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
  console.log('🧪 بدء الاختبارات الآلية الشاملة للمرحلة الفرعية 8.3.5');
  console.log('   الحفظ التلقائي والتزامن والأرشفة المباشرة (Supabase & Offline)');
  console.log('===============================================================\n');

  // -------------------------------------------------------------
  // المجموعة 1: فحص الحفظ التلقائي والطابع الزمني
  // -------------------------------------------------------------
  console.log('--- المجموعة 1: فحص الحفظ التلقائي ومؤشر الطابع الزمني ---');

  const teacherId = 'test-teacher-835';
  clearLiveSession(teacherId);

  const testSession: LiveRecitationSession = {
    id: `session-test-835-${Date.now()}`,
    circleId: 'c1',
    circleName: 'حلقة الإمام ورش',
    teacherId,
    teacherName: 'الأستاذ عبد الرحمن',
    hallName: 'قاعة الشيخ ابن باديس',
    date: '2026-11-06',
    status: 'in_progress',
    students: [
      {
        studentId: 's-101',
        fullName: 'أيوب بلقاسم',
        registrationNumber: 'REG-2026-101',
        circleId: 'c1',
        circleName: 'حلقة الإمام ورش',
        currentJuz: 15,
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
          ayahTo: 20,
          grade: 'ممتاز',
          score: 96,
          scoreOutOf20: 19.2,
          mistakesCount: 1,
          tajweedMistakesCount: 1,
        },
      },
      {
        studentId: 's-102',
        fullName: 'ياسين الجزائري',
        registrationNumber: 'REG-2026-102',
        circleId: 'c1',
        circleName: 'حلقة الإمام ورش',
        currentJuz: 10,
        targetJuz: 30,
        hifzLevel: 'متوسط',
        attendance: 'present',
        recitationState: 'pending',
        priority: 'normal',
        turnOrder: 2,
      },
    ],
  };

  saveLiveSessionDraft(testSession);
  assert(testSession.lastSavedAt !== undefined, 'تحديث الطابع الزمني lastSavedAt تلقائياً عند الحفظ');

  const retrieved = getActiveLiveSession(teacherId);
  assert(retrieved !== null, 'استرجاع مسودة الجلسة النشطة بنجاح');
  assert(retrieved?.id === testSession.id, 'مطابقة معرف الجلسة المسترجعة');
  assert(retrieved?.students.length === 2, 'حفظ واسترجاع بيانات طلاب الجلسة بالكامل');

  // -------------------------------------------------------------
  // المجموعة 2: فحص محرك الأرشفة المباشرة ومنع التكرار (Idempotency)
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 2: فحص محرك الأرشفة ومنع تكرار التسميعات ---');

  const archiveResult = await archiveAndSyncLiveSession(testSession);
  assert(archiveResult.success === true, 'نجاح عملية أرشفة الجلسة');
  assert(archiveResult.completedRecitations === 1, 'حصر دقيق للتسميعات المكتملة (1 طالب)');
  assert(archiveResult.attendedStudents === 2, 'حصر دقيق للطلاب الحاضرين (2 طلاب)');
  assert(archiveResult.archivedAt !== undefined, 'تثبيت توقيت الأرشفة الرسمي');

  // التأكد من مسح المسودة النشطة بعد الأرشفة
  const afterArchive = getActiveLiveSession(teacherId);
  assert(afterArchive === null, 'تصفير المسودة النشطة بعد إتمام الأرشفة بنجاح');

  // فحص سجل الجلسات المؤرشفة
  const archivedSessions = getArchivedSessions(teacherId);
  assert(archivedSessions.length >= 1, 'تسجيل الجلسة في قائمة الجلسات المؤرشفة');
  assert(archivedSessions[0].status === 'completed', 'حالة الجلسة المؤرشفة completed');

  // فحص منع التكرار (Idempotency check: إعادة أرشفة نفس الجلسة)
  const repeatedArchive = await archiveAndSyncLiveSession(testSession);
  const archivedAfterRepeat = getArchivedSessions(teacherId);
  const matchingSessions = archivedAfterRepeat.filter((s) => s.id === testSession.id);
  assert(matchingSessions.length === 1, 'منع التكرار (Idempotency): لا تتكرر الجلسة المؤرشفة في السجلات');

  // -------------------------------------------------------------
  // المجموعة 3: فحص التحقق من تكامل صفحة محطة الإقراء
  // -------------------------------------------------------------
  console.log('\n--- المجموعة 3: التحقق من واجهة محطة الإقراء وتكامل الأرشفة ---');

  const stationPagePath = path.resolve('pages/LiveRecitationStation.tsx');
  assert(fs.existsSync(stationPagePath), 'ملف محطة الإقراء LiveRecitationStation.tsx موجود');

  const stationContent = fs.readFileSync(stationPagePath, 'utf-8');
  assert(stationContent.includes('isSaving'), 'المحطة تحتوي على حالة الحفظ التلقائي isSaving');
  assert(stationContent.includes('isOnline'), 'المحطة تراقب حالة الاتصال بالإنترنت isOnline');
  assert(stationContent.includes('lastSavedDisplay'), 'المحطة تعرض توقيت آخر حفظ تلقائي');
  assert(stationContent.includes('showArchiveModal'), 'المحطة تدعم نافذة تأكيد إنهاء الجلسة والأرشفة');
  assert(stationContent.includes('archiveAndSyncLiveSession'), 'المحطة تستدعي خدمة الأرشفة والمزامنة السحابية');
  assert(stationContent.includes('handleConfirmArchiveSession'), 'المحطة تدعم اعتماد الأرشفة الفوري');
  assert(stationContent.includes('حفظ محلي مؤمن'), 'المحطة تدعم مرونة وضع عدم الاتصال');

  // تنظيف جلسة الاختبار
  clearLiveSession(teacherId);

  // -------------------------------------------------------------
  // النتائج النهائية
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`📊 ملخص نتائج الاختبارات للمرحلة 8.3.5: ${passedTests} / ${totalTests} اختبار ناجح`);
  if (passedTests === totalTests) {
    console.log('🎉 نجحت جميع فحوصات الحفظ التلقائي والتزامن والأرشفة بنسبة 100%!');
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

/**
 * خدمة بوابة الطالب القرآني (Student Portal Service)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * إدارة الورد القرآني، خريطة الأجزاء، الأوسمة، والمصحف برواية ورش
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  StudentDashboardData,
  StudentProfileData,
  StudentDailyWird,
  StudentBadge,
  StudentStreakData,
  StudentJuzMapItem,
  StudentCertificate,
} from '../types/studentPortal.types';
import { fetchStudentFollowupRecord } from './studentFollowupService';
import { QURAN_JUZ_NAMES } from './teacherPortalService';
import { getSurahsByJuz } from './quranMetadata';
import { WARSH_SURAH_LIBRARY } from './warshContent';

// بيانات تأسيسية لطلاب مدرسة نبراس
const MOCK_STUDENT_PROFILES: Record<string, StudentProfileData> = {
  's-001': {
    id: 's-001',
    registrationNumber: 'NEB-2026-0001',
    fullName: 'محمد ياسين درويش',
    gender: 'male',
    birthDate: '2014-05-12',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    hallName: 'قاعة الإمام مالك',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0551234567',
    currentJuz: 16,
    targetJuz: 30,
    currentHizb: 31,
    completionPercentage: 53,
    hifzLevel: 'متقدم',
    attendanceRate: 100,
    totalRecitationsCount: 42,
    points: 1250, // نقاط همة قرآنية
  },
  's-002': {
    id: 's-002',
    registrationNumber: 'NEB-2026-0002',
    fullName: 'إبراهيم بن خليل',
    gender: 'male',
    birthDate: '2015-08-20',
    circleId: 'd0000000-0000-0000-0000-000000000002',
    circleName: 'حلقة الصديق للمتقنين',
    hallName: 'قاعة الإمام مالك',
    teacherId: 'c0000000-0000-0000-0000-000000000001',
    teacherName: 'الشيخ عبد الرحمن السديس',
    teacherPhone: '0551234567',
    currentJuz: 8,
    targetJuz: 30,
    currentHizb: 15,
    completionPercentage: 27,
    hifzLevel: 'متوسط',
    attendanceRate: 88,
    totalRecitationsCount: 28,
    points: 620,
  },
};

// ورد اليوم التجريبي
const MOCK_DAILY_WIRD: Record<string, StudentDailyWird> = {
  's-001': {
    id: 'wird-001',
    date: '2026-11-07',
    newMemorization: {
      surahNumber: 24,
      surahName: 'سورة النور',
      fromAyah: 1,
      toAyah: 20,
      juzNumber: 18,
      isCompleted: false,
      warshNote: 'مراعاة توسط البدل في ﴿ءَايَٰتٍ﴾ ونقل الهمز في ﴿وَلَقَدْ أَنزَلْنَآ﴾',
    },
    minorReview: {
      surahNumber: 23,
      surahName: 'سورة المؤمنون',
      fromAyah: 1,
      toAyah: 50,
      juzNumber: 18,
      isCompleted: true,
      warshNote: 'ترقيق الراء في ﴿خَٰشِعُونَ﴾ ومراعاة القلقلة الصغرى',
    },
    majorReview: {
      juzNumber: 15,
      juzName: 'سبحان الذي أسرى (الإسراء والكهف)',
      isCompleted: false,
    },
    teacherNotes: 'استمع لتلاوة الشيخ الحصري برواية ورش وركز على ترقيق الراءات.',
    studentConfirmedAt: undefined,
  },
};

// مصفوفة الأوسمة والشارات القرآنية المعتمدة للطالب
export const STUDENT_BADGES_CATALOG: StudentBadge[] = [
  {
    id: 'badge-juz-amma',
    title: 'حافظ جزء عمّ',
    description: 'إتمام حفظ وإتقان الجزء الثلاثين من القرآن الكريم كاملاً برواية ورش.',
    icon: 'award',
    category: 'hifz',
    isUnlocked: true,
    unlockedAt: '2025-12-15',
    progressPercent: 100,
  },
  {
    id: 'badge-juz-tabarak',
    title: 'حافظ جزء تبارك',
    description: 'إتقان الجزء التاسع والعشرين وضبط مخارج سورة الملك وسورة القلم.',
    icon: 'crown',
    category: 'hifz',
    isUnlocked: true,
    unlockedAt: '2026-03-20',
    progressPercent: 100,
  },
  {
    id: 'badge-quarter-quran',
    title: 'خاتم ربع القرآن الكريم',
    description: 'حفظ وإتقان أكثر من 7 أجزاء ونصف من كتاب الله الكريم.',
    icon: 'sparkles',
    category: 'hifz',
    isUnlocked: true,
    unlockedAt: '2026-08-10',
    progressPercent: 100,
  },
  {
    id: 'badge-half-quran',
    title: 'خاتم نصف القرآن الكريم',
    description: 'بلوغ 15 جزءاً من القرآن العظيم وتجاوز منتصف الدرب المبارك.',
    icon: 'star',
    category: 'hifz',
    isUnlocked: true,
    unlockedAt: '2026-10-25',
    progressPercent: 100,
  },
  {
    id: 'badge-warsh-master',
    title: 'فارس رواية ورش',
    description: 'إتقان أحكام نقل الهمز ومد البدل وترقيق الراء وتغليظ اللام دون خطأ.',
    icon: 'book',
    category: 'tajweed',
    isUnlocked: true,
    unlockedAt: '2026-11-01',
    progressPercent: 100,
  },
  {
    id: 'badge-perfect-attendance',
    title: 'نجم المواظبة والانضباط',
    description: 'تحقيق نسبة حضور 100% في محراب المسجد دون أي غياب لمدة شهر كامل.',
    icon: 'flame',
    category: 'attendance',
    isUnlocked: true,
    unlockedAt: '2026-11-05',
    progressPercent: 100,
  },
  {
    id: 'badge-khatm-quran',
    title: 'خاتم كتاب الله المبارك',
    description: 'إتمام حفظ الأجزاء الثلاثين كاملة ونيل الإجازة القرآنية برواية ورش عن نافع.',
    icon: 'crown',
    category: 'hifz',
    isUnlocked: false,
    progressPercent: 53,
  },
];

/**
 * التحقق الأمني من صلاحية الوصول لبيانات الطالب
 */
export async function verifyStudentAccessGate(
  studentId: string,
  requestUserId: string
): Promise<boolean> {
  // إذا كان المستخدم طالباً، لا يسمح له بالاطلاع إلا على حسابه الشخصي فقط!
  if (requestUserId.startsWith('s-')) {
    return requestUserId === studentId;
  }
  // المعلمون والمدراء والأولياء يخضعون لبواباتهم السابقة
  return true;
}

/**
 * استرجاع بيانات لوحة تحكم الطالب المتكاملة
 */
export async function fetchStudentDashboardData(
  studentId: string = 's-001'
): Promise<StudentDashboardData> {
  const profile = MOCK_STUDENT_PROFILES[studentId] || MOCK_STUDENT_PROFILES['s-001'];
  const followup = await fetchStudentFollowupRecord(studentId);

  // حساب خريطة الأجزاء الثلاثين للطالب
  const juzMap: StudentJuzMapItem[] = Array.from({ length: 30 }, (_, i) => {
    const juzNum = i + 1;
    const isCompleted = juzNum < profile.currentJuz;
    const isCurrent = juzNum === profile.currentJuz;
    const surahs = getSurahsByJuz(juzNum);

    return {
      juzNumber: juzNum,
      juzName: QURAN_JUZ_NAMES[juzNum - 1] || `الجزء ${juzNum}`,
      status: isCompleted ? 'completed' : isCurrent ? 'in_progress' : 'locked',
      completionPercent: isCompleted ? 100 : isCurrent ? 50 : 0,
      totalSurahs: surahs.length,
      completedSurahs: isCompleted ? surahs.length : isCurrent ? Math.floor(surahs.length / 2) : 0,
    };
  });

  const wird = MOCK_DAILY_WIRD[studentId] || {
    id: `wird-${studentId}`,
    date: new Date().toISOString().split('T')[0],
    newMemorization: {
      surahNumber: 1,
      surahName: 'سورة الفاتحة',
      fromAyah: 1,
      toAyah: 7,
      juzNumber: 1,
      isCompleted: false,
    },
    minorReview: {
      surahNumber: 114,
      surahName: 'سورة الناس',
      fromAyah: 1,
      toAyah: 6,
      juzNumber: 30,
      isCompleted: true,
    },
    majorReview: {
      juzNumber: 30,
      juzName: 'جزء عم',
      isCompleted: false,
    },
  };

  const streak: StudentStreakData = {
    currentStreakDays: 14,
    longestStreakDays: 30,
    lastActiveDate: '2026-11-07',
    weeklyActivity: [true, true, true, true, true, true, false], // السبت إلى الخميس نشط
  };

  const weeklySchedule = [
    {
      dayOfWeek: 6,
      dayName: 'السبت',
      startTime: '08:00',
      endTime: '10:00',
      hallName: profile.hallName,
    },
    {
      dayOfWeek: 1,
      dayName: 'الإثنين',
      startTime: '16:30',
      endTime: '18:00',
      hallName: profile.hallName,
    },
    {
      dayOfWeek: 3,
      dayName: 'الأربعاء',
      startTime: '16:30',
      endTime: '18:00',
      hallName: profile.hallName,
    },
    {
      dayOfWeek: 4,
      dayName: 'الخميس',
      startTime: '16:30',
      endTime: '18:30',
      hallName: profile.hallName,
    },
  ];

  return {
    profile,
    wird,
    streak,
    badges: STUDENT_BADGES_CATALOG,
    juzMap,
    recentRecitations: followup.timeline,
    goals: followup.goals,
    reports: [],
    weeklySchedule,
  };
}

/**
 * تأكيد الطالب إنجاز أحد أقسام ورده القرآني
 */
export async function toggleWirdSectionCompleted(
  studentId: string,
  sectionType: 'new' | 'minor' | 'major'
): Promise<StudentDailyWird> {
  const wird = MOCK_DAILY_WIRD[studentId] || MOCK_DAILY_WIRD['s-001'];

  if (sectionType === 'new') {
    wird.newMemorization.isCompleted = !wird.newMemorization.isCompleted;
  } else if (sectionType === 'minor') {
    wird.minorReview.isCompleted = !wird.minorReview.isCompleted;
  } else if (sectionType === 'major') {
    wird.majorReview.isCompleted = !wird.majorReview.isCompleted;
  }

  wird.studentConfirmedAt = new Date().toISOString();
  return { ...wird };
}

/**
 * جلب شهادة الإنجاز القرآني الإلكترونية للطالب
 */
export async function fetchStudentCertificates(
  studentId: string
): Promise<StudentCertificate[]> {
  const profile = MOCK_STUDENT_PROFILES[studentId] || MOCK_STUDENT_PROFILES['s-001'];

  return [
    {
      id: 'cert-half-quran',
      title: 'شهادة إتمام نصف القرآن الكريم',
      studentName: profile.fullName,
      achievementText: 'نظير إتمامه حفظ خمسة عشر جزءاً من القرآن العظيم برواية ورش عن نافع بإتقان وتميز.',
      stageName: 'مرحلة المتقنين - الفوج الأول',
      issuedDate: '2026-10-25',
      teacherName: profile.teacherName,
      schoolName: 'مدرسة نبراس القرآنية',
      mosqueName: 'مسجد إبراهيم الخليل عليه السلام',
    },
  ];
}

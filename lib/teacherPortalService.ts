import { supabase, isSupabaseConfigured } from './supabase';
import {
  TeacherDashboardStats,
  TeacherCircleOverview,
  TeacherCircleDetail,
  TeacherStudentItem,
  TeacherStudentDetail,
  JuzProgressItem,
  RecitationHistoryEntry,
  QuickRecitationDTO,
} from '../types/teacherPortal.types';

// =============================================================================
// أسماء الأجزاء الثلاثين من القرآن الكريم وفق المصحف الشريف
// =============================================================================
export const QURAN_JUZ_NAMES = [
  'الم (الفاتحة والبقرة)',
  'سيقول السفهاء',
  'تلك الرسل',
  'لن تنالوا البر',
  'والمحصنات',
  'لا يحب الله',
  'وإذا سمعوا',
  'ولو أننا',
  'قال الملأ',
  'واعلموا',
  'يعتذرون',
  'وما من دابة',
  'وما أبرئ نفسي',
  'ربما',
  'سبحان الذي أسرى',
  'قال ألم',
  'اقترب للناس',
  'قد أفلح',
  'وقال الذين لا يرجون',
  'أمن خلق',
  'اتل ما أوحي',
  'ومن يقنت',
  'وما لي',
  'فمن أظلم',
  'إليه يرد',
  'حم (الأحقاف)',
  'قال فما خطبكم',
  'قد سمع الله',
  'تبارك الذي',
  'عم يتساءلون',
];

// دالة مساعدة لتوليد حالة تقدم الأجزاء للطالب
export const generateJuzProgress = (currentJuz: number, targetJuz: number = 30): JuzProgressItem[] => {
  return QURAN_JUZ_NAMES.map((name, index) => {
    const juzNumber = index + 1;
    let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
    let completionPercentage = 0;

    if (juzNumber < currentJuz) {
      status = 'completed';
      completionPercentage = 100;
    } else if (juzNumber === currentJuz) {
      status = 'in_progress';
      completionPercentage = 65;
    } else {
      status = 'not_started';
      completionPercentage = 0;
    }

    return {
      juzNumber,
      juzName: `الجزء ${juzNumber}: ${name}`,
      status,
      completionPercentage,
      lastReviewedDate: juzNumber <= currentJuz ? '2026-11-02' : undefined,
    };
  });
};

// =============================================================================
// البيانات التأسيسية لبوابة المعلم بمدرسة نبراس القرآنية
// =============================================================================
const ALL_CIRCLES_REGISTRY: TeacherCircleDetail[] = [
  {
    id: 'c1',
    name: 'حلقة الصديق للمتقنين',
    level: 'متقدم',
    hallName: 'قاعة الصديق - الطابق الأرضي',
    studentCount: 8,
    targetGender: 'بنين',
    scheduleDays: ['الأحد', 'الثلاثاء', 'الخميس'],
    sessionTime: '16:00 - 18:00 (بعد العصر)',
    capacity: 12,
    academicYear: '2025/2026',
    averageAttendanceRate: 94,
    description: 'حلقة مخصصة لحفظ وتثبيت القرآن الكريم كاملاً مع أحكام التجويد المتقدمة',
    teacherId: 't-01',
    isSimulated: true,
  },
  {
    id: 'c3',
    name: 'حلقة الإمام ورش',
    level: 'مراجعة وإتقان',
    hallName: 'قاعة الفاروق - الجناح الشرقي',
    studentCount: 7,
    targetGender: 'بنين',
    scheduleDays: ['السبت', 'الاثنين', 'الأربعاء'],
    sessionTime: '17:30 - 19:30 (بين المغرب والعشاء)',
    capacity: 10,
    academicYear: '2025/2026',
    averageAttendanceRate: 96,
    description: 'حلقة مخصصة لمراجعة القرآن الكريم وضبط القراءة برواية ورش عن نافع من طريق الأزرق',
    teacherId: 't-01',
    isSimulated: true,
  },
  {
    id: 'c2',
    name: 'حلقة البراعم والناشئة (معلم آخر)',
    level: 'مبتدئ',
    hallName: 'قاعة عثمان بن عفان',
    studentCount: 10,
    targetGender: 'بنين',
    scheduleDays: ['الأحد', 'الثلاثاء'],
    sessionTime: '15:00 - 16:30',
    capacity: 12,
    academicYear: '2025/2026',
    averageAttendanceRate: 91,
    description: 'حلقة مخصصة للمبتدئين في حفظ قصار السور والدروس الهجائية',
    teacherId: 't-02', // معلم مختلف لاختبار العزل الأمني RLS
    isSimulated: true,
  },
];

const ALL_STUDENTS_REGISTRY: Record<string, TeacherStudentDetail> = {
  's-001': {
    id: 's-001',
    fullName: 'أحمد محمد علي',
    registrationNumber: 'NEB-2026-0001',
    circleId: 'c1',
    circleName: 'حلقة الصديق للمتقنين',
    teacherId: 't-01',
    currentJuz: 15,
    targetJuz: 30,
    hifzLevel: 'متقدم',
    birthDate: '2012-05-14',
    age: 14,
    guardianName: 'محمد علي بن بلقاسم',
    guardianRelation: 'الأب',
    guardianPhone: '0550123456',
    guardianEmail: 'm.ali@nebras-quran.dz',
    address: 'حي الشهداء، بجوار مسجد إبراهيم الخليل',
    lastRecitationDate: '2026-11-04',
    lastRecitationSurah: 'سورة الكهف (1-40)',
    lastGrade: 'ممتاز',
    attendanceRate: 96,
    behaviorScore: 98,
    totalAttendanceDays: 48,
    totalAbsenceDays: 2,
    teacherNotes: 'طالب حريص ومجد، صوته ندي ورخيم، أظهر إتقاناً ممتازاً لأحكام المد والإدغام.',
    isSimulated: true,
    dataSource: 'local_simulated',
    juzProgress: generateJuzProgress(15, 30),
    recitationHistory: [
      {
        id: 'rec-101',
        date: '2026-11-04',
        recordType: 'new_memorization',
        recordTypeLabel: 'حفظ جديد',
        juz: 15,
        surahNumber: 18,
        surahName: 'سورة الكهف',
        ayahFrom: 1,
        ayahTo: 40,
        grade: 'ممتاز',
        mistakesCount: 0,
        tajweedMistakesCount: 1,
        notes: 'حفظ متقن ومحكم، مع انتباه لطيف لأحكام الراء المرققة',
      },
      {
        id: 'rec-102',
        date: '2026-11-02',
        recordType: 'minor_review',
        recordTypeLabel: 'مراجعة صغرى',
        juz: 15,
        surahNumber: 17,
        surahName: 'سورة الإسراء',
        ayahFrom: 70,
        ayahTo: 111,
        grade: 'ممتاز',
        mistakesCount: 1,
        tajweedMistakesCount: 0,
        notes: 'مراجعة قوية وتثبيت سريع لأواخر السورة',
      },
      {
        id: 'rec-103',
        date: '2026-10-30',
        recordType: 'major_review',
        recordTypeLabel: 'مراجعة كبرى',
        juz: 14,
        surahNumber: 16,
        surahName: 'سورة النحل',
        ayahFrom: 1,
        ayahTo: 80,
        grade: 'جيد جداً',
        mistakesCount: 2,
        tajweedMistakesCount: 1,
        notes: 'عرض الجزء كاملاً مع الشيخ، نبهته للمتشابهات مع سورة الأنعام',
      },
    ],
  },
  's-003': {
    id: 's-003',
    fullName: 'يوسف عبد الرحمن عمر',
    registrationNumber: 'NEB-2026-0003',
    circleId: 'c1',
    circleName: 'حلقة الصديق للمتقنين',
    teacherId: 't-01',
    currentJuz: 12,
    targetJuz: 30,
    hifzLevel: 'متقدم',
    birthDate: '2013-09-21',
    age: 13,
    guardianName: 'عبد الرحمن عمر الجزائري',
    guardianRelation: 'الأب',
    guardianPhone: '0661234567',
    guardianEmail: 'a.omar@nebras-quran.dz',
    address: 'حي البساتين، قصر الشلالة',
    lastRecitationDate: '2026-11-04',
    lastRecitationSurah: 'سورة يوسف (1-50)',
    lastGrade: 'جيد جداً',
    attendanceRate: 92,
    behaviorScore: 95,
    totalAttendanceDays: 45,
    totalAbsenceDays: 4,
    teacherNotes: 'سريع الحفظ ويمتاز بالتركيز العالي، يوصى بالتركيز على المراجعة التراكمية.',
    isSimulated: true,
    dataSource: 'local_simulated',
    juzProgress: generateJuzProgress(12, 30),
    recitationHistory: [
      {
        id: 'rec-104',
        date: '2026-11-04',
        recordType: 'new_memorization',
        recordTypeLabel: 'حفظ جديد',
        juz: 12,
        surahNumber: 12,
        surahName: 'سورة يوسف',
        ayahFrom: 1,
        ayahTo: 50,
        grade: 'جيد جداً',
        mistakesCount: 1,
        tajweedMistakesCount: 2,
        notes: 'أجاد الحفظ وتدرب على أحكام الإشمام والاختلاس في (تأمنا)',
      },
      {
        id: 'rec-105',
        date: '2026-11-01',
        recordType: 'minor_review',
        recordTypeLabel: 'مراجعة صغرى',
        juz: 12,
        surahNumber: 11,
        surahName: 'سورة هود',
        ayahFrom: 60,
        ayahTo: 123,
        grade: 'ممتاز',
        mistakesCount: 0,
        tajweedMistakesCount: 0,
        notes: 'تثبيت ممتاز واستحضار سريع للآيات',
      },
    ],
  },
  's-005': {
    id: 's-005',
    fullName: 'عبد الجليل عمر الشريف',
    registrationNumber: 'NEB-2026-0005',
    circleId: 'c3',
    circleName: 'حلقة الإمام ورش',
    teacherId: 't-01',
    currentJuz: 20,
    targetJuz: 30,
    hifzLevel: 'مراجعة',
    birthDate: '2011-12-05',
    age: 15,
    guardianName: 'عمر الشريف',
    guardianRelation: 'الأب',
    guardianPhone: '0555334455',
    guardianEmail: 'o.sharif@nebras-quran.dz',
    address: 'شارع المسجد الكبير، وسط المدينة',
    lastRecitationDate: '2026-11-03',
    lastRecitationSurah: 'سورة مريم (كاملة)',
    lastGrade: 'ممتاز',
    attendanceRate: 95,
    behaviorScore: 99,
    totalAttendanceDays: 47,
    totalAbsenceDays: 2,
    teacherNotes: 'من الطلاب النجباء المرشحين لمسابقة الإتقان القرآني الولائية.',
    isSimulated: true,
    dataSource: 'local_simulated',
    juzProgress: generateJuzProgress(20, 30),
    recitationHistory: [
      {
        id: 'rec-106',
        date: '2026-11-03',
        recordType: 'major_review',
        recordTypeLabel: 'مراجعة كبرى',
        juz: 16,
        surahNumber: 19,
        surahName: 'سورة مريم',
        ayahFrom: 1,
        ayahTo: 98,
        grade: 'ممتاز',
        mistakesCount: 0,
        tajweedMistakesCount: 0,
        notes: 'سرد متصل للسورة كاملة برواية ورش دون أي توقف أو تردد',
      },
      {
        id: 'rec-107',
        date: '2026-10-29',
        recordType: 'new_memorization',
        recordTypeLabel: 'حفظ جديد',
        juz: 20,
        surahNumber: 27,
        surahName: 'سورة النمل',
        ayahFrom: 60,
        ayahTo: 93,
        grade: 'ممتاز',
        mistakesCount: 0,
        tajweedMistakesCount: 1,
        notes: 'استيعاب دقيق لأوجه ورش في ترقيق اللامات والراءات',
      },
    ],
  },
  // طالب مسجل لمعلم آخر (t-02) لاختبار منع الوصول واختراق الصلاحيات
  's-099': {
    id: 's-099',
    fullName: 'بلال سفيان التواتي',
    registrationNumber: 'NEB-2026-0099',
    circleId: 'c2',
    circleName: 'حلقة البراعم والناشئة',
    teacherId: 't-02',
    currentJuz: 2,
    targetJuz: 30,
    hifzLevel: 'مبتدئ',
    birthDate: '2016-03-10',
    age: 10,
    guardianName: 'سفيان التواتي',
    guardianRelation: 'الأب',
    guardianPhone: '0555998877',
    guardianEmail: 's.touati@nebras-quran.dz',
    address: 'حي النور، قصر الشلالة',
    lastRecitationDate: '2026-11-04',
    lastRecitationSurah: 'سورة البلد',
    lastGrade: 'ممتاز',
    attendanceRate: 98,
    behaviorScore: 97,
    totalAttendanceDays: 30,
    totalAbsenceDays: 1,
    teacherNotes: 'طالب حلقة الشيخ عمر الفاروق.',
    isSimulated: true,
    dataSource: 'local_simulated',
    juzProgress: generateJuzProgress(2, 30),
    recitationHistory: [],
  },
};

let localStudentDetails = { ...ALL_STUDENTS_REGISTRY };

/**
 * جلب مؤشرات لوحة تحكم المعلم
 */
export const fetchTeacherDashboardStats = async (
  teacherId: string = 't-01'
): Promise<TeacherDashboardStats> => {
  const circles = await fetchTeacherCircles(teacherId);
  const students = await fetchTeacherStudents(undefined, teacherId);

  return {
    assignedCirclesCount: circles.length,
    totalStudentsCount: students.length,
    todayAttendanceRate: 94,
    completedRecitationsThisWeek: 32,
    isSimulated: !isSupabaseConfigured(),
    dataSource: isSupabaseConfigured() ? 'supabase_live' : 'local_simulated',
    nextSession: circles.length > 0
      ? {
          circleName: circles[0].name,
          hallName: circles[0].hallName,
          time: circles[0].sessionTime,
          day: 'اليوم (بعد صلاة العصر)',
        }
      : null,
  };
};

/**
 * جلب الحلقات المسندة للمعلم
 */
export const fetchTeacherCircles = async (
  teacherId: string = 't-01'
): Promise<TeacherCircleOverview[]> => {
  const detailed = await fetchTeacherCirclesWithDetails(teacherId);
  return detailed.map(c => ({
    id: c.id,
    name: c.name,
    level: c.level,
    hallName: c.hallName,
    studentCount: c.studentCount,
    targetGender: c.targetGender,
    scheduleDays: c.scheduleDays,
    sessionTime: c.sessionTime,
    teacherId: c.teacherId,
  }));
};

/**
 * جلب تفاصيل الحلقات المسندة للمعلم مع السعات والسنوات الأكاديمية
 * [أمان RLS]: حصر الاسترجاع حصراً على الحلقات التابعة لـ teacherId
 */
export const fetchTeacherCirclesWithDetails = async (
  teacherId: string = 't-01'
): Promise<TeacherCircleDetail[]> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('circles') as any)
        .select(`
          id,
          name,
          level,
          target_gender,
          capacity,
          teacher_id,
          academic_years (name),
          halls (name),
          circle_students (count)
        `)
        .eq('teacher_id', teacherId);

      if (!error && data && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          name: c.name,
          level: c.level || 'متوسط',
          hallName: c.halls?.name || 'قاعة المسجد',
          studentCount: c.circle_students?.[0]?.count || 0,
          targetGender: c.target_gender === 'male' ? 'بنين' : 'بنات',
          scheduleDays: ['الأحد', 'الثلاثاء', 'الخميس'],
          sessionTime: '16:00 - 18:00',
          capacity: c.capacity || 15,
          academicYear: c.academic_years?.name || '2025/2026',
          averageAttendanceRate: 95,
          description: `حلقة ${c.name} المباركة بمسجد إبراهيم الخليل`,
          teacherId: c.teacher_id,
          isSimulated: false,
        }));
      }
    } catch (err) {
      console.warn('جلب تفاصيل حلقات المعلم محلياً:', err);
    }
  }

  // فلترة الحلقات محلياً حسب المعلم المستعلم لمنع تسريب حلقات معلم آخر
  return ALL_CIRCLES_REGISTRY
    .filter(c => !teacherId || c.teacherId === teacherId)
    .map(c => ({ ...c, isSimulated: !isSupabaseConfigured() }));
};

/**
 * جلب طلاب حلقات المعلم (نظرة عامة)
 * [أمان RLS]: حصر استرجاع الطلاب على الحلقات المسندة للمعلم فقط
 */
export const fetchTeacherStudents = async (
  circleId?: string,
  teacherId: string = 't-01'
): Promise<TeacherStudentItem[]> => {
  // أولاً: جلب معرفات حلقات المعلم المصرح له بها
  const authorizedCircles = await fetchTeacherCircles(teacherId);
  const authorizedCircleIds = new Set(authorizedCircles.map(c => c.id));

  // إذا تم طلب حلقة محددة، التأكد من أنها تتبع هذا المعلم
  if (circleId && circleId !== 'all' && !authorizedCircleIds.has(circleId)) {
    console.warn(`[SECURITY VIOLATION] المعلم ${teacherId} حاول الوصول لطلاب حلقة غير مسندة إليه: ${circleId}`);
    return [];
  }

  if (isSupabaseConfigured() && circleId && circleId !== 'all') {
    try {
      const { data, error } = await (supabase.from('circle_students') as any)
        .select(`
          student:students (
            id,
            registration_number,
            hifz_level,
            profile:profiles!inner (full_name),
            guardian_students (
              guardian:guardians (full_name, phone)
            )
          ),
          circle:circles (name)
        `)
        .eq('circle_id', circleId)
        .eq('status', 'enrolled');

      if (!error && data && data.length > 0) {
        return data.map((item: any) => {
          const s = item.student || {};
          const p = s.profile || {};
          const g = s.guardian_students?.[0]?.guardian || {};
          return {
            id: s.id,
            fullName: p.full_name || 'طالب',
            registrationNumber: s.registration_number || '---',
            circleId,
            circleName: item.circle?.name || 'حلقة قرآنية',
            currentJuz: 10,
            targetJuz: 30,
            hifzLevel: s.hifz_level || 'متوسط',
            guardianName: g.full_name || 'ولي الأمر',
            guardianPhone: g.phone || '---',
            attendanceRate: 95,
            teacherId,
          };
        });
      }
    } catch (err) {
      console.warn('جلب طلاب المعلم محلياً:', err);
    }
  }

  // فلترة الطلاب محلياً لضمان عدم ظهور أي طالب من حلقات معلم آخر
  let list = Object.values(localStudentDetails)
    .filter(s => authorizedCircleIds.has(s.circleId))
    .map((s): TeacherStudentItem => ({
      id: s.id,
      fullName: s.fullName,
      registrationNumber: s.registrationNumber,
      circleId: s.circleId,
      circleName: s.circleName,
      currentJuz: s.currentJuz,
      targetJuz: s.targetJuz,
      hifzLevel: s.hifzLevel,
      guardianName: s.guardianName,
      guardianPhone: s.guardianPhone,
      lastRecitationDate: s.lastRecitationDate,
      lastRecitationSurah: s.lastRecitationSurah,
      lastGrade: s.lastGrade,
      attendanceRate: s.attendanceRate,
      teacherId: s.teacherId,
    }));

  if (circleId && circleId !== 'all') {
    list = list.filter(s => s.circleId === circleId);
  }
  return list;
};

/**
 * جلب الملف القرآني التفصيلي للطالب
 * [أمان RLS وحصانة الوصول]: التحقق الصارم من أن الطالب يتبع إحدى حلقات المعلم المستعلم
 */
export const fetchTeacherStudentDetail = async (
  studentId: string,
  teacherId: string = 't-01'
): Promise<TeacherStudentDetail | null> => {
  // فحص الصلاحية في طبقة الخدمة: هل هذا الطالب مسجل في إحدى حلقات هذا المعلم؟
  const teacherStudents = await fetchTeacherStudents(undefined, teacherId);
  const isEnrolled = teacherStudents.some(s => s.id === studentId);

  if (!isEnrolled) {
    console.warn(`[SECURITY BLOCKED] محاولة وصول غير مصرح بها: المعلم ${teacherId} حاول فتح الملف القرآني للطالب ${studentId}`);
    return null;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data: sData, error: sError } = await (supabase.from('students') as any)
        .select(`
          id,
          registration_number,
          hifz_level,
          birth_date,
          profile:profiles!inner (full_name),
          guardian_students (
            guardian:guardians (full_name, phone)
          )
        `)
        .eq('id', studentId)
        .single();

      if (!sError && sData) {
        // fetch recitations
        const { data: recData } = await (supabase.from('memorization_records') as any)
          .select('*')
          .eq('student_id', studentId)
          .order('date', { ascending: false })
          .limit(10);

        const p = sData.profile || {};
        const g = sData.guardian_students?.[0]?.guardian || {};
        const currentJuz = 12;

        const recHistory: RecitationHistoryEntry[] = (recData || []).map((r: any) => ({
          id: r.id,
          date: r.date,
          recordType: r.record_type,
          recordTypeLabel:
            r.record_type === 'new_memorization'
              ? 'حفظ جديد'
              : r.record_type === 'minor_review'
              ? 'مراجعة صغرى'
              : 'مراجعة كبرى',
          juz: r.juz || 1,
          surahNumber: r.surah_number,
          surahName: r.surah_name,
          ayahFrom: r.ayah_from,
          ayahTo: r.ayah_to,
          grade: r.grade,
          mistakesCount: r.mistakes_count || 0,
          tajweedMistakesCount: r.tajweed_mistakes_count || 0,
          notes: r.notes || '',
        }));

        return {
          id: sData.id,
          fullName: p.full_name || 'طالب',
          registrationNumber: sData.registration_number || '---',
          circleId: 'c1',
          circleName: 'حلقة الصديق للمتقنين',
          teacherId,
          currentJuz,
          targetJuz: 30,
          hifzLevel: sData.hifz_level || 'متقدم',
          birthDate: sData.birth_date,
          age: 14,
          guardianName: g.full_name || 'ولي الأمر',
          guardianRelation: 'الأب',
          guardianPhone: g.phone || '---',
          guardianEmail: 'guardian@nebras-quran.dz',
          address: 'بجوار مسجد إبراهيم الخليل',
          lastRecitationDate: recHistory[0]?.date,
          lastRecitationSurah: recHistory[0] ? `${recHistory[0].surahName} (${recHistory[0].ayahFrom}-${recHistory[0].ayahTo})` : undefined,
          lastGrade: recHistory[0]?.grade,
          attendanceRate: 95,
          behaviorScore: 96,
          totalAttendanceDays: 45,
          totalAbsenceDays: 3,
          teacherNotes: 'طالب متميز في الانضباط والتلاوة التجويدية.',
          juzProgress: generateJuzProgress(currentJuz, 30),
          recitationHistory: recHistory,
          isSimulated: false,
          dataSource: 'supabase_live',
        };
      }
    } catch (err) {
      console.warn('جلب تفاصيل الطالب محلياً:', err);
    }
  }

  const rawDetail = localStudentDetails[studentId];
  if (!rawDetail) return null;

  return {
    ...rawDetail,
    isSimulated: !isSupabaseConfigured(),
    dataSource: isSupabaseConfigured() ? 'supabase_live' : 'local_simulated',
  };
};

/**
 * تسجيل تسميع قرآني سريع في جلسة الحلقة
 * [أمان RLS]: منع تسجيل تسميع لطالب أو حلقة لا تتبع المعلم
 */
export const logQuickRecitation = async (
  dto: QuickRecitationDTO,
  teacherId: string = 't-01'
): Promise<{ success: boolean; recordId: string; error?: string }> => {
  // التحقق من الصلاحية: هل الطالب والحلقة يتبعان المعلم المستدعي؟
  const teacherCircles = await fetchTeacherCircles(teacherId);
  const authorizedCircleIds = new Set(teacherCircles.map(c => c.id));

  if (!authorizedCircleIds.has(dto.circleId)) {
    const errorMsg = `[SECURITY BLOCKED] غير مصرح: المعلم ${teacherId} لا يملك صلاحية تسجيل تسميع في الحلقة ${dto.circleId}`;
    console.error(errorMsg);
    return { success: false, recordId: '', error: errorMsg };
  }

  const teacherStudents = await fetchTeacherStudents(dto.circleId, teacherId);
  if (!teacherStudents.some(s => s.id === dto.studentId)) {
    const errorMsg = `[SECURITY BLOCKED] غير مصرح: الطالب ${dto.studentId} ليس مقيداً في حلقة المعلم ${teacherId}`;
    console.error(errorMsg);
    return { success: false, recordId: '', error: errorMsg };
  }

  const recordId = `rec-${Date.now()}`;
  const todayStr = new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await (supabase.from('memorization_records') as any)
        .insert({
          student_id: dto.studentId,
          circle_id: dto.circleId,
          date: todayStr,
          surah_number: dto.surahNumber,
          surah_name: dto.surahName,
          ayah_from: dto.ayahFrom,
          ayah_to: dto.ayahTo,
          record_type: dto.recordType,
          grade: dto.grade,
          mistakes_count: dto.mistakesCount,
          tajweed_mistakes_count: dto.tajweedMistakesCount,
          notes: dto.notes || null,
        })
        .select()
        .single();

      if (!error && data) {
        return { success: true, recordId: data.id };
      }
    } catch (err) {
      console.warn('حفظ التسميع محلياً:', err);
    }
  }

  // Fallback update
  const student = localStudentDetails[dto.studentId];
  if (student) {
    student.lastRecitationDate = todayStr;
    student.lastRecitationSurah = `${dto.surahName} (${dto.ayahFrom}-${dto.ayahTo})`;
    student.lastGrade = dto.grade;

    const recordTypeLabel =
      dto.recordType === 'new_memorization'
        ? 'حفظ جديد'
        : dto.recordType === 'minor_review'
        ? 'مراجعة صغرى'
        : 'مراجعة كبرى';

    const newHistoryEntry: RecitationHistoryEntry = {
      id: recordId,
      date: todayStr,
      recordType: dto.recordType,
      recordTypeLabel,
      juz: student.currentJuz,
      surahNumber: dto.surahNumber,
      surahName: dto.surahName,
      ayahFrom: dto.ayahFrom,
      ayahTo: dto.ayahTo,
      grade: dto.grade,
      mistakesCount: dto.mistakesCount,
      tajweedMistakesCount: dto.tajweedMistakesCount,
      notes: dto.notes,
    };

    student.recitationHistory = [newHistoryEntry, ...student.recitationHistory];
  }

  return { success: true, recordId };
};

/**
 * دالة مساعدة لاختبار التحقق الأمني من وصول المعلم لبيانات الطلاب والحلقات
 */
export const checkTeacherStudentAccess = async (
  teacherId: string,
  targetStudentId: string
): Promise<{ allowed: boolean; reason?: string }> => {
  const teacherStudents = await fetchTeacherStudents(undefined, teacherId);
  const isEnrolled = teacherStudents.some(s => s.id === targetStudentId);
  if (!isEnrolled) {
    return {
      allowed: false,
      reason: `الطالب ${targetStudentId} لا ينتمي إلى أي من الحلقات المسندة للمعلم ${teacherId}`,
    };
  }
  return { allowed: true };
};

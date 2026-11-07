import { supabase, isSupabaseConfigured } from './supabase';
import {
  StudentListItem,
  StudentFilterParams,
  StudentFullProfile,
  CreateStudentDTO,
  UpdateStudentDTO,
  TransferStudentDTO,
  GuardianItem,
  CircleTransferHistoryItem,
  AttendanceRecordItem,
  MemorizationRecordItem,
  StudentFeeItem,
} from '../types/student.types';
import { CircleLevelType, StudentStatusType } from '../types/database.types';

// =============================================================================
// بيانات تأسيسية واقعية لمدرسة نبراس بمسجد إبراهيم الخليل عند العمل دون خادم
// =============================================================================
const FALLBACK_STUDENTS: StudentListItem[] = [
  {
    id: 's-001',
    registrationNumber: 'NEB-2026-0001',
    fullName: 'أحمد محمد علي',
    gender: 'male',
    birthDate: '2012-05-15',
    address: 'حي اليرموك - الجزائر',
    guardianName: 'محمد علي بن بلقاسم',
    guardianPhone: '0550123456',
    guardianRelationship: 'أب',
    currentCircleId: 'c1',
    currentCircleName: 'حلقة الصديق للمتقنين',
    currentHallName: 'قاعة الصديق',
    teacherName: 'الشيخ عبد الرحمن السديس',
    hifzLevel: 'متقدم',
    currentJuz: 15,
    targetJuz: 30,
    status: 'active',
    enrollmentDate: '2025-09-01',
    academicYear: '1447-1448 هـ / 2025-2026 م',
  },
  {
    id: 's-002',
    registrationNumber: 'NEB-2026-0002',
    fullName: 'سارة عبد الله خالد',
    gender: 'female',
    birthDate: '2014-10-20',
    address: 'حي النرجس - الجزائر',
    guardianName: 'عبد الله بن خالد',
    guardianPhone: '0559876543',
    guardianRelationship: 'أب',
    currentCircleId: 'c4',
    currentCircleName: 'حلقة أم المؤمنين عائشة',
    currentHallName: 'قاعة أم المؤمنين عائشة',
    teacherName: 'الأستاذة مريم إبراهيم',
    hifzLevel: 'متوسط',
    currentJuz: 8,
    targetJuz: 30,
    status: 'active',
    enrollmentDate: '2025-09-01',
    academicYear: '1447-1448 هـ / 2025-2026 م',
  },
  {
    id: 's-003',
    registrationNumber: 'NEB-2026-0003',
    fullName: 'يوسف عمر الفاروق',
    gender: 'male',
    birthDate: '2013-01-10',
    address: 'حي الملقا - الجزائر',
    guardianName: 'عمر الفاروق بن سعيد',
    guardianPhone: '0662233445',
    guardianRelationship: 'أب',
    currentCircleId: 'c1',
    currentCircleName: 'حلقة الصديق للمتقنين',
    currentHallName: 'قاعة الصديق',
    teacherName: 'الشيخ عبد الرحمن السديس',
    hifzLevel: 'إتمام الحفظ',
    currentJuz: 28,
    targetJuz: 30,
    status: 'active',
    enrollmentDate: '2025-09-01',
    academicYear: '1447-1448 هـ / 2025-2026 م',
  },
  {
    id: 's-004',
    registrationNumber: 'NEB-2026-0004',
    fullName: 'خديجة بوجمعة مسعود',
    gender: 'female',
    birthDate: '2016-03-25',
    address: 'وسط المدينة - الجزائر',
    guardianName: 'بوجمعة مسعود',
    guardianPhone: '0771456789',
    guardianRelationship: 'أب',
    currentCircleId: 'c6',
    currentCircleName: 'حلقة الزهراوان للفتيات',
    currentHallName: 'قاعة أم المؤمنين عائشة',
    teacherName: 'الأستاذة مريم إبراهيم',
    hifzLevel: 'مبتدئ',
    currentJuz: 3,
    targetJuz: 30,
    status: 'active',
    enrollmentDate: '2025-09-15',
    academicYear: '1447-1448 هـ / 2025-2026 م',
  },
  {
    id: 's-005',
    registrationNumber: 'NEB-2026-0005',
    fullName: 'عبد الرحمن الشريف',
    gender: 'male',
    birthDate: '2011-07-14',
    address: 'حي البساتين',
    guardianName: 'عمر الشريف',
    guardianPhone: '0555334455',
    guardianRelationship: 'أب',
    currentCircleId: 'c3',
    currentCircleName: 'حلقة الإمام ورش',
    currentHallName: 'قاعة الفاروق',
    teacherName: 'الشيخ عبد الرحمن السديس',
    hifzLevel: 'مراجعة',
    currentJuz: 20,
    targetJuz: 30,
    status: 'active',
    enrollmentDate: '2025-09-01',
    academicYear: '1447-1448 هـ / 2025-2026 م',
  },
  {
    id: 's-006',
    registrationNumber: 'NEB-2026-0006',
    fullName: 'إيمان بلقاسم حمادي',
    gender: 'female',
    birthDate: '2015-11-02',
    address: 'حي النصر',
    guardianName: 'بلقاسم حمادي',
    guardianPhone: '0663112233',
    guardianRelationship: 'أب',
    currentCircleId: 'c6',
    currentCircleName: 'حلقة الزهراوان للفتيات',
    currentHallName: 'قاعة أم المؤمنين عائشة',
    teacherName: 'الأستاذة مريم إبراهيم',
    hifzLevel: 'مبتدئ',
    currentJuz: 2,
    targetJuz: 30,
    status: 'suspended',
    enrollmentDate: '2025-10-01',
    academicYear: '1447-1448 هـ / 2025-2026 م',
  },
];

export interface FetchStudentsResult {
  students: StudentListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLive: boolean;
}

/**
 * جلب قائمة الطلاب مع التصفية والفرز وتقسيم الصفحات
 */
export const fetchStudents = async (
  params: Partial<StudentFilterParams> = {}
): Promise<FetchStudentsResult> => {
  const {
    search,
    circleId,
    gender,
    level,
    status,
    academicYearId,
    page = 1,
    pageSize = 10,
    sortBy = 'fullName',
    sortOrder = 'asc',
  } = params;

  if (!isSupabaseConfigured()) {
    // محاكاة محلية ذكية
    let filtered = [...FALLBACK_STUDENTS];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        s =>
          s.fullName.toLowerCase().includes(q) ||
          s.registrationNumber.toLowerCase().includes(q) ||
          s.guardianPhone.includes(q) ||
          s.guardianName.toLowerCase().includes(q)
      );
    }

    if (gender && gender !== 'all') {
      filtered = filtered.filter(s => s.gender === gender);
    }

    if (level && level !== 'all') {
      filtered = filtered.filter(s => s.hifzLevel === level);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(s => s.status === status);
    }

    if (circleId && circleId !== 'all') {
      filtered = filtered.filter(s => s.currentCircleId === circleId);
    }

    const totalCount = filtered.length;
    const from = (page - 1) * pageSize;
    const paginated = filtered.slice(from, from + pageSize);

    return {
      students: paginated,
      totalCount,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      isLive: false,
    };
  }

  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('students')
      .select(
        `
        id,
        registration_number,
        full_name,
        birth_date,
        gender,
        address,
        current_juz,
        target_juz,
        hifz_level,
        status,
        notes,
        created_at,
        circle_students (
          id,
          circle_id,
          enrollment_date,
          status,
          circles (
            id,
            name,
            academic_year_id,
            teachers (full_name),
            halls (name),
            academic_years (name)
          )
        ),
        guardian_students (
          guardian_id,
          relationship_type,
          is_primary_contact,
          guardians (
            id,
            full_name,
            phone,
            relationship
          )
        )
      `,
        { count: 'exact' }
      );

    // تطبيق الفلاتر
    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`full_name.ilike.%${q}%,registration_number.ilike.%${q}%`);
    }

    if (gender && gender !== 'all') {
      query = query.eq('gender', gender);
    }

    if (level && level !== 'all') {
      query = query.eq('hifz_level', level);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // الفرز
    const orderColumn =
      sortBy === 'registrationNumber'
        ? 'registration_number'
        : sortBy === 'enrollmentDate'
        ? 'created_at'
        : sortBy === 'hifzLevel'
        ? 'current_juz'
        : 'full_name';

    query = query.order(orderColumn, { ascending: sortOrder === 'asc' });
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.warn('استعلام Supabase للطلاب أعاد خطأ، استخدام المحاكاة:', error.message);
      return {
        students: FALLBACK_STUDENTS.slice(from, from + pageSize),
        totalCount: FALLBACK_STUDENTS.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(FALLBACK_STUDENTS.length / pageSize)),
        isLive: false,
      };
    }

    if (!data || data.length === 0) {
      return {
        students: [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.max(1, Math.ceil(count / pageSize)) : 1,
        isLive: true,
      };
    }

    // تحويل البيانات المسترجعة إلى النموذج المعتمد StudentListItem
    const formattedStudents: StudentListItem[] = data.map((item: any) => {
      // استخراج القيد النشط
      const activeEnrollment = item.circle_students?.find(
        (cs: any) => cs.status === 'enrolled'
      );
      const circleObj = activeEnrollment?.circles;

      // استخراج ولي الأمر الأساسي
      const primaryGuardianRel =
        item.guardian_students?.find((gs: any) => gs.is_primary_contact) ||
        item.guardian_students?.[0];
      const guardianObj = primaryGuardianRel?.guardians;

      return {
        id: item.id,
        registrationNumber: item.registration_number,
        fullName: item.full_name,
        gender: item.gender,
        birthDate: item.birth_date,
        address: item.address,
        guardianName: guardianObj?.full_name || 'غير مسجل',
        guardianPhone: guardianObj?.phone || 'غير مسجل',
        guardianRelationship: primaryGuardianRel?.relationship_type || guardianObj?.relationship || 'ولي أمر',
        guardianId: guardianObj?.id,
        currentCircleId: circleObj?.id || null,
        currentCircleName: circleObj?.name || 'غير ملتحق بحلقة',
        currentHallName: circleObj?.halls?.name || 'غير محددة',
        teacherName: circleObj?.teachers?.full_name || 'لم يحدد',
        hifzLevel: item.hifz_level,
        currentJuz: item.current_juz || 0,
        targetJuz: item.target_juz || 30,
        status: item.status,
        enrollmentDate: activeEnrollment?.enrollment_date || item.created_at?.split('T')[0] || '',
        academicYear: circleObj?.academic_years?.name || '1447-1448 هـ / 2025-2026 م',
      };
    });

    return {
      students: formattedStudents,
      totalCount: count || formattedStudents.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil((count || formattedStudents.length) / pageSize)),
      isLive: true,
    };
  } catch (err) {
    console.error('فشل جلب سجلات الطلاب من Supabase:', err);
    return {
      students: FALLBACK_STUDENTS.slice(0, pageSize),
      totalCount: FALLBACK_STUDENTS.length,
      page: 1,
      pageSize,
      totalPages: 1,
      isLive: false,
    };
  }
};

/**
 * جلب الملف الشامل للطالب بتبويباته السبعة
 */
export const fetchStudentFullProfile = async (
  studentId: string
): Promise<StudentFullProfile | null> => {
  // فحص الطالب من البيانات التأسيسية إن لم يكن Supabase متصلاً
  const fallbackMatch = FALLBACK_STUDENTS.find(s => s.id === studentId);

  if (!isSupabaseConfigured()) {
    if (!fallbackMatch) return null;

    return {
      id: fallbackMatch.id,
      registrationNumber: fallbackMatch.registrationNumber,
      fullName: fallbackMatch.fullName,
      gender: fallbackMatch.gender,
      birthDate: fallbackMatch.birthDate,
      address: fallbackMatch.address,
      hifzLevel: fallbackMatch.hifzLevel,
      currentJuz: fallbackMatch.currentJuz,
      targetJuz: fallbackMatch.targetJuz,
      status: fallbackMatch.status,
      notes: 'طالب متميز في الانضباط وحفظ الآيات برواية ورش عن نافع.',
      createdAt: fallbackMatch.enrollmentDate,
      updatedAt: '2026-11-05',
      guardians: [
        {
          id: 'g-001',
          fullName: fallbackMatch.guardianName,
          relationship: fallbackMatch.guardianRelationship,
          phone: fallbackMatch.guardianPhone,
          secondaryPhone: '0555998877',
          email: 'guardian@nebras-quran.edu',
          address: fallbackMatch.address,
          isPrimaryContact: true,
          canPickup: true,
        },
      ],
      currentCircle: {
        id: fallbackMatch.currentCircleId || 'c1',
        name: fallbackMatch.currentCircleName,
        level: fallbackMatch.hifzLevel,
        hallName: fallbackMatch.currentHallName,
        teacherName: fallbackMatch.teacherName,
        enrollmentDate: fallbackMatch.enrollmentDate,
      },
      circleHistory: [
        {
          id: 'ch-01',
          circleId: fallbackMatch.currentCircleId || 'c1',
          circleName: fallbackMatch.currentCircleName,
          teacherName: fallbackMatch.teacherName,
          hallName: fallbackMatch.currentHallName,
          enrollmentDate: fallbackMatch.enrollmentDate,
          endDate: null,
          status: 'enrolled',
          transferReason: 'تسجيل أولي معتمد',
        },
      ],
      attendanceSummary: {
        totalSessions: 42,
        presentDays: 39,
        absentDays: 2,
        lateDays: 1,
        excusedDays: 0,
        attendanceRate: 95.2,
      },
      recentAttendance: [
        { id: 'att-1', date: '2026-11-05', status: 'present', delayMinutes: 0, notes: 'حضور مبكر وتسميع ممتاز' },
        { id: 'att-2', date: '2026-11-04', status: 'present', delayMinutes: 0, notes: null },
        { id: 'att-3', date: '2026-11-03', status: 'late', delayMinutes: 10, notes: 'تأخر بعذر مقبول' },
        { id: 'att-4', date: '2026-11-02', status: 'present', delayMinutes: 0, notes: null },
        { id: 'att-5', date: '2026-11-01', status: 'absent', delayMinutes: 0, notes: 'غياب مبرر' },
      ],
      memorizationSummary: {
        totalAyahsMemorized: 1840,
        totalJuzCompleted: fallbackMatch.currentJuz,
        latestSurah: 'البقرة',
        latestAyah: 255,
        excellentGradeRate: 92.5,
      },
      memorizationRecords: [
        {
          id: 'mem-1',
          date: '2026-11-05',
          surahNumber: 2,
          surahName: 'البقرة',
          ayahFrom: 250,
          ayahTo: 255,
          juz: 3,
          recordType: 'new_memorization',
          grade: 'ممتاز',
          mistakesCount: 0,
          tajweedMistakesCount: 0,
          notes: 'إتقان تام لأحكام المدود ومخارج الحروف',
          teacherName: fallbackMatch.teacherName,
        },
        {
          id: 'mem-2',
          date: '2026-11-04',
          surahNumber: 2,
          surahName: 'البقرة',
          ayahFrom: 240,
          ayahTo: 249,
          juz: 3,
          recordType: 'minor_review',
          grade: 'ممتاز',
          mistakesCount: 0,
          tajweedMistakesCount: 1,
          notes: 'ملاحظة على ترقيق الراء',
          teacherName: fallbackMatch.teacherName,
        },
      ],
      financialSummary: {
        totalBilledDzd: 18000,
        totalPaidDzd: 18000,
        totalRemainingDzd: 0,
        settlementStatus: 'settled',
      },
      fees: [
        {
          id: 'fee-1',
          feeTitle: 'اشتراك الفصل الدراسي الأول 2025-2026',
          periodKey: '2025-Q1',
          amount: 18000,
          discount: 0,
          finalAmount: 18000,
          paidAmount: 18000,
          remainingAmount: 0,
          status: 'paid',
          dueDate: '2025-09-30',
          payments: [
            {
              id: 'pay-1',
              receiptNumber: 'REC-2025-0142',
              amount: 18000,
              paymentMethod: 'cash',
              paymentDate: '2025-09-15',
              notes: 'سداد كامل نقداً بإيصال رسمي',
            },
          ],
        },
      ],
    };
  }

  try {
    // 1. استعلام بيانات الطالب الأساسية
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      if (fallbackMatch) return fetchStudentFullProfile(fallbackMatch.id);
      return null;
    }

    const s = student as any;

    // 2. استعلام الأولياء والحلقات والحضور والحفظ والرسوم بالتوازي
    const [
      guardiansRes,
      circleHistoryRes,
      attendanceRes,
      memorizationRes,
      feesRes,
    ] = await Promise.allSettled([
      supabase
        .from('guardian_students')
        .select(`
          relationship_type,
          is_primary_contact,
          can_pickup,
          guardians (*)
        `)
        .eq('student_id', studentId),
      supabase
        .from('circle_students')
        .select(`
          id,
          circle_id,
          enrollment_date,
          end_date,
          status,
          transfer_reason,
          circles (
            id,
            name,
            level,
            halls (name),
            teachers (full_name)
          )
        `)
        .eq('student_id', studentId)
        .order('enrollment_date', { ascending: false }),
      supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(30),
      supabase
        .from('memorization_records')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(30),
      supabase
        .from('fees')
        .select(`
          *,
          payments (*)
        `)
        .eq('student_id', studentId)
        .order('due_date', { ascending: false }),
    ]);

    // معالجة الأولياء
    const guardiansData: GuardianItem[] =
      guardiansRes.status === 'fulfilled' && guardiansRes.value.data
        ? (guardiansRes.value.data as any[]).map((item: any) => ({
            id: item.guardians?.id || '',
            fullName: item.guardians?.full_name || 'ولي أمر',
            relationship: item.relationship_type || item.guardians?.relationship || 'ولي أمر',
            phone: item.guardians?.phone || '',
            secondaryPhone: item.guardians?.secondary_phone,
            email: item.guardians?.email,
            address: item.guardians?.address,
            isPrimaryContact: !!item.is_primary_contact,
            canPickup: !!item.can_pickup,
          }))
        : [];

    // معالجة الحلقات والانتقالات
    const circleHistoryData: CircleTransferHistoryItem[] =
      circleHistoryRes.status === 'fulfilled' && circleHistoryRes.value.data
        ? (circleHistoryRes.value.data as any[]).map((item: any) => ({
            id: item.id,
            circleId: item.circle_id,
            circleName: item.circles?.name || 'حلقة غير محددة',
            teacherName: item.circles?.teachers?.full_name || 'غير محدد',
            hallName: item.circles?.halls?.name || 'غير محددة',
            enrollmentDate: item.enrollment_date,
            endDate: item.end_date,
            status: item.status,
            transferReason: item.transfer_reason,
          }))
        : [];

    const activeCircleItem = circleHistoryData.find(c => c.status === 'enrolled');

    // معالجة الحضور
    const attendanceRecords: AttendanceRecordItem[] =
      attendanceRes.status === 'fulfilled' && attendanceRes.value.data
        ? (attendanceRes.value.data as any[]).map((att: any) => ({
            id: att.id,
            date: att.date,
            status: att.status,
            delayMinutes: att.delay_minutes || 0,
            notes: att.notes,
          }))
        : [];

    const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
    const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
    const lateDays = attendanceRecords.filter(a => a.status === 'late').length;
    const excusedDays = attendanceRecords.filter(a => a.status === 'excused').length;
    const totalSessions = attendanceRecords.length;
    const attendanceRate = totalSessions > 0 ? Math.round(((presentDays + lateDays) / totalSessions) * 1000) / 10 : 100;

    // معالجة الحفظ والتسميع
    const memorizationRecords: MemorizationRecordItem[] =
      memorizationRes.status === 'fulfilled' && memorizationRes.value.data
        ? (memorizationRes.value.data as any[]).map((m: any) => ({
            id: m.id,
            date: m.date,
            surahNumber: m.surah_number,
            surahName: m.surah_name,
            ayahFrom: m.ayah_from,
            ayahTo: m.ayah_to,
            juz: m.juz,
            recordType: m.record_type,
            grade: m.grade,
            mistakesCount: m.mistakes_count || 0,
            tajweedMistakesCount: m.tajweed_mistakes_count || 0,
            notes: m.notes,
          }))
        : [];

    const latestSession = memorizationRecords[0];
    const excellentCount = memorizationRecords.filter(m => m.grade === 'ممتاز').length;
    const excellentGradeRate =
      memorizationRecords.length > 0
        ? Math.round((excellentCount / memorizationRecords.length) * 100)
        : 100;

    // معالجة السجل المالي
    const feesData: StudentFeeItem[] =
      feesRes.status === 'fulfilled' && feesRes.value.data
        ? (feesRes.value.data as any[]).map((f: any) => ({
            id: f.id,
            feeTitle: f.fee_title,
            periodKey: f.period_key,
            amount: Number(f.amount || 0),
            discount: Number(f.discount || 0),
            finalAmount: Number(f.final_amount || 0),
            paidAmount: Number(f.paid_amount || 0),
            remainingAmount: Number(f.remaining_amount || 0),
            status: f.status,
            dueDate: f.due_date,
            payments: (f.payments || []).map((p: any) => ({
              id: p.id,
              receiptNumber: p.receipt_number,
              amount: Number(p.amount || 0),
              paymentMethod: p.payment_method,
              paymentDate: p.payment_date,
              notes: p.notes,
            })),
          }))
        : [];

    const totalBilledDzd = feesData.reduce((acc, f) => acc + f.finalAmount, 0);
    const totalPaidDzd = feesData.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalRemainingDzd = feesData.reduce((acc, f) => acc + f.remainingAmount, 0);
    const settlementStatus =
      totalRemainingDzd === 0 && totalBilledDzd > 0
        ? 'settled'
        : totalPaidDzd > 0
        ? 'partial'
        : 'pending';

    return {
      id: s.id,
      registrationNumber: s.registration_number,
      fullName: s.full_name,
      gender: s.gender,
      birthDate: s.birth_date,
      address: s.address,
      hifzLevel: s.hifz_level,
      currentJuz: s.current_juz || 0,
      targetJuz: s.target_juz || 30,
      status: s.status,
      notes: s.notes,
      createdAt: s.created_at?.split('T')[0] || '',
      updatedAt: s.updated_at?.split('T')[0] || '',
      guardians: guardiansData,
      currentCircle: activeCircleItem
        ? {
            id: activeCircleItem.circleId,
            name: activeCircleItem.circleName,
            level: s.hifz_level,
            hallName: activeCircleItem.hallName,
            teacherName: activeCircleItem.teacherName,
            enrollmentDate: activeCircleItem.enrollmentDate,
          }
        : null,
      circleHistory: circleHistoryData,
      attendanceSummary: {
        totalSessions,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendanceRate,
      },
      recentAttendance: attendanceRecords,
      memorizationSummary: {
        totalAyahsMemorized: memorizationRecords.reduce(
          (sum, m) => sum + Math.max(1, m.ayahTo - m.ayahFrom + 1),
          0
        ),
        totalJuzCompleted: s.current_juz || 0,
        latestSurah: latestSession?.surahName || 'البقرة',
        latestAyah: latestSession?.ayahTo || 1,
        excellentGradeRate,
      },
      memorizationRecords,
      financialSummary: {
        totalBilledDzd,
        totalPaidDzd,
        totalRemainingDzd,
        settlementStatus,
      },
      fees: feesData,
    };
  } catch (err) {
    console.error('خطأ أثناء جلب الملف الشامل للطالب:', err);
    return null;
  }
};

/**
 * إضافة طالب جديد وربطه بولي الأمر والحلقة كوحدة ذرية
 */
export const createStudent = async (
  dto: CreateStudentDTO
): Promise<{ success: boolean; studentId?: string; error?: string }> => {
  if (!isSupabaseConfigured()) {
    // محاكاة فورية محلية
    const newId = 's-' + Date.now();
    const newReg = 'NEB-2026-' + Math.floor(1000 + Math.random() * 9000);
    FALLBACK_STUDENTS.unshift({
      id: newId,
      registrationNumber: newReg,
      fullName: dto.fullName,
      gender: dto.gender,
      birthDate: dto.birthDate,
      address: dto.address || 'الجزائر',
      guardianName: dto.guardian.fullName,
      guardianPhone: dto.guardian.phone,
      guardianRelationship: dto.guardian.relationship || 'أب',
      currentCircleId: dto.circleId || 'c1',
      currentCircleName: 'حلقة مسندة',
      currentHallName: 'قاعة الصديق',
      teacherName: 'هيئة التدريس',
      hifzLevel: dto.hifzLevel || 'مبتدئ',
      currentJuz: dto.currentJuz || 0,
      targetJuz: dto.targetJuz || 30,
      status: 'active',
      enrollmentDate: new Date().toISOString().split('T')[0],
      academicYear: '1447-1448 هـ / 2025-2026 م',
    });
    return { success: true, studentId: newId };
  }

  try {
    // 1. توليد رقم القيد الطلابي
    let registrationNumber: string;
    const { data: regNoData, error: regError } = await supabase.rpc(
      'generate_student_registration_number'
    );

    if (regError || !regNoData) {
      registrationNumber = 'NEB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    } else {
      registrationNumber = regNoData as string;
    }

    // 2. البحث عن ولي الأمر بالهاتف أو إدراجه
    let guardianId: string | null = null;
    const { data: existingGuardian } = await (supabase
      .from('guardians') as any)
      .select('id')
      .eq('phone', dto.guardian.phone.trim())
      .maybeSingle();

    if (existingGuardian) {
      guardianId = (existingGuardian as any).id;
    } else {
      const { data: newGuardian, error: guardianInsertError } = await (supabase
        .from('guardians') as any)
        .insert({
          full_name: dto.guardian.fullName,
          relationship: dto.guardian.relationship,
          phone: dto.guardian.phone.trim(),
          secondary_phone: dto.guardian.secondaryPhone || null,
          address: dto.guardian.address || dto.address || null,
        })
        .select('id')
        .single();

      if (guardianInsertError || !newGuardian) {
        throw new Error(`فشل إنشاء ملف ولي الأمر: ${guardianInsertError?.message}`);
      }
      guardianId = (newGuardian as any).id;
    }

    // 3. إدراج سجل الطالب في students
    const { data: newStudent, error: studentInsertError } = await (supabase
      .from('students') as any)
      .insert({
        registration_number: registrationNumber,
        full_name: dto.fullName,
        birth_date: dto.birthDate,
        gender: dto.gender,
        address: dto.address || null,
        hifz_level: dto.hifzLevel || 'مبتدئ',
        current_juz: dto.currentJuz || 0,
        target_juz: dto.targetJuz || 30,
        status: 'active',
        notes: dto.notes || null,
      })
      .select('id')
      .single();

    if (studentInsertError || !newStudent) {
      throw new Error(`فشل إنشاء ملف الطالب: ${studentInsertError?.message}`);
    }

    const studentId = (newStudent as any).id;

    // 4. ربط الطالب بولي الأمر
    if (guardianId) {
      await (supabase.from('guardian_students') as any).insert({
        guardian_id: guardianId,
        student_id: studentId,
        relationship_type: dto.guardian.relationship || 'ولي أمر',
        is_primary_contact: true,
        can_pickup: true,
      });
    }

    // 5. قيد الطالب في الحلقة إن تم اختيارها
    if (dto.circleId) {
      const { error: circleEnrollError } = await (supabase
        .from('circle_students') as any)
        .insert({
          circle_id: dto.circleId,
          student_id: studentId,
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'enrolled',
        });

      if (circleEnrollError) {
        console.warn('تنبيه أثناء انتساب الطالب للحلقة:', circleEnrollError.message);
      }
    }

    return { success: true, studentId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'خطأ غير معروف أثناء تسجيل الطالب';
    return { success: false, error: errorMsg };
  }
};

/**
 * تعديل بيانات الطالب
 */
export const updateStudent = async (
  studentId: string,
  dto: UpdateStudentDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const idx = FALLBACK_STUDENTS.findIndex(s => s.id === studentId);
    if (idx !== -1) {
      if (dto.fullName) FALLBACK_STUDENTS[idx].fullName = dto.fullName;
      if (dto.gender) FALLBACK_STUDENTS[idx].gender = dto.gender;
      if (dto.birthDate) FALLBACK_STUDENTS[idx].birthDate = dto.birthDate;
      if (dto.hifzLevel) FALLBACK_STUDENTS[idx].hifzLevel = dto.hifzLevel;
      if (dto.status) FALLBACK_STUDENTS[idx].status = dto.status;
      if (dto.guardian?.fullName) FALLBACK_STUDENTS[idx].guardianName = dto.guardian.fullName;
      if (dto.guardian?.phone) FALLBACK_STUDENTS[idx].guardianPhone = dto.guardian.phone;
    }
    return { success: true };
  }

  try {
    const updatePayload: Record<string, any> = {};
    if (dto.fullName) updatePayload.full_name = dto.fullName;
    if (dto.birthDate) updatePayload.birth_date = dto.birthDate;
    if (dto.gender) updatePayload.gender = dto.gender;
    if (dto.address !== undefined) updatePayload.address = dto.address;
    if (dto.hifzLevel) updatePayload.hifz_level = dto.hifzLevel;
    if (dto.currentJuz !== undefined) updatePayload.current_juz = dto.currentJuz;
    if (dto.targetJuz !== undefined) updatePayload.target_juz = dto.targetJuz;
    if (dto.status) updatePayload.status = dto.status;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;

    const { error: studentUpdateError } = await (supabase
      .from('students') as any)
      .update(updatePayload)
      .eq('id', studentId);

    if (studentUpdateError) throw studentUpdateError;

    // تحديث ولي الأمر إن توفر المعرف والبيانات
    if (dto.guardian?.id) {
      const gPayload: Record<string, any> = {};
      if (dto.guardian.fullName) gPayload.full_name = dto.guardian.fullName;
      if (dto.guardian.phone) gPayload.phone = dto.guardian.phone;
      if (dto.guardian.relationship) gPayload.relationship = dto.guardian.relationship;
      if (dto.guardian.secondaryPhone !== undefined) gPayload.secondary_phone = dto.guardian.secondaryPhone;

      await (supabase.from('guardians') as any).update(gPayload).eq('id', dto.guardian.id);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'خطأ أثناء تحديث بيانات الطالب';
    return { success: false, error: errorMsg };
  }
};

/**
 * تغيير حالة الطالب (نشط، موقوف، متخرج، منسحب)
 */
export const changeStudentStatus = async (
  studentId: string,
  newStatus: StudentStatusType,
  reasonNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const match = FALLBACK_STUDENTS.find(s => s.id === studentId);
    if (match) match.status = newStatus;
    return { success: true };
  }

  try {
    const { error } = await (supabase
      .from('students') as any)
      .update({
        status: newStatus,
        notes: reasonNotes || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'فشل تغيير حالة الطالب';
    return { success: false, error: errorMsg };
  }
};

/**
 * نقل الطالب بين الحلقات مع الحفاظ التام على السجل التاريخي
 */
export const transferStudentCircle = async (
  dto: TransferStudentDTO
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    const match = FALLBACK_STUDENTS.find(s => s.id === dto.studentId);
    if (match) {
      match.currentCircleId = dto.newCircleId;
      match.currentCircleName = 'حلقة منقول إليها';
    }
    return { success: true };
  }

  try {
    // محاولة استدعاء الدالة المخزنة RPC
    const { error } = await (supabase.rpc as any)('transfer_student_circle', {
      p_student_id: dto.studentId,
      p_new_circle_id: dto.newCircleId,
      p_transfer_reason: dto.transferReason,
    });

    if (error) {
      // تنفيذ يدوي بديل في حال لم تكن الدالة قد نُشرت بعد
      const { data: activeCs } = await (supabase
        .from('circle_students') as any)
        .select('id, circle_id')
        .eq('student_id', dto.studentId)
        .eq('status', 'enrolled')
        .maybeSingle();

      const today = new Date().toISOString().split('T')[0];

      if (activeCs) {
        await (supabase
          .from('circle_students') as any)
          .update({
            status: 'transferred',
            end_date: today,
            transfer_reason: dto.transferReason,
          })
          .eq('id', (activeCs as any).id);
      }

      const { error: insertError } = await (supabase.from('circle_students') as any).insert({
        circle_id: dto.newCircleId,
        student_id: dto.studentId,
        enrollment_date: today,
        status: 'enrolled',
        previous_circle_id: (activeCs as any)?.circle_id || null,
        transfer_reason: dto.transferReason,
      });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'فشل نقل الطالب إلى الحلقة المحددة';
    return { success: false, error: errorMsg };
  }
};

/**
 * جلب البيانات الوصفية (الحلقات والقاعات والسنوات الدراسية) لخيارات التصفية
 */
export const fetchFilterMetadata = async () => {
  if (!isSupabaseConfigured()) {
    return {
      circles: [
        { id: 'c1', name: 'حلقة الصديق للمتقنين', gender: 'male' },
        { id: 'c2', name: 'حلقة البراعم التأسيسية', gender: 'mixed' },
        { id: 'c3', name: 'حلقة الإمام ورش', gender: 'male' },
        { id: 'c4', name: 'حلقة أم المؤمنين عائشة', gender: 'female' },
        { id: 'c6', name: 'حلقة الزهراوان للفتيات', gender: 'female' },
      ],
      academicYears: [
        { id: 'ay1', name: '1447-1448 هـ / 2025-2026 م', isCurrent: true },
      ],
    };
  }

  try {
    const [circlesRes, yearsRes] = await Promise.allSettled([
      (supabase.from('circles') as any).select('id, name, target_gender, status').eq('status', 'active'),
      (supabase.from('academic_years') as any).select('id, name, is_current').order('is_current', { ascending: false }),
    ]);

    const circles =
      circlesRes.status === 'fulfilled' && circlesRes.value.data
        ? (circlesRes.value.data as any[]).map(c => ({ id: c.id, name: c.name, gender: c.target_gender }))
        : [];

    const academicYears =
      yearsRes.status === 'fulfilled' && yearsRes.value.data
        ? (yearsRes.value.data as any[]).map(y => ({ id: y.id, name: y.name, isCurrent: y.is_current }))
        : [];

    return { circles, academicYears };
  } catch (err) {
    return { circles: [], academicYears: [] };
  }
};

/**
 * تصدير جدول الطلاب إلى ملف CSV باللغة العربية مع ترميز UTF-8 BOM
 */
export const exportStudentsToCSV = (students: StudentListItem[]) => {
  const headers = [
    'رقم القيد',
    'الاسم الكامل',
    'الجنس',
    'تاريخ الميلاد',
    'اسم ولي الأمر',
    'هاتف ولي الأمر',
    'صلة القرابة',
    'الحلقة الحالية',
    'القاعة الدراسية',
    'المعلم المشرف',
    'المستوى القرآني',
    'الأجزاء المحفوظة',
    'حالة القيد',
    'تاريخ الالتحاق',
    'العام الدراسي',
  ];

  const rows = students.map(s => [
    `"${s.registrationNumber}"`,
    `"${s.fullName}"`,
    `"${s.gender === 'male' ? 'ذكر' : 'أنثى'}"`,
    `"${s.birthDate}"`,
    `"${s.guardianName}"`,
    `"${s.guardianPhone}"`,
    `"${s.guardianRelationship}"`,
    `"${s.currentCircleName}"`,
    `"${s.currentHallName}"`,
    `"${s.teacherName}"`,
    `"${s.hifzLevel}"`,
    `"${s.currentJuz} / ${s.targetJuz}"`,
    `"${s.status === 'active' ? 'نشط' : s.status === 'suspended' ? 'موقوف' : s.status === 'graduated' ? 'متخرج' : 'منسحب'}"`,
    `"${s.enrollmentDate}"`,
    `"${s.academicYear}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nebras_students_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

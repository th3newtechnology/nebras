import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../types/database.types';

type StudentRow = Database['public']['Tables']['students']['Row'];
type CircleRow = Database['public']['Tables']['circles']['Row'];
type HallRow = Database['public']['Tables']['halls']['Row'];
type CircleStudentRow = Database['public']['Tables']['circle_students']['Row'];
type AttendanceRow = Database['public']['Tables']['attendance']['Row'];
type FeeRow = Database['public']['Tables']['fees']['Row'];
type ApplicationRow = Database['public']['Tables']['registration_applications']['Row'];
type AcademicYearRow = Database['public']['Tables']['academic_years']['Row'];
type MemorizationRow = Database['public']['Tables']['memorization_records']['Row'];

export interface DashboardStudentMetrics {
  total: number;
  active: number;
  male: number;
  female: number;
  graduated: number;
  suspended: number;
  levelDistribution: {
    level: string;
    count: number;
    percentage: number;
  }[];
}

export interface DashboardCirclesHallsMetrics {
  totalCircles: number;
  activeCircles: number;
  totalHalls: number;
  totalCapacity: number;
  enrolledStudentsCount: number;
  occupancyRate: number;
  circlesOverview: {
    id: string;
    name: string;
    level: string;
    gender: string;
    capacity: number;
    enrolledCount: number;
    occupancyPercent: number;
  }[];
}

export interface DashboardAttendanceMetrics {
  todayRate: number;
  recordedToday: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  weeklyTrend: {
    day: string;
    date: string;
    rate: number;
    present: number;
    absent: number;
  }[];
}

export interface DashboardFinancialMetrics {
  totalBilledDzd: number;
  totalCollectedDzd: number;
  totalRemainingDzd: number;
  collectionRate: number;
  paidCount: number;
  partiallyPaidCount: number;
  pendingCount: number;
  overdueCount: number;
  statusBreakdown: {
    status: string;
    count: number;
    amount: number;
    color: string;
  }[];
}

export interface DashboardApplicationItem {
  id: string;
  studentName: string;
  studentAge: number | null;
  guardianName: string;
  guardianPhone: string;
  desiredTrack: string;
  previousMemorization: string | null;
  createdAt: string;
  status: string;
}

export interface DashboardApplicationsMetrics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
  recentPending: DashboardApplicationItem[];
}

export interface DashboardMemorizationItem {
  id: string;
  studentName?: string;
  surahName: string;
  surahNumber: number;
  juz: number;
  ayahFrom: number;
  ayahTo: number;
  recordType: string;
  grade: string;
  date: string;
}

export interface DashboardMemorizationMetrics {
  totalSessionsThisMonth: number;
  excellentGradeRate: number;
  recentLogs: DashboardMemorizationItem[];
  monthlyHifzProgress: {
    month: string;
    newMemorizationAyahs: number;
    reviewedJuz: number;
    activeMemorizers: number;
  }[];
  gradeDistribution: {
    grade: string;
    count: number;
    fill: string;
  }[];
}

export interface AdminDashboardData {
  academicYear: string;
  students: DashboardStudentMetrics;
  circlesAndHalls: DashboardCirclesHallsMetrics;
  attendance: DashboardAttendanceMetrics;
  financials: DashboardFinancialMetrics;
  applications: DashboardApplicationsMetrics;
  memorization: DashboardMemorizationMetrics;
  isLoading: boolean;
  isLiveSupabase: boolean;
  lastUpdated: string | null;
  error: string | null;
  refetch: () => Promise<void>;
}

// بيانات نموذجية واقعية لمدرسة نبراس بمسجد إبراهيم الخليل عند عدم توفر سجلات في قاعدة البيانات
const FALLBACK_DASHBOARD_DATA: Omit<AdminDashboardData, 'isLoading' | 'isLiveSupabase' | 'lastUpdated' | 'error' | 'refetch'> = {
  academicYear: '1447-1448 هـ / 2025-2026 م',
  students: {
    total: 184,
    active: 172,
    male: 102,
    female: 82,
    graduated: 8,
    suspended: 4,
    levelDistribution: [
      { level: 'مبتدئ (البراعم والتأسيس)', count: 48, percentage: 26 },
      { level: 'متوسط (الأجزاء الأولى)', count: 64, percentage: 35 },
      { level: 'متقدم (نصف القرآن)', count: 42, percentage: 23 },
      { level: 'إتمام الحفظ (الماهر)', count: 18, percentage: 10 },
      { level: 'مراجعة وتثبيت الروايات', count: 12, percentage: 6 },
    ],
  },
  circlesAndHalls: {
    totalCircles: 8,
    activeCircles: 8,
    totalHalls: 4,
    totalCapacity: 120,
    enrolledStudentsCount: 110,
    occupancyRate: 91.6,
    circlesOverview: [
      { id: 'c1', name: 'حلقة البراعم التأسيسية', level: 'مبتدئ', gender: 'مختلط', capacity: 15, enrolledCount: 15, occupancyPercent: 100 },
      { id: 'c2', name: 'حلقة الصديق للمتقنين', level: 'متقدم', gender: 'ذكور', capacity: 18, enrolledCount: 16, occupancyPercent: 88.8 },
      { id: 'c3', name: 'حلقة الإمام ورش', level: 'متوسط', gender: 'ذكور', capacity: 20, enrolledCount: 19, occupancyPercent: 95 },
      { id: 'c4', name: 'حلقة أم المؤمنين عائشة', level: 'مبتدئ', gender: 'إناث', capacity: 15, enrolledCount: 14, occupancyPercent: 93.3 },
      { id: 'c5', name: 'حلقة الإمام نافع للمراجعة', level: 'مراجعة', gender: 'ذكور', capacity: 12, enrolledCount: 11, occupancyPercent: 91.6 },
      { id: 'c6', name: 'حلقة الزهراوان للفتيات', level: 'متوسط', gender: 'إناث', capacity: 16, enrolledCount: 15, occupancyPercent: 93.7 },
      { id: 'c7', name: 'حلقة الإتقان والإجازة', level: 'إتمام الحفظ', gender: 'ذكور', capacity: 10, enrolledCount: 9, occupancyPercent: 90 },
      { id: 'c8', name: 'حلقة رياض الصالحين', level: 'مبتدئ', gender: 'ذكور', capacity: 14, enrolledCount: 11, occupancyPercent: 78.5 },
    ],
  },
  attendance: {
    todayRate: 94.8,
    recordedToday: 172,
    presentCount: 163,
    absentCount: 5,
    lateCount: 4,
    excusedCount: 2,
    weeklyTrend: [
      { day: 'الأحد', date: '2026-11-01', rate: 96.2, present: 165, absent: 7 },
      { day: 'الاثنين', date: '2026-11-02', rate: 93.5, present: 160, absent: 12 },
      { day: 'الثلاثاء', date: '2026-11-03', rate: 95.0, present: 163, absent: 9 },
      { day: 'الأربعاء', date: '2026-11-04', rate: 92.8, present: 159, absent: 13 },
      { day: 'الخميس', date: '2026-11-05', rate: 94.8, present: 163, absent: 9 },
    ],
  },
  financials: {
    totalBilledDzd: 368000,
    totalCollectedDzd: 295000,
    totalRemainingDzd: 73000,
    collectionRate: 80.1,
    paidCount: 142,
    partiallyPaidCount: 24,
    pendingCount: 14,
    overdueCount: 4,
    statusBreakdown: [
      { status: 'مدفوع بالكامل', count: 142, amount: 284000, color: '#059669' },
      { status: 'مدفوع جزئياً', count: 24, amount: 48000, color: '#0284c7' },
      { status: 'مستحق السداد', count: 14, amount: 28000, color: '#d97706' },
      { status: 'متأخر', count: 4, amount: 8000, color: '#e11d48' },
    ],
  },
  applications: {
    pendingCount: 6,
    approvedCount: 38,
    rejectedCount: 2,
    totalCount: 46,
    recentPending: [
      {
        id: 'app-01',
        studentName: 'ياسين بن عبد الله',
        studentAge: 9,
        guardianName: 'عبد الله بن أحمد',
        guardianPhone: '0555123456',
        desiredTrack: 'MEMORIZATION',
        previousMemorization: 'حفظ 3 أجزاء (عم، تبارك، قد سمع)',
        createdAt: 'منذ ساعتين',
        status: 'PENDING',
      },
      {
        id: 'app-02',
        studentName: 'إيمان بلقاسم',
        studentAge: 7,
        guardianName: 'بلقاسم بن مسعود',
        guardianPhone: '0661987654',
        desiredTrack: 'BEGINNER',
        previousMemorization: 'جزء عم مع أحكام التجويد الأساسية',
        createdAt: 'منذ 5 ساعات',
        status: 'PENDING',
      },
      {
        id: 'app-03',
        studentName: 'عبد الرحمن الشريف',
        studentAge: 12,
        guardianName: 'عمر الشريف',
        guardianPhone: '0770334455',
        desiredTrack: 'TAJWEED',
        previousMemorization: 'حفظ 10 أجزاء برواية ورش عن نافع',
        createdAt: 'منذ يوم',
        status: 'PENDING',
      },
      {
        id: 'app-04',
        studentName: 'مريم الصديق',
        studentAge: 8,
        guardianName: 'محمد الصديق',
        guardianPhone: '0552778899',
        desiredTrack: 'BEGINNER',
        previousMemorization: 'قصار السور والقاعدة النورانية',
        createdAt: 'منذ يومين',
        status: 'PENDING',
      },
      {
        id: 'app-05',
        studentName: 'أنس حمادي',
        studentAge: 14,
        guardianName: 'توفيق حمادي',
        guardianPhone: '0664112233',
        desiredTrack: 'IJAZAH',
        previousMemorization: 'حفظ القرآن كاملاً ويرغب في نيل الإجازة',
        createdAt: 'منذ 3 أيام',
        status: 'PENDING',
      },
    ],
  },
  memorization: {
    totalSessionsThisMonth: 384,
    excellentGradeRate: 86.4,
    recentLogs: [
      {
        id: 'rec-01',
        studentName: 'أحمد محمد علي',
        surahName: 'البقرة',
        surahNumber: 2,
        juz: 3,
        ayahFrom: 250,
        ayahTo: 255,
        recordType: 'حفظ جديد',
        grade: 'ممتاز',
        date: 'اليوم - الفترة الصباحية',
      },
      {
        id: 'rec-02',
        studentName: 'سارة عبد الله',
        surahName: 'آل عمران',
        surahNumber: 3,
        juz: 4,
        ayahFrom: 1,
        ayahTo: 20,
        recordType: 'مراجعة صغرى',
        grade: 'ممتاز',
        date: 'اليوم - الفترة الصباحية',
      },
      {
        id: 'rec-03',
        studentName: 'يوسف عمر الفاروق',
        surahName: 'النساء',
        surahNumber: 4,
        juz: 5,
        ayahFrom: 40,
        ayahTo: 60,
        recordType: 'حفظ جديد',
        grade: 'جيد جداً',
        date: 'أمس - الفترة المسائية',
      },
      {
        id: 'rec-04',
        studentName: 'خديجة بوجمعة',
        surahName: 'الكهف',
        surahNumber: 18,
        juz: 15,
        ayahFrom: 1,
        ayahTo: 30,
        recordType: 'مراجعة كبرى',
        grade: 'ممتاز',
        date: 'أمس - الفترة المسائية',
      },
    ],
    monthlyHifzProgress: [
      { month: 'جويلية', newMemorizationAyahs: 1420, reviewedJuz: 110, activeMemorizers: 150 },
      { month: 'أوت', newMemorizationAyahs: 1680, reviewedJuz: 135, activeMemorizers: 158 },
      { month: 'سبتمبر', newMemorizationAyahs: 2150, reviewedJuz: 180, activeMemorizers: 165 },
      { month: 'أكتوبر', newMemorizationAyahs: 2840, reviewedJuz: 240, activeMemorizers: 172 },
      { month: 'نوفمبر', newMemorizationAyahs: 3290, reviewedJuz: 295, activeMemorizers: 172 },
    ],
    gradeDistribution: [
      { grade: 'ممتاز', count: 332, fill: '#059669' },
      { grade: 'جيد جداً', count: 38, fill: '#0284c7' },
      { grade: 'جيد', count: 12, fill: '#d97706' },
      { grade: 'يحتاج مراجعة', count: 2, fill: '#e11d48' },
    ],
  },
};

export const useAdminDashboardData = (): AdminDashboardData => {
  const [data, setData] = useState<Omit<AdminDashboardData, 'isLoading' | 'isLiveSupabase' | 'lastUpdated' | 'error' | 'refetch'>>(FALLBACK_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef<boolean>(false);

  const fetchDashboardData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      setIsLiveSupabase(false);
      setData(FALLBACK_DASHBOARD_DATA);
      setLastUpdated(new Date().toLocaleTimeString('ar-DZ'));
      setIsLoading(false);
      isFetchingRef.current = false;
      return;
    }

    try {
      // استعلامات Supabase مع حماية الأنواع
      const [
        studentsRes,
        circlesRes,
        hallsRes,
        circleStudentsRes,
        attendanceRes,
        feesRes,
        applicationsRes,
        academicYearRes,
        memorizationRes,
      ] = await Promise.allSettled([
        supabase.from('students').select('*'),
        supabase.from('circles').select('*'),
        supabase.from('halls').select('*'),
        supabase.from('circle_students').select('*'),
        supabase.from('attendance').select('*').order('date', { ascending: false }).limit(200),
        supabase.from('fees').select('*'),
        supabase.from('registration_applications').select('*').order('created_at', { ascending: false }),
        supabase.from('academic_years').select('*').eq('is_current', true).maybeSingle(),
        supabase.from('memorization_records').select('*').order('date', { ascending: false }).limit(20),
      ]);

      let hasLiveData = false;

      // 1. العام الدراسي
      let academicYearName = FALLBACK_DASHBOARD_DATA.academicYear;
      if (academicYearRes.status === 'fulfilled' && !academicYearRes.value.error && academicYearRes.value.data) {
        const yearRow = academicYearRes.value.data as AcademicYearRow;
        academicYearName = yearRow.name;
        hasLiveData = true;
      }

      // 2. مقاييس الطلاب
      let studentMetrics = { ...FALLBACK_DASHBOARD_DATA.students };
      if (studentsRes.status === 'fulfilled' && !studentsRes.value.error && studentsRes.value.data && studentsRes.value.data.length > 0) {
        hasLiveData = true;
        const allStudents = studentsRes.value.data as StudentRow[];
        const total = allStudents.length;
        const active = allStudents.filter(s => s.status === 'active').length;
        const male = allStudents.filter(s => s.gender === 'male').length;
        const female = allStudents.filter(s => s.gender === 'female').length;
        const graduated = allStudents.filter(s => s.status === 'graduated').length;
        const suspended = allStudents.filter(s => s.status === 'suspended').length;

        // توزيع المستويات
        const levelCounts: Record<string, number> = {
          'مبتدئ': 0,
          'متوسط': 0,
          'متقدم': 0,
          'إتمام الحفظ': 0,
          'مراجعة': 0,
        };
        allStudents.forEach(s => {
          if (s.hifz_level && levelCounts[s.hifz_level] !== undefined) {
            levelCounts[s.hifz_level]++;
          }
        });

        const levelDistribution = Object.entries(levelCounts).map(([level, count]) => ({
          level,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }));

        studentMetrics = {
          total,
          active,
          male,
          female,
          graduated,
          suspended,
          levelDistribution,
        };
      }

      // 3. الحلقات والقاعات
      let circlesAndHallsMetrics = { ...FALLBACK_DASHBOARD_DATA.circlesAndHalls };
      const circlesData = circlesRes.status === 'fulfilled' && !circlesRes.value.error ? (circlesRes.value.data as CircleRow[]) : null;
      const hallsData = hallsRes.status === 'fulfilled' && !hallsRes.value.error ? (hallsRes.value.data as HallRow[]) : null;
      const circleStudentsData = circleStudentsRes.status === 'fulfilled' && !circleStudentsRes.value.error ? (circleStudentsRes.value.data as CircleStudentRow[]) : null;

      if (circlesData && circlesData.length > 0) {
        hasLiveData = true;
        const totalCircles = circlesData.length;
        const activeCircles = circlesData.filter(c => c.status === 'active').length;
        const totalHalls = hallsData?.length || 0;
        const totalCapacity = hallsData?.reduce((acc, h) => acc + (h.capacity || 0), 0) || 0;
        const activeEnrollments = circleStudentsData?.filter(cs => cs.status === 'enrolled') || [];
        const enrolledStudentsCount = activeEnrollments.length;
        const occupancyRate = totalCapacity > 0 ? Math.round((enrolledStudentsCount / totalCapacity) * 1000) / 10 : 0;

        const circlesOverview = circlesData.map(c => {
          const enrolled = activeEnrollments.filter(cs => cs.circle_id === c.id).length;
          const cap = c.capacity || 15;
          return {
            id: c.id,
            name: c.name,
            level: c.level,
            gender: c.target_gender === 'male' ? 'ذكور' : c.target_gender === 'female' ? 'إناث' : 'مختلط',
            capacity: cap,
            enrolledCount: enrolled,
            occupancyPercent: Math.min(100, Math.round((enrolled / cap) * 100)),
          };
        });

        circlesAndHallsMetrics = {
          totalCircles,
          activeCircles,
          totalHalls,
          totalCapacity,
          enrolledStudentsCount,
          occupancyRate,
          circlesOverview,
        };
      }

      // 4. الحضور والغياب
      let attendanceMetrics = { ...FALLBACK_DASHBOARD_DATA.attendance };
      if (attendanceRes.status === 'fulfilled' && !attendanceRes.value.error && attendanceRes.value.data && attendanceRes.value.data.length > 0) {
        hasLiveData = true;
        const attRecords = attendanceRes.value.data as AttendanceRow[];
        const latestDate = attRecords[0].date;
        const todayRecords = attRecords.filter(r => r.date === latestDate);
        const presentCount = todayRecords.filter(r => r.status === 'present').length;
        const lateCount = todayRecords.filter(r => r.status === 'late').length;
        const absentCount = todayRecords.filter(r => r.status === 'absent').length;
        const excusedCount = todayRecords.filter(r => r.status === 'excused').length;
        const recordedToday = todayRecords.length;
        const todayRate = recordedToday > 0 ? Math.round(((presentCount + lateCount) / recordedToday) * 1000) / 10 : 0;

        // تجميع آخر 5 أيام متوفرة
        const datesMap = new Map<string, { present: number; absent: number; total: number }>();
        attRecords.forEach(r => {
          const cur = datesMap.get(r.date) || { present: 0, absent: 0, total: 0 };
          if (r.status === 'present' || r.status === 'late') cur.present++;
          if (r.status === 'absent') cur.absent++;
          cur.total++;
          datesMap.set(r.date, cur);
        });

        const weeklyTrend = Array.from(datesMap.entries())
          .slice(0, 5)
          .map(([date, stats]) => ({
            day: new Date(date).toLocaleDateString('ar-DZ', { weekday: 'short' }),
            date,
            rate: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
            present: stats.present,
            absent: stats.absent,
          }))
          .reverse();

        attendanceMetrics = {
          todayRate,
          recordedToday,
          presentCount,
          absentCount,
          lateCount,
          excusedCount,
          weeklyTrend: weeklyTrend.length > 0 ? weeklyTrend : FALLBACK_DASHBOARD_DATA.attendance.weeklyTrend,
        };
      }

      // 5. المحرك المالي
      let financialMetrics = { ...FALLBACK_DASHBOARD_DATA.financials };
      if (feesRes.status === 'fulfilled' && !feesRes.value.error && feesRes.value.data && feesRes.value.data.length > 0) {
        hasLiveData = true;
        const fees = feesRes.value.data as FeeRow[];
        const totalBilledDzd = fees.reduce((sum, f) => sum + Number(f.final_amount || 0), 0);
        const totalCollectedDzd = fees.reduce((sum, f) => sum + Number(f.paid_amount || 0), 0);
        const totalRemainingDzd = fees.reduce((sum, f) => sum + Number(f.remaining_amount || 0), 0);
        const collectionRate = totalBilledDzd > 0 ? Math.round((totalCollectedDzd / totalBilledDzd) * 1000) / 10 : 0;

        const paidCount = fees.filter(f => f.status === 'paid').length;
        const partiallyPaidCount = fees.filter(f => f.status === 'partially_paid').length;
        const pendingCount = fees.filter(f => f.status === 'pending').length;
        const overdueCount = fees.filter(f => f.status === 'overdue').length;

        const statusBreakdown = [
          {
            status: 'مدفوع بالكامل',
            count: paidCount,
            amount: fees.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.paid_amount || 0), 0),
            color: '#059669',
          },
          {
            status: 'مدفوع جزئياً',
            count: partiallyPaidCount,
            amount: fees.filter(f => f.status === 'partially_paid').reduce((s, f) => s + Number(f.paid_amount || 0), 0),
            color: '#0284c7',
          },
          {
            status: 'مستحق السداد',
            count: pendingCount,
            amount: fees.filter(f => f.status === 'pending').reduce((s, f) => s + Number(f.remaining_amount || 0), 0),
            color: '#d97706',
          },
          {
            status: 'متأخر',
            count: overdueCount,
            amount: fees.filter(f => f.status === 'overdue').reduce((s, f) => s + Number(f.remaining_amount || 0), 0),
            color: '#e11d48',
          },
        ];

        financialMetrics = {
          totalBilledDzd,
          totalCollectedDzd,
          totalRemainingDzd,
          collectionRate,
          paidCount,
          partiallyPaidCount,
          pendingCount,
          overdueCount,
          statusBreakdown,
        };
      }

      // 6. طلبات الالتحاق
      let applicationsMetrics = { ...FALLBACK_DASHBOARD_DATA.applications };
      if (applicationsRes.status === 'fulfilled' && !applicationsRes.value.error && applicationsRes.value.data) {
        hasLiveData = true;
        const apps = applicationsRes.value.data as ApplicationRow[];
        const pending = apps.filter(a => a.status === 'PENDING');
        const approved = apps.filter(a => a.status === 'APPROVED');
        const rejected = apps.filter(a => a.status === 'REJECTED');

        const recentPending: DashboardApplicationItem[] = pending.slice(0, 5).map(a => ({
          id: a.id,
          studentName: a.student_name,
          studentAge: a.student_age,
          guardianName: a.guardian_name,
          guardianPhone: a.guardian_phone,
          desiredTrack: a.desired_track,
          previousMemorization: a.previous_memorization,
          createdAt: new Date(a.created_at).toLocaleDateString('ar-DZ'),
          status: a.status,
        }));

        applicationsMetrics = {
          pendingCount: pending.length,
          approvedCount: approved.length,
          rejectedCount: rejected.length,
          totalCount: apps.length,
          recentPending: recentPending.length > 0 ? recentPending : FALLBACK_DASHBOARD_DATA.applications.recentPending,
        };
      }

      // 7. سجلات التسميع والإنجاز القرآني
      let memorizationMetrics = { ...FALLBACK_DASHBOARD_DATA.memorization };
      if (memorizationRes.status === 'fulfilled' && !memorizationRes.value.error && memorizationRes.value.data && memorizationRes.value.data.length > 0) {
        hasLiveData = true;
        const recs = memorizationRes.value.data as MemorizationRow[];
        const excellentCount = recs.filter(r => r.grade === 'ممتاز').length;
        const excellentGradeRate = recs.length > 0 ? Math.round((excellentCount / recs.length) * 100) : 85;

        const gradeCounts: Record<string, number> = {
          'ممتاز': 0,
          'جيد جداً': 0,
          'جيد': 0,
          'يحتاج مراجعة': 0,
        };
        recs.forEach(r => {
          if (r.grade && gradeCounts[r.grade] !== undefined) {
            gradeCounts[r.grade]++;
          }
        });

        const gradeColors: Record<string, string> = {
          'ممتاز': '#059669',
          'جيد جداً': '#0284c7',
          'جيد': '#d97706',
          'يحتاج مراجعة': '#e11d48',
        };

        const gradeDistribution = Object.entries(gradeCounts).map(([grade, count]) => ({
          grade,
          count,
          fill: gradeColors[grade] || '#64748b',
        }));

        const recentLogs: DashboardMemorizationItem[] = recs.slice(0, 6).map(r => ({
          id: r.id,
          surahName: r.surah_name,
          surahNumber: r.surah_number,
          juz: r.juz,
          ayahFrom: r.ayah_from,
          ayahTo: r.ayah_to,
          recordType: r.record_type === 'new_memorization' ? 'حفظ جديد' : r.record_type === 'minor_review' ? 'مراجعة صغرى' : 'مراجعة كبرى',
          grade: r.grade,
          date: new Date(r.date).toLocaleDateString('ar-DZ'),
        }));

        memorizationMetrics = {
          totalSessionsThisMonth: recs.length,
          excellentGradeRate,
          recentLogs,
          monthlyHifzProgress: FALLBACK_DASHBOARD_DATA.memorization.monthlyHifzProgress,
          gradeDistribution,
        };
      }

      setIsLiveSupabase(hasLiveData);
      setData({
        academicYear: academicYearName,
        students: studentMetrics,
        circlesAndHalls: circlesAndHallsMetrics,
        attendance: attendanceMetrics,
        financials: financialMetrics,
        applications: applicationsMetrics,
        memorization: memorizationMetrics,
      });
      setLastUpdated(new Date().toLocaleTimeString('ar-DZ'));
    } catch (err: unknown) {
      console.error('خطأ أثناء جلب مؤشرات لوحة الإدارة من Supabase:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير معروف في الاتصال');
      setIsLiveSupabase(false);
      setData(FALLBACK_DASHBOARD_DATA);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    isLoading,
    isLiveSupabase,
    lastUpdated,
    error,
    refetch: fetchDashboardData,
  };
};

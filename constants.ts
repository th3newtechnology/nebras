import { Student, Teacher, Classroom, Announcement, PaymentStatus } from './types';

export const SCHOOL_INFO = {
  name: 'مدرسة نبراس القرآن',
  affiliation: 'مسجد إبراهيم الخليل',
  fullName: 'مدرسة نبراس القرآن بمسجد إبراهيم الخليل',
  vision: 'ريادة في تعليم القرآن الكريم وتخريج جيل متخلق بأخلاق القرآن',
  message: 'تقديم تعليم قرآني متميز يجمع بين الإتقان في الحفظ والتجويد والتربية الإيمانية',
  email: 'contact@nebras-quran.edu',
  phone: '0500000000',
  address: 'مسجد إبراهيم الخليل'
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    birthDate: '2012-05-15',
    address: 'حي اليرموك',
    guardianName: 'محمد علي',
    guardianPhone: '0501234567',
    teacherId: 't1',
    hifzLevel: 15,
    behaviorScore: 95,
    attendanceRate: 98,
    paymentStatus: PaymentStatus.PAID,
    lastRevision: 'سورة البقرة',
    progressHistory: []
  },
  {
    id: '2',
    name: 'سارة عبد الله',
    birthDate: '2013-10-20',
    address: 'حي النرجس',
    guardianName: 'عبد الله بن خالد',
    guardianPhone: '0559876543',
    teacherId: 't2',
    hifzLevel: 8,
    behaviorScore: 88,
    attendanceRate: 92,
    paymentStatus: PaymentStatus.PENDING,
    lastRevision: 'سورة آل عمران',
    progressHistory: []
  },
  {
    id: '3',
    name: 'يوسف عمر الفاروق',
    birthDate: '2014-01-10',
    address: 'حي الملقا',
    guardianName: 'عمر الفاروق',
    guardianPhone: '0562233445',
    teacherId: 't1',
    hifzLevel: 22,
    behaviorScore: 100,
    attendanceRate: 100,
    paymentStatus: PaymentStatus.PAID,
    lastRevision: 'سورة النساء',
    progressHistory: []
  }
];

export const MOCK_TEACHERS: Teacher[] = [
  {
    id: 't1',
    name: 'الشيخ عبد الرحمن السديس',
    qualification: 'ماجستير في القراءات العشر',
    experience: '15 سنة',
    specialization: 'تحفيظ وتجويد',
    joinDate: '2010-09-01',
    assignedHalls: ['قاعة الصديق', 'قاعة الفاروق']
  },
  {
    id: 't2',
    name: 'الأستاذة مريم إبراهيم',
    qualification: 'إجازة في حفظ القرآن الكريم',
    experience: '8 سنوات',
    specialization: 'تحفيظ براعم',
    joinDate: '2015-02-15',
    assignedHalls: ['قاعة عائشة']
  }
];

export const MOCK_HALLS: Classroom[] = [
  { id: 'h1', name: 'قاعة الصديق', teacherId: 't1', studentCount: 12, capacity: 15 },
  { id: 'h2', name: 'قاعة الفاروق', teacherId: 't1', studentCount: 10, capacity: 12 },
  { id: 'h3', name: 'قاعة عائشة', teacherId: 't2', studentCount: 8, capacity: 10 }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'بدء التسجيل للفصل الصيفي', date: '2026-05-01', content: 'نعلن عن فتح باب التسجيل للدورات الصيفية المكثفة بمدرسة نبراس القرآن.', type: 'info' },
  { id: 'a2', title: 'اجتماع أولياء الأمور', date: '2026-05-10', content: 'ندعوكم لحضور اللقاء الدوري في رحاب مسجد إبراهيم الخليل لمناقشة سير العملية التعليمية.', type: 'warning' }
];

export const COLORS = {
  primary: '#065f46',      // Islamic Emerald 800
  primaryDark: '#064e3b',  // Islamic Emerald 900
  primaryLight: '#059669', // Islamic Emerald 600
  accent: '#d97706',       // Warm Gold 500
  accentLight: '#fbbf24',  // Warm Gold 400
  background: '#fdfbf7',   // Ivory 50
  card: '#ffffff',
  text: '#1e293b',
  muted: '#64748b'
};


import { Student, Teacher, Classroom, Announcement, PaymentStatus } from './types';

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    name: 'أحمد محمد علي',
    birthDate: '2012-05-15',
    address: 'حي اليرموك، الرياض',
    guardianName: 'محمد علي',
    guardianPhone: '0501234567',
    teacherId: 't1',
    hifzLevel: 15,
    behaviorScore: 95,
    attendanceRate: 98,
    paymentStatus: PaymentStatus.PAID,
    lastRevision: 'سورة البقرة',
    // Added missing progressHistory
    progressHistory: []
  },
  {
    id: '2',
    name: 'سارة عبد الله',
    birthDate: '2013-10-20',
    address: 'حي النرجس، الرياض',
    guardianName: 'عبد الله بن خالد',
    guardianPhone: '0559876543',
    teacherId: 't2',
    hifzLevel: 8,
    behaviorScore: 88,
    attendanceRate: 92,
    paymentStatus: PaymentStatus.PENDING,
    lastRevision: 'سورة آل عمران',
    // Added missing progressHistory
    progressHistory: []
  },
  {
    id: '3',
    name: 'يوسف عمر الفاروق',
    birthDate: '2014-01-10',
    address: 'حي الملقا، الرياض',
    guardianName: 'عمر الفاروق',
    guardianPhone: '0562233445',
    teacherId: 't1',
    hifzLevel: 22,
    behaviorScore: 100,
    attendanceRate: 100,
    paymentStatus: PaymentStatus.PAID,
    lastRevision: 'سورة النساء',
    // Added missing progressHistory
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
  { id: 'a1', title: 'بدء التسجيل للفصل الصيفي', date: '2024-05-01', content: 'نعلن عن فتح باب التسجيل للدورات الصيفية المكثفة.', type: 'info' },
  { id: 'a2', title: 'اجتماع أولياء الأمور', date: '2024-05-10', content: 'ندعوكم لحضور الاجتماع الدوري لمناقشة سير العملية التعليمية.', type: 'warning' }
];

export const COLORS = {
  primary: '#0891b2', // Cyan-600
  secondary: '#0d9488', // Teal-600
  accent: '#f59e0b', // Amber-500
  background: '#f8fafc',
  text: '#1e293b'
};

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  RefreshCw,
  Printer,
  Edit2,
  ArrowRightLeft,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Phone,
  DoorOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Database,
  Archive,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudents } from '../hooks/useStudents';
import { StudentListItem, StudentFullProfile } from '../types/student.types';
import { UserRole, Student, Teacher, Classroom, PaymentStatus, ProgressEntry } from '../types';
import { StudentProfileModal } from '../components/students/StudentProfileModal';
import { StudentFormModal } from '../components/students/StudentFormModal';
import { StudentTransferModal } from '../components/students/StudentTransferModal';
import { useNotifications } from '../context/NotificationContext';
import { updateLocalData } from '../hooks/useLocalDB';

// =============================================================================
// مكوّن عرض المتابعة المحفوظ لدعم لوحة التحكم لغير الإداريين دون كسر التوافق
// =============================================================================
export const StudentDetailsContent: React.FC<{
  student: Student;
  teachers?: Teacher[];
  halls?: Classroom[];
  onRefresh?: () => void;
  onNavigateToFees?: (name: string) => void;
  readOnly?: boolean;
}> = ({ student, readOnly = false }) => {
  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="p-6 bg-gradient-to-r from-islamic-900 to-islamic-800 text-white rounded-3xl flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black font-amiri text-ivory-50">{student.name}</h3>
          <p className="text-xs text-gold-300 font-bold mt-1">
            المستوى القرآني: جزء {student.hifzLevel} • الانضباط: {student.attendanceRate}%
          </p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/10 text-gold-300 flex items-center justify-center text-3xl font-black font-amiri">
          {student.name[0]}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">الانضباط</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{student.attendanceRate}%</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">الدرجة السلوكية</span>
          <p className="text-xl font-black text-gold-600 mt-1">{student.behaviorScore}/100</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">ولي الأمر</span>
          <p className="text-xs font-bold text-slate-800 mt-2 truncate">{student.guardianName}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">الهاتف</span>
          <p className="text-xs font-mono font-bold text-slate-800 mt-2" dir="ltr">{student.guardianPhone}</p>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// شاشة إدارة شؤون الطلاب المركزية (المرحلة 7.2)
// =============================================================================
export const Students: React.FC<{ onNavigateToFees?: (name: string) => void }> = ({
  onNavigateToFees,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;

  const {
    students,
    loading,
    totalCount,
    page,
    pageSize,
    totalPages,
    isLive,
    error,
    filters,
    circlesList,
    academicYearsList,
    setPage,
    setFilter,
    resetFilters,
    refresh,
    exportCSV,
  } = useStudents();

  const { addNotification } = useNotifications();

  // المودالات
  const [profileModalStudentId, setProfileModalStudentId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null);
  const [studentToTransfer, setStudentToTransfer] = useState<StudentListItem | StudentFullProfile | null>(null);

  // إحصائيات سريعة للرأس
  const activeCount = useMemo(() => students.filter(s => s.status === 'active').length, [students]);
  const suspendedCount = useMemo(() => students.filter(s => s.status === 'suspended').length, [students]);

  const handleOpenEdit = (student: StudentListItem) => {
    setStudentToEdit(student);
    setIsFormModalOpen(true);
  };

  const handleOpenNew = () => {
    setStudentToEdit(null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans" dir="rtl">
      {/* Top Header */}
      <section className="bg-gradient-to-l from-islamic-950 via-islamic-900 to-islamic-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-gold-500/25">
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>إدارة شؤون الطلاب وقيد الحلقات</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isLive ? 'اتصال مباشر مع Supabase' : 'وضع المحاكاة التأسيسي'}</span>
              </span>

              <span className="text-xs text-ivory-300/80 font-bold">
                إجمالي الطلاب: {totalCount} طالب
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-ivory-50 tracking-tight font-amiri">
              سجل الطلاب والملفات الدراسية الرسمية
            </h2>
            <p className="text-xs md:text-sm text-ivory-200/90 max-w-2xl leading-relaxed">
              منظومة متكاملة لمتابعة مسارات الحفظ، توزيع الحلقات، أولياء الأمور، وإصدار بطاقات الطلاب الرسمية لمسجد إبراهيم الخليل.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gold-300 rounded-xl text-xs font-bold transition-all border border-gold-400/30 shadow-xs"
              title="تصدير جدول الطلاب إلى Excel / CSV باللغة العربية"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-gold-400" />
              <span>تصدير Excel/CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleOpenNew}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md shadow-gold-900/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>تسجيل طالب جديد</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Search Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={e => setFilter('search', e.target.value)}
              placeholder="ابحث بالاسم، رقم القيد (NEB-...)، اسم ولي الأمر، أو الهاتف..."
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-islamic-500 focus:border-islamic-500 transition-all"
            />
          </div>

          {/* Quick Clear Button */}
          {(filters.search ||
            filters.circleId !== 'all' ||
            filters.gender !== 'all' ||
            filters.level !== 'all' ||
            filters.status !== 'all') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط التصفية</span>
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Filter: Circle */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">الحلقة القرآنية</label>
            <select
              value={filters.circleId || 'all'}
              onChange={e => setFilter('circleId', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع الحلقات</option>
              {circlesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter: Gender */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">الجنس</label>
            <select
              value={filters.gender || 'all'}
              onChange={e => setFilter('gender', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">الكل (ذكور وإناث)</option>
              <option value="male">ذكور فقط</option>
              <option value="female">إناث فقط</option>
            </select>
          </div>

          {/* Filter: Hifz Level */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">المستوى القرآني</label>
            <select
              value={filters.level || 'all'}
              onChange={e => setFilter('level', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع المستويات</option>
              <option value="مبتدئ">مبتدئ</option>
              <option value="متوسط">متوسط</option>
              <option value="متقدم">متقدم</option>
              <option value="إتمام الحفظ">إتمام الحفظ</option>
              <option value="مراجعة">مراجعة</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">حالة القيد</label>
            <select
              value={filters.status || 'all'}
              onChange={e => setFilter('status', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">قيد نشط</option>
              <option value="suspended">موقوف مؤقتاً</option>
              <option value="graduated">متخرج</option>
              <option value="withdrawn">منسحب</option>
            </select>
          </div>

          {/* Filter: Sort */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 block uppercase">الترتيب حسب</label>
            <select
              value={filters.sortBy || 'fullName'}
              onChange={e => setFilter('sortBy', e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="fullName">الاسم أبجدياً</option>
              <option value="registrationNumber">رقم القيد</option>
              <option value="enrollmentDate">تاريخ التسجيل</option>
              <option value="hifzLevel">مقدار الحفظ</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main 12-Column Students Table */}
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            {/* Table Header */}
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">رقم القيد</th>
                <th className="p-4">اسم الطالب الكامل</th>
                <th className="p-4">الجنس</th>
                <th className="p-4">تاريخ الميلاد</th>
                <th className="p-4">ولي الأمر</th>
                <th className="p-4">الهاتف</th>
                <th className="p-4">الحلقة المسندة</th>
                <th className="p-4">المستوى القرآني</th>
                <th className="p-4">حالة القيد</th>
                <th className="p-4">تاريخ الالتحاق</th>
                <th className="p-4">العام الدراسي</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
                    <p className="text-xs font-bold text-slate-500 mt-2">جاري تحميل سجلات الطلاب...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-24 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-bold text-slate-700 text-sm">لا توجد سجلات مطابقة للشروط المحددة</p>
                    <p className="text-xs mt-1">جرّب تغيير عبارة البحث أو إعادة ضبط خيارات التصفية</p>
                  </td>
                </tr>
              ) : (
                students.map(student => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setProfileModalStudentId(student.id)}
                  >
                    {/* 1. Registration Number */}
                    <td className="p-4 font-mono font-bold text-islamic-950 whitespace-nowrap">
                      {student.registrationNumber}
                    </td>

                    {/* 2. Full Name */}
                    <td className="p-4 font-black text-slate-900 font-amiri text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-islamic-100 text-islamic-900 font-bold flex items-center justify-center shrink-0">
                          {student.fullName[0]}
                        </div>
                        <span>{student.fullName}</span>
                      </div>
                    </td>

                    {/* 3. Gender */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          student.gender === 'male'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {student.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </span>
                    </td>

                    {/* 4. Birth Date */}
                    <td className="p-4 font-mono text-slate-600 whitespace-nowrap">{student.birthDate}</td>

                    {/* 5. Guardian Name */}
                    <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                      <div>
                        <p>{student.guardianName}</p>
                        <span className="text-[10px] text-slate-400">{student.guardianRelationship}</span>
                      </div>
                    </td>

                    {/* 6. Guardian Phone */}
                    <td className="p-4 font-mono text-slate-700 whitespace-nowrap" dir="ltr">
                      {student.guardianPhone}
                    </td>

                    {/* 7. Circle Name */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                        <span className="font-bold text-slate-900">{student.currentCircleName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{student.teacherName}</span>
                    </td>

                    {/* 8. Hifz Level */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gold-50 text-gold-800 border border-gold-200">
                        {student.hifzLevel} ({student.currentJuz} جـ)
                      </span>
                    </td>

                    {/* 9. Status */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          student.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : student.status === 'suspended'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : student.status === 'graduated'
                            ? 'bg-islamic-50 text-islamic-800 border border-islamic-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {student.status === 'active'
                          ? 'نشط'
                          : student.status === 'suspended'
                          ? 'موقوف'
                          : student.status === 'graduated'
                          ? 'متخرج'
                          : 'منسحب'}
                      </span>
                    </td>

                    {/* 10. Enrollment Date */}
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">{student.enrollmentDate}</td>

                    {/* 11. Academic Year */}
                    <td className="p-4 text-slate-500 text-[11px] whitespace-nowrap">{student.academicYear}</td>

                    {/* 12. Actions */}
                    <td
                      className="p-4 text-center whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setProfileModalStudentId(student.id)}
                          className="p-1.5 text-slate-500 hover:text-islamic-800 hover:bg-islamic-50 rounded-lg transition-colors"
                          title="عرض الملف الشامل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setStudentToTransfer(student)}
                              className="p-1.5 text-slate-500 hover:text-gold-700 hover:bg-gold-50 rounded-lg transition-colors"
                              title="نقل الطالب بين الحلقات"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <div>
            <span>
              عرض {students.length} من أصل {totalCount} طالب مسجل
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1 || loading}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              aria-label="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-mono">
              الصفحة {page} من {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              aria-label="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MODAL 1: Full Student Profile (7 Tabs) */}
      <StudentProfileModal
        studentId={profileModalStudentId}
        onClose={() => setProfileModalStudentId(null)}
        onOpenTransferModal={student => {
          setProfileModalStudentId(null);
          setStudentToTransfer(student);
        }}
        onStatusChanged={() => {
          refresh();
          addNotification('تم التحديث', 'تم تغيير حالة الطالب بنجاح.', 'success');
        }}
      />

      {/* MODAL 2: Add / Edit Student */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        onSuccess={() => {
          refresh();
          addNotification(
            studentToEdit ? 'تم التعديل' : 'تم التسجيل',
            studentToEdit
              ? 'تم تحديث بيانات الطالب بنجاح.'
              : 'تم تسجيل الطالب وربطه بولي الأمر والحلقة بنجاح.',
            'success'
          );
        }}
      />

      {/* MODAL 3: Circle Transfer */}
      <StudentTransferModal
        student={studentToTransfer}
        onClose={() => setStudentToTransfer(null)}
        onSuccess={() => {
          refresh();
          addNotification('تم النقل', 'تم نقل الطالب إلى الحلقة الجديدة بنجاح.', 'success');
        }}
      />
    </div>
  );
};

export default Students;

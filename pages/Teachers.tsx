import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  GraduationCap,
  Calendar,
  Briefcase,
  Loader2,
  DoorOpen,
  CheckCircle2,
  Users,
  Layers,
  Phone,
  Mail,
  RotateCcw,
  RefreshCw,
  Eye,
  Edit2,
  Award,
  Sparkles,
} from 'lucide-react';
import { TeacherItem, TeacherStatus } from '../types/circle.types';
import { fetchTeachers, changeTeacherStatus } from '../lib/teachersService';
import { TeacherFormModal } from '../components/teachers/TeacherFormModal';
import { TeacherDetailsModal } from '../components/teachers/TeacherDetailsModal';
import { useNotifications } from '../context/NotificationContext';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TeacherStatus>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<TeacherItem | null>(null);
  const [selectedTeacherForDetails, setSelectedTeacherForDetails] = useState<TeacherItem | null>(null);

  const { addNotification } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTeachers();
      setTeachers(res.teachers);
      setIsLive(res.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch =
        !searchTerm ||
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone.includes(searchTerm) ||
        (t.specialization && t.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.qualification && t.qualification.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = teachers.length;
    const active = teachers.filter(t => t.status === 'active').length;
    const totalCircles = teachers.reduce((acc, t) => acc + t.assignedCirclesCount, 0);
    const totalStudents = teachers.reduce((acc, t) => acc + t.totalStudentsCount, 0);
    return { total, active, totalCircles, totalStudents };
  }, [teachers]);

  const handleOpenAdd = () => {
    setTeacherToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (t: TeacherItem) => {
    setTeacherToEdit(t);
    setIsFormModalOpen(true);
  };

  const handleStatusToggle = async (t: TeacherItem) => {
    const nextStatus: TeacherStatus = t.status === 'active' ? 'on_leave' : 'active';
    const res = await changeTeacherStatus(t.id, nextStatus);
    if (res.success) {
      addNotification(
        'تم تغيير الحالة',
        `تم تحديث حالة المعلم "${t.fullName}" إلى ${nextStatus === 'active' ? 'نشط' : 'في إجازة'}.`,
        'success'
      );
      loadData();
    } else {
      addNotification('خطأ', res.error || 'فشل تحديث الحالة', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Page Header */}
      <section className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>هيئة التحفيظ والتدريس</span>
              </span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {isLive ? '● متصل بقاعدة البيانات' : '○ وضع العرض المحلي'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black font-amiri text-gold-300">
              إدارة المعلمين والمحفظين
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              متابعة شيوخ ومحفظي مدرسة نبراس القرآنية بمسجد إبراهيم الخليل، توزيع الحلقات القرآنية، والمؤهلات الأكاديمية والروايات المجاز بها.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>تسجيل معلم جديد</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي المعلمين</span>
            <p className="text-2xl font-black text-slate-900 font-mono">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-islamic-50 border border-islamic-100 flex items-center justify-center text-islamic-800">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">المحفظون النشطون</span>
            <p className="text-2xl font-black text-emerald-800 font-mono">{stats.active}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">الحلقات المدارة</span>
            <p className="text-2xl font-black text-gold-700 font-mono">{stats.totalCircles}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-100 flex items-center justify-center text-gold-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي الطلاب المتابعين</span>
            <p className="text-2xl font-black text-sky-800 font-mono">{stats.totalStudents}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم، رقم الهاتف، المؤهل، أو التخصص القرآني..."
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع الحالات</option>
              <option value="active">نشط بالتدريس</option>
              <option value="on_leave">في إجازة</option>
              <option value="inactive">غير نشط</option>
            </select>

            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="flex items-center gap-1.5 px-3 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Teachers Cards / Table Grid */}
      <section className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
            <p className="text-xs font-bold text-slate-500">جاري استرجاع بيانات هيئة التحفيظ...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-2 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-slate-700 text-sm">لا يوجد معلّمون مطابقون لمعايير البحث</p>
            <p className="text-xs">جرّب كتابة اسم مختلف أو تغيير خيارات التصفية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachers.map(teacher => (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-islamic-700/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-islamic-50 border border-islamic-200 flex items-center justify-center text-islamic-900 font-amiri font-black text-xl group-hover:bg-islamic-900 group-hover:text-gold-300 transition-colors">
                        {teacher.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 font-amiri text-base group-hover:text-islamic-900 transition-colors">
                          {teacher.fullName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                          <Award className="w-3 h-3 text-gold-600" />
                          <span>{teacher.specialization || 'تحفيظ القرآن'}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        teacher.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : teacher.status === 'on_leave'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {teacher.status === 'active' ? 'نشط' : teacher.status === 'on_leave' ? 'إجازة' : 'معطل'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${teacher.phone}`} dir="ltr" className="font-mono font-bold hover:text-islamic-800">
                        {teacher.phone}
                      </a>
                    </div>
                    {teacher.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-[11px] truncate">{teacher.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px] truncate">{teacher.qualification || 'إجازة في القرآن'}</span>
                    </div>
                  </div>

                  {/* Assigned Circles Badges */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>الحلقات القرآنية ({teacher.assignedCirclesCount})</span>
                      <span className="text-emerald-700 font-mono font-bold">{teacher.totalStudentsCount} طالب</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.assignedCircles.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">لا توجد حلقات مسندة</span>
                      ) : (
                        teacher.assignedCircles.map(c => (
                          <span
                            key={c.id}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200/80"
                          >
                            {c.name}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <button
                    onClick={() => setSelectedTeacherForDetails(teacher)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-islamic-900 hover:bg-white rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-islamic-800" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(teacher)}
                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-white rounded-lg transition-colors"
                      title="تعديل بيانات المعلم"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleStatusToggle(teacher)}
                      className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                      title="تبديل الحالة بين نشط وإجازة"
                    >
                      {teacher.status === 'active' ? 'تعطيل مؤقت' : 'تفعيل'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <TeacherFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={loadData}
        teacherToEdit={teacherToEdit}
      />

      <TeacherDetailsModal
        isOpen={!!selectedTeacherForDetails}
        onClose={() => setSelectedTeacherForDetails(null)}
        teacher={selectedTeacherForDetails}
        onEdit={handleOpenEdit}
      />
    </div>
  );
};

export default Teachers;

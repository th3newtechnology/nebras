import React, { useState, useEffect, useMemo } from 'react';
import {
  DoorOpen,
  Users,
  Plus,
  Loader2,
  Trash2,
  Layers,
  BookOpen,
  User,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  CircleItem,
  HallItem,
  TeacherItem,
  CircleLevel,
  TargetGender,
  CircleStatus,
  HallStatus,
} from '../types/circle.types';
import {
  fetchCircles,
  fetchHalls,
} from '../lib/circlesService';
import { fetchTeachers } from '../lib/teachersService';
import { CircleFormModal } from '../components/circles/CircleFormModal';
import { HallFormModal } from '../components/circles/HallFormModal';
import { CircleStudentsModal } from '../components/circles/CircleStudentsModal';
import { useNotifications } from '../context/NotificationContext';

const Halls: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'circles' | 'halls'>('circles');

  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [halls, setHalls] = useState<HallItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | CircleLevel>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | TargetGender>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CircleStatus>('all');

  // Modals state
  const [isCircleModalOpen, setIsCircleModalOpen] = useState(false);
  const [circleToEdit, setCircleToEdit] = useState<CircleItem | null>(null);

  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [hallToEdit, setHallToEdit] = useState<HallItem | null>(null);

  const [selectedCircleForStudents, setSelectedCircleForStudents] = useState<CircleItem | null>(null);

  const { addNotification } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [circlesRes, hallsRes, teachersRes] = await Promise.all([
        fetchCircles(),
        fetchHalls(),
        fetchTeachers(),
      ]);
      setCircles(circlesRes.circles);
      setHalls(hallsRes.halls);
      setTeachers(teachersRes.teachers);
      setIsLive(circlesRes.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Circles
  const filteredCircles = useMemo(() => {
    return circles.filter(c => {
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.hallName && c.hallName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
      const matchesGender = genderFilter === 'all' || c.targetGender === genderFilter;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesLevel && matchesGender && matchesStatus;
    });
  }, [circles, searchTerm, levelFilter, genderFilter, statusFilter]);

  // Filtered Halls
  const filteredHalls = useMemo(() => {
    return halls.filter(h => {
      return (
        !searchTerm ||
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.location && h.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [halls, searchTerm]);

  // Global Academic Year ID
  const currentAcademicYearId = circles[0]?.academicYearId || 'a0000000-0000-0000-0000-000000000001';

  // Overall Stats
  const stats = useMemo(() => {
    const totalCircles = circles.length;
    const activeCircles = circles.filter(c => c.status === 'active').length;
    const totalHalls = halls.length;
    const totalCapacity = circles.reduce((acc, c) => acc + c.capacity, 0);
    const totalEnrolled = circles.reduce((acc, c) => acc + c.enrolledStudentsCount, 0);
    const averageOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    return { totalCircles, activeCircles, totalHalls, totalCapacity, totalEnrolled, averageOccupancy };
  }, [circles, halls]);

  // Handlers
  const handleOpenNewCircle = () => {
    setCircleToEdit(null);
    setIsCircleModalOpen(true);
  };

  const handleOpenEditCircle = (c: CircleItem) => {
    setCircleToEdit(c);
    setIsCircleModalOpen(true);
  };

  const handleOpenNewHall = () => {
    setHallToEdit(null);
    setIsHallModalOpen(true);
  };

  const handleOpenEditHall = (h: HallItem) => {
    setHallToEdit(h);
    setIsHallModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنظومة التعليمية ومرافق المسجد</span>
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
              الحلقات القرآنية والأفواج والقاعات
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              إدارة مستويات التحفيظ الخمسة، توزيع الطلاب على الحلقات، متابعة السعة الاستيعابية ونسب الإشغال لقاعات مسجد إبراهيم الخليل.
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

            {activeTab === 'circles' ? (
              <button
                onClick={handleOpenNewCircle}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء حلقة جديدة</span>
              </button>
            ) : (
              <button
                onClick={handleOpenNewHall}
                className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قاعة جديدة</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">إجمالي الحلقات</span>
            <p className="text-2xl font-black text-slate-900 font-mono">{stats.totalCircles}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-islamic-50 border border-islamic-100 flex items-center justify-center text-islamic-800">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">القاعات الدراسية</span>
            <p className="text-2xl font-black text-gold-700 font-mono">{stats.totalHalls}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-100 flex items-center justify-center text-gold-600">
            <DoorOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">الطلاب المقيدون</span>
            <p className="text-2xl font-black text-emerald-800 font-mono">{stats.totalEnrolled}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1">متوسط نسبة الإشغال</span>
            <p className="text-2xl font-black text-sky-800 font-mono">{stats.averageOccupancy}%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('circles')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'circles'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-gold-400" />
          <span>الحلقات القرآنية والأفواج ({circles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('halls')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'halls'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DoorOpen className="w-4 h-4 text-gold-400" />
          <span>قاعات ومرافق المسجد ({halls.length})</span>
        </button>
      </div>

      {/* Search & Filters */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'circles'
                  ? 'ابحث باسم الحلقة، المحفظ، أو القاعة المسندة...'
                  : 'ابحث باسم القاعة أو موقعها بالمسجد...'
              }
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          {activeTab === 'circles' && (
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={e => setLevelFilter(e.target.value as any)}
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع المستويات</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="متوسط">متوسط</option>
                <option value="متقدم">متقدم</option>
                <option value="إتمام الحفظ">إتمام الحفظ</option>
                <option value="مراجعة">مراجعة</option>
              </select>

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={e => setGenderFilter(e.target.value as any)}
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع الفئات</option>
                <option value="male">ذكور (طلاب)</option>
                <option value="female">إناث (طالبات)</option>
                <option value="mixed">براعم (مختلط)</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشطة ومستمرة</option>
                <option value="suspended">موقوفة</option>
                <option value="completed">مكتملة</option>
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Content: TAB 1 (Circles) */}
      {activeTab === 'circles' && (
        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري استرجاع بيانات الحلقات القرآنية...</p>
            </div>
          ) : filteredCircles.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-2 text-slate-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد حلقات مطابقة للخيارات المحددة</p>
              <p className="text-xs">جرّب تغيير عبارة البحث أو إعادة ضبط خيارات التصفية</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCircles.map(circle => {
                // Color according to occupancy rate
                const barColor =
                  circle.occupancyRate >= 95
                    ? 'bg-rose-600'
                    : circle.occupancyRate >= 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-600';

                return (
                  <div
                    key={circle.id}
                    className="bg-white rounded-3xl border border-slate-200/90 hover:border-islamic-700/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Circle Card Top */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-islamic-50 text-islamic-800 border border-islamic-200 font-bold mb-1.5 inline-block">
                            {circle.level}
                          </span>
                          <h3 className="font-black text-slate-900 font-amiri text-lg group-hover:text-islamic-900 transition-colors">
                            {circle.name}
                          </h3>
                        </div>

                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                            circle.targetGender === 'male'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : circle.targetGender === 'female'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {circle.targetGender === 'male'
                            ? 'ذكور'
                            : circle.targetGender === 'female'
                            ? 'إناث'
                            : 'براعم'}
                        </span>
                      </div>

                      {/* Teacher & Hall */}
                      <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500">المحفظ:</span>
                            <strong className="text-slate-800">{circle.teacherName}</strong>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DoorOpen className="w-3.5 h-3.5 text-gold-600" />
                            <span className="text-slate-500">القاعة:</span>
                            <span className="font-bold text-slate-800">
                              {circle.hallName || 'غير مسندة لقاعة'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Capacity & Progress Bar */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">السعة الاستيعابية:</span>
                          <span className="font-mono text-slate-800">
                            <strong>{circle.enrolledStudentsCount}</strong> / {circle.capacity} طالب (
                            {circle.occupancyRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${Math.min(100, circle.occupancyRate)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Schedules summary */}
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 block">أيام ومواعيد الحصص:</span>
                        {circle.schedules.length === 0 ? (
                          <span className="text-[10px] text-slate-400 italic">لم تجدول حصص بعد</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {circle.schedules.map(sch => (
                              <span
                                key={sch.id}
                                className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200/80 font-mono"
                              >
                                {sch.dayName} ({sch.startTime}-{sch.endTime})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <button
                        onClick={() => setSelectedCircleForStudents(circle)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-islamic-900 hover:bg-white rounded-xl transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-islamic-800" />
                        <span>قائمة الطلاب ({circle.enrolledStudentsCount})</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditCircle(circle)}
                        className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-white rounded-lg transition-colors"
                        title="تعديل بيانات الحلقة"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Content: TAB 2 (Halls) */}
      {activeTab === 'halls' && (
        <section className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري استرجاع بيانات قاعات المسجد...</p>
            </div>
          ) : filteredHalls.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center space-y-2 text-slate-400">
              <DoorOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد قاعات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHalls.map(hall => (
                <div
                  key={hall.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-gold-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 group-hover:bg-gold-500 group-hover:text-slate-950 transition-colors">
                        <DoorOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 font-amiri text-lg group-hover:text-islamic-900 transition-colors">
                          {hall.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hall.location || 'مسجد إبراهيم الخليل'}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        hall.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : hall.status === 'maintenance'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {hall.status === 'active' ? 'جاهزة ونشطة' : hall.status === 'maintenance' ? 'صيانة' : 'معطلة'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">السعة القصوى</span>
                      <p className="text-base font-black text-slate-800 font-mono">{hall.capacity} مقعد</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">الحلقات المقامة</span>
                      <p className="text-base font-black text-islamic-800 font-mono">
                        {hall.assignedCirclesCount} حلقات
                      </p>
                    </div>
                  </div>

                  {hall.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {hall.notes}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 text-[11px]">
                      إجمالي الطلاب المترددين: <strong>{hall.currentOccupancy}</strong> طالب
                    </span>
                    <button
                      onClick={() => handleOpenEditHall(hall)}
                      className="p-2 text-slate-500 hover:text-amber-700 hover:bg-slate-50 rounded-xl transition-colors"
                      title="تعديل بيانات القاعة"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      <CircleFormModal
        isOpen={isCircleModalOpen}
        onClose={() => setIsCircleModalOpen(false)}
        onSuccess={loadData}
        circleToEdit={circleToEdit}
        teachers={teachers}
        halls={halls}
        currentAcademicYearId={currentAcademicYearId}
      />

      <HallFormModal
        isOpen={isHallModalOpen}
        onClose={() => setIsHallModalOpen(false)}
        onSuccess={loadData}
        hallToEdit={hallToEdit}
      />

      <CircleStudentsModal
        isOpen={!!selectedCircleForStudents}
        onClose={() => setSelectedCircleForStudents(null)}
        circle={selectedCircleForStudents}
      />
    </div>
  );
};

export default Halls;

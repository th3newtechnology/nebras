import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Eye,
  FileCheck2,
  UserCheck,
  DoorOpen,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import {
  RegistrationApplicationItem,
  fetchApplications,
  convertApplicationToStudent,
  updateApplicationStatus,
} from '../lib/registrationService';
import { fetchFilterMetadata } from '../lib/studentsService';

const TRACK_LABELS: Record<string, { label: string; color: string }> = {
  BEGINNER: { label: 'براعم وتأسيس', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  MEMORIZATION: { label: 'حفظ وتثبيت القرآن', color: 'bg-gold-50 text-gold-800 border-gold-200' },
  TAJWEED: { label: 'تجويد وروايات', color: 'bg-sky-50 text-sky-800 border-sky-200' },
  IJAZAH: { label: 'إجازة بالسند المتصل', color: 'bg-purple-50 text-purple-800 border-purple-200' },
};

const Registration: React.FC = () => {
  const [applications, setApplications] = useState<RegistrationApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED'>('all');

  const { addNotification } = useNotifications();

  // مودال التحويل والاعتماد
  const [appToConvert, setAppToConvert] = useState<RegistrationApplicationItem | null>(null);
  const [convertGender, setConvertGender] = useState<'male' | 'female'>('male');
  const [convertBirthDate, setConvertBirthDate] = useState('2015-01-01');
  const [convertCircleId, setConvertCircleId] = useState('');
  const [convertNotes, setConvertNotes] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  // مودال التفاصيل
  const [selectedApp, setSelectedApp] = useState<RegistrationApplicationItem | null>(null);

  // الحلقات المتاحة
  const [circles, setCircles] = useState<{ id: string; name: string; gender: string }[]>([]);

  const loadData = async () => {
    setLoading(true);
    const [appsRes, metaRes] = await Promise.all([
      fetchApplications(),
      fetchFilterMetadata(),
    ]);
    setApplications(appsRes.applications);
    setIsLive(appsRes.isLive);
    setCircles(metaRes.circles);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        app.studentName.toLowerCase().includes(q) ||
        app.guardianPhone.includes(q) ||
        app.guardianName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'PENDING').length,
      approved: applications.filter(a => a.status === 'APPROVED').length,
      contacted: applications.filter(a => a.status === 'CONTACTED').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    };
  }, [applications]);

  const openConvertModal = (app: RegistrationApplicationItem) => {
    setAppToConvert(app);
    setConvertGender('male');
    if (app.studentAge) {
      const year = new Date().getFullYear() - app.studentAge;
      setConvertBirthDate(`${year}-01-01`);
    } else {
      setConvertBirthDate('2015-01-01');
    }
    setConvertCircleId('');
    setConvertNotes('');
    setConvertError(null);
  };

  const handleExecuteConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appToConvert) return;

    setIsConverting(true);
    setConvertError(null);

    const res = await convertApplicationToStudent({
      applicationId: appToConvert.id,
      circleId: convertCircleId || undefined,
      birthDate: convertBirthDate,
      gender: convertGender,
      notes: convertNotes.trim() || undefined,
    });

    if (res.success) {
      addNotification('تم الاعتماد بنجاح', `تم تحويل ${appToConvert.studentName} إلى طالب مقيد رسمياً.`, 'success');
      setAppToConvert(null);
      loadData();
    } else {
      setConvertError(res.error || 'فشلت عملية التحويل');
    }

    setIsConverting(false);
  };

  const handleQuickStatusChange = async (
    appId: string,
    newStatus: 'APPROVED' | 'REJECTED' | 'CONTACTED',
    notes?: string
  ) => {
    const res = await updateApplicationStatus(appId, newStatus, notes);
    if (res.success) {
      addNotification('تم التحديث', 'تم تغيير حالة الطلب بنجاح.', 'success');
      loadData();
    } else {
      addNotification('خطأ', res.error || 'فشل تحديث حالة الطلب.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans" dir="rtl">
      {/* Top Banner */}
      <section className="bg-gradient-to-l from-islamic-950 via-islamic-900 to-islamic-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-gold-500/25">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>طلبات الالتحاق والتسجيل الإلكتروني</span>
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{isLive ? 'قاعدة بيانات حيّة' : 'وضع المحاكاة'}</span>
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-ivory-50 tracking-tight font-amiri">
              إدارة طلبات الالتحاق الواردة من الموقع العام
            </h2>
            <p className="text-xs md:text-sm text-ivory-200/90 max-w-2xl leading-relaxed">
              مراجعة طلبات التسجيل، تقييم المستويات، والتحويل الفوري بنقرة واحدة إلى ملفات طلاب رسمية في مدرسة نبراس بمسجد إبراهيم الخليل.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 self-start lg:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </section>

      {/* Stats 4 Cards Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'all' ? 'border-islamic-800 shadow-sm' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase">إجمالي الطلبات</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
        </div>

        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'PENDING' ? 'border-gold-500 shadow-sm' : 'border-slate-200/80 hover:border-gold-300'
          }`}
        >
          <span className="text-[10px] font-bold text-gold-700 uppercase">قيد الدراسة والمراجعة</span>
          <p className="text-2xl font-black text-gold-600 mt-1">{stats.pending}</p>
        </div>

        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'APPROVED' ? 'border-emerald-600 shadow-sm' : 'border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-700 uppercase">تم قبولها كطلاب</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approved}</p>
        </div>

        <div
          onClick={() => setStatusFilter('CONTACTED')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'CONTACTED' ? 'border-sky-600 shadow-sm' : 'border-slate-200/80 hover:border-sky-300'
          }`}
        >
          <span className="text-[10px] font-bold text-sky-700 uppercase">تم التواصل مع الولي</span>
          <p className="text-2xl font-black text-sky-600 mt-1">{stats.contacted}</p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم المتقدم، اسم ولي الأمر، أو رقم الهاتف..."
            className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">تصفية:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">كافة الحالات</option>
            <option value="PENDING">قيد الدراسة (PENDING)</option>
            <option value="APPROVED">تم القبول (APPROVED)</option>
            <option value="CONTACTED">تم التواصل (CONTACTED)</option>
            <option value="REJECTED">مرفوض (REJECTED)</option>
          </select>
        </div>
      </section>

      {/* Applications List */}
      <section className="space-y-3">
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
            <p className="text-xs font-bold text-slate-500 mt-2">جاري قراءة طلبات الالتحاق...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">لا توجد طلبات تطابق معايير التصفية</p>
          </div>
        ) : (
          filteredApps.map(app => {
            const trackMeta = TRACK_LABELS[app.desiredTrack] || TRACK_LABELS.BEGINNER;

            return (
              <div
                key={app.id}
                className="bg-white p-5 rounded-3xl border border-slate-200/80 hover:border-islamic-300 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-900 font-bold flex items-center justify-center text-lg shrink-0 border border-gold-200">
                    {app.studentName[0]}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 font-amiri truncate">
                        {app.studentName}
                      </h3>
                      {app.studentAge && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {app.studentAge} سنوات
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${trackMeta.color}`}>
                        {trackMeta.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>الولي: <strong className="text-slate-800">{app.guardianName}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono" dir="ltr">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{app.guardianPhone}</span>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(app.createdAt).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>

                    {app.previousMemorization && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 line-clamp-1">
                        الحفظ السابق: {app.previousMemorization}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      app.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : app.status === 'PENDING'
                        ? 'bg-gold-50 text-gold-800 border border-gold-200'
                        : app.status === 'CONTACTED'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {app.status === 'APPROVED'
                      ? 'مقبول (طالب مقيد)'
                      : app.status === 'PENDING'
                      ? 'قيد الدراسة'
                      : app.status === 'CONTACTED'
                      ? 'تم التواصل'
                      : 'مرفوض'}
                  </span>

                  {/* Actions for PENDING */}
                  {app.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => openConvertModal(app)}
                        className="px-4 py-2 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <UserCheck className="w-4 h-4 text-gold-400" />
                        <span>قبول واعتماد كطالب</span>
                      </button>

                      <button
                        onClick={() => handleQuickStatusChange(app.id, 'CONTACTED', 'تم الاتصال بالولي لتحديد مقابلة')}
                        className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold transition-colors"
                      >
                        تم التواصل
                      </button>

                      <button
                        onClick={() => handleQuickStatusChange(app.id, 'REJECTED', 'عدم توافق الشروط أو اكتمال الفوج')}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="رفض الطلب"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {app.status === 'CONTACTED' && (
                    <button
                      onClick={() => openConvertModal(app)}
                      className="px-4 py-2 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-4 h-4 text-gold-400" />
                      <span>اعتماد كطالب بعد المقابلة</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* MODAL: One-Click Atomic Conversion */}
      {appToConvert && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          dir="rtl"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-islamic-950 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-amiri text-ivory-50">
                    اعتماد الطلب وتحويله إلى طالب رسمي
                  </h3>
                  <p className="text-[11px] text-ivory-200/80">
                    توليد رقم قيد رسمي وربط الطالب بولي أمره وتعيين الحلقة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAppToConvert(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleExecuteConversion} className="p-6 space-y-4">
              {convertError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{convertError}</span>
                </div>
              )}

              {/* Applicant Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <p className="text-sm font-black text-slate-900 font-amiri">{appToConvert.studentName}</p>
                <p className="text-xs text-slate-500">
                  ولي الأمر: <strong>{appToConvert.guardianName}</strong> ({appToConvert.guardianPhone})
                </p>
                <p className="text-xs text-gold-800 font-bold">
                  المسار المطلوب: {TRACK_LABELS[appToConvert.desiredTrack]?.label || appToConvert.desiredTrack}
                </p>
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الجنس</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConvertGender('male')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      convertGender === 'male'
                        ? 'bg-islamic-800 text-white border-islamic-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ذكر (طالب)
                  </button>
                  <button
                    type="button"
                    onClick={() => setConvertGender('female')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      convertGender === 'female'
                        ? 'bg-rose-700 text-white border-rose-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    أنثى (طالبة)
                  </button>
                </div>
              </div>

              {/* Birth Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">تاريخ الميلاد المعتمد</label>
                <input
                  type="date"
                  value={convertBirthDate}
                  onChange={e => setConvertBirthDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              {/* Target Circle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  الحلقة المقترحة للالتحاق
                </label>
                <select
                  value={convertCircleId}
                  onChange={e => setConvertCircleId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="">-- بدون تعيين حلقة الآن (تحديد لاحقاً) --</option>
                  {circles.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gender === 'male' ? 'ذكور' : c.gender === 'female' ? 'إناث' : 'مختلط'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">ملاحظات الاعتماد والقبول</label>
                <input
                  type="text"
                  value={convertNotes}
                  onChange={e => setConvertNotes(e.target.value)}
                  placeholder="ملاحظات مقابلة تحديد المستوى أو قرار الإدارة..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAppToConvert(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isConverting}
                  className="px-6 py-2 bg-islamic-800 hover:bg-islamic-900 text-gold-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isConverting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>تأكيد التحويل وإنشاء ملف الطالب</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;

import React, { useState, useEffect } from 'react';
import {
  StudentFullProfile,
  StudentListItem,
} from '../../types/student.types';
import {
  fetchStudentFullProfile,
  changeStudentStatus,
} from '../../lib/studentsService';
import {
  X,
  User,
  Heart,
  BookOpen,
  CalendarCheck,
  Award,
  Wallet,
  FileText,
  Printer,
  ArrowRightLeft,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Loader2,
  IdCard,
} from 'lucide-react';

interface StudentProfileModalProps {
  studentId: string | null;
  onClose: () => void;
  onOpenTransferModal?: (student: StudentListItem | StudentFullProfile) => void;
  onStatusChanged?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
  onOpenTransferModal,
  onStatusChanged,
}) => {
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'personal' | 'guardian' | 'academic' | 'attendance' | 'hifz' | 'financial' | 'admin'
  >('personal');
  const [isChangingStatus, setIsChangingStatus] = useState<boolean>(false);
  const [statusReason, setStatusReason] = useState<string>('');
  const [showStatusConfirm, setShowStatusConfirm] = useState<'suspended' | 'graduated' | 'withdrawn' | 'active' | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!studentId) return;

    const loadProfile = async () => {
      setLoading(true);
      const data = await fetchStudentFullProfile(studentId);
      if (isMounted) {
        setProfile(data);
        setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [studentId]);

  if (!studentId) return null;

  const handleStatusUpdate = async (newStatus: 'active' | 'suspended' | 'graduated' | 'withdrawn') => {
    if (!profile) return;
    setIsChangingStatus(true);
    const res = await changeStudentStatus(profile.id, newStatus, statusReason);
    if (res.success) {
      setProfile(prev => (prev ? { ...prev, status: newStatus } : null));
      setShowStatusConfirm(null);
      setStatusReason('');
      onStatusChanged?.();
    }
    setIsChangingStatus(false);
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-gold-300 flex items-center justify-center text-2xl font-black border border-gold-500/30 shrink-0 font-amiri">
              {profile?.fullName?.[0] || 'ط'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black font-amiri text-ivory-50">
                  {loading ? 'جاري تحميل ملف الطالب...' : profile?.fullName}
                </h3>
                {profile && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      profile.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                        : profile.status === 'suspended'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    }`}
                  >
                    {profile.status === 'active'
                      ? 'قيد نشط'
                      : profile.status === 'suspended'
                      ? 'موقوف مؤقتاً'
                      : profile.status === 'graduated'
                      ? 'متخرج'
                      : 'منسحب'}
                  </span>
                )}
              </div>
              <p className="text-xs text-ivory-200/80 mt-0.5 font-mono">
                رقم القيد: {profile?.registrationNumber || '...'} • مدرسة نبراس بمسجد إبراهيم الخليل
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCard}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gold-300 transition-colors"
              title="طباعة بطاقة الطالب الرسمية"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 overflow-x-auto custom-scrollbar shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'personal'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-islamic-800" />
            <span>المعلومات الشخصية</span>
          </button>

          <button
            onClick={() => setActiveTab('guardian')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'guardian'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-600" />
            <span>ولي الأمر</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'academic'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-gold-600" />
            <span>الحلقات والانتقالات</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            <span>سجل الحضور ({profile?.attendanceSummary.attendanceRate || 0}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('hifz')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'hifz'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>الحفظ والمتابعة</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'financial'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-indigo-600" />
            <span>السجل المالي (DZD)</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'admin'
                ? 'bg-white text-islamic-900 shadow-xs font-black border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>الإجراءات الإدارية</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-islamic-800" />
              <p className="text-xs font-bold text-slate-600">جاري قراءة السجلات الشاملة للطالب من الخادم...</p>
            </div>
          ) : !profile ? (
            <div className="py-20 text-center text-slate-400">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold">تعذر العثور على ملف الطالب المحدد.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TAB 1: Personal Info */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">الاسم الكامل</span>
                      <p className="text-base font-black text-slate-900 mt-1 font-amiri">{profile.fullName}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">رقم القيد المدرسي</span>
                      <p className="text-base font-mono font-black text-islamic-900 mt-1">{profile.registrationNumber}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">الجنس</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {profile.gender === 'male' ? 'ذكر' : 'أنثى'}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">تاريخ الميلاد</span>
                      <p className="text-sm font-mono font-bold text-slate-800 mt-1">{profile.birthDate}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">المستوى القرآني</span>
                      <p className="text-sm font-bold text-gold-700 mt-1">{profile.hifzLevel}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">مقدار الحفظ</span>
                      <p className="text-sm font-bold text-emerald-700 mt-1">
                        {profile.currentJuz} جزء (الهدف: {profile.targetJuz} جزء)
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> العنوان السكني
                    </span>
                    <p className="text-xs font-bold text-slate-700">{profile.address || 'غير مسجل'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">ملاحظات إدارية</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{profile.notes || 'لا توجد ملاحظات إدارية مدونة.'}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: Guardian Info */}
              {activeTab === 'guardian' && (
                <div className="space-y-4">
                  {profile.guardians.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Heart className="w-10 h-10 mx-auto text-rose-300 mb-2 opacity-50" />
                      <p className="text-xs">لم يتم ربط ولي أمر بهذا الطالب حتى الآن.</p>
                    </div>
                  ) : (
                    profile.guardians.map(g => (
                      <div key={g.id || g.phone} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm">
                              {g.fullName[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900">{g.fullName}</h4>
                              <p className="text-[11px] text-slate-500">{g.relationship}</p>
                            </div>
                          </div>
                          {g.isPrimaryContact && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              جهة الاتصال الأساسية
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block mb-0.5">رقم الهاتف</span>
                            <span className="font-mono font-bold text-slate-800" dir="ltr">{g.phone}</span>
                          </div>
                          {g.secondaryPhone && (
                            <div className="p-3 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block mb-0.5">هاتف إضافي</span>
                              <span className="font-mono font-bold text-slate-800" dir="ltr">{g.secondaryPhone}</span>
                            </div>
                          )}
                          <div className="p-3 bg-white rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block mb-0.5">صلاحية الاستلام</span>
                            <span className="font-bold text-slate-800">{g.canPickup ? 'مصرح له بالاستلام' : 'غير مصرح'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Academic & Circles */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  {/* Current Active Circle Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-l from-islamic-900 to-islamic-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">الحلقة المقيد بها حالياً</span>
                      <h4 className="text-xl font-black font-amiri text-ivory-50">
                        {profile.currentCircle?.name || 'غير مقيد في حلقة حالياً'}
                      </h4>
                      <p className="text-xs text-ivory-200/80">
                        المعلم: {profile.currentCircle?.teacherName || 'لم يحدد'} • القاعة: {profile.currentCircle?.hallName || 'غير محددة'}
                      </p>
                    </div>

                    {onOpenTransferModal && (
                      <button
                        onClick={() => onOpenTransferModal(profile)}
                        className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-colors flex items-center gap-2 self-start sm:self-center shadow-md shadow-gold-900/30"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>نقل الطالب لحلقة أخرى</span>
                      </button>
                    )}
                  </div>

                  {/* Transfer History Table */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>سجل الانتساب والانتقالات التاريخية</span>
                    </h5>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <tr>
                            <th className="p-3">اسم الحلقة</th>
                            <th className="p-3">المعلم</th>
                            <th className="p-3">القاعة</th>
                            <th className="p-3">تاريخ الالتحاق</th>
                            <th className="p-3">تاريخ الانتهاء</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3">سبب النقل / الملاحظات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {profile.circleHistory.map((h, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-800">{h.circleName}</td>
                              <td className="p-3 text-slate-600">{h.teacherName}</td>
                              <td className="p-3 text-slate-600">{h.hallName}</td>
                              <td className="p-3 font-mono">{h.enrollmentDate}</td>
                              <td className="p-3 font-mono">{h.endDate || 'مستمر'}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    h.status === 'enrolled'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {h.status === 'enrolled' ? 'مقيد حالياً' : 'تم نقله'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-500 text-[11px]">{h.transferReason || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Attendance */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  {/* Summary Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <span className="text-[10px] font-bold uppercase">نسبة الانضباط</span>
                      <p className="text-2xl font-black mt-1">{profile.attendanceSummary.attendanceRate}%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                      <span className="text-[10px] font-bold uppercase">أيام الحضور</span>
                      <p className="text-2xl font-black mt-1">{profile.attendanceSummary.presentDays} يوم</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
                      <span className="text-[10px] font-bold uppercase">مرات التأخر</span>
                      <p className="text-2xl font-black mt-1">{profile.attendanceSummary.lateDays}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-900">
                      <span className="text-[10px] font-bold uppercase">أيام الغياب</span>
                      <p className="text-2xl font-black mt-1">{profile.attendanceSummary.absentDays} يوم</p>
                    </div>
                  </div>

                  {/* Attendance Log Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">حالة الحضور</th>
                          <th className="p-3">التأخر (دقائق)</th>
                          <th className="p-3">ملاحظات المعلم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {profile.recentAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-400">
                              لا توجد سجلات حضور مسجلة حتى الآن.
                            </td>
                          </tr>
                        ) : (
                          profile.recentAttendance.map(att => (
                            <tr key={att.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono font-bold text-slate-800">{att.date}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    att.status === 'present'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : att.status === 'late'
                                      ? 'bg-amber-100 text-amber-800'
                                      : att.status === 'excused'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {att.status === 'present'
                                    ? 'حاضر'
                                    : att.status === 'late'
                                    ? 'متأخر'
                                    : att.status === 'excused'
                                    ? 'معذور'
                                    : 'غائب'}
                                </span>
                              </td>
                              <td className="p-3 font-mono">{att.delayMinutes > 0 ? `${att.delayMinutes} د` : '—'}</td>
                              <td className="p-3 text-slate-500 text-[11px]">{att.notes || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: Hifz & Memorization */}
              {activeTab === 'hifz' && (
                <div className="space-y-6">
                  {/* Hifz Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
                      <span className="text-[10px] font-bold uppercase">آخر سورة وآية</span>
                      <p className="text-xl font-black mt-1 font-amiri">
                        سورة {profile.memorizationSummary.latestSurah} (آية {profile.memorizationSummary.latestAyah})
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <span className="text-[10px] font-bold uppercase">نسبة التقدير الممتاز</span>
                      <p className="text-2xl font-black mt-1">{profile.memorizationSummary.excellentGradeRate}%</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                      <span className="text-[10px] font-bold uppercase">الآيات المحفوظة في السجل</span>
                      <p className="text-2xl font-black mt-1">{profile.memorizationSummary.totalAyahsMemorized} آية</p>
                    </div>
                  </div>

                  {/* Memorization Sessions Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="p-3">التاريخ</th>
                          <th className="p-3">السورة والآيات</th>
                          <th className="p-3">الجزء</th>
                          <th className="p-3">نوع الحصة</th>
                          <th className="p-3">التقدير</th>
                          <th className="p-3">الأخطاء / التجويد</th>
                          <th className="p-3">ملاحظات التسميع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {profile.memorizationRecords.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-400">
                              لا توجد حصص تسميع مسجلة في قاعدة البيانات حتى الآن.
                            </td>
                          </tr>
                        ) : (
                          profile.memorizationRecords.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono">{m.date}</td>
                              <td className="p-3 font-black text-slate-800">
                                سورة {m.surahName} ({m.ayahFrom}-{m.ayahTo})
                              </td>
                              <td className="p-3 font-bold text-slate-600">جـ {m.juz}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {m.recordType === 'new_memorization'
                                    ? 'حفظ جديد'
                                    : m.recordType === 'minor_review'
                                    ? 'مراجعة صغرى'
                                    : 'مراجعة كبرى'}
                                </span>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    m.grade === 'ممتاز'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : m.grade === 'جيد جداً'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {m.grade}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-600">
                                {m.mistakesCount} حفظ / {m.tajweedMistakesCount} تجويد
                              </td>
                              <td className="p-3 text-slate-500 text-[11px]">{m.notes || '—'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: Financial (DZD) */}
              {activeTab === 'financial' && (
                <div className="space-y-6">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">المبلغ المفوتر الإجمالي</span>
                      <p className="text-xl font-black text-slate-900 mt-1 font-amiri">
                        {profile.financialSummary.totalBilledDzd.toLocaleString('ar-DZ')} د.ج
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                      <span className="text-[10px] font-bold uppercase">المسدد الفعلي</span>
                      <p className="text-xl font-black mt-1 font-amiri">
                        {profile.financialSummary.totalPaidDzd.toLocaleString('ar-DZ')} د.ج
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
                      <span className="text-[10px] font-bold uppercase">المبلغ المتبقي</span>
                      <p className="text-xl font-black mt-1 font-amiri">
                        {profile.financialSummary.totalRemainingDzd.toLocaleString('ar-DZ')} د.ج
                      </p>
                    </div>
                  </div>

                  {/* Security Guard Notice */}
                  <div className="p-3.5 bg-islamic-50/80 border border-islamic-200/80 rounded-2xl flex items-center gap-3 text-xs text-islamic-900 font-bold">
                    <ShieldCheck className="w-5 h-5 text-gold-600 shrink-0" />
                    <span>
                      السجلات المالية محمية بسياسات الأمان الصارمة ومحرك التدقيق المالي لمسجد إبراهيم الخليل، ولا يمكن إجراء تعديلات مالية مباشرة من ملف الطالب.
                    </span>
                  </div>

                  {/* Fees Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="p-3">بند الاشتراك</th>
                          <th className="p-3">تاريخ الاستحقاق</th>
                          <th className="p-3">المبلغ المستحق</th>
                          <th className="p-3">المسدد</th>
                          <th className="p-3">المتبقي</th>
                          <th className="p-3">الحالة</th>
                          <th className="p-3">سندات القبض</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {profile.fees.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-slate-400">
                              لا توجد اشتراكات أو رسوم مسجلة لهذا الطالب حتى الآن.
                            </td>
                          </tr>
                        ) : (
                          profile.fees.map(fee => (
                            <tr key={fee.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-800">{fee.feeTitle}</td>
                              <td className="p-3 font-mono">{fee.dueDate}</td>
                              <td className="p-3 font-bold text-slate-900">{fee.finalAmount.toLocaleString('ar-DZ')} د.ج</td>
                              <td className="p-3 font-bold text-emerald-700">{fee.paidAmount.toLocaleString('ar-DZ')} د.ج</td>
                              <td className="p-3 font-bold text-amber-700">{fee.remainingAmount.toLocaleString('ar-DZ')} د.ج</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    fee.status === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : fee.status === 'partially_paid'
                                      ? 'bg-sky-100 text-sky-800'
                                      : fee.status === 'overdue'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {fee.status === 'paid'
                                    ? 'مدفوع'
                                    : fee.status === 'partially_paid'
                                    ? 'جزئي'
                                    : fee.status === 'overdue'
                                    ? 'متأخر'
                                    : 'مستحق'}
                                </span>
                              </td>
                              <td className="p-3 text-[11px] font-mono">
                                {fee.payments.map(p => p.receiptNumber).join(', ') || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: Administrative Actions */}
              {activeTab === 'admin' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="text-sm font-black text-slate-900">إدارة حالة قيد الطالب</h4>
                    <p className="text-xs text-slate-500">
                      تغيير حالة الطالب الحالية مع الحفاظ على كافة السجلات والبيانات السابقة بأمان.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {profile.status !== 'active' && (
                        <button
                          onClick={() => setShowStatusConfirm('active')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          إعادة تفعيل القيد (نشط)
                        </button>
                      )}

                      {profile.status !== 'suspended' && (
                        <button
                          onClick={() => setShowStatusConfirm('suspended')}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          إيقاف مؤقت للقيد
                        </button>
                      )}

                      {profile.status !== 'graduated' && (
                        <button
                          onClick={() => setShowStatusConfirm('graduated')}
                          className="px-4 py-2 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          توثيق تخرج الطالب
                        </button>
                      )}

                      {profile.status !== 'withdrawn' && (
                        <button
                          onClick={() => setShowStatusConfirm('withdrawn')}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
                        >
                          أرشفة وتسجيل انسحاب
                        </button>
                      )}
                    </div>

                    {showStatusConfirm && (
                      <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-3 mt-3 animate-in fade-in">
                        <p className="text-xs font-bold text-slate-800">
                          يرجى تدوين سبب تغيير الحالة إلى (
                          {showStatusConfirm === 'active'
                            ? 'نشط'
                            : showStatusConfirm === 'suspended'
                            ? 'موقوف مؤقتاً'
                            : showStatusConfirm === 'graduated'
                            ? 'متخرج'
                            : 'منسحب'}
                          ):
                        </p>
                        <input
                          type="text"
                          value={statusReason}
                          onChange={e => setStatusReason(e.target.value)}
                          placeholder="اكتب السبب أو الملاحظة الإدارية..."
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(showStatusConfirm)}
                            disabled={isChangingStatus}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            {isChangingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>تأكيد التعديل</span>
                          </button>
                          <button
                            onClick={() => setShowStatusConfirm(null)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Print Card Preview Component */}
                  <div className="p-6 rounded-2xl bg-ivory-50 border border-gold-300/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IdCard className="w-5 h-5 text-gold-600" />
                        <h4 className="text-sm font-black text-islamic-950">بطاقة الطالب الرسمية للمسجد</h4>
                      </div>
                      <button
                        onClick={handlePrintCard}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>طباعة البطاقة</span>
                      </button>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-gold-400/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center sm:text-right">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          <span className="font-amiri text-lg font-black text-islamic-950">مدرسة نبراس القرآن</span>
                          <span className="text-[10px] text-gold-700 font-bold bg-gold-50 px-2 py-0.5 rounded-md">
                            مسجد إبراهيم الخليل
                          </span>
                        </div>
                        <h5 className="text-2xl font-black font-amiri text-slate-900">{profile.fullName}</h5>
                        <p className="text-xs text-slate-500 font-mono font-bold">
                          رقم القيد: {profile.registrationNumber} • الحلقة: {profile.currentCircle?.name || 'غير محددة'}
                        </p>
                      </div>

                      <div className="w-24 h-24 rounded-2xl bg-islamic-900 text-gold-300 font-amiri text-4xl font-black flex items-center justify-center border-2 border-gold-500/40 shadow-md">
                        {profile.fullName[0]}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

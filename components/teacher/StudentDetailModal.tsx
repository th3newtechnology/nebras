import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  User,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  TrendingUp,
  MapPin,
  Heart,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { TeacherStudentDetail } from '../../types/teacherPortal.types';
import { fetchTeacherStudentDetail } from '../../lib/teacherPortalService';
import { useAuth } from '../../context/AuthContext';
import { StudentFollowupRecordModal } from '../students/StudentFollowupRecordModal';

interface StudentDetailModalProps {
  isOpen: boolean;
  studentId: string | null;
  onClose: () => void;
  onOpenRecitation: (studentId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  studentId,
  onClose,
  onOpenRecitation,
}) => {
  const [student, setStudent] = useState<TeacherStudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'info'>('progress');
  const [isFollowupOpen, setIsFollowupOpen] = useState(false);

  const { user } = useAuth();
  const teacherId = user?.teacherId || user?.id || 't-01';

  useEffect(() => {
    if (isOpen && studentId) {
      setLoading(true);
      fetchTeacherStudentDetail(studentId, teacherId)
        .then((data) => setStudent(data))
        .catch((err) => console.error('خطأ في تحميل بيانات الطالب:', err))
        .finally(() => setLoading(false));
    } else {
      setStudent(null);
    }
  }, [isOpen, studentId, teacherId]);

  if (!isOpen) return null;

  const cleanPhone = student?.guardianPhone.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = cleanPhone.startsWith('0')
    ? `https://wa.me/213${cleanPhone.substring(1)}`
    : `https://wa.me/${cleanPhone}`;

  const completionPercentage = student
    ? Math.round((student.currentJuz / (student.targetJuz || 30)) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="flex items-center gap-3 py-6 justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-300" />
              <span className="text-sm font-bold text-emerald-100">جاري تحميل السجل القرآني للطالب...</span>
            </div>
          ) : student ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-2">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-black font-amiri text-gold-300 shadow-inner">
                  {student.fullName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black font-amiri text-white">
                      {student.fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gold-500/20 text-gold-300 border border-gold-400/30">
                      #{student.registrationNumber}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200 font-bold mt-1">
                    {student.circleName} • المستوى: {student.hifzLevel}
                    {student.age && ` • السن: ${student.age} سنة`}
                  </p>
                </div>
              </div>

              {/* Quick Header Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    onOpenRecitation(student.id);
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-emerald-950 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-gold-500/20"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>بدء التسميع</span>
                </button>

                <a
                  href={`tel:${student.guardianPhone}`}
                  className="p-2.5 bg-white/10 hover:bg-white/20 text-emerald-100 rounded-2xl transition-colors"
                  title="اتصال هاتفي بولي الأمر"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-emerald-600/50 hover:bg-emerald-600 text-white rounded-2xl transition-colors"
                  title="مراسلة ولي الأمر عبر واتساب"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : null}
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 flex gap-2 pt-2 overflow-x-auto scroll-smooth whitespace-nowrap">
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'progress'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>خريطة الأجزاء القرآنية (30 جزء)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>سجل التسميع والمراجعة</span>
            {student?.recitationHistory && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {student.recitationHistory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-4 font-black text-xs transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-emerald-700 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>بيانات ولي الأمر والانضباط</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600">جاري إعداد السجل القرآني...</p>
            </div>
          ) : !student ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold">تعذر استرجاع بيانات هذا الطالب</p>
            </div>
          ) : (
            <>
              {/* TAB 1: QURANIC JUZ PROGRESS MAP */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {/* Progress Header Card */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-ivory-50 rounded-2xl border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
                        مستوى إنجاز حفظ القرآن الكريم
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-emerald-950 font-mono">
                          {student.currentJuz}
                        </span>
                        <span className="text-sm font-bold text-slate-600">
                          من أصل {student.targetJuz || 30} جزءاً
                        </span>
                        <span className="text-sm font-black text-gold-700 font-mono mr-2">
                          ({completionPercentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full md:w-64">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span>نسبة الإتمام</span>
                        <span className="font-mono">{completionPercentage}%</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-black">الدليل الإيضاحي للأجزاء:</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 inline-block" />
                      <span>محفوظ ومثبت</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-amber-500 inline-block" />
                      <span>قيد الحفظ والمراجعة الحالية</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-slate-200 inline-block" />
                      <span>متبقي في الخطة</span>
                    </span>
                  </div>

                  {/* 30 Juz Visual Grid */}
                  <div>
                    <h4 className="text-xs font-black text-slate-700 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>خريطة المصحف الشريف (الأجزاء الثلاثون):</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {student.juzProgress.map((juz) => {
                        const isDone = juz.status === 'completed';
                        const isCurrent = juz.status === 'in_progress';

                        return (
                          <div
                            key={juz.juzNumber}
                            className={`p-3 rounded-2xl border text-right transition-all relative overflow-hidden group ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                                : isCurrent
                                ? 'bg-amber-50/80 border-amber-300 text-amber-950 shadow-sm ring-2 ring-amber-400/40'
                                : 'bg-slate-50/70 border-slate-200 text-slate-400'
                            }`}
                            title={juz.juzName}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-black text-xs">
                                #{juz.juzNumber}
                              </span>
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                              {isCurrent && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
                            </div>

                            <p className="text-[11px] font-black truncate">{juz.juzName}</p>

                            <div className="mt-2 text-[10px] font-bold">
                              {isDone ? (
                                <span className="text-emerald-700">مكتمل 100%</span>
                              ) : isCurrent ? (
                                <span className="text-amber-700">جاري التثبيت</span>
                              ) : (
                                <span className="text-slate-400">لم يبدأ</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RECITATION & REVISION HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-700">
                      سجل آخر جلسات الإقراء والتسميع المعتمدة في الحلقة
                    </h4>
                    <span className="text-[11px] font-bold text-slate-400">
                      مرتبة من الأحدث إلى الأقدم
                    </span>
                  </div>

                  {student.recitationHistory.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold">لا يوجد جلسات تسميع مسجلة بعد لهذا الطالب</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {student.recitationHistory.map((rec) => (
                        <div
                          key={rec.id}
                          className="p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                    rec.recordType === 'new_memorization'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : rec.recordType === 'minor_review'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {rec.recordTypeLabel}
                                </span>
                                <h5 className="text-sm font-black text-slate-800">
                                  {rec.surahName} (الآيات: {rec.ayahFrom} - {rec.ayahTo})
                                </h5>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                                {rec.date} • الجزء {rec.juz}
                              </span>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-black ${
                                rec.grade === 'ممتاز'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : rec.grade === 'جيد جداً'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                                  : rec.grade === 'جيد'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              {rec.grade}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                            <span>
                              عثرات الحفظ (اللحن الجلي):{' '}
                              <strong className="text-slate-800 font-mono">{rec.mistakesCount}</strong>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>
                              أحكام التجويد (اللحن الخفي):{' '}
                              <strong className="text-slate-800 font-mono">{rec.tajweedMistakesCount}</strong>
                            </span>
                          </div>

                          {rec.notes && (
                            <p className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 font-serif leading-relaxed">
                              <strong>ملاحظة المحفظ:</strong> {rec.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GUARDIAN & ATTENDANCE INFO */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Discipline Metrics */}
                  <div>
                    <h4 className="text-xs font-black text-slate-700 mb-3">
                      مؤشرات الانضباط والمواظبة في محراب المسجد
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                        <span className="text-[10px] font-black text-emerald-700 uppercase block">
                          نسبة الحضور
                        </span>
                        <p className="text-2xl font-black text-emerald-900 font-mono mt-1">
                          {student.attendanceRate}%
                        </p>
                      </div>

                      <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 text-center">
                        <span className="text-[10px] font-black text-teal-700 uppercase block">
                          الدرجة السلوكية
                        </span>
                        <p className="text-2xl font-black text-teal-900 font-mono mt-1">
                          {student.behaviorScore}/100
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] font-black text-slate-600 uppercase block">
                          أيام الحضور
                        </span>
                        <p className="text-2xl font-black text-slate-800 font-mono mt-1">
                          {student.totalAttendanceDays}
                        </p>
                      </div>

                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                        <span className="text-[10px] font-black text-rose-700 uppercase block">
                          أيام الغياب
                        </span>
                        <p className="text-2xl font-black text-rose-800 font-mono mt-1">
                          {student.totalAbsenceDays}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guardian Info Card */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-black text-slate-700">بيانات ولي الأمر والاتصال السريع</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold block">اسم ولي الأمر:</span>
                        <p className="font-black text-slate-800">
                          {student.guardianName} ({student.guardianRelation || 'ولي الأمر'})
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold block">رقم الهاتف:</span>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-bold text-slate-800" dir="ltr">
                            {student.guardianPhone}
                          </p>
                          <a
                            href={`tel:${student.guardianPhone}`}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="اتصال"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {student.guardianEmail && (
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold block">البريد الإلكتروني:</span>
                          <p className="font-mono text-slate-700" dir="ltr">
                            {student.guardianEmail}
                          </p>
                        </div>
                      )}

                      {student.address && (
                        <div className="space-y-1">
                          <span className="text-slate-400 font-bold block">العنوان السكني:</span>
                          <p className="font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{student.address}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teacher's Notes */}
                  {student.teacherNotes && (
                    <div className="p-4 bg-gold-50/60 rounded-2xl border border-gold-200 text-xs">
                      <span className="font-black text-gold-900 block mb-1">
                        ملاحظات وتوصيات فضيلة المحفظ:
                      </span>
                      <p className="text-slate-700 leading-relaxed font-serif">
                        {student.teacherNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              مدرسة نبراس القرآنية • مسجد إبراهيم الخليل
            </span>
            {student?.isSimulated ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                وضع المحاكاة الميدانية
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                بيانات حية (Supabase)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {student && (
              <button
                onClick={() => setIsFollowupOpen(true)}
                className="px-4 py-2.5 bg-islamic-900 hover:bg-islamic-950 text-gold-300 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm border border-gold-500/20"
              >
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                <span>سجل المتابعة التربوي المستمر</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors"
            >
              إغلاق
            </button>
            {student && (
              <button
                onClick={() => {
                  onOpenRecitation(student.id);
                  onClose();
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-4 h-4" />
                <span>جلسة تسميع فورية</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Student Followup Record Modal */}
      {student && (
        <StudentFollowupRecordModal
          isOpen={isFollowupOpen}
          studentId={student.id}
          onClose={() => setIsFollowupOpen(false)}
        />
      )}
    </div>
  );
};

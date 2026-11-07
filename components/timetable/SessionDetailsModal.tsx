import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Calendar,
  User,
  DoorOpen,
  Users,
  AlertTriangle,
  Trash2,
  Printer,
  Sparkles,
  Phone,
  CheckCircle,
  ShieldAlert,
  Loader2,
  Info,
  MapPin,
  Ban,
} from 'lucide-react';
import {
  TimetableSession,
  ScheduleException,
  CircleStudentListItem,
} from '../../types/circle.types';
import { fetchCircleStudents } from '../../lib/circlesService';
import { deleteScheduleException } from '../../lib/timetableService';
import { useNotifications } from '../../context/NotificationContext';

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TimetableSession | null;
  onOpenExceptionModal: (session: TimetableSession) => void;
  onDeleteSession: (sessionId: string, circleName: string, dayName: string) => void;
  onReload: () => void;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  isOpen,
  onClose,
  session,
  onOpenExceptionModal,
  onDeleteSession,
  onReload,
}) => {
  const [students, setStudents] = useState<CircleStudentListItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [deletingException, setDeletingException] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (isOpen && session?.circleId) {
      loadStudents(session.circleId);
    }
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  const loadStudents = async (circleId: string) => {
    setLoadingStudents(true);
    try {
      const studentList = await fetchCircleStudents(circleId);
      setStudents(studentList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleRemoveException = async (exceptionId: string) => {
    if (confirm('هل أنت متأكد من إلغاء هذا الاستثناء واستعادة موعد الحصة النظامي؟')) {
      setDeletingException(true);
      try {
        const res = await deleteScheduleException(exceptionId);
        if (res.success) {
          addNotification('تم استعادة الحصة', 'تم إلغاء الاستثناء بنجاح واستعادة الجدول النظامي.', 'success');
          onReload();
          onClose();
        } else {
          addNotification('خطأ', res.error || 'فشل إلغاء الاستثناء', 'error');
        }
      } finally {
        setDeletingException(false);
      }
    }
  };

  const hasActiveException = Boolean(session.activeException);
  const activeEx = session.activeException;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 font-mono">
                  {session.circleLevel}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {session.targetGender === 'male'
                    ? 'بنين'
                    : session.targetGender === 'female'
                    ? 'بنات'
                    : 'مشترك'}
                </span>
              </div>
              <h3 className="text-xl font-black font-amiri text-gold-200 mt-1">
                {session.circleName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Active Exception Alert if present */}
          {hasActiveException && activeEx && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px]">
                      {activeEx.exceptionType === 'cancelled'
                        ? 'حصة ملغاة'
                        : activeEx.exceptionType === 'rescheduled'
                        ? 'تعديل موعد'
                        : activeEx.exceptionType === 'substitute_teacher'
                        ? 'معلم بديل'
                        : 'نقل قاعة'}
                    </span>
                    <span>استثناء مسجل لتاريخ: {activeEx.exceptionDate}</span>
                  </div>
                  <p className="text-xs text-amber-800 font-medium">السبب: {activeEx.reason}</p>
                  <div className="text-[10px] text-amber-700">
                    بواسطة: {activeEx.authorName} ({new Date(activeEx.createdAt).toLocaleDateString('ar-DZ')})
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveException(activeEx.id)}
                disabled={deletingException}
                className="px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[10px] shrink-0 transition-colors"
                title="إلغاء الاستثناء واستعادة الموعد النظامي"
              >
                استعادة النظامي
              </button>
            </div>
          )}

          {/* Time & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Timing card */}
            <div className="p-4 rounded-2xl bg-islamic-50/60 border border-islamic-100 space-y-1.5">
              <div className="flex items-center gap-2 text-islamic-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-islamic-700" />
                <span>الموعد الأسبوعي</span>
              </div>
              <div className="font-amiri font-black text-slate-900 text-base">
                يوم {session.dayName}
              </div>
              <div className="text-xs font-mono font-bold text-islamic-800">
                من {session.startTime} إلى {session.endTime}
              </div>
            </div>

            {/* Hall Card */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <DoorOpen className="w-4 h-4 text-amber-700" />
                <span>مكان انعقاد الحلقة</span>
              </div>
              <div className="font-amiri font-black text-slate-900 text-base">
                {session.hallName || 'لم تحدد القاعة بعد'}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{session.hallLocation || 'مسجد إبراهيم الخليل'}</span>
              </div>
            </div>
          </div>

          {/* Teacher Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-islamic-800 text-white flex items-center justify-center font-amiri font-black text-lg">
                {session.teacherName.charAt(session.teacherName.indexOf(' ') + 1) || 'م'}
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">المحفظ المسؤول</div>
                <div className="text-sm font-black text-slate-900 font-amiri">{session.teacherName}</div>
              </div>
            </div>
            {session.teacherPhone && (
              <a
                href={`tel:${session.teacherPhone}`}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold font-mono flex items-center gap-1.5 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5 text-islamic-700" />
                <span>{session.teacherPhone}</span>
              </a>
            )}
          </div>

          {/* Enrolled Students Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-islamic-800" />
                <h4 className="font-bold text-xs text-slate-800">
                  قائمة طلاب الحلقة المقيدين ({students.length} طالب)
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">
                حالة القيد: مقيد نشط
              </span>
            </div>

            {loadingStudents ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-islamic-800" />
                <span className="text-xs text-slate-500 font-bold">جاري تحميل قائمة الطلاب...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 font-bold">
                لا يوجد طلاب مقيدون في هذه الحلقة حالياً
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
                {students.map((student, idx) => (
                  <div
                    key={student.id}
                    className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {student.registrationNumber}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="px-2 py-0.5 rounded-md bg-islamic-50 text-islamic-800 text-[10px] font-bold">
                        {student.hifzLevel}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {student.guardianPhone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onDeleteSession(session.id, session.circleName, session.dayName);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف الموعد نهائياً</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenExceptionModal(session);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>تسجيل استثناء أو إلغاء</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  X,
  UserCheck,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Calendar,
  BookOpen,
  Users,
  DoorOpen,
  Award,
  Clock,
  Printer,
} from 'lucide-react';
import { TeacherItem } from '../../types/circle.types';

interface TeacherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherItem | null;
  onEdit?: (teacher: TeacherItem) => void;
}

export const TeacherDetailsModal: React.FC<TeacherDetailsModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onEdit,
}) => {
  if (!isOpen || !teacher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500/20 border-2 border-gold-400 flex items-center justify-center text-gold-300 font-amiri text-2xl font-black">
              {teacher.fullName.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-amiri text-gold-300">{teacher.fullName}</h3>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    teacher.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : teacher.status === 'on_leave'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  }`}
                >
                  {teacher.status === 'active' ? 'نشط بالتدريس' : teacher.status === 'on_leave' ? 'في إجازة' : 'غير نشط'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gold-400" />
                <span>{teacher.specialization || 'تحفيظ القرآن الكريم'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="طباعة الملف"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">الحلقات المسندة</span>
              <p className="text-xl font-black text-islamic-900 font-mono">{teacher.assignedCirclesCount}</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">إجمالي الطلاب</span>
              <p className="text-xl font-black text-emerald-800 font-mono">{teacher.totalStudentsCount}</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">سنوات الخبرة</span>
              <p className="text-xl font-black text-gold-800 font-mono">{teacher.experienceYears} سنوات</p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">تاريخ التعيين</span>
              <p className="text-xs font-bold text-slate-700 font-mono mt-1">{teacher.hireDate || '—'}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-slate-500">رقم الهاتف:</span>
                <a
                  href={`tel:${teacher.phone}`}
                  dir="ltr"
                  className="font-bold font-mono text-islamic-800 hover:underline"
                >
                  {teacher.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-slate-500">البريد الإلكتروني:</span>
                <span className="font-bold text-slate-800 font-mono">{teacher.email || 'غير مسجل'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-slate-500">المؤهل / الإجازة:</span>
                <span className="font-bold text-slate-800">{teacher.qualification || 'إجازة في القرآن الكريم'}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-gold-600 shrink-0" />
                <span className="text-slate-500">المهمة التعليمية:</span>
                <span className="font-bold text-slate-800">{teacher.specialization || 'تحفيظ وتجويد'}</span>
              </div>
            </div>
          </div>

          {/* Notes if available */}
          {teacher.notes && (
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-amber-900">
              <span className="text-[10px] font-black uppercase tracking-wider block text-amber-700 mb-1">
                ملاحظات الإدارة:
              </span>
              <p className="text-xs font-bold leading-relaxed">{teacher.notes}</p>
            </div>
          )}

          {/* Assigned Circles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-islamic-800" />
                <span>الحلقات والأفواج المسندة للمحفظ ({teacher.assignedCircles.length})</span>
              </h4>
            </div>

            {teacher.assignedCircles.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="font-bold">لا توجد حلقات مسندة لهذا المعلم حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacher.assignedCircles.map(c => (
                  <div
                    key={c.id}
                    className="p-4 bg-white border border-slate-200/90 rounded-2xl hover:border-islamic-700/50 hover:shadow-xs transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 font-amiri text-sm">{c.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-islamic-50 text-islamic-800 border border-islamic-200 font-bold">
                        {c.level}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-gold-600" />
                        <span>{c.hallName || 'بدون قاعة محددة'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                        <Users className="w-3.5 h-3.5" />
                        <span>{c.studentCount} طالب</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(teacher);
              }}
              className="px-4 py-2 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl font-bold text-xs transition-colors"
            >
              تعديل بيانات المعلم
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs transition-colors ml-auto"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

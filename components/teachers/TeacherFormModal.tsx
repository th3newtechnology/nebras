import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Calendar,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  TeacherItem,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherStatus,
} from '../../types/circle.types';
import { createTeacher, updateTeacher } from '../../lib/teachersService';

interface TeacherFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacherToEdit?: TeacherItem | null;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teacherToEdit,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState<TeacherStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherToEdit) {
      setFullName(teacherToEdit.fullName);
      setPhone(teacherToEdit.phone);
      setEmail(teacherToEdit.email || '');
      setQualification(teacherToEdit.qualification || '');
      setSpecialization(teacherToEdit.specialization || '');
      setExperienceYears(teacherToEdit.experienceYears || 0);
      setHireDate(teacherToEdit.hireDate || '');
      setStatus(teacherToEdit.status);
      setNotes(teacherToEdit.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setQualification('');
      setSpecialization('تحفيظ القرآن الكريم وأحكام التجويد');
      setExperienceYears(3);
      setHireDate(new Date().toISOString().split('T')[0]);
      setStatus('active');
      setNotes('');
    }
    setError(null);
  }, [teacherToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('يرجى إدخال اسم المعلم بالكامل');
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setError('يرجى إدخال رقم هاتف صالح (مثال: 0550123456)');
      return;
    }

    setLoading(true);

    try {
      if (teacherToEdit) {
        const dto: UpdateTeacherDTO = {
          fullName,
          phone: cleanPhone,
          email: email.trim() || undefined,
          qualification: qualification.trim() || undefined,
          specialization: specialization.trim() || undefined,
          experienceYears,
          hireDate,
          status,
          notes: notes.trim() || undefined,
        };

        const res = await updateTeacher(teacherToEdit.id, dto);
        if (!res.success) {
          setError(res.error || 'فشل تحديث بيانات المعلم');
          setLoading(false);
          return;
        }
      } else {
        const dto: CreateTeacherDTO = {
          fullName,
          phone: cleanPhone,
          email: email.trim() || undefined,
          qualification: qualification.trim() || undefined,
          specialization: specialization.trim() || undefined,
          experienceYears,
          hireDate,
          status,
          notes: notes.trim() || undefined,
        };

        const res = await createTeacher(dto);
        if (!res.success) {
          setError(res.error || 'فشل إضافة المعلم');
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">
                {teacherToEdit ? 'تعديل بيانات المعلم والمحفظ' : 'تسجيل معلم / محفظ جديد'}
              </h3>
              <p className="text-xs text-slate-300">
                {teacherToEdit ? teacherToEdit.fullName : 'إضافة عضو جديد إلى هيئة التحفيظ بمسجد إبراهيم الخليل'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-bold">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">اسم المعلم الكامل *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">رقم الهاتف *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0550123456"
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-left focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Email & Hire Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">البريد الإلكتروني (اختياري)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="teacher@nebras.edu.dz"
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">تاريخ التعيين / الالتحاق بالمدرسة</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={hireDate}
                  onChange={e => setHireDate(e.target.value)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Qualification & Specialization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">المؤهل العلمي / الإجازة القرآنية</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={qualification}
                  onChange={e => setQualification(e.target.value)}
                  placeholder="مثال: إجازة برواية ورش، ماجستير علوم إسلامية"
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">التخصص القرآني الدقيق</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  placeholder="مثال: تحفيظ وإتقان الروايات، تحفيظ البراعم"
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Experience Years & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">سنوات الخبرة في التعليم والتحفيظ</label>
              <input
                type="number"
                min={0}
                max={60}
                value={experienceYears}
                onChange={e => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">حالة المعلم</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TeacherStatus)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="active">نشط بالتدريس</option>
                <option value="on_leave">في إجازة مؤقتة</option>
                <option value="inactive">غير نشط (معطل)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">ملاحظات إدارية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="أي ملاحظات تخص أوقات التفرغ، الأسانيد المجاز بها، أو المهام الإدارية..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 font-black"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{teacherToEdit ? 'حفظ التعديلات' : 'تسجيل المعلم'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

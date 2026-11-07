import React, { useState, useEffect } from 'react';
import {
  StudentListItem,
  CreateStudentDTO,
  UpdateStudentDTO,
} from '../../types/student.types';
import {
  createStudent,
  updateStudent,
  fetchFilterMetadata,
} from '../../lib/studentsService';
import { CircleLevelType } from '../../types/database.types';
import {
  X,
  UserPlus,
  Edit2,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: StudentListItem | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
}) => {
  const isEditing = !!studentToEdit;

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [birthDate, setBirthDate] = useState('2015-01-01');
  const [address, setAddress] = useState('');
  const [hifzLevel, setHifzLevel] = useState<CircleLevelType>('مبتدئ');
  const [currentJuz, setCurrentJuz] = useState(0);
  const [targetJuz, setTargetJuz] = useState(30);
  const [notes, setNotes] = useState('');

  // بيانات ولي الأمر
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('أب');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianSecondaryPhone, setGuardianSecondaryPhone] = useState('');

  // الحلقة
  const [circleId, setCircleId] = useState('');
  const [circles, setCircles] = useState<{ id: string; name: string; gender: string }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadCircles = async () => {
      const meta = await fetchFilterMetadata();
      if (isMounted) {
        setCircles(meta.circles);
      }
    };
    loadCircles();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName);
      setGender(studentToEdit.gender);
      setBirthDate(studentToEdit.birthDate);
      setAddress(studentToEdit.address || '');
      setHifzLevel(studentToEdit.hifzLevel);
      setCurrentJuz(studentToEdit.currentJuz);
      setTargetJuz(studentToEdit.targetJuz);
      setGuardianName(studentToEdit.guardianName);
      setGuardianRelationship(studentToEdit.guardianRelationship);
      setGuardianPhone(studentToEdit.guardianPhone);
      setCircleId(studentToEdit.currentCircleId || '');
    } else {
      // إعادة تعيين النموذج
      setFullName('');
      setGender('male');
      setBirthDate('2015-01-01');
      setAddress('');
      setHifzLevel('مبتدئ');
      setCurrentJuz(0);
      setTargetJuz(30);
      setNotes('');
      setGuardianName('');
      setGuardianRelationship('أب');
      setGuardianPhone('');
      setGuardianSecondaryPhone('');
      setCircleId('');
    }
    setErrorMessage(null);
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // التحقق من الحقول
    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالب الكامل.');
      return;
    }

    if (!guardianName.trim() || !guardianPhone.trim()) {
      setErrorMessage('يرجى إدخال اسم ورقم هاتف ولي الأمر.');
      return;
    }

    const cleanPhone = guardianPhone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 8) {
      setErrorMessage('رقم هاتف ولي الأمر غير مكتمل (8 أرقام على الأقل).');
      return;
    }

    // التحقق من التوافق الجنسي مع الحلقة
    if (circleId) {
      const chosenCircle = circles.find(c => c.id === circleId);
      if (chosenCircle && chosenCircle.gender !== 'mixed' && chosenCircle.gender !== gender) {
        setErrorMessage(
          `الحلقة المختارة مخصصة لـ (${chosenCircle.gender === 'male' ? 'الذكور' : 'الإناث'}) ولا تتوافق مع جنس الطالب.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    if (isEditing && studentToEdit) {
      const dto: UpdateStudentDTO = {
        fullName: fullName.trim(),
        gender,
        birthDate,
        address: address.trim() || undefined,
        hifzLevel,
        currentJuz,
        targetJuz,
        guardian: {
          id: studentToEdit.guardianId,
          fullName: guardianName.trim(),
          phone: cleanPhone,
          relationship: guardianRelationship,
        },
      };

      const res = await updateStudent(studentToEdit.id, dto);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'فشل تحديث بيانات الطالب.');
      }
    } else {
      const dto: CreateStudentDTO = {
        fullName: fullName.trim(),
        gender,
        birthDate,
        address: address.trim() || undefined,
        hifzLevel,
        currentJuz,
        targetJuz,
        notes: notes.trim() || undefined,
        circleId: circleId || undefined,
        guardian: {
          fullName: guardianName.trim(),
          relationship: guardianRelationship,
          phone: cleanPhone,
          secondaryPhone: guardianSecondaryPhone.trim() || undefined,
        },
      };

      const res = await createStudent(dto);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || 'فشل تسجيل الطالب.');
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/30">
              {isEditing ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-ivory-50">
                {isEditing ? 'تعديل ملف الطالب' : 'تسجيل طالب جديد'}
              </h3>
              <p className="text-[11px] text-ivory-200/80">
                {isEditing ? 'تحديث البيانات الشخصية والأكاديمية وولي الأمر' : 'إدراج طالب رسمي وربطه بولي الأمر والحلقة القرآنية'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Personal Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-islamic-800"></span>
              <span>1. المعلومات الشخصية للطالب</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  اسم الطالب الرباعي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="مثال: يوسف بن عمر الفاروق"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-islamic-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  الجنس <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('male')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      gender === 'male'
                        ? 'bg-islamic-800 text-white border-islamic-800 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ذكر (طالب)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('female')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                      gender === 'female'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    أنثى (طالبة)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  تاريخ الميلاد <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">العنوان السكني</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="مثال: حي اليرموك - الجزائر"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Guardian Info */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>2. بيانات ولي الأمر</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  اسم ولي الأمر الكامل <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={e => setGuardianName(e.target.value)}
                  placeholder="مثال: عمر بن سعيد الفاروق"
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  صلة القرابة <span className="text-rose-500">*</span>
                </label>
                <select
                  value={guardianRelationship}
                  onChange={e => setGuardianRelationship(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="أب">أب</option>
                  <option value="أم">أم</option>
                  <option value="أخ">أخ</option>
                  <option value="جد">جد</option>
                  <option value="ولي أمر شرعي">ولي أمر شرعي</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  رقم الهاتف الأساسي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={e => setGuardianPhone(e.target.value)}
                  placeholder="0550123456"
                  required
                  dir="ltr"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">رقم هاتف إضافي (اختياري)</label>
                <input
                  type="tel"
                  value={guardianSecondaryPhone}
                  onChange={e => setGuardianSecondaryPhone(e.target.value)}
                  placeholder="0661234567"
                  dir="ltr"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-right"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Academic Placement */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold-600"></span>
              <span>3. المستوى القرآني وتعيين الحلقة</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">المستوى القرآني</label>
                <select
                  value={hifzLevel}
                  onChange={e => setHifzLevel(e.target.value as CircleLevelType)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="مبتدئ">مبتدئ (البراعم والتأسيس)</option>
                  <option value="متوسط">متوسط (الأجزاء الأولى)</option>
                  <option value="متقدم">متقدم (نصف القرآن)</option>
                  <option value="إتمام الحفظ">إتمام الحفظ (الماهر)</option>
                  <option value="مراجعة">مراجعة وتثبيت الروايات</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">المحفوظ الحالي (أجزاء)</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={currentJuz}
                  onChange={e => setCurrentJuz(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">الهدف القرآني (أجزاء)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={targetJuz}
                  onChange={e => setTargetJuz(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono"
                />
              </div>

              {!isEditing && (
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    تعيين الحلقة القرآنية المبدئية
                  </label>
                  <select
                    value={circleId}
                    onChange={e => setCircleId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="">-- بدون تعيين حلقة حالياً (تحديد لاحقاً) --</option>
                    {circles.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.gender === 'male' ? 'ذكور' : c.gender === 'female' ? 'إناث' : 'مختلط'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700 block">ملاحظات إدارية إضافية</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="تدوين أي ملاحظات صحية أو دراسية خاصة بالطالب..."
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEditing ? 'حفظ التعديلات' : 'اعتماد تسجيل الطالب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

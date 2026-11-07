import React, { useState } from 'react';
import { X, CheckCircle2, User, Phone, Sparkles, AlertCircle, BookOpen, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const containerRef = useFocusTrap(isOpen, onClose);

  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    guardianName: '',
    guardianPhone: '',
    desiredTrack: 'BEGINNER',
    previousMemorization: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // التحقق من الحقول الإلزامية
    if (!formData.studentName.trim() || !formData.guardianName.trim() || !formData.guardianPhone.trim()) {
      setErrorMessage('يرجى ملء كافة الحقول الإلزامية (اسم الطالب، اسم ولي الأمر، ورقم الهاتف)');
      return;
    }

    if (formData.guardianPhone.trim().length < 8) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح للتواصل');
      return;
    }

    setIsSubmitting(true);

    const submitApplication = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { error } = await (supabase.from('registration_applications') as any).insert({
            student_name: formData.studentName.trim(),
            student_age: formData.studentAge ? parseInt(formData.studentAge, 10) : null,
            guardian_name: formData.guardianName.trim(),
            guardian_phone: formData.guardianPhone.trim(),
            desired_track: formData.desiredTrack,
            previous_memorization: formData.previousMemorization.trim() || null,
            notes: formData.notes.trim() || null,
            status: 'PENDING'
          });

          if (error) {
            if (error.code === '23505') {
              setErrorMessage('يوجد طلب تسجيل معلق بالفعل لهذا الطالب بنفس رقم هاتف ولي الأمر. وسيتواصل معكم فريق القبول قريباً.');
            } else {
              setErrorMessage('تعذر إرسال الطلب حالياً بسبب خطأ في الخادم، يرجى إعادة المحاولة لاحقاً أو الاتصال بإدارة المدرسة.');
            }
            setIsSubmitting(false);
            return;
          }
        } else {
          // محاكاة سريعة في بيئة العرض التوضيحي عند غياب مفاتيح Supabase
          await new Promise((res) => setTimeout(res, 500));
        }

        setIsSubmitting(false);
        setIsSuccess(true);
      } catch (err: any) {
        setErrorMessage('حدث خطأ غير متوقع أثناء إرسال الطلب. يرجى إعادة المحاولة.');
        setIsSubmitting(false);
      }
    };

    submitApplication();
  };

  const handleReset = () => {
    setFormData({
      studentName: '',
      studentAge: '',
      guardianName: '',
      guardianPhone: '',
      desiredTrack: 'BEGINNER',
      previousMemorization: '',
      notes: ''
    });
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الترويسة */}
        <div className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-950 text-white p-6 sm:p-8 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 p-2 rounded-xl text-ivory-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            aria-label="إغلاق نافذة طلب الالتحاق"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          <div className="space-y-2">
            <span className="text-xs text-gold-400 font-bold bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20 inline-block">
              بوابة التسجيل والالتحاق
            </span>
            <h3 id="registration-modal-title" className="text-2xl font-black text-white font-amiri leading-tight">
              طلب التحاق جديد بمدرسة نبراس القرآن
            </h3>
            <p className="text-xs text-ivory-200">
              في رحاب مسجد إبراهيم الخليل — الموسم القرآني الجديد
            </p>
          </div>
        </div>

        {/* جسم النافذة القابل للتمرير */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-5 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-islamic-950 font-amiri">
                  تم تسجيل طلبكم بنجاح ومبارك عليكم!
                </h4>
                <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                  شكراً لثقتكم بمدرسة نبراس القرآن. تم استلام بيانات الطالب <strong>{formData.studentName}</strong>، وسيتواصل معكم فريق شؤون الطلاب بمسجد إبراهيم الخليل لتحديد موعد مقابلة تحديد المستوى.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-ivory-50 border border-slate-200 max-w-md mx-auto text-xs text-slate-700 space-y-2 text-right">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-gold-600" aria-hidden="true" />
                  <span>الخطوة القادمة:</span>
                </div>
                <p>
                  حضور الطالب مصحوباً بولي أمره إلى مقر المدرسة لإجراء التقييم التمهيدي وتأكيد الفوج المناسب.
                </p>
              </div>

              <div className="pt-4">
                <Button variant="primary" size="md" onClick={handleReset}>
                  إتمام وإغلاق النافذة
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium" role="alert">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* بيانات الطالب */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  بيانات الطالب الأساسية
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="student-full-name" className="block text-xs font-bold text-slate-700">
                      اسم الطالب الرباعي <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="student-full-name"
                      type="text"
                      required
                      placeholder="اسم الطالب (مثال: يوسف أحمد)"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-islamic-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="student-age-input" className="block text-xs font-bold text-slate-700">
                      العمر (سنوات) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="student-age-input"
                      type="number"
                      required
                      min={5}
                      max={70}
                      placeholder="مثال: 9"
                      value={formData.studentAge}
                      onChange={(e) => setFormData({ ...formData, studentAge: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-islamic-600"
                    />
                  </div>
                </div>
              </div>

              {/* بيانات ولي الأمر */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  بيانات ولي الأمر والتواصل
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="guardian-full-name" className="block text-xs font-bold text-slate-700">
                      اسم ولي الأمر <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="guardian-full-name"
                      type="text"
                      required
                      placeholder="اسم ولي الأمر (مثال: أحمد بن محمد)"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-islamic-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="guardian-phone-input" className="block text-xs font-bold text-slate-700">
                      رقم الهاتف للتواصل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="guardian-phone-input"
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="0500000000"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-islamic-600"
                    />
                  </div>
                </div>
              </div>

              {/* المسار القرآني المطلوب */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  المسار ومقدار الحفظ السابق
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="desired-track-select" className="block text-xs font-bold text-slate-700">
                      المسار القرآني المرغوب
                    </label>
                    <select
                      id="desired-track-select"
                      value={formData.desiredTrack}
                      onChange={(e) => setFormData({ ...formData, desiredTrack: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-islamic-600"
                    >
                      <option value="BEGINNER">مسار البراعم والناشئة (5 - 10 سنوات)</option>
                      <option value="INTERMEDIATE">مسار الحفظ المرحلي (11 - 15 سنة)</option>
                      <option value="ADVANCED">مسار الحفظ المكثف والخاتمين</option>
                      <option value="IJAZAH">مسار الإجازات بالسند المتصل</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="previous-memorization-input" className="block text-xs font-bold text-slate-700">
                      مقدار الحفظ الحالي (إن وجد)
                    </label>
                    <input
                      id="previous-memorization-input"
                      type="text"
                      placeholder="مثال: جزء عم، أو ٥ أجزاء"
                      value={formData.previousMemorization}
                      onChange={(e) => setFormData({ ...formData, previousMemorization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-islamic-600"
                    />
                  </div>
                </div>
              </div>

              {/* أزرار الإرسال */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                >
                  إلغاء
                </button>
                <Button
                  type="submit"
                  variant="gold"
                  size="md"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto text-xs font-black shadow-md"
                >
                  <span>تأكيد إرسال طلب الالتحاق</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
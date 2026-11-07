import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Calendar,
  DollarSign,
  FileText,
  User,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Tag,
  Percent,
} from 'lucide-react';
import { CreateFeeDTO, FeeItem } from '../../types/finance.types';
import { createFee, updateFee, formatDZD } from '../../lib/financeService';
import { fetchStudents } from '../../lib/studentsService';
import { StudentListItem } from '../../types/student.types';

interface FeeFormModalProps {
  isOpen: boolean;
  feeToEdit?: FeeItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_PRESETS = [
  { title: 'اشتراك شهري للحلقات القرآنية', amount: 2000, period: 'شهري' },
  { title: 'اشتراك فصلي للمدرسة القرآنية', amount: 6000, period: 'فصلي' },
  { title: 'رسوم التسجيل السنوي والمصاحف', amount: 2500, period: 'سنوي' },
  { title: 'اشتراك دورة التجويد المكثفة', amount: 3500, period: 'دورة' },
  { title: 'رسوم إجازة برواية ورش عن نافع', amount: 5000, period: 'إجازة' },
];

export const FeeFormModal: React.FC<FeeFormModalProps> = ({
  isOpen,
  feeToEdit,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const isEditMode = Boolean(feeToEdit);

  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(feeToEdit?.studentId || '');
  const [feeTitle, setFeeTitle] = useState(feeToEdit?.feeTitle || COMMON_PRESETS[0].title);
  const [periodKey, setPeriodKey] = useState(feeToEdit?.periodKey || '2025-Q1');
  const [amount, setAmount] = useState<number>(feeToEdit?.amount || COMMON_PRESETS[0].amount);
  const [discount, setDiscount] = useState<number>(feeToEdit?.discount || 0);
  const [dueDate, setDueDate] = useState(
    feeToEdit?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(feeToEdit?.notes || '');

  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      setStudentsLoading(true);
      try {
        const res = await fetchStudents({ page: 1, pageSize: 100 });
        setStudents(res.students);
        if (!selectedStudentId && res.students.length > 0) {
          setSelectedStudentId(res.students[0].id);
        }
      } catch (err) {
        console.warn('تعذر جلب قائمة الطلاب:', err);
      } finally {
        setStudentsLoading(false);
      }
    };

    if (!isEditMode) {
      loadStudents();
    }
  }, [isEditMode, selectedStudentId]);

  const handlePresetSelect = (preset: typeof COMMON_PRESETS[0]) => {
    setFeeTitle(preset.title);
    setAmount(preset.amount);
  };

  const finalAmount = Math.max(0, amount - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('يرجى تحديد مبلغ صحيح أكبر من الصفر.');
      return;
    }

    if (discount < 0 || discount > amount) {
      setError('مبلغ الخصم غير صالح، لا يمكن أن يكون سالباً أو أكبر من أصل الرسم.');
      return;
    }

    if (!isEditMode && !selectedStudentId) {
      setError('يرجى اختيار الطالب المعني بهذا الرسم.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && feeToEdit) {
        await updateFee(feeToEdit.id, {
          feeTitle,
          periodKey: periodKey.trim() || undefined,
          amount,
          discount,
          dueDate,
          notes: notes.trim() || undefined,
        });
      } else {
        await createFee({
          studentId: selectedStudentId,
          academicYearId: 'a0000000-0000-0000-0000-000000000001',
          feeTitle,
          periodKey: periodKey.trim() || undefined,
          amount,
          discount,
          dueDate,
          notes: notes.trim() || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'تعذر حفظ الرسم المالي. يرجى مراجعة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <PlusCircle className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-black font-amiri tracking-wide">
                {isEditMode ? 'تعديل بيانات الرسم المالي' : 'إصدار رسم مالي / اشتراك جديد'}
              </h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                مدرسة نبراس القرآنية — تسجيل الاستحقاق بالدينار الجزائري
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Student Selector */}
          {!isEditMode ? (
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">الطالب المعني بالرسم *</label>
              <div className="relative">
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={studentsLoading}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.registrationNumber}) — {s.currentCircleName}
                    </option>
                  ))}
                </select>
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">الطالب:</span>
              <p className="text-base font-black text-slate-800">{feeToEdit?.studentName}</p>
              <p className="text-xs text-slate-500 font-mono">رقم القيد: {feeToEdit?.registrationNumber}</p>
            </div>
          )}

          {/* Quick Presets */}
          {!isEditMode && (
            <div>
              <span className="text-xs font-black text-slate-500 block mb-2">قوالب الرسوم الشائعة:</span>
              <div className="flex flex-wrap gap-2">
                {COMMON_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 rounded-xl transition-all"
                  >
                    {p.title} ({formatDZD(p.amount)})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fee Title */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">عنوان / بيان الرسم المالي *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={feeTitle}
                onChange={(e) => setFeeTitle(e.target.value)}
                placeholder="مثال: اشتراك شهر نوفمبر 2026"
                className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Period Key & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">رمز الفترة / الفصل</label>
              <input
                type="text"
                placeholder="مثال: 2026-Q1 أو 2026-11"
                value={periodKey}
                onChange={(e) => setPeriodKey(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ الاستحقاق *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Amount and Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">مبلغ الرسم الإجمالي (د.ج) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-base font-black text-slate-800 transition-all font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  د.ج
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">قيمة الخصم / الإعفاء (د.ج)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={amount}
                  step="50"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-base font-black text-slate-800 transition-all font-mono"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  د.ج
                </span>
              </div>
            </div>
          </div>

          {/* Net Amount Banner */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs font-black text-emerald-900">الصافي المستحق للدفع:</span>
            <span className="text-lg font-black text-emerald-950 font-mono">
              {formatDZD(finalAmount)}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">ملاحظات إدارية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات حول كفالة أو تقسيط..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-medium text-slate-800 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditMode ? 'حفظ التعديلات' : 'إصدار الرسم المالي'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

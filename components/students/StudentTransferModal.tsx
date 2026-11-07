import React, { useState, useEffect } from 'react';
import {
  StudentListItem,
  StudentFullProfile,
} from '../../types/student.types';
import {
  transferStudentCircle,
  fetchFilterMetadata,
} from '../../lib/studentsService';
import {
  X,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DoorOpen,
  Calendar,
} from 'lucide-react';

interface StudentTransferModalProps {
  student: StudentListItem | StudentFullProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const StudentTransferModal: React.FC<StudentTransferModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const [circles, setCircles] = useState<{ id: string; name: string; gender: string }[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  if (!student) return null;

  const currentCircleName =
    'currentCircleName' in student
      ? student.currentCircleName
      : student.currentCircle?.name || 'غير مقيد';

  const currentCircleId =
    'currentCircleId' in student
      ? student.currentCircleId
      : student.currentCircle?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircleId) {
      setError('يرجى اختيار الحلقة الجديدة المراد النقل إليها.');
      return;
    }

    if (selectedCircleId === currentCircleId) {
      setError('لا يمكن نقل الطالب إلى نفس الحلقة المقيد بها حالياً.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await transferStudentCircle({
      studentId: student.id,
      newCircleId: selectedCircleId,
      transferReason: transferReason.trim() || 'نقل إداري معتمد',
    });

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'فشلت عملية النقل');
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-amiri text-ivory-50">نقل الطالب بين الحلقات</h3>
              <p className="text-[11px] text-ivory-200/80">توثيق الانتقال مع الحفاظ على السجل التاريخي</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block">اسم الطالب</span>
            <p className="text-sm font-black text-slate-900 font-amiri">{student.fullName}</p>
            <p className="text-xs text-slate-500 font-medium">
              الحلقة الحالية: <strong className="text-islamic-900">{currentCircleName}</strong>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              الحلقة الجديدة المستهدفة <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCircleId}
              onChange={e => setSelectedCircleId(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-islamic-500 focus:bg-white transition-all"
            >
              <option value="">-- اختر الحلقة المراد النقل إليها --</option>
              {circles
                .filter(c => c.id !== currentCircleId)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.gender === 'male' ? 'ذكور' : c.gender === 'female' ? 'إناث' : 'مختلط'})
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">تاريخ الانتقال الفعلي</label>
            <input
              type="date"
              value={transferDate}
              onChange={e => setTransferDate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">سبب النقل / الملاحظة الإدارية</label>
            <textarea
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              placeholder="مثال: ترقية مستوى الحفظ، التوفيق بين المواعيد الدراسية، إلخ..."
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-islamic-500 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-6 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>تأكيد النقل الرسمي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

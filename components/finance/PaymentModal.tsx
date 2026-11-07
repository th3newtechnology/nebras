import React, { useState } from 'react';
import {
  X,
  Wallet,
  Calendar,
  CreditCard,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Building,
  Hash,
} from 'lucide-react';
import { FeeItem, PaymentMethodType, ReceiptPrintData } from '../../types/finance.types';
import { recordPayment, formatDZD } from '../../lib/financeService';

interface PaymentModalProps {
  isOpen: boolean;
  fee: FeeItem | null;
  onClose: () => void;
  onSuccess: (receipt: ReceiptPrintData) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  fee,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !fee) return null;

  const [amount, setAmount] = useState<number>(fee.remainingAmount);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر.');
      return;
    }

    if (amount > fee.remainingAmount) {
      setError(
        `المبلغ المدخل (${formatDZD(amount)}) يتجاوز المتبقي على الطالب (${formatDZD(fee.remainingAmount)}).`
      );
      return;
    }

    setLoading(true);
    try {
      const result = await recordPayment({
        feeId: fee.id,
        studentId: fee.studentId,
        amount,
        paymentDate,
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess(result.receipt);
    } catch (err: any) {
      setError(err?.message || 'تعذر تسجيل الدفعة المالية. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wallet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xl font-black font-amiri tracking-wide">تسجيل دفعة وسند مالي</h3>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
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

        {/* Fee Summary Banner */}
        <div className="bg-slate-50 p-5 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">الطالب المستفيد</span>
              <h4 className="text-base font-black text-slate-800">{fee.studentName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                رقم القيد: {fee.registrationNumber} • {fee.circleName || 'غير مسكن'}
              </p>
            </div>
            <div className="text-left">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">الرسم المطلوب</span>
              <p className="text-sm font-bold text-slate-700">{fee.feeTitle}</p>
              <div className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-black">
                المتبقي: {formatDZD(fee.remainingAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-6 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount and Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-black text-slate-700">مبلغ الدفعة (بالدينار الجزائري DZD) *</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAmount(fee.remainingAmount)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                >
                  كامل المتبقي ({formatDZD(fee.remainingAmount)})
                </button>
                {fee.remainingAmount > 1000 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(fee.remainingAmount / 2))}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    النصف ({formatDZD(Math.round(fee.remainingAmount / 2))})
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                min="100"
                max={fee.remainingAmount}
                step="50"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-16 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none text-xl font-black text-slate-800 transition-all font-mono"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                د.ج
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">طريقة السداد *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-black shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                }`}
              >
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">نقداً (صندوق)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-black shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                }`}
              >
                <Building className="w-5 h-5 text-blue-600" />
                <span className="text-xs">تحويل بنكي / CCP</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('check')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'check'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-black shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-bold'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span className="text-xs">شيك بريدي/بنكي</span>
              </button>
            </div>
          </div>

          {/* Payment Date & Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ السداد *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-700 transition-all"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">
                رقم الإشعار / الحوالة / الشيك
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: CCP-293849"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-medium text-slate-700 transition-all font-mono"
                />
                <Hash className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">ملاحظات إضافية (اختياري)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="أي توضيحات تخص سند القبض..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-medium text-slate-700 transition-all"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
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
                  <span>جاري تسجيل السند...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تأكيد السداد وإصدار الوصل</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

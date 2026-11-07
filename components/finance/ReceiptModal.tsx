import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Building,
  Calendar,
  User,
  CreditCard,
  Hash,
  Download,
} from 'lucide-react';
import { ReceiptPrintData } from '../../types/finance.types';
import { formatDZD } from '../../lib/financeService';

interface ReceiptModalProps {
  isOpen: boolean;
  receipt: ReceiptPrintData | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  receipt,
  onClose,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'نقداً (صندوق المدرسة)';
      case 'bank_transfer':
        return 'تحويل بنكي / CCP';
      case 'check':
        return 'شيك بنكي / بريدي';
      case 'online':
        return 'دفع إلكتروني';
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black">تم إصدار سند القبض بنجاح</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة السند الرسمي</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div
          id="printable-receipt"
          className="p-8 overflow-y-auto space-y-6 print:p-0 print:m-0 print:space-y-4 text-slate-800"
        >
          {/* Header */}
          <div className="border-b-2 border-emerald-900/10 pb-6 text-center space-y-2">
            <p className="text-xs font-black text-slate-500">الجمهورية الجزائرية الديمقراطية الشعبية</p>
            <div className="flex items-center justify-between">
              <div className="text-right">
                <h2 className="text-xl font-black font-amiri text-emerald-900">
                  {receipt.schoolName}
                </h2>
                <p className="text-xs font-bold text-slate-600">{receipt.mosqueAffiliation}</p>
                <p className="text-[11px] text-slate-400 font-mono">حي اليرموك — الجزائر</p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-gold-300 flex items-center justify-center font-black text-2xl shadow-inner font-amiri border-2 border-gold-400">
                نبراس
              </div>

              <div className="text-left font-mono">
                <span className="text-[10px] font-black text-slate-400 block">رقم سند القبض</span>
                <span className="text-sm font-black text-emerald-800 tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                  {receipt.receiptNumber}
                </span>
                <p className="text-xs text-slate-500 mt-1 font-bold">
                  التاريخ: {receipt.paymentDate}
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <span className="text-xs font-amiri font-bold text-emerald-700 italic tracking-wider">
                ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلاً ﴾
              </span>
              <div className="mt-1 inline-block px-6 py-1 bg-gradient-to-r from-emerald-800 to-teal-800 text-white text-xs font-black rounded-full shadow-sm">
                سند قبض مالي رسمي — إيصال تحصيل
              </div>
            </div>
          </div>

          {/* Student and Guardian Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-sm">
            <div>
              <span className="text-[11px] font-black text-slate-400 block mb-1">بيانات الطالب المسجل:</span>
              <p className="font-black text-slate-900 text-base">{receipt.studentName}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                رقم القيد: <span className="font-black text-emerald-800">{receipt.registrationNumber}</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-400 block mb-1">بيانات ولي الأمر:</span>
              <p className="font-bold text-slate-800">{receipt.guardianName}</p>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                الهاتف: <span className="font-bold">{receipt.guardianPhone}</span>
              </p>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-3">بيان الرسم / الخدمة</th>
                  <th className="p-3 text-center">الفترة</th>
                  <th className="p-3 text-center">طريقة السداد</th>
                  <th className="p-3 text-left">المبلغ المقبوض</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3.5">
                    <span className="font-black text-slate-800 block text-sm">{receipt.feeTitle}</span>
                    {receipt.transactionReference && (
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        مرجع العملية: {receipt.transactionReference}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-600">
                    {receipt.periodKey || 'الفصل الجاري'}
                  </td>
                  <td className="p-3.5 text-center font-bold text-emerald-800">
                    {getMethodName(receipt.paymentMethod)}
                  </td>
                  <td className="p-3.5 text-left font-black text-base text-emerald-900 font-mono">
                    {formatDZD(receipt.amountPaid)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 block">
                المبلغ المقبوض بالأرقام:
              </span>
              <span className="text-2xl font-black text-emerald-950 font-mono">
                {formatDZD(receipt.amountPaid)}
              </span>
            </div>

            <div className="text-left">
              <span className="text-xs font-bold text-slate-600 block">
                الرصيد المتبقي على هذا الرسم:
              </span>
              <span className={`text-base font-black font-mono ${receipt.remainingAmount === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                {receipt.remainingAmount === 0 ? '0 د.ج (خالص الذمة ✅)' : formatDZD(receipt.remainingAmount)}
              </span>
            </div>
          </div>

          {receipt.notes && (
            <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
              <span className="font-black text-slate-700 ml-1">ملاحظات الإدارة:</span>
              <span>{receipt.notes}</span>
            </div>
          )}

          {/* Official Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="p-4 rounded-xl border border-dashed border-slate-300">
              <span className="font-black text-slate-500 block mb-8">توقيع المستلم (أمين الصندوق)</span>
              <span className="font-bold text-slate-800">{receipt.receivedByName}</span>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-between">
              <span className="font-black text-slate-500 block">الختم الرسمي للمدرسة والمسجد</span>
              <div className="w-16 h-16 rounded-full border-2 border-emerald-800/30 flex items-center justify-center text-[10px] text-emerald-900 font-black rotate-[-12deg]">
                ختم الإدارة
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100">
            سند صادر آلياً من بوابة إدارة مدرسة نبراس القرآنية — لا يعتد به في حال الكشط أو التعديل
          </div>
        </div>

        {/* Footer (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            إغلاق
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-sm shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الوصل</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Building,
} from 'lucide-react';
import { GuardianChildFeeSummary } from '../../types/guardianPortal.types';
import { formatDZD } from '../../lib/financeService';

interface ChildFeesTabProps {
  feeSummary?: GuardianChildFeeSummary;
  studentName: string;
}

export const ChildFeesTab: React.FC<ChildFeesTabProps> = ({
  feeSummary,
  studentName,
}) => {
  if (!feeSummary) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
        لا توجد بيانات رسوم مسجلة لهذا الابن.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 block">إجمالي الاشتراكات المستحقة</span>
          <span className="text-2xl font-black font-mono text-slate-900 mt-1 block">
            {formatDZD(feeSummary.totalRequired)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            للعام الدراسي الجاري
          </span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-900 block">إجمالي المسدد والمقبوض</span>
          <span className="text-2xl font-black font-mono text-emerald-950 mt-1 block">
            {formatDZD(feeSummary.totalPaid)}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
            بسندات قبض رسمية معتمدة
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            feeSummary.remaining === 0
              ? 'bg-emerald-50/60 border-emerald-200'
              : 'bg-amber-50/60 border-amber-200'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-700 block">المبلغ المتبقي المطلوب</span>
          <span
            className={`text-2xl font-black font-mono mt-1 block ${
              feeSummary.remaining === 0 ? 'text-emerald-800' : 'text-amber-900'
            }`}
          >
            {formatDZD(feeSummary.remaining)}
          </span>
          <span className="text-[10px] font-bold block mt-0.5">
            {feeSummary.isFullyPaid ? '✓ تم سداد كافة الاشتراكات' : 'متبقٍ واجب السداد'}
          </span>
        </div>
      </div>

      {/* Fees List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-700" />
            <span>سجل الرسوم والاشتراكات الشهرية ({studentName}):</span>
          </h4>
        </div>

        <div className="space-y-2.5">
          {feeSummary.fees.map((fee) => (
            <div
              key={fee.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{fee.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fee.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : fee.status === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {fee.status === 'paid'
                      ? '✓ مسدد بالكامل'
                      : fee.status === 'partial'
                      ? 'سداد جزئي'
                      : 'قيد الانتظار'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-1">
                  <span>تاريخ الاستحقاق: {fee.dueDate}</span>
                  {fee.receiptNumber && (
                    <span className="text-emerald-800 font-bold">
                      سند القبض: #{fee.receiptNumber}
                    </span>
                  )}
                  {fee.paidAt && <span>بتاريخ: {fee.paidAt}</span>}
                </div>
              </div>

              <div className="text-left font-mono">
                <span className="text-sm font-black text-slate-900 block">
                  {formatDZD(fee.amount)}
                </span>
                {fee.remainingAmount > 0 && (
                  <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                    متبقٍ: {formatDZD(fee.remainingAmount)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informative Note */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Building className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800 block mb-0.5">
            معلومات سداد الاشتراكات بمدرسة نبراس:
          </span>
          <p className="leading-relaxed">
            يتم تسليم واستلام الاشتراكات الشهرية وسندات القبض المعتمدة مباشرة لدى أمانة المدرسة بمكتب الإدارة بمسجد إبراهيم الخليل عليه السلام، مع إمكانية التحويل البنكي أو البريدي CCP والتأكيد الفوري في النظام.
          </p>
        </div>
      </div>
    </div>
  );
};

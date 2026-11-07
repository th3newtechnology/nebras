import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
  DollarSign,
  ChevronLeft,
  X,
  Users,
  PlusCircle,
  Printer,
  Receipt,
  ArrowUpRight,
  RefreshCw,
  Building,
  CreditCard,
  Edit2,
  Ban,
  FileText,
  BadgePercent,
  Calendar,
} from 'lucide-react';
import {
  FeeItem,
  PaymentItem,
  FinanceStatistics,
  ReceiptPrintData,
  FeeStatusType,
} from '../types/finance.types';
import {
  fetchFees,
  fetchPayments,
  fetchFinanceStats,
  cancelFee,
  formatDZD,
  getReceiptPrintData,
} from '../lib/financeService';
import { PaymentModal } from '../components/finance/PaymentModal';
import { ReceiptModal } from '../components/finance/ReceiptModal';
import { FeeFormModal } from '../components/finance/FeeFormModal';
import { useNotifications } from '../context/NotificationContext';

interface FeesProps {
  initialSearch?: string;
  onSearchClear?: () => void;
}

export const Fees: React.FC<FeesProps> = ({ initialSearch, onSearchClear }) => {
  const { addNotification } = useNotifications();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'fees' | 'payments'>('fees');

  // Data states
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<FinanceStatistics>({
    totalExpected: 0,
    totalCollected: 0,
    totalRemaining: 0,
    totalOverdue: 0,
    collectionRate: 0,
    totalPaidCount: 0,
    totalPendingCount: 0,
    totalOverdueCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState<FeeItem | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptPrintData | null>(null);

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState<FeeItem | null>(null);

  // Load Data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedFees, fetchedPayments, fetchedStats] = await Promise.all([
        fetchFees({ search: searchTerm, status: statusFilter }),
        fetchPayments({ search: searchTerm, paymentMethod: methodFilter }),
        fetchFinanceStats(),
      ]);

      setFees(fetchedFees);
      setPayments(fetchedPayments);
      setStats(fetchedStats);
    } catch (err) {
      console.error('خطأ في تحميل البيانات المالية:', err);
      addNotification('خطأ في الاتصال', 'تعذر جلب البيانات المالية المحدثة.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, methodFilter, addNotification]);

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearSearch = () => {
    setSearchTerm('');
    onSearchClear?.();
  };

  // Actions
  const handleOpenPayment = (fee: FeeItem) => {
    setSelectedFeeForPayment(fee);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (receipt: ReceiptPrintData) => {
    setIsPaymentModalOpen(false);
    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);
    addNotification(
      'تم السداد بنجاح',
      `تم استلام مبلغ ${formatDZD(receipt.amountPaid)} وسند القبض جاهز للطباعة.`,
      'success'
    );
    loadData();
  };

  const handleViewReceipt = async (paymentId: string) => {
    const receiptData = await getReceiptPrintData(paymentId);
    if (receiptData) {
      setActiveReceipt(receiptData);
      setIsReceiptModalOpen(true);
    } else {
      addNotification('خطأ', 'تعذر استخراج بيانات سند القبض.', 'error');
    }
  };

  const handleCancelFee = async (fee: FeeItem) => {
    if (fee.paidAmount > 0) {
      addNotification('إلغاء مرفوض', 'لا يمكن إلغاء رسم يتضمن دفعات مسددة مسبقاً.', 'warning');
      return;
    }

    const confirmCancel = window.confirm(
      `هل أنت متأكد من رغبتك في إلغاء رسم "${fee.feeTitle}" للطالب ${fee.studentName}؟`
    );
    if (!confirmCancel) return;

    try {
      await cancelFee(fee.id, 'إلغاء يدوي من الإدارة');
      addNotification('تم الإلغاء', `تم إلغاء رسم ${fee.feeTitle} بنجاح.`, 'info');
      loadData();
    } catch (err: any) {
      addNotification('خطأ في الإلغاء', err?.message || 'تعذر إلغاء الرسم.', 'error');
    }
  };

  const handleEditFee = (fee: FeeItem) => {
    setFeeToEdit(fee);
    setIsFeeModalOpen(true);
  };

  const handleCreateFee = () => {
    setFeeToEdit(null);
    setIsFeeModalOpen(true);
  };

  // Status Badge Helper
  const getStatusBadge = (status: FeeStatusType) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            مدفوع بالكامل
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800 border border-teal-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            سداد جزئي
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            قيد الانتظار
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            متأخر
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <Ban className="w-3.5 h-3.5 text-slate-400" />
            ملغى
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-900 text-gold-400 rounded-2xl shadow-md border border-emerald-800">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-amiri text-slate-900 tracking-tight">
                إدارة الشؤون المالية والاشتراكات
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                متابعة الرسوم، تسجيل سندات القبض، وتحصيل الاشتراكات بالدينار الجزائري (DZD)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm transition-all active:scale-95"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleCreateFee}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-800/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-5 h-5 text-gold-300" />
            <span>إصدار رسم مالي جديد</span>
          </button>
        </div>
      </header>

      {/* KPI Stat Cards (Algerian Dinar DZD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Collected */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              إجمالي المحصل
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-800 font-mono tracking-tight">
            {formatDZD(stats.totalCollected)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{stats.totalPaidCount} رسم مدفوع بالكامل</span>
          </div>
        </div>

        {/* Total Remaining */}
        <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              رسوم قيد التحصيل
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 font-mono tracking-tight">
            {formatDZD(stats.totalRemaining)}
          </div>
          <div className="mt-2 text-xs text-amber-600 font-bold">
            <span>{stats.totalPendingCount} اشتراك قيد الانتظار</span>
          </div>
        </div>

        {/* Total Overdue */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              المتأخرات المتعثرة
            </span>
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-2xl group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-800 font-mono tracking-tight">
            {formatDZD(stats.totalOverdue)}
          </div>
          <div className="mt-2 text-xs text-rose-600 font-bold">
            <span>{stats.totalOverdueCount} اشتراك متأخر الدفع</span>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              نسبة التحصيل العامة
            </span>
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl group-hover:scale-110 transition-transform">
              <BadgePercent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-800 font-mono tracking-tight">
            {stats.collectionRate}%
          </div>
          <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('fees')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all ${
                activeTab === 'fees'
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>سجل الرسوم والمستحقات ({fees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm transition-all ${
                activeTab === 'payments'
                  ? 'bg-emerald-800 text-white shadow-md shadow-emerald-800/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>سندات القبض والمعاملات ({payments.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[280px]">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث بالاسم، رقم القيد، أو السند..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-11 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-bold transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab-Specific Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'fees' ? (
            <>
              <span className="text-xs font-black text-slate-400">تصفية الحالة:</span>
              {(['all', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled'] as const).map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                      statusFilter === st
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'all' && 'جميع الحالات'}
                    {st === 'pending' && 'قيد الانتظار'}
                    {st === 'partially_paid' && 'سداد جزئي'}
                    {st === 'paid' && 'مدفوع بالكامل'}
                    {st === 'overdue' && 'متأخر'}
                    {st === 'cancelled' && 'ملغى'}
                  </button>
                )
              )}
            </>
          ) : (
            <>
              <span className="text-xs font-black text-slate-400">طريقة السداد:</span>
              {(['all', 'cash', 'bank_transfer', 'check'] as const).map((pm) => (
                <button
                  key={pm}
                  onClick={() => setMethodFilter(pm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    methodFilter === pm
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pm === 'all' && 'جميع الطرق'}
                  {pm === 'cash' && 'نقداً (صندوق)'}
                  {pm === 'bank_transfer' && 'تحويل بنكي / CCP'}
                  {pm === 'check' && 'شيك'}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {initialSearch && (
        <div className="bg-emerald-50 border border-emerald-200 px-6 py-3 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xs font-black text-emerald-900">
              أنت تستعرض السجلات المالية الخاصة بـ: <span className="font-mono">{initialSearch}</span>
            </p>
          </div>
          <button
            onClick={clearSearch}
            className="text-xs font-black text-emerald-700 hover:underline"
          >
            عرض كافة الطلاب
          </button>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-700" />
          <p className="text-slate-500 font-bold text-xs tracking-wider">
            جاري مزامنة السجلات المالية وسندات القبض...
          </p>
        </div>
      ) : activeTab === 'fees' ? (
        /* Fees Table */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-4">اسم الطالب ورقم القيد</th>
                  <th className="p-4">بيان الرسم والفترة</th>
                  <th className="p-4 text-left">الصافي</th>
                  <th className="p-4 text-left">المسدد</th>
                  <th className="p-4 text-left">المتبقي</th>
                  <th className="p-4 text-center">الاستحقاق</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400 font-bold">
                      لا توجد رسوم مالية مطابقة لمعايير البحث.
                    </td>
                  </tr>
                ) : (
                  fees.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm shadow-sm">
                            {fee.studentName[0]}
                          </div>
                          <div>
                            <span className="font-black text-slate-800 text-sm block">
                              {fee.studentName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              #{fee.registrationNumber} • {fee.circleName || 'غير مسكن'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Fee Title */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{fee.feeTitle}</span>
                        {fee.periodKey && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                            {fee.periodKey}
                          </span>
                        )}
                      </td>

                      {/* Final Amount */}
                      <td className="p-4 text-left font-black text-slate-800 font-mono">
                        {formatDZD(fee.finalAmount)}
                        {fee.discount > 0 && (
                          <span className="block text-[10px] text-emerald-600 font-sans">
                            (خصم {formatDZD(fee.discount)})
                          </span>
                        )}
                      </td>

                      {/* Paid Amount */}
                      <td className="p-4 text-left font-black text-emerald-700 font-mono">
                        {formatDZD(fee.paidAmount)}
                      </td>

                      {/* Remaining Amount */}
                      <td className="p-4 text-left font-mono">
                        <span
                          className={`font-black ${
                            fee.remainingAmount === 0 ? 'text-slate-400' : 'text-amber-800'
                          }`}
                        >
                          {formatDZD(fee.remainingAmount)}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="p-4 text-center text-slate-600 font-mono text-[11px]">
                        {fee.dueDate}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">{getStatusBadge(fee.status)}</td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {fee.remainingAmount > 0 && fee.status !== 'cancelled' && (
                            <button
                              onClick={() => handleOpenPayment(fee)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs shadow-sm transition-all active:scale-95"
                              title="تسجيل سداد دفعة"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>قبض دفعة</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleEditFee(fee)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                            title="تعديل بيانات الرسم"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {fee.paidAmount === 0 && fee.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelFee(fee)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                              title="إلغاء الرسم"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Payments & Receipts Table */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-4">رقم السند والتاريخ</th>
                  <th className="p-4">اسم الطالب ورقم القيد</th>
                  <th className="p-4">بيان الرسم</th>
                  <th className="p-4 text-left">المبلغ المقبوض</th>
                  <th className="p-4 text-center">طريقة السداد</th>
                  <th className="p-4">المستلم (أمين الصندوق)</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                      لا توجد سندات قبض مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Receipt No & Date */}
                      <td className="p-4">
                        <span className="font-mono font-black text-emerald-800 text-sm block">
                          {p.receiptNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.paymentDate}</span>
                      </td>

                      {/* Student */}
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-sm block">
                          {p.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          #{p.registrationNumber}
                        </span>
                      </td>

                      {/* Fee Title */}
                      <td className="p-4">
                        <span className="font-medium text-slate-700">{p.feeTitle}</span>
                        {p.transactionReference && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            مرجع: {p.transactionReference}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-left font-black text-emerald-800 text-sm font-mono">
                        {formatDZD(p.amount)}
                      </td>

                      {/* Payment Method */}
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                          {p.paymentMethod === 'cash' && <Wallet className="w-3.5 h-3.5 text-emerald-600" />}
                          {p.paymentMethod === 'bank_transfer' && <Building className="w-3.5 h-3.5 text-blue-600" />}
                          {p.paymentMethod === 'check' && <CreditCard className="w-3.5 h-3.5 text-amber-600" />}
                          {p.paymentMethod === 'cash'
                            ? 'نقداً'
                            : p.paymentMethod === 'bank_transfer'
                            ? 'تحويل CCP'
                            : 'شيك'}
                        </span>
                      </td>

                      {/* Receiver */}
                      <td className="p-4 text-slate-600 font-bold">{p.receivedByName}</td>

                      {/* Action: Print Receipt */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleViewReceipt(p.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-black text-xs transition-all active:scale-95"
                          title="عرض وطباعة سند القبض"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-700" />
                          <span>طباعة الوصل</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        fee={selectedFeeForPayment}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        receipt={activeReceipt}
        onClose={() => setIsReceiptModalOpen(false)}
      />

      <FeeFormModal
        isOpen={isFeeModalOpen}
        feeToEdit={feeToEdit}
        onClose={() => setIsFeeModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
};

export default Fees;

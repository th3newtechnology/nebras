export type FeeStatusType = 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethodType = 'cash' | 'bank_transfer' | 'check' | 'online';
export type PaymentStatusType = 'confirmed' | 'reversed' | 'pending';

export interface FeeItem {
  id: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  guardianName: string;
  guardianPhone: string;
  circleName?: string;
  academicYearId: string;
  academicYearName?: string;
  feeTitle: string;
  periodKey: string | null;
  amount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeStatusType;
  dueDate: string;
  notes: string | null;
  createdAt: string;
  paymentsCount?: number;
}

export interface PaymentItem {
  id: string;
  feeId: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  feeTitle: string;
  receiptNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethodType;
  status: PaymentStatusType;
  transactionReference: string | null;
  receivedBy: string;
  receivedByName: string;
  reversalReason?: string | null;
  reversedBy?: string | null;
  reversedAt?: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateFeeDTO {
  studentId: string;
  academicYearId: string;
  feeTitle: string;
  periodKey?: string;
  amount: number;
  discount?: number;
  dueDate: string;
  notes?: string;
}

export interface BatchCreateFeeDTO {
  studentIds: string[];
  circleId?: string;
  academicYearId: string;
  feeTitle: string;
  periodKey?: string;
  amount: number;
  discount?: number;
  dueDate: string;
  notes?: string;
}

export interface UpdateFeeDTO {
  feeTitle?: string;
  periodKey?: string;
  amount?: number;
  discount?: number;
  dueDate?: string;
  notes?: string;
}

export interface CreatePaymentDTO {
  feeId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethodType;
  transactionReference?: string;
  notes?: string;
  receivedBy?: string;
}

export interface FeeFilterParams {
  search?: string;
  status?: string;
  circleId?: string;
  academicYearId?: string;
  periodKey?: string;
}

export interface PaymentFilterParams {
  search?: string;
  paymentMethod?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface FinanceStatistics {
  totalExpected: number;
  totalCollected: number;
  totalRemaining: number;
  totalOverdue: number;
  collectionRate: number;
  totalPaidCount: number;
  totalPendingCount: number;
  totalOverdueCount: number;
}

export interface ReceiptPrintData {
  receiptNumber: string;
  paymentDate: string;
  studentName: string;
  registrationNumber: string;
  guardianName: string;
  guardianPhone: string;
  feeTitle: string;
  periodKey: string | null;
  amountPaid: number;
  finalFeeAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethodType;
  transactionReference: string | null;
  receivedByName: string;
  notes: string | null;
  schoolName: string;
  mosqueAffiliation: string;
}

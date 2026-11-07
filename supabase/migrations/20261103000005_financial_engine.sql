-- =============================================================================
-- Migration: 20261103000005_financial_engine.sql
-- Description: Financial Management (DZD), Fees, Payments, Composite Integrity, and Atomic Concurrency Locks
-- Author: Senior PostgreSQL / Supabase Engineer
-- Project: مدرسة نبراس القرآن - مسجد إبراهيم الخليل
-- =============================================================================

-- 1. جدول الرسوم المدرسية المستحقة (fees)
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    fee_title TEXT NOT NULL,
    period_key TEXT,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    discount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0 AND discount <= amount),
    final_amount NUMERIC(12,2) GENERATED ALWAYS AS (amount - discount) STORED,
    paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(12,2) GENERATED ALWAYS AS (amount - discount - paid_amount) STORED,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_fees_id_student UNIQUE (id, student_id),
    CONSTRAINT chk_paid_not_exceed_final CHECK (paid_amount <= (amount - discount))
);

CREATE INDEX IF NOT EXISTS idx_fees_student ON public.fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_academic_year ON public.fees(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON public.fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON public.fees(due_date);

CREATE TRIGGER trigger_fees_updated_at
BEFORE UPDATE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. جدول المدفوعات وسندات القبض (payments)
-- يمثل المصدر الوحيد للحقيقة المالية (Single Source of Truth)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_id UUID NOT NULL,
    student_id UUID NOT NULL,
    receipt_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'check', 'online')),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'reversed')),
    transaction_reference TEXT,
    received_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reversal_reason TEXT,
    reversed_by UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    reversed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- قيد المفتاح الأجنبي المركب لضمان تطابق الطالب المسدد مع صاحب الرسم
    CONSTRAINT fk_payments_fee_student FOREIGN KEY (fee_id, student_id) 
        REFERENCES public.fees(id, student_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_payments_fee ON public.payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_no ON public.payments(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

-- 3. دالة وزَناد التزامن المالي الذري (Atomic Payment Synchronization with Row Locking)
-- تعالج بدقة حالة الدفعات المتزامنة وتمنع تجاوز المتبقي
CREATE OR REPLACE FUNCTION public.sync_fee_payments()
RETURNS TRIGGER AS $$
DECLARE
    v_fee_id UUID;
    v_final_amount NUMERIC(12,2);
    v_total_paid NUMERIC(12,2);
    v_new_status TEXT;
    v_current_status TEXT;
BEGIN
    v_fee_id := COALESCE(NEW.fee_id, OLD.fee_id);

    -- 1. قفل حصري على مستوى السطر (Row-Level Exclusive Lock) لسجل الرسم
    -- يمنع أي معاملة متزامنة أخرى من قراءة أو كتابة نفس الرسم حتى اكتمال هذه المعاملة
    SELECT final_amount, status INTO v_final_amount, v_current_status
    FROM public.fees
    WHERE id = v_fee_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'الرسم المالي غير موجود: %', v_fee_id USING ERRCODE = 'P0002';
    END IF;

    -- 2. حساب إجمالي المدفوعات من الدفعات المعتمدة فقط (confirmed)
    SELECT COALESCE(SUM(amount), 0.00)
    INTO v_total_paid
    FROM public.payments
    WHERE fee_id = v_fee_id AND status = 'confirmed';

    -- 3. التحقق الصارم من عدم تجاوز المبلغ الصافي
    IF v_total_paid > v_final_amount THEN
        RAISE EXCEPTION 'تجاوز مالي مرفوض: مجموع المدفوعات المعتمدة (%.2f DZD) يتجاوز صافي قيمة الرسم المستحق (%.2f DZD). تم رفض المعاملة.',
            v_total_paid, v_final_amount
            USING ERRCODE = 'P0001';
    END IF;

    -- 4. تحديد الحالة المالية الجديدة
    IF v_current_status = 'cancelled' THEN
        v_new_status := 'cancelled';
    ELSIF v_total_paid = 0.00 THEN
        v_new_status := 'pending';
    ELSIF v_total_paid >= v_final_amount THEN
        v_new_status := 'paid';
    ELSE
        v_new_status := 'partially_paid';
    END IF;

    -- 5. التحديث الذري لجدول fees
    UPDATE public.fees
    SET paid_amount = v_total_paid,
        status = v_new_status,
        updated_at = now()
    WHERE id = v_fee_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_fee_payments
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.sync_fee_payments();

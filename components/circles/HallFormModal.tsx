import React, { useState, useEffect } from 'react';
import {
  X,
  DoorOpen,
  MapPin,
  Users,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import {
  HallItem,
  CreateHallDTO,
  UpdateHallDTO,
  HallStatus,
} from '../../types/circle.types';
import { createHall, updateHall } from '../../lib/circlesService';

interface HallFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hallToEdit?: HallItem | null;
}

export const HallFormModal: React.FC<HallFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  hallToEdit,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number>(20);
  const [status, setStatus] = useState<HallStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hallToEdit) {
      setName(hallToEdit.name);
      setLocation(hallToEdit.location || '');
      setCapacity(hallToEdit.capacity);
      setStatus(hallToEdit.status);
      setNotes(hallToEdit.notes || '');
    } else {
      setName('');
      setLocation('الطابق الأرضي');
      setCapacity(18);
      setStatus('active');
      setNotes('');
    }
    setError(null);
  }, [hallToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى إدخال اسم القاعة');
      return;
    }
    if (capacity <= 0) {
      setError('يرجى تحديد سعة استيعابية صحيحة');
      return;
    }

    setLoading(true);

    try {
      if (hallToEdit) {
        const dto: UpdateHallDTO = {
          name: name.trim(),
          location: location.trim() || undefined,
          capacity,
          status,
          notes: notes.trim() || undefined,
        };

        const res = await updateHall(hallToEdit.id, dto);
        if (!res.success) {
          setError(res.error || 'فشل تحديث بيانات القاعة');
          setLoading(false);
          return;
        }
      } else {
        const dto: CreateHallDTO = {
          name: name.trim(),
          location: location.trim() || undefined,
          capacity,
          status,
          notes: notes.trim() || undefined,
        };

        const res = await createHall(dto);
        if (!res.success) {
          setError(res.error || 'فشل إضافة القاعة');
          setLoading(false);
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <DoorOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">
                {hallToEdit ? 'تعديل بيانات القاعة' : 'إضافة قاعة جديدة'}
              </h3>
              <p className="text-xs text-slate-300">
                {hallToEdit ? hallToEdit.name : 'تسجيل قاعة دراسية ضمن مرافق مسجد إبراهيم الخليل'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-bold">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Hall Name */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">اسم القاعة *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: قاعة الإمام مالك"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          {/* Location & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">الموقع داخل المسجد</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="مثال: الطابق الأرضي - الجناح الغربي"
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">السعة القصوى (عدد المقاعد) *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value) || 1)}
                  className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">الحالة التشغيلية للقاعة</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as HallStatus)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
            >
              <option value="active">جاهزة ونشطة لاستقبال الحلقات</option>
              <option value="maintenance">تحت الصيانة / الترميم</option>
              <option value="inactive">معطلة مؤقتاً</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">ملاحظات والتجهيزات المتوفرة</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: مجهزة بجهاز عرض، رفوف مصاحف، مكيف هواء..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-islamic-800 hover:bg-islamic-900 text-gold-300 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 font-black"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{hallToEdit ? 'حفظ التعديلات' : 'إضافة القاعة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

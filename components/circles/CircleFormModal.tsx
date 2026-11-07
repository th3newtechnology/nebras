import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  User,
  DoorOpen,
  Users,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import {
  CircleItem,
  CircleLevel,
  TargetGender,
  CircleStatus,
  CreateCircleDTO,
  UpdateCircleDTO,
  TeacherItem,
  HallItem,
} from '../../types/circle.types';
import { createCircle, updateCircle } from '../../lib/circlesService';

interface CircleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  circleToEdit?: CircleItem | null;
  teachers: TeacherItem[];
  halls: HallItem[];
  currentAcademicYearId: string;
}

const LEVELS: CircleLevel[] = ['مبتدئ', 'متوسط', 'متقدم', 'إتمام الحفظ', 'مراجعة'];

export const CircleFormModal: React.FC<CircleFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  circleToEdit,
  teachers,
  halls,
  currentAcademicYearId,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<CircleLevel>('مبتدئ');
  const [teacherId, setTeacherId] = useState('');
  const [hallId, setHallId] = useState<string>('');
  const [targetGender, setTargetGender] = useState<TargetGender>('male');
  const [capacity, setCapacity] = useState<number>(15);
  const [status, setStatus] = useState<CircleStatus>('active');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (circleToEdit) {
      setName(circleToEdit.name);
      setLevel(circleToEdit.level);
      setTeacherId(circleToEdit.teacherId);
      setHallId(circleToEdit.hallId || '');
      setTargetGender(circleToEdit.targetGender);
      setCapacity(circleToEdit.capacity);
      setStatus(circleToEdit.status);
    } else {
      setName('');
      setLevel('مبتدئ');
      setTeacherId(teachers.length > 0 ? teachers[0].id : '');
      setHallId(halls.length > 0 ? halls[0].id : '');
      setTargetGender('male');
      setCapacity(15);
      setStatus('active');
    }
    setError(null);
  }, [circleToEdit, isOpen, teachers, halls]);

  if (!isOpen) return null;

  // Selected hall capacity warning
  const selectedHall = halls.find(h => h.id === hallId);
  const hallCapacityWarning =
    selectedHall && capacity > selectedHall.capacity
      ? `تنبيه: سعة الحلقة (${capacity}) أكبر من السعة القصوى للقاعة المحددة "${selectedHall.name}" (${selectedHall.capacity} مقعداً).`
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('يرجى تحديد اسم الحلقة القرآنية');
      return;
    }
    if (!teacherId) {
      setError('يرجى اختيار المحفظ المسؤول عن الحلقة');
      return;
    }
    if (capacity <= 0) {
      setError('يرجى تحديد سعة استيعابية صحيحة للحلقة');
      return;
    }

    setLoading(true);

    try {
      if (circleToEdit) {
        const dto: UpdateCircleDTO = {
          name: name.trim(),
          level,
          teacherId,
          hallId: hallId || null,
          targetGender,
          capacity,
          status,
        };

        const res = await updateCircle(circleToEdit.id, dto);
        if (!res.success) {
          setError(res.error || 'فشل تحديث بيانات الحلقة');
          setLoading(false);
          return;
        }
      } else {
        const dto: CreateCircleDTO = {
          name: name.trim(),
          level,
          academicYearId: currentAcademicYearId,
          teacherId,
          hallId: hallId || null,
          targetGender,
          capacity,
          status,
        };

        const res = await createCircle(dto);
        if (!res.success) {
          setError(res.error || 'فشل إنشاء الحلقة');
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
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white flex items-center justify-between border-b border-gold-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black font-amiri text-gold-300">
                {circleToEdit ? 'تعديل بيانات الحلقة القرآنية' : 'إنشاء حلقة قرآنية جديدة'}
              </h3>
              <p className="text-xs text-slate-300">
                {circleToEdit ? circleToEdit.name : 'تأسيس فوج تحفيظ جديد وتعيين القاعة والمحفظ المشرف'}
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

          {hallCapacityWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{hallCapacityWarning}</span>
            </div>
          )}

          {/* Circle Name */}
          <div className="space-y-1.5">
            <label className="text-slate-700 block">اسم الحلقة القرآنية *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: حلقة الإمام نافع للمتقنين"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          {/* Level & Target Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">المستوى القرآني المعتمد *</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as CircleLevel)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                {LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">الفئة المستهدفة *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetGender('male')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    targetGender === 'male'
                      ? 'bg-islamic-800 text-white border-islamic-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ذكور (طلاب)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetGender('female')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    targetGender === 'female'
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  إناث (طالبات)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetGender('mixed')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    targetGender === 'mixed'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  براعم (مختلط)
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Teacher & Hall */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">المحفظ المشرف *</label>
              <select
                required
                value={teacherId}
                onChange={e => setTeacherId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="">-- اختر المعلم --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} {t.status !== 'active' ? '(غير نشط)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">القاعة الدراسية المسندة</label>
              <select
                value={hallId}
                onChange={e => setHallId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="">بدون قاعة محددة (أو حلقة متغيرة)</option>
                {halls.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} (السعة: {h.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-700 block">السعة القصوى للطلاب *</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-islamic-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 block">حالة الحلقة</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as CircleStatus)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-islamic-800 font-bold"
              >
                <option value="active">نشطة ومستمرة</option>
                <option value="suspended">موقوفة مؤقتاً</option>
                <option value="completed">مكتملة / منتهية</option>
              </select>
            </div>
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
              <span>{circleToEdit ? 'حفظ التعديلات' : 'تأكيد إنشاء الحلقة'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

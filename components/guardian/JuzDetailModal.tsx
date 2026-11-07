import React, { useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Volume2,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { getSurahsByJuz, SurahMetadata } from '../../lib/quranMetadata';
import { QURAN_JUZ_NAMES } from '../../lib/teacherPortalService';

interface JuzDetailModalProps {
  isOpen: boolean;
  juzNumber: number;
  currentStudentJuz: number;
  studentName: string;
  onClose: () => void;
}

export const JuzDetailModal: React.FC<JuzDetailModalProps> = ({
  isOpen,
  juzNumber,
  currentStudentJuz,
  studentName,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isCompleted = juzNumber < currentStudentJuz;
  const isCurrent = juzNumber === currentStudentJuz;
  const juzName = QURAN_JUZ_NAMES[juzNumber - 1] || `الجزء ${juzNumber}`;
  const surahs = getSurahsByJuz(juzNumber);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black font-mono text-lg border ${
                isCompleted
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : isCurrent
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {juzNumber}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-amiri text-slate-900">
                  الجزء {juzNumber}: {juzName}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCompleted
                    ? '✓ متقن ومكتمل'
                    : isCurrent
                    ? '⏳ قيد الحفظ والتثبيت'
                    : 'متبقٍ في الخطة'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                متابعة حفظ الطالب: <strong>{studentName}</strong> برواية ورش عن نافع
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Juz Status Summary */}
        <div
          className={`p-4 rounded-2xl border ${
            isCompleted
              ? 'bg-emerald-50/70 border-emerald-200'
              : isCurrent
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : isCurrent ? (
              <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            ) : (
              <BookOpen className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <span className="font-bold text-slate-900 block mb-0.5">
                {isCompleted
                  ? 'تم إتقان هذا الجزء بفضل الله تعالى'
                  : isCurrent
                  ? 'الطالب يعمل حالياً على حفظ وتثبيت هذا الجزء'
                  : 'مرحلة مستقبلية ضمن المسار القرآني للطالب'}
              </span>
              <p className="text-slate-600 leading-relaxed font-medium">
                {isCompleted
                  ? 'تمت مراجعة هذا الجزء وتثبيته لدى الشيخ المحفظ بمحراب مسجد إبراهيم الخليل، مع العناية بأحكام رواية ورش.'
                  : isCurrent
                  ? 'يتلقى الطالب تسميع السور المندرجة في هذا الجزء أسبوعياً، مع التركيز على ضبط المخارج وأحكام التجويد.'
                  : `سيبدأ الطالب في هذا الجزء بعد إتمام الجزء ${juzNumber - 1} وفق الخطة التربوية المعتمدة.`}
              </p>
            </div>
          </div>
        </div>

        {/* Surahs in this Juz */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>السور القرآنية التي تبتدئ في هذا الجزء:</span>
          </h4>

          {surahs.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
              تتابع وتكملة لسور الجزء السابق.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {surahs.map((surah) => (
                <div
                  key={surah.number}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold flex items-center justify-center text-[11px]">
                      {surah.number}
                    </span>
                    <div>
                      <span className="font-black text-slate-900 block">{surah.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        رقم السورة: {surah.number}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    {surah.ayahsCount} آية
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Home Revision Guidance for Parents (Warsh Reading) */}
        <div className="p-4 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <Sparkles className="w-4 h-4 text-gold-600" />
            <span>إرشادات منزلية للأسرة لمراجعة هذا الجزء (برواية ورش عن نافع):</span>
          </div>

          <ul className="space-y-1.5 text-slate-700 leading-relaxed list-disc list-inside font-medium pr-1">
            <li>
              <strong>الاستماع المتكرر:</strong> تشغيل المصحف المرتل برواية ورش (طريق الأزرق) بصوت الشيخ الحصري أو الشيخ عبد الباسط لتثبيت ترقيق الراءات وتغليظ اللامات.
            </li>
            <li>
              <strong>المراجعة التراكمية اليومية:</strong> تخصيص 20 دقيقة يومياً قبل النوم لتكرار ورد الحفظ مع الابن غيباً.
            </li>
            <li>
              <strong>العناية بمد البدل:</strong> مراعاة توسط البدل (4 حركات) وفق ما يتلقاه الطالب في حلقة مسجد إبراهيم الخليل.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

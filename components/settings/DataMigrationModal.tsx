import React, { useState, useEffect } from 'react';
import {
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Download,
  ShieldCheck,
} from 'lucide-react';
import {
  detectLegacyLocalStorageData,
  parseLegacyJsonDump,
  validateAndSanitizeLegacyData,
  executeLegacyDataMigration,
} from '../../lib/dataMigrationService';
import {
  LegacyDatabaseDump,
  MigrationPreflightReport,
  MigrationExecutionReport,
} from '../../types/dataMigration.types';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface DataMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationSuccess?: () => void;
}

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationSuccess,
}) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState<'inspect' | 'migrating' | 'completed'>('inspect');
  const [legacyDump, setLegacyDump] = useState<LegacyDatabaseDump | null>(null);
  const [preflightReport, setPreflightReport] = useState<MigrationPreflightReport | null>(null);
  const [migrationReport, setMigrationReport] = useState<MigrationExecutionReport | null>(null);
  const [migratingProgress, setMigratingProgress] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step !== 'migrating') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // كشف البيانات تلقائياً عند الفتح
      const detected = detectLegacyLocalStorageData();
      setLegacyDump(detected);
      const { report } = validateAndSanitizeLegacyData(detected);
      setPreflightReport(report);
      setStep('inspect');
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // معالجة رفع ملف نسخة احتياطية قديمة
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseLegacyJsonDump(content);
        setLegacyDump(parsed);
        const { report } = validateAndSanitizeLegacyData(parsed);
        setPreflightReport(report);
        addNotification('نجاح', 'تم فحص ملف النسخة الاحتياطية وتطهير البيانات المرفوعة بنجاح.', 'success');
      } catch (err: any) {
        addNotification('خطأ', err.message || 'فشل فحص ملف النسخة الاحتياطية', 'error');
      }
    };
    reader.readAsText(file);
  };

  // تشغيل الترحيل
  const handleStartMigration = async () => {
    if (!legacyDump) return;

    setStep('migrating');
    setMigratingProgress(20);

    const timer1 = setTimeout(() => setMigratingProgress(60), 400);
    const timer2 = setTimeout(() => setMigratingProgress(90), 800);

    try {
      const report = await executeLegacyDataMigration(
        legacyDump,
        user?.email || 'admin@nebras.edu'
      );
      setMigratingProgress(100);
      setMigrationReport(report);
      setStep('completed');

      addNotification(
        'تم الترحيل بنجاح',
        `تم نقل وتطهير ${report.totalMigrated} سجلاً إلى البنية الحديثة بنجاح تام.`,
        'success'
      );

      if (onMigrationSuccess) {
        onMigrationSuccess();
      }
    } catch (err: any) {
      addNotification('خطأ', err.message || 'تعذر استكمال الترحيل', 'error');
      setStep('inspect');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
      onClick={() => {
        if (step !== 'migrating') onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-amiri text-slate-900">
                منظومة ترحيل وتطهير البيانات التاريخية (Data Migration)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                نقل بيانات الطلاب والاشتراكات القديمة إلى قاعدة بيانات Supabase الرسمية
              </p>
            </div>
          </div>

          {step !== 'migrating' && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP 1: INSPECTION & PREFLIGHT */}
        {step === 'inspect' && preflightReport && (
          <div className="space-y-5">
            {/* Summary Banner */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  إجمالي السجلات المكتشفة للترحيل:
                </span>
                <span className="text-2xl font-black font-mono text-emerald-900 mt-0.5 block">
                  {preflightReport.totalRecordsFound} سجلاً
                </span>
              </div>
              <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                جاهزة للترحيل العلائقي ✓
              </span>
            </div>

            {/* Entities Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold">الطلاب</span>
                <span className="text-base font-black font-mono text-slate-800">
                  {preflightReport.entitiesBreakdown.students || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold">المعلمون</span>
                <span className="text-base font-black font-mono text-slate-800">
                  {preflightReport.entitiesBreakdown.teachers || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold">القاعات</span>
                <span className="text-base font-black font-mono text-slate-800">
                  {preflightReport.entitiesBreakdown.halls || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold">سجلات الرسوم DZD</span>
                <span className="text-base font-black font-mono text-slate-800">
                  {preflightReport.entitiesBreakdown.fees || 0}
                </span>
              </div>
            </div>

            {/* Warnings or Sanitization Notices */}
            {preflightReport.issues.length > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>ملاحظات التطهير التلقائي للبيانات ({preflightReport.issues.length}):</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {preflightReport.issues.map((issue, idx) => (
                    <p key={idx} className="text-slate-700 text-[11px] leading-relaxed">
                      • {issue.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Upload External JSON Backup */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Upload className="w-4 h-4 text-slate-400 shrink-0" />
                <span>أو يمكنك استيراد ملف نسخة احتياطية قديمة (`.json`):</span>
              </div>
              <label className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer shrink-0">
                <span>اختيار ملف...</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleStartMigration}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-gold-300" />
                <span>بدء الترحيل والتطهير الآن</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MIGRATING (PROGRESS) */}
        {step === 'migrating' && (
          <div className="py-12 text-center space-y-5">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-700 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-base font-black font-amiri text-slate-900">
                جاري ترحيل وتطهير البيانات التاريخية...
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                تطبيق قواعد النزاهة العلائقية وتسجيل الرقابة في audit_logs
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${migratingProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-bold block">
                {migratingProgress}%
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED REPORT */}
        {step === 'completed' && migrationReport && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-black font-amiri text-emerald-950">
                اكتملت عملية الترحيل بنجاح تام 100%!
              </h4>
              <p className="text-xs text-emerald-800 font-medium max-w-md mx-auto leading-relaxed">
                {migrationReport.notes}
              </p>
              <span className="inline-block text-[10px] text-slate-400 font-mono bg-white px-3 py-1 rounded-full border border-emerald-200">
                معرف التوثيق الرقابي: {migrationReport.auditLogId}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-colors shadow-xs"
              >
                إغلاق والعودة للإعدادات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

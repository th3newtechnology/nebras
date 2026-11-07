import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Save,
  Download,
  Calendar,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building,
  FileText,
  Clock,
  History,
  Check,
  PlusCircle,
  Eye,
  Filter,
  Search,
  Lock,
  Database,
} from 'lucide-react';
import { DataMigrationModal } from '../components/settings/DataMigrationModal';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useSupabaseStatus } from '../hooks/useSupabaseStatus';
import { exportFullDB } from '../hooks/useLocalDB';
import {
  SchoolSettings,
  AcademicYearItem,
  AuditLogItem,
} from '../types/settings.types';
import {
  fetchSchoolSettings,
  updateSchoolSettings,
  fetchAcademicYears,
  createAcademicYear,
  setCurrentAcademicYear,
  fetchAuditLogs,
} from '../lib/settingsService';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  const { addNotification } = useNotifications();
  const supabaseStatus = useSupabaseStatus();

  // Tabs
  const [activeTab, setActiveTab] = useState<'profile' | 'years' | 'audit' | 'cloud'>('profile');

  // School Settings State
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Academic Years State
  const [academicYears, setAcademicYears] = useState<AcademicYearItem[]>([]);
  const [isCreatingYear, setIsCreatingYear] = useState(false);
  const [newYearName, setNewYearName] = useState('');
  const [newYearStart, setNewYearStart] = useState('');
  const [newYearEnd, setNewYearEnd] = useState('');
  const [newYearIsCurrent, setNewYearIsCurrent] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null);

  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [loadedSettings, loadedYears, loadedLogs] = await Promise.all([
          fetchSchoolSettings(),
          fetchAcademicYears(),
          fetchAuditLogs(),
        ]);
        setSettings(loadedSettings);
        setAcademicYears(loadedYears);
        setAuditLogs(loadedLogs);
      } catch (err) {
        console.error('خطأ في تحميل الإعدادات:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSavingSettings(true);
    try {
      const updated = await updateSchoolSettings(settings);
      setSettings(updated);
      addNotification('تم الحفظ', 'تم تحديث بيانات وإعدادات المدرسة بنجاح.', 'success');
    } catch (err: any) {
      addNotification('خطأ', err?.message || 'تعذر حفظ الإعدادات.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim() || !newYearStart || !newYearEnd) return;

    try {
      const created = await createAcademicYear({
        name: newYearName.trim(),
        startDate: newYearStart,
        endDate: newYearEnd,
        isCurrent: newYearIsCurrent,
      });

      const updated = await fetchAcademicYears();
      setAcademicYears(updated);
      setIsCreatingYear(false);
      setNewYearName('');
      setNewYearStart('');
      setNewYearEnd('');
      setNewYearIsCurrent(false);
      addNotification('تم الإضافة', `تم إنشاء العام الدراسي "${created.name}" بنجاح.`, 'success');
    } catch (err: any) {
      addNotification('خطأ', err?.message || 'تعذر إنشاء العام الدراسي.', 'error');
    }
  };

  const handleSetCurrentYear = async (year: AcademicYearItem) => {
    if (year.isCurrent) return;
    try {
      await setCurrentAcademicYear(year.id);
      const updated = await fetchAcademicYears();
      setAcademicYears(updated);
      addNotification('العام الدراسي النشط', `تم تعيين ${year.name} كعام دراسي نشط للمدرسة.`, 'success');
    } catch (err: any) {
      addNotification('خطأ', err?.message || 'تعذر تعيين العام الحالي.', 'error');
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !auditSearch ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entityType.toLowerCase().includes(auditSearch.toLowerCase());

    const matchesAction =
      auditActionFilter === 'all' || log.action === auditActionFilter;

    return matchesSearch && matchesAction;
  });

  if (!isAdmin) {
    return (
      <div className="py-24 text-center space-y-4" dir="rtl">
        <Lock className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-xl font-black text-slate-700">صلاحية محظورة</h3>
        <p className="text-sm text-slate-500">هذه الصفحة مخصصة لمديري النظام (ADMIN) فقط.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-900 text-gold-400 rounded-2xl shadow-md border border-emerald-800">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-amiri text-slate-900 tracking-tight">
              إعدادات النظام والرقابة
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              إدارة بيانات مدرسة نبراس، الأعوام الدراسية، وسجل التدقيق الرقابي المعتمد
            </p>
          </div>
        </div>

        {/* Cloud Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          <span className="text-slate-500">حالة الخادم:</span>
          {supabaseStatus.isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase متصل
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700 font-black">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              تخزين محلي (Offline)
            </span>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'profile'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>بيانات المدرسة والهوية</span>
        </button>

        <button
          onClick={() => setActiveTab('years')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'years'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>الأعوام الدراسية ({academicYears.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'audit'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجل التدقيق الرقابي ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'cloud'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>أمن البيانات والخادم السحابي</span>
        </button>
      </div>

      {/* Tab 1: School Profile */}
      {activeTab === 'profile' && settings && (
        <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-800">البيانات الرسمية للمدرسة</h3>
            <p className="text-xs text-slate-400 mt-1">تظهر هذه البيانات في الترويسات الرسمية والوصولات وسندات القبض</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">اسم الصرح القرآني *</label>
              <input
                type="text"
                required
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">التبعية والمسجد *</label>
              <input
                type="text"
                required
                value={settings.affiliation}
                onChange={(e) => setSettings({ ...settings, affiliation: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">العملة الافتراضية للمعاملات *</label>
              <input
                type="text"
                disabled
                value="الدينار الجزائري (DZD / د.ج)"
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">المنطقة الزمنية</label>
              <input
                type="text"
                disabled
                value={settings.timezone}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">العنوان الجغرافي</label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-sm font-bold text-slate-800 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">الرؤية التربوية</label>
              <textarea
                rows={3}
                value={settings.vision || ''}
                onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-medium text-slate-800 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">الرسالة والأهداف</label>
              <textarea
                rows={3}
                value={settings.message || ''}
                onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-600 outline-none text-xs font-medium text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl font-black text-sm shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Academic Years */}
      {activeTab === 'years' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800">إدارة الأعوام والسنوات الدراسية</h3>
              <p className="text-xs text-slate-400 mt-0.5">تحديد العام الدراسي الفعال لربط الحلقات، التسجيل، والرسوم</p>
            </div>
            <button
              onClick={() => setIsCreatingYear(!isCreatingYear)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة عام دراسي جديد</span>
            </button>
          </div>

          {/* Create Year Box */}
          {isCreatingYear && (
            <form onSubmit={handleCreateYear} className="bg-emerald-50/60 p-6 rounded-3xl border border-emerald-200 space-y-4 animate-in slide-in-from-top-2">
              <h4 className="font-black text-emerald-900 text-sm">بيانات العام الدراسي الجديد</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">مسمى العام الدراسي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 1448-1449 هـ / 2026-2027 م"
                    value={newYearName}
                    onChange={(e) => setNewYearName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ البداية *</label>
                  <input
                    type="date"
                    required
                    value={newYearStart}
                    onChange={(e) => setNewYearStart(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1.5">تاريخ النهاية *</label>
                  <input
                    type="date"
                    required
                    value={newYearEnd}
                    onChange={(e) => setNewYearEnd(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newYearIsCurrent}
                    onChange={(e) => setNewYearIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-700">تعيين مباشرة كعام دراسي نشط حالياً</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingYear(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black"
                  >
                    حفظ العام
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Academic Years Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-4">العام الدراسي</th>
                  <th className="p-4 text-center">تاريخ البداية</th>
                  <th className="p-4 text-center">تاريخ النهاية</th>
                  <th className="p-4 text-center">الحالة</th>
                  <th className="p-4 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {academicYears.map((year) => (
                  <tr key={year.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <span className="font-black text-slate-800 text-sm block">{year.name}</span>
                    </td>
                    <td className="p-4 text-center font-mono text-slate-600">{year.startDate}</td>
                    <td className="p-4 text-center font-mono text-slate-600">{year.endDate}</td>
                    <td className="p-4 text-center">
                      {year.isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          العام الحالي النشط
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">مؤرشف</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {!year.isCurrent && (
                        <button
                          onClick={() => handleSetCurrentYear(year)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl font-black text-xs transition-all active:scale-95"
                        >
                          تفعيل كعام نشط
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>سجل التدقيق الرقابي غير القابل للتعديل</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-mono">
                  Append-Only Immutable Ledger
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توثيق رقابي وقانوني صارم لكافة العمليات الحساسة في المدرسة محمي بزناد منع الحذف
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث في السجل..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
                  <tr>
                    <th className="p-4">نوع العملية</th>
                    <th className="p-4">الكيان المتأثر</th>
                    <th className="p-4">المسؤول المنفذ</th>
                    <th className="p-4 text-center">التوقيت</th>
                    <th className="p-4 text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-black text-emerald-800 text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-700">{log.entityType}</span>
                        {log.entityId && (
                          <span className="block text-[10px] font-mono text-slate-400">
                            #{log.entityId.slice(0, 8)}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.userRole}</span>
                      </td>
                      <td className="p-4 text-center font-mono text-slate-500 text-[11px]">
                        {new Date(log.createdAt).toLocaleString('ar-DZ')}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedAuditLog(log)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Cloud and Security */}
      {activeTab === 'cloud' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-600" />
                <span>حالة خادم Supabase السحابي</span>
              </h3>
              <button
                type="button"
                onClick={() => supabaseStatus.refresh()}
                disabled={supabaseStatus.isLoading}
                className="p-2 text-slate-400 hover:text-emerald-600 rounded-xl hover:bg-slate-50 transition-colors"
                title="إعادة فحص الاتصال"
              >
                <RefreshCw className={`w-4 h-4 ${supabaseStatus.isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">حالة الربط المباشر:</span>
                {supabaseStatus.isConnected ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-black border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> متصل وجاهز للإنتاج
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-black border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5" /> وضع العمل دون خادم (Offline)
                  </span>
                )}
              </div>

              {supabaseStatus.latencyMs !== undefined && (
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-200">
                  <span>زمن استجابة الخادم:</span>
                  <span className="font-mono text-emerald-700 font-bold">{supabaseStatus.latencyMs} ms</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {supabaseStatus.message}
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>النسخ الاحتياطي وأمن البيانات</span>
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              تضمن مدرسة نبراس حفظ كافة البيانات الأكاديمية والمالية مع إمكانية تصدير نسخة احتياطية فورية بتنسيق JSON.
            </p>

            <button
              onClick={exportFullDB}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50 rounded-2xl border border-slate-200 hover:border-emerald-200 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                <span className="text-xs font-black text-slate-700 group-hover:text-emerald-800">
                  تصدير نسخة احتياطية شاملة (JSON)
                </span>
              </div>
            </button>

            <button
              onClick={() => setIsMigrationModalOpen(true)}
              className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl border border-emerald-300 hover:border-emerald-400 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-700 transition-colors" />
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-950 block">
                    ترحيل واستيراد البيانات التاريخية (Data Migration)
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    كشف بيانات المتصفح القديمة أو رفع ملف نسخة احتياطية وتطهيرها علائقياً
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Data Migration Modal */}
      <DataMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        onMigrationSuccess={async () => {
          const loadedLogs = await fetchAuditLogs();
          setAuditLogs(loadedLogs);
        }}
      />

      {/* Audit Detail Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-800 text-sm">تفاصيل العملية الرقابية</h4>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {selectedAuditLog.action}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="font-bold text-slate-500">المسؤول:</span> {selectedAuditLog.userName} ({selectedAuditLog.userEmail})</p>
              <p><span className="font-bold text-slate-500">الكيان:</span> {selectedAuditLog.entityType} ({selectedAuditLog.entityId || '---'})</p>
              <p><span className="font-bold text-slate-500">عنوان IP:</span> <span className="font-mono">{selectedAuditLog.ipAddress || '---'}</span></p>
              <p><span className="font-bold text-slate-500">التاريخ:</span> <span className="font-mono">{new Date(selectedAuditLog.createdAt).toISOString()}</span></p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">البيانات الجديدة:</span>
              <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono overflow-x-auto text-slate-700 max-h-40">
                {JSON.stringify(selectedAuditLog.newData, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

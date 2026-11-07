import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Star,
  BookOpen,
  Calendar,
  User,
  Plus,
  Loader2,
  Award,
  Sparkles,
  RefreshCw,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Bookmark,
} from 'lucide-react';
import {
  MemorizationRecordItem,
  EvaluationItem,
  MemorizationRecordType,
  MemorizationGrade,
  EvaluationType,
} from '../types/pedagogical.types';
import { CircleItem, TeacherItem } from '../types/circle.types';
import {
  fetchMemorizationRecords,
  fetchEvaluations,
} from '../lib/pedagogicalService';
import { fetchCircles } from '../lib/circlesService';
import { fetchTeachers } from '../lib/teachersService';
import { NewMemorizationModal } from '../components/grades/NewMemorizationModal';
import { EvaluationFormModal } from '../components/grades/EvaluationFormModal';
import { useNotifications } from '../context/NotificationContext';

const GRADE_BADGE_STYLE: Record<MemorizationGrade, string> = {
  ممتاز: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  'جيد جداً': 'bg-sky-50 text-sky-800 border-sky-200',
  جيد: 'bg-amber-50 text-amber-800 border-amber-200',
  'يحتاج مراجعة': 'bg-rose-50 text-rose-800 border-rose-200',
};

const RECORD_TYPE_LABEL: Record<MemorizationRecordType, { label: string; style: string }> = {
  new_memorization: { label: 'حفظ جديد', style: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  minor_review: { label: 'مراجعة صغرى', style: 'bg-sky-50 text-sky-800 border-sky-200' },
  major_review: { label: 'مراجعة كبرى', style: 'bg-purple-50 text-purple-800 border-purple-200' },
};

const EVALUATION_TYPE_LABEL: Record<EvaluationType, string> = {
  memorization: 'اختبار حفظ',
  revision: 'اختبار مراجعة',
  tajweed: 'اختبار تجويد',
  behavior: 'تقييم سلوكي',
};

const Grades: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'memorization' | 'evaluations'>('memorization');

  const [memorizationRecords, setMemorizationRecords] = useState<MemorizationRecordItem[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');

  // Modals
  const [isNewMemorizationOpen, setIsNewMemorizationOpen] = useState(false);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);

  const { addNotification } = useNotifications();

  const loadData = async () => {
    setLoading(true);
    try {
      const [memRes, evalRes, cirRes, teaRes] = await Promise.all([
        fetchMemorizationRecords(),
        fetchEvaluations(),
        fetchCircles(),
        fetchTeachers(),
      ]);

      setMemorizationRecords(memRes.records);
      setEvaluations(evalRes.evaluations);
      setCircles(cirRes.circles);
      setTeachers(teaRes.teachers);
      setIsLive(memRes.isLive);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Memorization Records
  const filteredMemorization = useMemo(() => {
    return memorizationRecords.filter(r => {
      const matchesSearch =
        !searchTerm ||
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.surahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.registrationNumber.includes(searchTerm);

      const matchesCircle = selectedCircleId === 'all' || r.circleId === selectedCircleId;
      const matchesType = filterType === 'all' || r.recordType === filterType;
      const matchesGrade = filterGrade === 'all' || r.grade === filterGrade;

      return matchesSearch && matchesCircle && matchesType && matchesGrade;
    });
  }, [memorizationRecords, searchTerm, selectedCircleId, filterType, filterGrade]);

  // Filtered Evaluations
  const filteredEvaluations = useMemo(() => {
    return evaluations.filter(e => {
      const matchesSearch =
        !searchTerm ||
        e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.appreciation && e.appreciation.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCircle = selectedCircleId === 'all' || e.circleId === selectedCircleId;
      const matchesType = filterType === 'all' || e.evaluationType === filterType;

      return matchesSearch && matchesCircle && matchesType;
    });
  }, [evaluations, searchTerm, selectedCircleId, filterType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-islamic-950 via-islamic-900 to-islamic-800 text-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gold-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المتابعة القرآنية وسجل الإتقان</span>
              </span>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isLive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {isLive ? '● متصل بقاعدة البيانات' : '○ وضع العرض المحلي'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black font-amiri text-gold-300">
              دفتر المتابعة القرآنية وسجل الإتقان
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              توثيق جلسات التسميع اليومية للحفظ الجديد والمراجعة الصغرى والكبرى بدقة السور والآيات، ورصد نتائج الاختبارات الدورية وتدرج الإتقان لمسجد إبراهيم الخليل.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="طباعة السجل"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>طباعة السجل</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>

            <button
              onClick={() => setIsNewMemorizationOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-gold-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل تسميع / مراجعة</span>
            </button>

            <button
              onClick={() => setIsEvaluationOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-gold-300 font-bold rounded-xl text-xs transition-all border border-gold-400/30"
            >
              <Award className="w-4 h-4" />
              <span>رصد اختبار دوري</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveTab('memorization');
            setFilterType('all');
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'memorization'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-gold-400" />
          <span>دفتر التسميع والمتابعة اليومية ({memorizationRecords.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('evaluations');
            setFilterType('all');
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
            activeTab === 'evaluations'
              ? 'bg-islamic-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4 text-gold-400" />
          <span>سجل التقييمات والاختبارات الدورية ({evaluations.length})</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب، رقم القيد، أو السورة..."
              className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-islamic-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            {/* Circle Filter */}
            <select
              value={selectedCircleId}
              onChange={e => setSelectedCircleId(e.target.value)}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
            >
              <option value="all">جميع الحلقات</option>
              {circles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            {activeTab === 'memorization' ? (
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع أنواع التسميع</option>
                <option value="new_memorization">حفظ جديد</option>
                <option value="minor_review">مراجعة صغرى</option>
                <option value="major_review">مراجعة كبرى</option>
              </select>
            ) : (
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع أنواع الاختبارات</option>
                <option value="memorization">اختبار حفظ</option>
                <option value="revision">اختبار مراجعة</option>
                <option value="tajweed">اختبار تجويد</option>
                <option value="behavior">تقييم سلوكي</option>
              </select>
            )}

            {/* Grade Filter (only in memorization) */}
            {activeTab === 'memorization' && (
              <select
                value={filterGrade}
                onChange={e => setFilterGrade(e.target.value)}
                className="px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700"
              >
                <option value="all">جميع التقديرات</option>
                <option value="ممتاز">ممتاز</option>
                <option value="جيد جداً">جيد جداً</option>
                <option value="جيد">جيد</option>
                <option value="يحتاج مراجعة">يحتاج مراجعة</option>
              </select>
            )}
          </div>
        </div>
      </section>

      {/* Content: TAB 1 (Daily Memorization) */}
      {activeTab === 'memorization' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل سجلات التسميع اليومية...</p>
            </div>
          ) : filteredMemorization.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد سجلات تسميع مطابقة للبحث</p>
              <p className="text-xs">سجّل حصة تسميع جديدة للبدء بتوثيق محفوظات الطلاب</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase">
                  <tr>
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">تاريخ التسميع</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">نوع السجل</th>
                    <th className="p-4">السورة القرآنية والآيات</th>
                    <th className="p-4 text-center">الجزء</th>
                    <th className="p-4 text-center">درجة الإتقان</th>
                    <th className="p-4 text-center">الأخطاء (حفظ / تجويد)</th>
                    <th className="p-4">الملاحظات والتوجيه</th>
                    <th className="p-4">المحفظ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMemorization.map((item, idx) => {
                    const typeCfg = RECORD_TYPE_LABEL[item.recordType];
                    const gradeStyle = GRADE_BADGE_STYLE[item.grade];

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-4 font-mono text-slate-500 whitespace-nowrap">{item.date}</td>
                        <td className="p-4 whitespace-nowrap">
                          <strong className="font-black text-slate-900 font-amiri text-sm block">
                            {item.studentName}
                          </strong>
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.registrationNumber}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${typeCfg.style}`}
                          >
                            {typeCfg.label}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <strong className="text-slate-800 font-amiri text-sm">
                            سورة {item.surahName}
                          </strong>
                          <span className="text-[11px] font-mono text-slate-500 block">
                            الآيات: {item.ayahFrom} ⇦ {item.ayahTo}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                          جـ{item.juz}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${gradeStyle}`}>
                            {item.grade}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold whitespace-nowrap">
                          <span className="text-rose-600">{item.mistakesCount}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-amber-600">{item.tajweedMistakesCount}</span>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {item.notes ? `«${item.notes}»` : '—'}
                        </td>
                        <td className="p-4 text-slate-700 font-bold whitespace-nowrap">
                          {item.teacherName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Content: TAB 2 (Evaluations) */}
      {activeTab === 'evaluations' && (
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-islamic-800" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل سجلات الاختبارات والتقييمات...</p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="font-bold text-slate-700 text-sm">لا توجد تقييمات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/80 uppercase">
                  <tr>
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">تاريخ الاختبار</th>
                    <th className="p-4">اسم الطالب</th>
                    <th className="p-4">نوع الاختبار</th>
                    <th className="p-4 text-center">العلامة</th>
                    <th className="p-4 text-center">النسبة المئوية</th>
                    <th className="p-4 text-center">التقدير الإجمالي</th>
                    <th className="p-4">الملاحظات</th>
                    <th className="p-4">الممتحن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvaluations.map((evalItem, idx) => (
                    <tr key={evalItem.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-mono text-slate-500 whitespace-nowrap">{evalItem.date}</td>
                      <td className="p-4 whitespace-nowrap">
                        <strong className="font-black text-slate-900 font-amiri text-sm block">
                          {evalItem.studentName}
                        </strong>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[11px]">
                          {EVALUATION_TYPE_LABEL[evalItem.evaluationType]}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-black text-slate-800 text-sm whitespace-nowrap">
                        {evalItem.score} / {evalItem.maxScore}
                      </td>
                      <td className="p-4 text-center font-mono font-bold whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg ${
                            evalItem.percentage >= 90
                              ? 'bg-emerald-50 text-emerald-800'
                              : evalItem.percentage >= 75
                              ? 'bg-sky-50 text-sky-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {evalItem.percentage}%
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <strong className="text-islamic-900 font-bold">
                          {evalItem.appreciation || '—'}
                        </strong>
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">
                        {evalItem.notes || '—'}
                      </td>
                      <td className="p-4 text-slate-700 font-bold whitespace-nowrap">
                        {evalItem.teacherName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      <NewMemorizationModal
        isOpen={isNewMemorizationOpen}
        onClose={() => setIsNewMemorizationOpen(false)}
        onSuccess={loadData}
        circles={circles}
        teachers={teachers}
      />

      <EvaluationFormModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
        onSuccess={loadData}
        circles={circles}
        teachers={teachers}
      />
    </div>
  );
};

export default Grades;

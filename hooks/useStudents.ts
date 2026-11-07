import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StudentListItem,
  StudentFilterParams,
} from '../types/student.types';
import {
  fetchStudents,
  fetchFilterMetadata,
  exportStudentsToCSV,
} from '../lib/studentsService';

export interface UseStudentsReturn {
  students: StudentListItem[];
  loading: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLive: boolean;
  error: string | null;
  filters: StudentFilterParams;
  circlesList: { id: string; name: string; gender: string }[];
  academicYearsList: { id: string; name: string; isCurrent: boolean }[];
  setPage: (page: number) => void;
  setFilter: (key: keyof StudentFilterParams, value: any) => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  exportCSV: () => void;
}

const DEFAULT_FILTERS: StudentFilterParams = {
  search: '',
  circleId: 'all',
  gender: 'all',
  level: 'all',
  status: 'all',
  academicYearId: 'all',
  page: 1,
  pageSize: 10,
  sortBy: 'fullName',
  sortOrder: 'asc',
};

export const useStudents = (): UseStudentsReturn => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<StudentFilterParams>(DEFAULT_FILTERS);
  const [circlesList, setCirclesList] = useState<{ id: string; name: string; gender: string }[]>([]);
  const [academicYearsList, setAcademicYearsList] = useState<{ id: string; name: string; isCurrent: boolean }[]>([]);

  const isFetchingRef = useRef<boolean>(false);

  // جلب البيانات الوصفية للفلاتر
  useEffect(() => {
    let isMounted = true;
    const loadMetadata = async () => {
      const meta = await fetchFilterMetadata();
      if (isMounted) {
        setCirclesList(meta.circles);
        setAcademicYearsList(meta.academicYears);
      }
    };
    loadMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // جلب سجلات الطلاب
  const loadStudents = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchStudents(filters);
      setStudents(result.students);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setIsLive(result.isLive);
    } catch (err: unknown) {
      console.error('فشل جلب قائمة الطلاب:', err);
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [filters]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const setPage = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: Math.max(1, newPage) }));
  }, []);

  const setFilter = useCallback((key: keyof StudentFilterParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // إعادة التعيين للصفحة الأولى عند تغيير أي فلتر
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const exportCSV = useCallback(() => {
    exportStudentsToCSV(students);
  }, [students]);

  return {
    students,
    loading,
    totalCount,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
    isLive,
    error,
    filters,
    circlesList,
    academicYearsList,
    setPage,
    setFilter,
    resetFilters,
    refresh: loadStudents,
    exportCSV,
  };
};

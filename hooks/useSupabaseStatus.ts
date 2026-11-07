import { useState, useEffect, useCallback } from 'react';
import { checkSupabaseHealth, isSupabaseConfigured, SupabaseHealthResult } from '../lib/supabase';

export interface UseSupabaseStatusReturn {
  isConfigured: boolean;
  isConnected: boolean;
  isLoading: boolean;
  latencyMs?: number;
  message: string;
  error?: string;
  url?: string;
  refresh: () => Promise<void>;
}

export const useSupabaseStatus = (): UseSupabaseStatusReturn => {
  const [status, setStatus] = useState<SupabaseHealthResult>({
    ok: false,
    configured: isSupabaseConfigured(),
    message: isSupabaseConfigured() ? 'جاري فحص الاتصال...' : 'لم يتم إعداد المفاتيح بعد',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await checkSupabaseHealth();
      setStatus(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ غير متوقع';
      setStatus({
        ok: false,
        configured: isSupabaseConfigured(),
        message: `فشل التحقق: ${msg}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isConfigured: status.configured,
    isConnected: status.ok,
    isLoading,
    latencyMs: status.latencyMs,
    message: status.message,
    error: status.error,
    url: status.url,
    refresh: checkStatus,
  };
};

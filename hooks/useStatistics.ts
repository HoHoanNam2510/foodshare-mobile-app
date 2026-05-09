import { useState, useEffect, useCallback, useRef } from 'react';
import { getMyStatisticsApi } from '@/lib/statisticsApi';
import { IStatisticsQuery, IStatisticsData } from '@/types/statistics';

interface UseStatisticsReturn {
  data: IStatisticsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStatistics(query: IStatisticsQuery): UseStatisticsReturn {
  const [data, setData] = useState<IStatisticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dùng ref để debounce
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyStatisticsApi(queryRef.current);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Lỗi khi tải dữ liệu thống kê');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi kết nối';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      fetchData();
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

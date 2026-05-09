import api from '@/lib/axios';
import { IStatisticsQuery, IStatisticsResponse } from '@/types/statistics';

/**
 * Gọi API lấy thống kê cho user/store hiện tại.
 * @param query Các tham số lọc (range, from, to, compareFrom, compareTo, postType)
 * @returns Promise<IStatisticsResponse>
 */
export async function getMyStatisticsApi(
  query: IStatisticsQuery
): Promise<IStatisticsResponse> {
  const { data } = await api.get<IStatisticsResponse>('/statistics/me', {
    params: query,
  });
  return data;
}

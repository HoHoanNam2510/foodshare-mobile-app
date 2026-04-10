import api from '@/lib/axios';

import type { IPagination } from './voucherApi';

// =============================================
// TYPESCRIPT INTERFACES
// =============================================

export interface IPointLog {
  _id: string;
  userId: string;
  amount: number; // Số dương = cộng điểm, số âm = trừ điểm
  reason: string;
  referenceId?: string; // ID của Transaction hoặc Report
  createdAt: string;
}

export interface IPointHistoryResponse {
  currentPoints: number; // Tổng điểm hiện tại từ User.greenPoints
  logs: IPointLog[];
  pagination: IPagination;
}

// =============================================
// API FUNCTIONS
// =============================================

export async function getPointHistoryApi(params?: {
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: IPointHistoryResponse }> {
  const { data } = await api.get('/greenpoints/history', { params });
  // Normalize: backend returns { data: { greenPoints, logs }, pagination }
  // We reshape to { data: { currentPoints, logs, pagination } }
  return {
    success: data.success,
    data: {
      currentPoints: data.data?.greenPoints ?? 0,
      logs: data.data?.logs ?? [],
      pagination: data.pagination,
    },
  };
}

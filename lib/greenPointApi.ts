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

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type LeaderboardRole = 'USER' | 'STORE' | 'ALL';

export interface LeaderboardEntry {
  rank: number;
  points: number;
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
    role: 'USER' | 'STORE';
  };
}

export interface MyRankingSummaryItem {
  rank: number;
  points: number;
}

export interface LeaderboardResponseData {
  period: LeaderboardPeriod;
  role: LeaderboardRole;
  entries: LeaderboardEntry[];
  currentUserRank?: {
    rank: number;
    points: number;
  } | null;
  pagination: IPagination;
}

export interface MyRankingSummaryResponseData {
  daily?: MyRankingSummaryItem;
  weekly?: MyRankingSummaryItem;
  monthly?: MyRankingSummaryItem;
  yearly?: MyRankingSummaryItem;
}

export async function getLeaderboardApi(params?: {
  period?: LeaderboardPeriod;
  role?: LeaderboardRole;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: LeaderboardResponseData }> {
  const { data } = await api.get('/greenpoints/leaderboard', { params });
  const raw = data.data ?? {};
  // Backend trả về field "leaderboard" + entry dùng "periodPoints",
  // mobile interface dùng "entries" + "points" → normalize tại đây.
  return {
    success: data.success,
    data: {
      period: raw.period ?? params?.period ?? 'weekly',
      role: raw.role ?? params?.role ?? 'ALL',
      entries: (raw.leaderboard ?? []).map(
        (e: { rank: number; periodPoints?: number; points?: number; user: LeaderboardEntry['user'] }) => ({
          rank: e.rank,
          points: e.periodPoints ?? e.points ?? 0,
          user: e.user,
        })
      ),
      currentUserRank: raw.myRank ?? null,
      pagination: raw.pagination ?? {
        page: 1,
        limit: params?.limit ?? 20,
        total: 0,
        totalPages: 0,
      },
    },
  };
}

export async function getMyRankingSummaryApi(): Promise<{
  success: boolean;
  data: MyRankingSummaryResponseData;
}> {
  const { data } = await api.get('/greenpoints/ranking-summary');
  const raw = data.data ?? {};
  // Backend trả về { rank, periodPoints, totalPoints },
  // mobile interface dùng { rank, points } → normalize tại đây.
  function normalize(item?: {
    rank?: number | null;
    periodPoints?: number;
  }): MyRankingSummaryItem | undefined {
    if (!item || item.rank == null) return undefined;
    return { rank: item.rank, points: item.periodPoints ?? 0 };
  }
  return {
    success: data.success,
    data: {
      daily: normalize(raw.daily),
      weekly: normalize(raw.weekly),
      monthly: normalize(raw.monthly),
      yearly: normalize(raw.yearly),
    },
  };
}

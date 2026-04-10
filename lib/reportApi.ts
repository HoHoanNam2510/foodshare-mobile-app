import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export type ReportTargetType = 'POST' | 'USER' | 'TRANSACTION' | 'REVIEW';

export type ReportReason =
  | 'FOOD_SAFETY'
  | 'SCAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'NO_SHOW'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED' | 'WITHDRAWN';

export type ReportAction =
  | 'NONE'
  | 'POST_HIDDEN'
  | 'USER_WARNED'
  | 'USER_BANNED'
  | 'REFUNDED'
  | 'REVIEW_DELETED';

export interface IReport {
  _id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
  images: string[];
  status: ReportStatus;
  actionTaken: ReportAction;
  resolutionNote?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
  images: string[];
}

// ── POST /api/reports ──────────────────────────────────────────────────────

export async function createReportApi(
  payload: CreateReportPayload
): Promise<{ success: boolean; message: string; data: IReport }> {
  const { data } = await api.post('/reports', payload);
  return data;
}

export interface UpdateReportPayload {
  reason?: ReportReason;
  description?: string;
  images?: string[];
}

// ── PUT /api/reports/:id ───────────────────────────────────────────────────

export async function updateReportApi(
  reportId: string,
  payload: UpdateReportPayload
): Promise<{ success: boolean; message: string; data: IReport }> {
  const { data } = await api.put(`/reports/${reportId}`, payload);
  return data;
}

// ── DELETE /api/reports/:id ────────────────────────────────────────────────

export async function withdrawReportApi(
  reportId: string
): Promise<{ success: boolean; message: string; data: IReport }> {
  const { data } = await api.delete(`/reports/${reportId}`);
  return data;
}

// ── GET /api/reports/me ────────────────────────────────────────────────────

export async function getMyReportsApi(params?: {
  status?: ReportStatus;
}): Promise<{ success: boolean; data: IReport[] }> {
  const { data } = await api.get('/reports/me', { params });
  return data;
}

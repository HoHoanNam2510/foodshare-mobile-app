import api from '@/lib/axios';

export type NotificationType =
  | 'TRANSACTION'
  | 'RADAR'
  | 'SYSTEM'
  | 'VOUCHER'
  | 'FEEDBACK';

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  titleKey?: string;
  bodyKey?: string;
  bodyParams?: Record<string, string | number>;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedNotificationsResponse {
  success: boolean;
  data: INotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

export async function getMyNotificationsApi(
  page = 1,
  limit = 20
): Promise<PaginatedNotificationsResponse> {
  const res = await api.get<PaginatedNotificationsResponse>(
    `/notifications?page=${page}&limit=${limit}`
  );
  return res.data;
}

export async function getUnreadCountApi(): Promise<number> {
  const res = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return res.data.data.count;
}

export async function markAsReadApi(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsReadApi(): Promise<void> {
  await api.patch('/notifications/read-all');
}

export async function deleteNotificationApi(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}

export async function deleteAllReadApi(): Promise<number> {
  const res = await api.delete<{
    success: boolean;
    data: { deletedCount: number };
  }>('/notifications/read-all');
  return res.data.data.deletedCount;
}

export async function deleteManyNotificationsApi(
  ids: string[]
): Promise<number> {
  const res = await api.delete<{
    success: boolean;
    data: { deletedCount: number };
  }>('/notifications/batch', { data: { ids } });
  return res.data.data.deletedCount;
}

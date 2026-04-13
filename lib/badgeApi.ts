import api from '@/lib/axios';

// =============================================
// TYPESCRIPT INTERFACES
// =============================================

export type TriggerEvent =
  | 'PROFILE_COMPLETED'
  | 'POST_CREATED'
  | 'TRANSACTION_COMPLETED'
  | 'REVIEW_RECEIVED'
  | 'GREENPOINTS_AWARDED'
  | 'KYC_APPROVED';

export type TargetRole = 'USER' | 'STORE' | 'BOTH';

export interface IBadge {
  _id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  targetRole: TargetRole;
  triggerEvent: TriggerEvent;
  pointReward: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  // Enriched by getBadgeCatalog
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface IBadgeCatalogResponse {
  total: number;
  unlocked: number;
  badges: IBadge[];
}

export interface IUserBadge {
  _id: string;
  userId: string;
  badgeId: IBadge; // populated
  unlockedAt: string;
}

// =============================================
// API FUNCTIONS
// =============================================

/** Lấy toàn bộ catalog badge kèm trạng thái mở khóa của user hiện tại */
export async function getBadgeCatalogApi(): Promise<{
  success: boolean;
  data: IBadgeCatalogResponse;
}> {
  const { data } = await api.get('/badges/catalog');
  return data;
}

/** Lấy danh sách badge đã mở khóa của user hiện tại */
export async function getMyBadgesApi(): Promise<{
  success: boolean;
  data: IUserBadge[];
}> {
  const { data } = await api.get('/badges/my');
  return data;
}

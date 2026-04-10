import api from '@/lib/axios';

// =============================================
// TYPESCRIPT INTERFACES
// =============================================

// ── Voucher (dữ liệu gốc từ server) ──────────────────────────────────────
export interface IVoucher {
  _id: string;
  creatorId: string; // ID của Store đã tạo
  code: string; // VD: "FREESHIP50" — luôn uppercase
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number; // 50 (%) hoặc 10000 (VNĐ)
  pointCost: number; // Số GreenPoints cần để đổi
  totalQuantity: number;
  remainingQuantity: number;
  validFrom: string; // ISO date string
  validUntil: string; // ISO date string
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── UserVoucher (voucher trong ví user) ───────────────────────────────────
export interface IUserVoucher {
  _id: string;
  userId: string;
  voucherId: IVoucher; // Đã được populate từ server
  status: 'UNUSED' | 'USED' | 'EXPIRED';
  usedAt?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Pagination ────────────────────────────────────────────────────────────
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Form Body cho Store ───────────────────────────────────────────────────
export interface CreateVoucherBody {
  code: string;
  title: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  pointCost: number;
  totalQuantity: number;
  validFrom: string; // ISO date string
  validUntil: string;
}

export interface UpdateVoucherBody {
  title?: string;
  description?: string;
  validUntil?: string;
  // Lưu ý: discountType, discountValue, pointCost, code bị server chặn sửa nếu đã có user đổi
}

// ── Query Params ──────────────────────────────────────────────────────────
export type VoucherSortOption = 'newest' | 'pointCost_asc' | 'pointCost_desc';
export type VoucherStatusFilter = 'UNUSED' | 'USED' | 'EXPIRED';
export type DiscountTypeFilter = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'ALL';

// =============================================
// API FUNCTIONS — USER: Chợ Voucher
// =============================================

export async function getVoucherMarketApi(params?: {
  sort?: VoucherSortOption;
  discountType?: DiscountTypeFilter;
  page?: number;
  limit?: number;
}): Promise<{ success: boolean; data: IVoucher[]; pagination: IPagination }> {
  // Loại bỏ giá trị 'ALL' trước khi gửi lên server
  const cleanParams =
    params?.discountType === 'ALL'
      ? { ...params, discountType: undefined }
      : params;
  const { data } = await api.get('/vouchers/market', { params: cleanParams });
  return data;
}

// =============================================
// API FUNCTIONS — USER: Đổi điểm
// =============================================

export async function redeemVoucherApi(
  voucherId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(`/vouchers/${voucherId}/redeem`);
  return data;
}

// =============================================
// API FUNCTIONS — USER: Ví Voucher
// =============================================

export async function getMyVouchersApi(params?: {
  status?: VoucherStatusFilter;
}): Promise<{ success: boolean; data: IUserVoucher[] }> {
  const { data } = await api.get('/vouchers/me', { params });
  return data;
}

// =============================================
// API FUNCTIONS — STORE: Quản lý Voucher
// =============================================

export async function storeGetMyVouchersApi(): Promise<{
  success: boolean;
  data: IVoucher[];
}> {
  const { data } = await api.get('/vouchers/store/mine');
  return data;
}

export async function storeCreateVoucherApi(
  body: CreateVoucherBody
): Promise<{ success: boolean; data: IVoucher }> {
  const { data } = await api.post('/vouchers', body);
  return data;
}

export async function storeUpdateVoucherApi(
  voucherId: string,
  body: UpdateVoucherBody
): Promise<{ success: boolean; data: IVoucher }> {
  const { data } = await api.put(`/vouchers/${voucherId}`, body);
  return data;
}

export async function storeToggleVoucherApi(
  voucherId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.patch(`/vouchers/${voucherId}/toggle`);
  return data;
}

import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ITransactionPost {
  _id: string;
  title: string;
  images: string[];
  type: 'P2P_FREE' | 'B2C_MYSTERY_BAG';
  price: number;
}

export type TransactionStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ESCROWED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ITransaction {
  _id: string;
  postId: ITransactionPost;  // populated
  requesterId: string | ITransactionRequester; // string in list, populated object in detail
  ownerId: string;            // ObjectId string — người cho / cửa hàng
  type: 'REQUEST' | 'ORDER';
  quantity: number;
  status: TransactionStatus;
  paymentMethod: 'FREE' | 'MOMO' | 'ZALOPAY';
  verificationCode?: string;
  expiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Requester is populated in the owner-view endpoint
export interface ITransactionRequester {
  _id: string;
  fullName: string;
  avatar?: string;
  averageRating?: number;
}

export interface ITransactionAsOwner extends Omit<ITransaction, 'requesterId'> {
  requesterId: ITransactionRequester;
}

// ── GET /api/transactions/me ────────────────────────────────────────────────
// Lấy lịch sử giao dịch của người dùng hiện tại (với tư cách Người nhận)

export async function getMyTransactionsApi(): Promise<{
  success: boolean;
  data: ITransaction[];
}> {
  const { data } = await api.get('/transactions/me');
  return data;
}

// ── GET /api/transactions/:id ───────────────────────────────────────────────
// Xem chi tiết giao dịch theo ID — cả Receiver lẫn Donor đều dùng được

export async function getTransactionByIdApi(id: string): Promise<{
  success: boolean;
  data: ITransaction;
}> {
  const { data } = await api.get(`/transactions/${id}`);
  return data;
}

// ── PUT /api/transactions/requests/:id (action: DELETE) ────────────────────
// Receiver huỷ yêu cầu xin đồ đang PENDING

export async function cancelRequestApi(
  transactionId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.put(`/transactions/requests/${transactionId}`, {
    action: 'DELETE',
  });
  return data;
}

// ── POST /api/transactions/requests ────────────────────────────────────────
// Người nhận tạo yêu cầu xin đồ (P2P)

export async function createRequestApi(
  postId: string,
  quantity: number
): Promise<{ success: boolean; message: string; data: ITransaction }> {
  const { data } = await api.post('/transactions/requests', { postId, quantity });
  return data;
}

// ── POST /api/transactions/orders ───────────────────────────────────────────
// Người mua đặt túi mù (B2C)

export async function createOrderApi(
  postId: string,
  quantity: number,
  paymentMethod: 'MOMO' | 'ZALOPAY'
): Promise<{ success: boolean; message: string; data: ITransaction }> {
  const { data } = await api.post('/transactions/orders', { postId, quantity, paymentMethod });
  return data;
}

// ── GET /api/transactions/as-owner ─────────────────────────────────────────
// Xem giao dịch với tư cách Người cho / Cửa hàng (requesterId được populate)

export async function getMyTransactionsAsOwnerApi(): Promise<{
  success: boolean;
  data: ITransactionAsOwner[];
}> {
  const { data } = await api.get('/transactions/as-owner');
  return data;
}

// ── PATCH /api/transactions/:id/respond ────────────────────────────────────
// Người cho chấp nhận hoặc từ chối yêu cầu P2P

export async function respondToRequestApi(
  transactionId: string,
  response: 'ACCEPT' | 'REJECT'
): Promise<{ success: boolean; message: string; data: ITransactionAsOwner }> {
  const { data } = await api.patch(`/transactions/${transactionId}/respond`, { response });
  return data;
}

// ── POST /api/transactions/scan ─────────────────────────────────────────────
// Người nhận nhập/quét mã xác minh để hoàn tất giao dịch

export async function scanQrApi(verificationCode: string): Promise<{
  success: boolean;
  message: string;
  data: ITransaction;
}> {
  const { data } = await api.post('/transactions/scan', {
    qrCode: verificationCode,
  });
  return data;
}

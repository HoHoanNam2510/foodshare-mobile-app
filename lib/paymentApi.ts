import api from '@/lib/axios';
import type { IPaymentInfo } from '@/lib/transactionApi';

// ── GET /api/transactions/orders/:id/qr ───────────────────────────────────
// Lấy lại thông tin VietQR cho đơn hàng PENDING (dùng khi cần hiển thị lại QR)

export async function getPaymentQRApi(transactionId: string): Promise<{
  success: boolean;
  data: IPaymentInfo & { expiredAt: string };
}> {
  const { data } = await api.get(`/transactions/orders/${transactionId}/qr`);
  return data;
}

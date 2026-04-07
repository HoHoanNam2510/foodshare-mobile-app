import api from '@/lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface InitiatePaymentResult {
  payUrl: string;
  partnerTransId: string;
}

// ── POST /api/payment/initiate ─────────────────────────────────────────────
// Buyer gọi sau khi createOrder → nhận payUrl để mở cổng thanh toán

export async function initiatePaymentApi(
  transactionId: string,
  returnUrl?: string
): Promise<{ success: boolean; data: InitiatePaymentResult }> {
  const { data } = await api.post('/payment/initiate', {
    transactionId,
    returnUrl,
  });
  return data;
}

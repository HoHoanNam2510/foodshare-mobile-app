/**
 * Định dạng số thành tiền VND.
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Tính delta phần trăm giữa hai giá trị.
 * @returns object { value: number, sign: '+' | '-' | '' }
 */
export function formatPercentDelta(
  current: number,
  previous: number
): { value: number; sign: '+' | '-' | '' } {
  if (previous === 0) {
    return { value: current === 0 ? 0 : 100, sign: current > 0 ? '+' : '' };
  }
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
  return { value: Math.abs(delta), sign };
}

/**
 * Tính toán from/to Date từ preset range.
 */
export function getRangeFromPreset(preset: '7d' | '30d' | '12m'): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const to = new Date(now);
  let from: Date;

  switch (preset) {
    case '7d':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '12m':
      from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return { from, to };
}

/**
 * Kiểm tra hai khoảng thời gian có cùng độ dài (±1 ngày) không.
 */
export function validateCompareRange(
  range1: { from: Date; to: Date },
  range2: { from: Date; to: Date }
): boolean {
  const diff1 = range1.to.getTime() - range1.from.getTime();
  const diff2 = range2.to.getTime() - range2.from.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.abs(diff1 - diff2) <= oneDay;
}

import { useColorScheme } from 'nativewind';

// Tập trung toàn bộ hardcoded hex colors cần đổi theo theme.
// Dùng khi `style={{}}` không hỗ trợ Tailwind dark: prefix.
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    // ─── Icon & indicator accents ──────────────────────────────────────
    // primary-T40 → T60 (sáng hơn để readable trên nền tối)
    primaryGreen: isDark ? '#5CA051' : '#296C24',
    // primary-T50 → T70
    primaryGreenLight: isDark ? '#76BC69' : '#42863A',
    // secondary-T40 → T60
    secondaryOrange: isDark ? '#D97723' : '#944A00',

    // ─── Text ──────────────────────────────────────────────────────────
    // neutral-T10 → T90
    textPrimary: isDark ? '#E1E3E2' : '#191C1C',
    // neutral-T50 → T60
    textMuted: isDark ? '#8F9190' : '#757777',
    // neutral-T70 giữ nguyên (đủ contrast trên cả 2 nền)
    textDisabled: isDark ? '#757777' : '#AAABAB',

    // ─── Placeholder ───────────────────────────────────────────────────
    // neutral-T70 → T40 (trên input nền tối hơn)
    placeholder: isDark ? '#5C5F5E' : '#AAABAB',

    // ─── Backgrounds & surfaces ────────────────────────────────────────
    // Chip/pill/card tint nhẹ — neutral-T95 → T30
    surfaceSubtle: isDark ? '#454747' : '#F0F4F0',
    // primary tint rất nhẹ — primary-T95 → T20
    surfaceGreenTint: isDark ? '#003A03' : '#E8F5E2',
    // border của voucher/alert xanh lá nhạt
    borderGreenLight: isDark ? '#0A530C' : '#C8EFC0',
    // border primary-T80 → T30
    borderGreenMedium: isDark ? '#0A530C' : '#90D882',

    // ─── Shadows ───────────────────────────────────────────────────────
    shadowNeutral: '#191C1C',
    shadowPrimary: isDark ? '#42863A' : '#296C24',
    // opacity nhân tố: giảm bóng đổ ở dark mode
    shadowOpacityCard: isDark ? 0.0 : 0.07,
    shadowOpacityChat: isDark ? 0.0 : 0.08,

    // ─── Gradient (LinearGradient không nhận Tailwind class) ───────────
    loginGradient: isDark
      ? (['#003A03', '#2E3131', '#191C1C'] as const)
      : (['#ABF59C', '#FFDCC6', '#FFFFFF'] as const),

    // ─── Switch (React Native Switch component) ────────────────────────
    switchTrackFalse: isDark ? '#454747' : '#C5C7C6',
    switchTrackTrue: isDark ? '#42863A' : '#90D882',
    switchThumbActive: isDark ? '#5CA051' : '#296C24',
    switchThumbInactive: isDark ? '#5C5F5E' : '#AAABAB',

    // ─── Voucher status badge colors ───────────────────────────────────
    voucherUnused: {
      bg: isDark ? '#003A03' : '#ABF59C',
      text: isDark ? '#90D882' : '#002201',
    },
    voucherLocked: {
      bg: isDark ? '#2E2000' : '#FFF2CC',
      text: isDark ? '#F59E0B' : '#7A5F00',
    },
    voucherUsed: {
      bg: isDark ? '#454747' : '#E1E3E2',
      text: isDark ? '#AAABAB' : '#5C5F5E',
    },
    voucherExpired: {
      bg: isDark ? 'rgba(186,26,26,0.20)' : 'rgba(186,26,26,0.12)',
      text: isDark ? '#FF8080' : '#ba1a1a',
    },

    // ─── Post type badge (hardcoded trong post-detail, PostCard) ───────
    badgeP2P: {
      bg: isDark ? '#003A03' : '#296C24',
      text: '#FFFFFF',
    },
    badgeB2C: {
      bg: isDark ? '#4F2500' : '#944A00',
      text: '#FFFFFF',
    },

    // ─── Order confirm modal ───────────────────────────────────────────
    orderWarningBorder: isDark ? '#92400E' : '#F59E0B',
    orderWarningText: isDark ? '#FCD34D' : '#B45309',
    orderWarningBg: isDark ? '#292000' : '#FFFBEB',

    // ─── Review card ───────────────────────────────────────────────────
    reviewReplyBg: isDark ? '#2E3131' : '#F0F4F0',

    // ─── Map preview & explore ─────────────────────────────────────────
    mapPreviewImageBg: isDark ? '#2E3131' : '#F3F4F4',
  } as const;
}

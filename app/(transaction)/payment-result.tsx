import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import StackHeader from '@/components/shared/headers/StackHeader';

import {
  getTransactionByIdApi,
  type ITransaction,
  type TransactionStatus,
} from '@/lib/transactionApi';

// ── Status display config ───────────────────────────────────────────────────

const RESULT_CONFIG: Record<
  'success' | 'pending' | 'failed',
  { icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string; titleKey: string; subtitleKey: string }
> = {
  success: {
    icon: 'check-circle',
    color: '#296C24',
    bg: '#E8F5E3',
    titleKey: 'transaction.resultSuccessTitle',
    subtitleKey: 'transaction.resultSuccessSubtitle',
  },
  pending: {
    icon: 'hourglass-top',
    color: '#944A00',
    bg: '#FFF7ED',
    titleKey: 'transaction.resultPendingTitle',
    subtitleKey: 'transaction.resultPendingSubtitle',
  },
  failed: {
    icon: 'cancel',
    color: '#BE123C',
    bg: '#FFF1F2',
    titleKey: 'transaction.resultFailedTitle',
    subtitleKey: 'transaction.resultFailedSubtitle',
  },
};

// Map transaction status to result status
function getResultStatus(txnStatus?: TransactionStatus): 'success' | 'pending' | 'failed' {
  switch (txnStatus) {
    case 'ESCROWED':
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
    case 'REJECTED':
    case 'REFUNDED':
      return 'failed';
    default:
      return 'pending';
  }
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function PaymentResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { transactionId, status: initialStatus } = useLocalSearchParams<{
    transactionId: string;
    status?: string;
  }>();

  const [transaction, setTransaction] = useState<ITransaction | null>(null);
  const [resultStatus, setResultStatus] = useState<'success' | 'pending' | 'failed'>(
    (initialStatus as any) ?? 'pending'
  );
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);

  const MAX_POLLS = 12; // Poll for ~1 minute (5s intervals)

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) return;
    try {
      const res = await getTransactionByIdApi(transactionId);
      setTransaction(res.data);
      const status = getResultStatus(res.data.status);
      setResultStatus(status);
      // Stop polling if we got a final status
      if (status !== 'pending') {
        setIsPolling(false);
      }
    } catch {
      // Silently fail — keep polling
    }
  }, [transactionId]);

  // Poll for transaction status updates
  useEffect(() => {
    if (!transactionId) return;

    // Initial fetch
    fetchTransaction();

    if (!isPolling) return;

    const interval = setInterval(() => {
      setPollCount((prev) => {
        if (prev >= MAX_POLLS) {
          clearInterval(interval);
          setIsPolling(false);
          return prev;
        }
        fetchTransaction();
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [transactionId, isPolling, fetchTransaction]);

  const config = RESULT_CONFIG[resultStatus];

  return (
    <View className="flex-1 bg-neutral-DEFAULT">
      <StackHeader title={t('transaction.resultTitle')} />
      <View className="flex-1 items-center justify-center px-8 gap-6">
        {/* Status Icon */}
        <View
          className="w-24 h-24 rounded-full items-center justify-center"
          style={{ backgroundColor: config.bg }}
        >
          {resultStatus === 'pending' && isPolling ? (
            <ActivityIndicator size="large" color={config.color} />
          ) : (
            <MaterialIcons name={config.icon} size={48} color={config.color} />
          )}
        </View>

        {/* Title + Subtitle */}
        <View className="items-center gap-2">
          <Text className="font-sans font-extrabold text-2xl text-neutral-T10 text-center">
            {t(config.titleKey)}
          </Text>
          <Text className="font-body text-sm text-neutral-T50 text-center leading-5">
            {t(config.subtitleKey)}
          </Text>
        </View>

        {/* Transaction Info */}
        {transaction && (
          <View className="w-full bg-neutral-T100 rounded-2xl p-5 gap-3" style={styles.card}>
            <InfoRow label={t('transaction.orderIdLabel')} value={`#${transaction._id.slice(-8)}`} />
            {transaction.totalAmount != null && (
              <InfoRow
                label={t('transaction.totalAmountLabel')}
                value={`${transaction.totalAmount.toLocaleString('vi-VN')}đ`}
                bold
              />
            )}
            <InfoRow label={t('transaction.paymentMethodLabel')} value={transaction.paymentMethod} />
            {transaction.verificationCode && resultStatus === 'success' && (
              <>
                <View className="h-px bg-neutral-T90 my-1" />
                <View className="items-center gap-2 pt-1">
                  <Text className="font-label text-xs text-neutral-T50 uppercase tracking-wider">
                    {t('transaction.pickupCodeLabel')}
                  </Text>
                  <View className="bg-primary-T95 border border-primary-T70 rounded-xl px-6 py-3">
                    <Text className="font-mono text-xl font-bold text-primary-T30 tracking-widest text-center">
                      {transaction.verificationCode.slice(-8).toUpperCase()}
                    </Text>
                  </View>
                  <Text className="font-body text-xs text-neutral-T50 text-center">
                    {t('transaction.showCodeAtStore')}
                  </Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Retry polling */}
        {!isPolling && resultStatus === 'pending' && (
          <TouchableOpacity
            onPress={() => {
              setPollCount(0);
              setIsPolling(true);
            }}
            className="flex-row items-center gap-2"
          >
            <MaterialIcons name="refresh" size={18} color="#296C24" />
            <Text className="font-label font-semibold text-sm text-primary-T40">
              {t('transaction.checkAgainBtn')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Actions */}
      <View className="px-5 pb-6 gap-3">
        <TouchableOpacity
          className="w-full bg-primary-T40 rounded-2xl items-center justify-center py-4"
          activeOpacity={0.85}
          onPress={() => router.replace('/(transaction)/transaction-list' as any)}
        >
          <Text className="text-neutral-T100 font-sans font-bold text-base">
            {t('transaction.viewMyTransactionsBtn')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full items-center justify-center py-3"
          activeOpacity={0.7}
          onPress={() => router.replace('/(tabs)' as any)}
        >
          <Text className="font-label font-semibold text-sm text-neutral-T50">
            {t('transaction.backHomeBtn')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-body text-sm text-neutral-T50">{label}</Text>
      <Text
        className={`font-${bold ? 'sans font-extrabold' : 'body'} text-sm text-neutral-T10`}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
});

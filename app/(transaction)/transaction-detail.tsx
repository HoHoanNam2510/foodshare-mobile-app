// app/(transaction)/transaction-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import StackHeader from '@/components/shared/headers/StackHeader';

import QRCode from 'react-native-qrcode-svg';

import {
  cancelRequestApi,
  confirmReceiptApi,
  getTransactionByIdApi,
  scanQrApi,
  type ITransaction,
  type ITransactionRequester,
  type TransactionStatus,
} from '@/lib/transactionApi';
import { getOrCreateConversationApi } from '@/lib/chatApi';
import { getMyWrittenReviewsApi } from '@/lib/reviewApi';
import { useAuthStore } from '@/stores/authStore';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TransactionStatus,
  { labelKey: string; bg: string; text: string; icon: string }
> = {
  PENDING: {
    labelKey: 'transaction.statusPending',
    bg: '#FEF9C3',
    text: '#A16207',
    icon: 'hourglass-empty',
  },
  ACCEPTED: {
    labelKey: 'transaction.statusAccepted',
    bg: '#DBEAFE',
    text: '#1D4ED8',
    icon: 'check-circle',
  },
  COMPLETED: {
    labelKey: 'transaction.statusCompleted',
    bg: '#DCFCE7',
    text: '#15803D',
    icon: 'verified',
  },
  CANCELLED: {
    labelKey: 'transaction.statusCancelled',
    bg: '#F3F4F6',
    text: '#6B7280',
    icon: 'cancel',
  },
  REJECTED: {
    labelKey: 'transaction.statusRejected',
    bg: '#FEE2E2',
    text: '#DC2626',
    icon: 'block',
  },
};

// ── Workflow steps ────────────────────────────────────────────────────────────

const P2P_STEPS: { status: TransactionStatus; labelKey: string }[] = [
  { status: 'PENDING', labelKey: 'transaction.stepSendRequest' },
  { status: 'ACCEPTED', labelKey: 'transaction.stepAccepted' },
  { status: 'COMPLETED', labelKey: 'transaction.stepCompleted' },
];

function getStepIndex(status: TransactionStatus): number {
  if (status === 'COMPLETED') return 2;
  if (status === 'ACCEPTED') return 1;
  return 0;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View className="border-neutral-T90 flex-row items-center gap-3 border-b py-3">
      <View className="bg-neutral-T95 h-8 w-8 items-center justify-center rounded-lg">
        <MaterialIcons name={icon as any} size={16} color="#757777" />
      </View>
      <View className="flex-1">
        <Text className="font-label text-neutral-T50 text-[10px] uppercase tracking-wider">
          {label}
        </Text>
        <Text className="font-body text-neutral-T10 mt-0.5 text-sm font-semibold">
          {value}
        </Text>
      </View>
    </View>
  );
}

function BankInfoRow({
  label,
  value,
  copyable,
  highlight,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  highlight?: 'blue' | 'orange';
}) {
  const valueColor =
    highlight === 'blue'
      ? '#1D4ED8'
      : highlight === 'orange'
        ? '#C2410C'
        : undefined;

  return (
    <View className="flex-row items-center justify-between py-1">
      <Text className="font-body text-neutral-T50 text-sm">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Text
          className="font-sans text-sm font-semibold"
          style={valueColor ? { color: valueColor } : undefined}
        >
          {value}
        </Text>
        {copyable && (
          <TouchableOpacity
            onPress={async () => {
              await Clipboard.setStringAsync(value);
              Alert.alert('Đã sao chép', value);
            }}
          >
            <MaterialIcons name="content-copy" size={15} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function StatusTimeline({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const currentStep = getStepIndex(status);
  const isCancelledOrRejected = status === 'CANCELLED' || status === 'REJECTED';

  return (
    <View style={styles.card} className="bg-neutral-T100 gap-3 rounded-2xl p-5">
      <Text className="font-label text-neutral-T50 text-xs font-semibold uppercase tracking-wider">
        {t('transaction.progressTitle')}
      </Text>
      {isCancelledOrRejected ? (
        <View className="flex-row items-center gap-3">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-red-100">
            <MaterialIcons name="close" size={16} color="#DC2626" />
          </View>
          <Text className="font-body text-sm font-semibold text-red-600">
            {t(STATUS_CONFIG[status].labelKey)}
          </Text>
        </View>
      ) : (
        <View className="gap-0">
          {P2P_STEPS.map((step, i) => {
            const done = i <= currentStep;
            const isLast = i === P2P_STEPS.length - 1;
            return (
              <View key={step.status} className="flex-row gap-3">
                {/* Dot + line */}
                <View className="items-center" style={{ width: 32 }}>
                  <View
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: done ? '#296C24' : '#E5E7EB' }}
                  >
                    <MaterialIcons
                      name={done ? 'check' : 'radio-button-unchecked'}
                      size={16}
                      color={done ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                  {!isLast && (
                    <View
                      className="my-1 w-0.5 flex-1"
                      style={{
                        backgroundColor:
                          i < currentStep ? '#296C24' : '#E5E7EB',
                        minHeight: 20,
                      }}
                    />
                  )}
                </View>
                {/* Label */}
                <View className="justify-center pb-4">
                  <Text
                    className="font-body text-sm font-semibold"
                    style={{ color: done ? '#191C1C' : '#9CA3AF' }}
                  >
                    {t(step.labelKey)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ── QR Display for Donor ──────────────────────────────────────────────────────

function DonorQrSection({ verificationCode }: { verificationCode: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.card} className="bg-neutral-T100 gap-4 rounded-2xl p-5">
      <View className="gap-1">
        <Text className="text-neutral-T10 font-sans text-base font-bold">
          {t('transaction.qrVerifyTitle')}
        </Text>
        <Text className="font-body text-neutral-T50 text-xs leading-4">
          {t('transaction.qrVerifyDesc')}
        </Text>
      </View>

      {/* QR code image */}
      <View className="items-center py-2">
        <View
          style={styles.qrContainer}
          className="items-center gap-4 rounded-2xl bg-white p-5"
        >
          <View style={styles.qrCornerTL} />
          <View style={styles.qrCornerTR} />
          <View style={styles.qrCornerBL} />
          <View style={styles.qrCornerBR} />

          <QRCode
            value={verificationCode}
            size={180}
            color="#191C1C"
            backgroundColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Text code for manual input */}
      <View className="bg-neutral-T95 gap-2 rounded-xl p-4">
        <Text className="font-label text-neutral-T50 text-center text-[10px] uppercase tracking-wider">
          {t('transaction.orReadCode')}
        </Text>
        <Text
          className="font-body text-neutral-T10 text-center text-sm font-semibold leading-5"
          selectable
        >
          {verificationCode}
        </Text>
      </View>
    </View>
  );
}

// ── QR Scan Section for Receiver ──────────────────────────────────────────────

interface ReceiverScanSectionProps {
  onCompleted: () => void;
}

function ReceiverScanSection({ onCompleted }: ReceiverScanSectionProps) {
  const { t } = useTranslation();
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');
  const scannedRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleScanPress = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          t('transaction.cameraPermissionTitle'),
          t('transaction.cameraPermissionMsg'),
          [{ text: 'OK' }]
        );
        return;
      }
    }
    scannedRef.current = false;
    setShowCameraModal(true);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setShowCameraModal(false);
    setIsSubmitting(true);
    try {
      await scanQrApi(data.trim());
      Alert.alert(
        t('transaction.scanSuccessTitle'),
        t('transaction.scanSuccessMsg'),
        [{ text: 'OK', onPress: onCompleted }]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('transaction.invalidCodeMsg');
      Alert.alert(t('transaction.scanErrorTitle'), msg, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!codeInput.trim()) {
      setInputError(t('transaction.enterCodeTitle'));
      return;
    }
    setIsSubmitting(true);
    setInputError('');
    try {
      await scanQrApi(codeInput.trim());
      setShowManualModal(false);
      Alert.alert(
        t('transaction.scanSuccessTitle'),
        t('transaction.scanSuccessMsg'),
        [{ text: 'OK', onPress: onCompleted }]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('transaction.invalidCodeMsg');
      setInputError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View
        style={styles.card}
        className="bg-neutral-T100 gap-4 rounded-2xl p-5"
      >
        <View className="gap-1">
          <Text className="text-neutral-T10 font-sans text-base font-bold">
            {t('transaction.scanVerifyTitle')}
          </Text>
          <Text className="font-body text-neutral-T50 text-xs leading-4">
            {t('transaction.scanVerifyDesc')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleScanPress}
          activeOpacity={0.85}
          disabled={isSubmitting}
          className="bg-primary-T40 h-14 flex-row items-center justify-center gap-2 rounded-xl"
          style={styles.primaryBtn}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="qr-code-scanner" size={22} color="#FFFFFF" />
              <Text className="font-label text-neutral-T100 text-base font-bold">
                {t('transaction.scanQRBtn')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowManualModal(true)}
          activeOpacity={0.8}
          className="border-neutral-T80 h-12 flex-row items-center justify-center gap-2 rounded-xl border"
        >
          <MaterialIcons name="keyboard" size={18} color="#757777" />
          <Text className="font-label text-neutral-T50 text-sm font-semibold">
            {t('transaction.enterManualBtn')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Camera modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View className="flex-1 bg-black">
          {/* Close button */}
          <SafeAreaView
            edges={['top']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowCameraModal(false)}
              className="m-4 h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <MaterialIcons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />

          {/* Viewfinder overlay */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
            className="items-center justify-center"
          >
            <View style={styles.scanFrame} />
            <Text className="font-body mt-6 px-8 text-center text-sm text-white">
              {t('transaction.cameraHint')}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Manual input modal */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <View
            className="flex-1"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          >
            <TouchableOpacity
              className="flex-1"
              onPress={() => setShowManualModal(false)}
            />
            <View
              style={styles.bottomSheet}
              className="bg-neutral-T100 gap-5 rounded-t-3xl px-6 pb-8 pt-5"
            >
              <View className="bg-neutral-T80 h-1 w-10 self-center rounded-full" />

              <View className="gap-1">
                <Text className="text-neutral-T10 font-sans text-lg font-bold">
                  {t('transaction.enterCodeTitle')}
                </Text>
                <Text className="font-body text-neutral-T50 text-sm">
                  {t('transaction.enterCodeDesc')}
                </Text>
              </View>

              <View className="gap-2">
                <TextInput
                  value={codeInput}
                  onChangeText={(v) => {
                    setCodeInput(v);
                    setInputError('');
                  }}
                  placeholder={t('transaction.enterCodePlaceholder')}
                  placeholderTextColor="#AAABAB"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-neutral-T95 font-body text-neutral-T10 border-neutral-T90 h-14 rounded-xl border px-4"
                  style={inputError ? styles.inputError : undefined}
                />
                {!!inputError && (
                  <Text className="font-body text-xs text-red-500">
                    {inputError}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleManualSubmit}
                disabled={isSubmitting}
                activeOpacity={0.85}
                className="bg-primary-T40 h-14 items-center justify-center rounded-xl"
                style={styles.primaryBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label text-neutral-T100 text-base font-bold">
                    {t('common.confirm')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TransactionDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);

  const [transaction, setTransaction] = useState<ITransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // checkHasReviewed declared first — load() calls it when COMPLETED
  const checkHasReviewed = useCallback(async () => {
    try {
      const res = await getMyWrittenReviewsApi({ transactionId: id });
      setHasReviewed(res.data.length > 0);
    } catch {
      /* silent */
    }
  }, [id]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTransactionByIdApi(id);
      setTransaction(res.data);
      // Always check review status when transaction is COMPLETED
      if (res.data.status === 'COMPLETED') {
        checkHasReviewed();
      }
    } catch {
      setError(t('transaction.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id, checkHasReviewed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Primitive derived values — stable deps for the polling effect
  const txStatus = transaction?.status;
  const txType = transaction?.type;
  const txOwnerId = transaction?.ownerId;
  const txRequesterId = transaction
    ? typeof transaction.requesterId === 'object'
      ? transaction.requesterId._id
      : (transaction.requesterId as string)
    : undefined;
  const currentUserId = currentUser?._id;

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 3s for the passive party (P2P donor / B2C buyer) while ACCEPTED.
  // Calls checkHasReviewed directly when COMPLETED is detected — no intermediate useEffect chain.
  useEffect(() => {
    if (txStatus !== 'ACCEPTED' || !currentUserId) return;

    const isP2P = txType === 'REQUEST';
    const isPassiveParty =
      (isP2P && currentUserId === txOwnerId) ||
      (!isP2P && currentUserId === txRequesterId);

    if (!isPassiveParty) return;

    const intervalRef = { id: 0 as ReturnType<typeof setInterval> };
    intervalRef.id = setInterval(async () => {
      try {
        const res = await getTransactionByIdApi(id);
        setTransaction(res.data);
        if (res.data.status === 'COMPLETED') {
          clearInterval(intervalRef.id);
          checkHasReviewed();
        }
      } catch {
        /* silent */
      }
    }, 3000);
    return () => clearInterval(intervalRef.id);
  }, [
    txStatus,
    txType,
    txOwnerId,
    txRequesterId,
    id,
    currentUserId,
    checkHasReviewed,
  ]);

  // Re-check when returning to screen (e.g., back from create-review while component stays mounted)
  useFocusEffect(
    useCallback(() => {
      if (txStatus === 'COMPLETED') {
        checkHasReviewed();
      }
    }, [txStatus, checkHasReviewed])
  );

  if (isLoading) {
    return (
      <View className="bg-neutral flex-1">
        <StackHeader title={t('transaction.transactionDetail')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View className="bg-neutral flex-1">
        <StackHeader title={t('transaction.transactionDetail')} />
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="font-body text-neutral-T50 text-center text-sm">
            {error ?? t('transaction.notFound')}
          </Text>
          <TouchableOpacity
            onPress={load}
            className="bg-primary-T40 rounded-xl px-6 py-3"
            activeOpacity={0.85}
          >
            <Text className="font-label text-neutral-T100 font-semibold">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const tx = transaction;
  const post = tx.postId;
  const cfg = STATUS_CONFIG[tx.status];
  const isP2P = tx.type === 'REQUEST';

  // Role detection: requesterId có thể là string hoặc object populated
  const requesterId =
    typeof tx.requesterId === 'object' ? tx.requesterId._id : tx.requesterId;
  const isDonor = currentUser?._id === tx.ownerId;
  const isReceiver = currentUser?._id === requesterId;
  const showQrSection = tx.status === 'ACCEPTED';

  const handleChat = async () => {
    if (!currentUser) return;
    const otherId = isDonor
      ? (tx.requesterId as ITransactionRequester)._id
      : tx.ownerId;
    setIsChatting(true);
    try {
      const res = await getOrCreateConversationApi(otherId);
      const conv = res.data.data;
      const other = conv.participants.find((p) => p._id !== currentUser._id);
      router.push({
        pathname: '/(chat)/chat-detail',
        params: {
          conversationId: conv._id,
          name: other?.fullName ?? 'Người dùng',
          avatarUri: other?.avatar ?? '',
        },
      } as any);
    } catch {
      Alert.alert(t('common.error'), t('transaction.chatError'));
    } finally {
      setIsChatting(false);
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      t('transaction.cancelRequestTitle'),
      t('transaction.cancelRequestMsg'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('transaction.cancelRequest'),
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelRequestApi(tx._id);
              Alert.alert(
                t('transaction.cancelledAlertTitle'),
                t('transaction.cancelledRequestMsg'),
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (e: any) {
              Alert.alert(
                t('common.error'),
                e?.response?.data?.message ?? t('common.error')
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      t('transaction.cancelOrderAlertTitle'),
      t('transaction.cancelOrderAlertMsg'),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('transaction.cancelOrderDestructiveBtn'),
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelRequestApi(tx._id);
              Alert.alert(
                t('transaction.cancelledAlertTitle'),
                t('transaction.orderCancelledMsg'),
                [{ text: 'OK', onPress: () => router.back() }]
              );
            } catch (e: any) {
              Alert.alert(
                t('common.error'),
                e?.response?.data?.message ?? t('common.error')
              );
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const statusBadge = (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: cfg.bg }}
    >
      <Text
        className="font-label text-xs font-bold"
        style={{ color: cfg.text }}
      >
        {t(cfg.labelKey).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View className="bg-neutral flex-1">
      <StackHeader
        title={t('transaction.transactionDetail')}
        rightElement={statusBadge}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        <View className="gap-3 px-4 pt-4">
          {/* ── Post Info Card ── */}
          <View
            style={styles.card}
            className="bg-neutral-T100 gap-3 rounded-2xl p-5"
          >
            <Text className="font-label text-neutral-T50 text-[10px] font-semibold uppercase tracking-wider">
              {t('transaction.postSectionLabel')}
            </Text>
            <Text className="text-neutral-T10 font-sans text-lg font-bold leading-tight">
              {post?.title ?? 'Bài đăng đã bị xóa'}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              <View
                className="rounded-md px-2 py-1"
                style={{ backgroundColor: isP2P ? '#DCFCE7' : '#FEF3C7' }}
              >
                <Text
                  className="font-label text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: isP2P ? '#15803D' : '#92400E' }}
                >
                  {isP2P
                    ? t('transaction.p2pFreeLabel')
                    : t('transaction.b2cMysteryLabel')}
                </Text>
              </View>
              <View className="bg-neutral-T95 rounded-md px-2 py-1">
                <Text className="font-label text-neutral-T50 text-[10px] font-bold uppercase tracking-wider">
                  {t('transaction.qtyLabel')} {tx.quantity}
                </Text>
              </View>
              {!isP2P && (
                <View className="bg-neutral-T95 rounded-md px-2 py-1">
                  <Text className="font-label text-neutral-T50 text-[10px] font-bold uppercase tracking-wider">
                    {((post?.price ?? 0) * tx.quantity).toLocaleString('vi-VN')}
                    đ
                  </Text>
                </View>
              )}
            </View>

            <View className="bg-neutral-T90 h-px" />

            <InfoRow
              icon="event"
              label={t('transaction.createdAtLabel')}
              value={formatDate(tx.createdAt)}
            />
            <InfoRow
              icon="payment"
              label={t('transaction.paymentLabel')}
              value={tx.paymentMethod}
            />
          </View>

          {/* ── Role badge ── */}
          <View
            style={styles.card}
            className="bg-neutral-T100 flex-row items-center gap-3 rounded-2xl px-5 py-4"
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: isDonor ? '#DCFCE7' : '#EFF6FF' }}
            >
              <MaterialIcons
                name={isDonor ? 'volunteer-activism' : 'person'}
                size={20}
                color={isDonor ? '#15803D' : '#1D4ED8'}
              />
            </View>
            <View>
              <Text className="font-label text-neutral-T50 text-[10px] uppercase tracking-wider">
                {t('transaction.yourRoleLabel')}
              </Text>
              <Text className="text-neutral-T10 mt-0.5 font-sans text-sm font-bold">
                {isDonor
                  ? t('transaction.donorRoleFull')
                  : isReceiver
                    ? t('transaction.receiverRoleFull')
                    : t('transaction.participantRole')}
              </Text>
            </View>
          </View>

          {/* ── Contact other party ── */}
          <TouchableOpacity
            style={styles.card}
            className="bg-neutral-T100 flex-row items-center gap-3 rounded-2xl px-5 py-4"
            activeOpacity={0.8}
            onPress={handleChat}
            disabled={isChatting}
          >
            <View className="bg-primary-T95 h-10 w-10 items-center justify-center rounded-xl">
              <MaterialIcons
                name="chat-bubble-outline"
                size={20}
                color="#296C24"
              />
            </View>
            <View className="flex-1">
              <Text className="font-label text-neutral-T50 text-[10px] uppercase tracking-wider">
                {t('transaction.contactSectionLabel')}
              </Text>
              <Text className="text-neutral-T10 mt-0.5 font-sans text-sm font-bold">
                {isDonor
                  ? t('transaction.msgWithReceiver')
                  : t('transaction.msgWithDonor')}
              </Text>
            </View>
            {isChatting ? (
              <ActivityIndicator size="small" color="#296C24" />
            ) : (
              <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
            )}
          </TouchableOpacity>

          {/* ── Status Timeline ── */}
          {isP2P && <StatusTimeline status={tx.status} />}

          {/* ── QR Section (only when ACCEPTED) ── */}
          {showQrSection && isP2P && isDonor && tx.verificationCode && (
            <DonorQrSection verificationCode={tx.verificationCode} />
          )}

          {showQrSection && isP2P && isReceiver && (
            <ReceiverScanSection onCompleted={load} />
          )}

          {/* ── B2C ACCEPTED: Buyer — thông tin chuyển khoản thủ công ── */}
          {tx.status === 'ACCEPTED' &&
            !isP2P &&
            isReceiver &&
            tx.bankSnapshot && (
              <View
                style={styles.card}
                className="bg-neutral-T100 gap-3 rounded-2xl p-5"
              >
                <Text className="text-neutral-T10 font-sans text-base font-bold">
                  Thông tin chuyển khoản
                </Text>

                {tx.bankSnapshot.bankName && (
                  <BankInfoRow
                    label="Ngân hàng"
                    value={tx.bankSnapshot.bankName}
                  />
                )}
                <BankInfoRow
                  label="Số tài khoản"
                  value={tx.bankSnapshot.bankAccountNumber}
                  copyable
                />
                <BankInfoRow
                  label="Tên chủ TK"
                  value={tx.bankSnapshot.bankAccountName}
                />
                <BankInfoRow
                  label="Số tiền"
                  value={`${(tx.totalAmount ?? 0).toLocaleString('vi-VN')} ₫`}
                  highlight="blue"
                />
                <BankInfoRow
                  label="Nội dung CK"
                  value={tx.verificationCode ?? ''}
                  copyable
                  highlight="orange"
                />

                <View className="flex-row items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <MaterialIcons
                    name="info-outline"
                    size={16}
                    color="#B45309"
                    style={{ marginTop: 1 }}
                  />
                  <Text
                    className="font-body flex-1 text-xs leading-5"
                    style={{ color: '#92400E' }}
                  >
                    Nhập đúng nội dung chuyển khoản để cửa hàng xác nhận đúng
                    đơn của bạn.
                  </Text>
                </View>
              </View>
            )}

          {/* ── B2C ACCEPTED: Store — confirm receipt button ── */}
          {tx.status === 'ACCEPTED' && !isP2P && isDonor && (
            <View
              style={styles.card}
              className="bg-neutral-T100 gap-4 rounded-2xl p-5"
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-primary-T95 h-10 w-10 items-center justify-center rounded-xl">
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={20}
                    color="#296C24"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 font-sans text-sm font-bold">
                    {t('transaction.b2cConfirmReceiptTitle')}
                  </Text>
                  <Text className="font-body text-neutral-T50 mt-0.5 text-xs leading-4">
                    {t('transaction.b2cConfirmReceiptDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  setIsConfirming(true);
                  try {
                    await confirmReceiptApi(tx._id);
                    Alert.alert(
                      t('transaction.confirmReceiptSuccessTitle'),
                      t('transaction.confirmReceiptSuccessMsg'),
                      [{ text: 'OK', onPress: load }]
                    );
                  } catch (e: any) {
                    Alert.alert(
                      t('common.error'),
                      e?.response?.data?.message ?? t('common.error')
                    );
                  } finally {
                    setIsConfirming(false);
                  }
                }}
                disabled={isConfirming}
                activeOpacity={0.85}
                className="bg-primary-T40 h-14 flex-row items-center justify-center gap-2 rounded-xl"
                style={styles.primaryBtn}
              >
                {isConfirming ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons
                      name="check-circle-outline"
                      size={22}
                      color="#FFFFFF"
                    />
                    <Text className="font-label text-neutral-T100 text-base font-bold">
                      {t('transaction.confirmReceiptBtn')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* PENDING state — P2P: chờ người cho xác nhận */}
          {tx.status === 'PENDING' && isReceiver && isP2P && (
            <View
              style={styles.card}
              className="bg-neutral-T100 gap-4 rounded-2xl p-5"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-yellow-50">
                  <MaterialIcons
                    name="hourglass-empty"
                    size={20}
                    color="#A16207"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 font-sans text-sm font-bold">
                    {t('transaction.pendingDonorWaitTitle')}
                  </Text>
                  <Text className="font-body text-neutral-T50 mt-0.5 text-xs leading-4">
                    {t('transaction.pendingDonorWaitDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCancelRequest}
                disabled={isCancelling}
                activeOpacity={0.8}
                className="h-11 flex-row items-center justify-center gap-2 rounded-xl border border-red-200"
                style={{ backgroundColor: '#FEF2F2' }}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={16} color="#DC2626" />
                    <Text
                      className="font-label text-sm font-semibold"
                      style={{ color: '#DC2626' }}
                    >
                      {t('transaction.cancelRequest')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* PENDING state — B2C: chờ store xác nhận đơn */}
          {tx.status === 'PENDING' && isReceiver && !isP2P && (
            <View
              style={styles.card}
              className="bg-neutral-T100 gap-4 rounded-2xl p-5"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                  <MaterialIcons name="store" size={20} color="#B45309" />
                </View>
                <View className="flex-1">
                  <Text className="text-neutral-T10 font-sans text-sm font-bold">
                    {t('transaction.pendingB2CWaitTitle')}
                  </Text>
                  <Text className="font-body text-neutral-T50 mt-0.5 text-xs leading-4">
                    {t('transaction.pendingB2CWaitDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCancelOrder}
                disabled={isCancelling}
                activeOpacity={0.8}
                className="h-11 flex-row items-center justify-center gap-2 rounded-xl border border-red-200"
                style={{ backgroundColor: '#FEF2F2' }}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={16} color="#DC2626" />
                    <Text
                      className="font-label text-sm font-semibold"
                      style={{ color: '#DC2626' }}
                    >
                      {t('transaction.cancelOrderBtn')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {tx.status === 'PENDING' && isDonor && (
            <View
              style={styles.card}
              className="bg-neutral-T100 flex-row items-center gap-3 rounded-2xl p-5"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <MaterialIcons name="inbox" size={20} color="#1D4ED8" />
              </View>
              <View className="flex-1">
                <Text className="text-neutral-T10 font-sans text-sm font-bold">
                  {t('transaction.pendingForDonorTitle')}
                </Text>
                <Text className="font-body text-neutral-T50 mt-0.5 text-xs leading-4">
                  {t('transaction.pendingForDonorDesc')}
                </Text>
              </View>
            </View>
          )}

          {/* ── Review CTA (COMPLETED transactions) ── */}
          {tx.status === 'COMPLETED' && (isDonor || isReceiver) && (
            <TouchableOpacity
              style={styles.card}
              className={`flex-row items-center gap-3 rounded-2xl px-5 py-4 ${
                hasReviewed ? 'bg-neutral-T95' : 'bg-primary-T95'
              }`}
              activeOpacity={hasReviewed ? 1 : 0.8}
              disabled={hasReviewed}
              onPress={() => {
                const otherName = isDonor
                  ? typeof tx.requesterId === 'object'
                    ? tx.requesterId.fullName
                    : 'Người nhận'
                  : 'Người cho';
                router.push({
                  pathname: '/(review)/create-review',
                  params: {
                    transactionId: tx._id,
                    revieweeName: otherName,
                  },
                } as any);
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: hasReviewed ? '#E5E7EB' : '#296C24' }}
              >
                <MaterialIcons
                  name={hasReviewed ? 'check-circle' : 'star'}
                  size={20}
                  color={hasReviewed ? '#9CA3AF' : '#FFFFFF'}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-sans text-sm font-bold ${hasReviewed ? '' : 'text-primary-T10'}`}
                  style={hasReviewed ? { color: '#757777' } : undefined}
                >
                  {hasReviewed
                    ? t('transaction.reviewedCTATitle')
                    : t('transaction.reviewCTATitle')}
                </Text>
                <Text
                  className={`font-body mt-0.5 text-xs leading-4 ${hasReviewed ? '' : 'text-primary-T30'}`}
                  style={hasReviewed ? { color: '#AAABAB' } : undefined}
                >
                  {hasReviewed
                    ? t('transaction.reviewedCTADesc')
                    : t('transaction.reviewCTADesc')}
                </Text>
              </View>
              {!hasReviewed && (
                <MaterialIcons name="chevron-right" size={20} color="#296C24" />
              )}
            </TouchableOpacity>
          )}

          {/* ── Report transaction ── */}
          {(isDonor || isReceiver) && (
            <TouchableOpacity
              style={styles.card}
              className="bg-neutral-T100 flex-row items-center gap-3 rounded-2xl px-5 py-4"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(report)/create-report',
                  params: {
                    targetType: 'TRANSACTION',
                    targetId: tx._id,
                    targetTitle: post?.title ?? '',
                  },
                } as any)
              }
            >
              <View className="bg-neutral-T95 h-10 w-10 items-center justify-center rounded-xl">
                <MaterialIcons name="flag" size={20} color="#757777" />
              </View>
              <View className="flex-1">
                <Text className="font-label text-neutral-T50 text-[10px] uppercase tracking-wider">
                  {t('transaction.reportSectionLabel')}
                </Text>
                <Text className="text-neutral-T10 mt-0.5 font-sans text-sm font-bold">
                  {t('transaction.reportTransactionTitle')}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryBtn: {
    shadowColor: '#296C24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  qrContainer: {
    width: 220,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // QR corner decorations
  qrCornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#296C24',
    borderTopLeftRadius: 4,
  },
  qrCornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#296C24',
    borderTopRightRadius: 4,
  },
  qrCornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#296C24',
    borderBottomLeftRadius: 4,
  },
  qrCornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#296C24',
    borderBottomRightRadius: 4,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: '#296C24',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
});

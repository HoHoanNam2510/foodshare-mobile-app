// app/(transaction)/transaction-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  fileDisputeApi,
  getTransactionByIdApi,
  scanQrApi,
  type ITransaction,
  type ITransactionRequester,
  type TransactionStatus,
} from '@/lib/transactionApi';
import { getOrCreateConversationApi } from '@/lib/chatApi';
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
  ESCROWED: {
    labelKey: 'transaction.statusEscrowed',
    bg: '#F3E8FF',
    text: '#7E22CE',
    icon: 'lock',
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
  REFUNDED: {
    labelKey: 'transaction.statusRefunded',
    bg: '#FFF7ED',
    text: '#C2410C',
    icon: 'replay',
  },
  DISPUTED: {
    labelKey: 'transaction.statusDisputed',
    bg: '#FFF1F2',
    text: '#BE123C',
    icon: 'report-problem',
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
    <View className="flex-row items-center gap-3 py-3 border-b border-neutral-T90">
      <View className="w-8 h-8 rounded-lg bg-neutral-T95 items-center justify-center">
        <MaterialIcons name={icon as any} size={16} color="#757777" />
      </View>
      <View className="flex-1">
        <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
          {label}
        </Text>
        <Text className="font-body font-semibold text-sm text-neutral-T10 mt-0.5">
          {value}
        </Text>
      </View>
    </View>
  );
}

function StatusTimeline({ status }: { status: TransactionStatus }) {
  const { t } = useTranslation();
  const currentStep = getStepIndex(status);
  const isCancelledOrRejected = status === 'CANCELLED' || status === 'REJECTED';

  return (
    <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-3">
      <Text className="font-label font-semibold text-xs text-neutral-T50 uppercase tracking-wider">
        {t('transaction.progressTitle')}
      </Text>
      {isCancelledOrRejected ? (
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
            <MaterialIcons name="close" size={16} color="#DC2626" />
          </View>
          <Text className="font-body font-semibold text-sm text-red-600">
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
                    className="w-8 h-8 rounded-full items-center justify-center"
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
                      className="w-0.5 flex-1 my-1"
                      style={{
                        backgroundColor:
                          i < currentStep ? '#296C24' : '#E5E7EB',
                        minHeight: 20,
                      }}
                    />
                  )}
                </View>
                {/* Label */}
                <View className="pb-4 justify-center">
                  <Text
                    className="font-body font-semibold text-sm"
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
    <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-4">
      <View className="gap-1">
        <Text className="font-sans font-bold text-base text-neutral-T10">
          {t('transaction.qrVerifyTitle')}
        </Text>
        <Text className="font-body text-xs text-neutral-T50 leading-4">
          {t('transaction.qrVerifyDesc')}
        </Text>
      </View>

      {/* QR code image */}
      <View className="items-center py-2">
        <View
          style={styles.qrContainer}
          className="bg-white rounded-2xl p-5 items-center gap-4"
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
      <View className="bg-neutral-T95 rounded-xl p-4 gap-2">
        <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider text-center">
          {t('transaction.orReadCode')}
        </Text>
        <Text
          className="font-body font-semibold text-sm text-neutral-T10 text-center leading-5"
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
  transactionId: string;
  onCompleted: () => void;
}

function ReceiverScanSection({
  transactionId,
  onCompleted,
}: ReceiverScanSectionProps) {
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
        className="bg-neutral-T100 rounded-2xl p-5 gap-4"
      >
        <View className="gap-1">
          <Text className="font-sans font-bold text-base text-neutral-T10">
            {t('transaction.scanVerifyTitle')}
          </Text>
          <Text className="font-body text-xs text-neutral-T50 leading-4">
            {t('transaction.scanVerifyDesc')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleScanPress}
          activeOpacity={0.85}
          disabled={isSubmitting}
          className="h-14 bg-primary-T40 rounded-xl flex-row items-center justify-center gap-2"
          style={styles.primaryBtn}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="qr-code-scanner" size={22} color="#FFFFFF" />
              <Text className="font-label font-bold text-base text-neutral-T100">
                {t('transaction.scanQRBtn')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowManualModal(true)}
          activeOpacity={0.8}
          className="h-12 border border-neutral-T80 rounded-xl flex-row items-center justify-center gap-2"
        >
          <MaterialIcons name="keyboard" size={18} color="#757777" />
          <Text className="font-label font-semibold text-sm text-neutral-T50">
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
              className="m-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center"
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
            <Text className="text-white font-body text-sm mt-6 text-center px-8">
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
              className="bg-neutral-T100 rounded-t-3xl px-6 pt-5 pb-8 gap-5"
            >
              <View className="w-10 h-1 rounded-full bg-neutral-T80 self-center" />

              <View className="gap-1">
                <Text className="font-sans font-bold text-lg text-neutral-T10">
                  {t('transaction.enterCodeTitle')}
                </Text>
                <Text className="font-body text-sm text-neutral-T50">
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
                  className="bg-neutral-T95 rounded-xl px-4 h-14 font-body text-neutral-T10 border border-neutral-T90"
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
                className="h-14 bg-primary-T40 rounded-xl items-center justify-center"
                style={styles.primaryBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label font-bold text-base text-neutral-T100">
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
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeError, setDisputeError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTransactionByIdApi(id);
      setTransaction(res.data);
    } catch {
      setError(t('transaction.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral">
        <StackHeader title={t('transaction.transactionDetail')} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View className="flex-1 bg-neutral">
        <StackHeader title={t('transaction.transactionDetail')} />
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">
            {error ?? t('transaction.notFound')}
          </Text>
          <TouchableOpacity
            onPress={load}
            className="px-6 py-3 bg-primary-T40 rounded-xl"
            activeOpacity={0.85}
          >
            <Text className="font-label font-semibold text-neutral-T100">
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
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg }}
    >
      <Text
        className="font-label font-bold text-xs"
        style={{ color: cfg.text }}
      >
        {t(cfg.labelKey).toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-neutral">
      <StackHeader
        title={t('transaction.transactionDetail')}
        rightElement={statusBadge}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        <View className="px-4 gap-3 pt-4">
          {/* ── Post Info Card ── */}
          <View
            style={styles.card}
            className="bg-neutral-T100 rounded-2xl p-5 gap-3"
          >
            <Text className="font-label font-semibold text-[10px] text-neutral-T50 uppercase tracking-wider">
              {t('transaction.postSectionLabel')}
            </Text>
            <Text className="font-sans font-bold text-lg text-neutral-T10 leading-tight">
              {post.title}
            </Text>

            <View className="flex-row gap-2 flex-wrap">
              <View
                className="px-2 py-1 rounded-md"
                style={{ backgroundColor: isP2P ? '#DCFCE7' : '#FEF3C7' }}
              >
                <Text
                  className="font-label font-bold text-[10px] uppercase tracking-wider"
                  style={{ color: isP2P ? '#15803D' : '#92400E' }}
                >
                  {isP2P
                    ? t('transaction.p2pFreeLabel')
                    : t('transaction.b2cMysteryLabel')}
                </Text>
              </View>
              <View className="px-2 py-1 rounded-md bg-neutral-T95">
                <Text className="font-label font-bold text-[10px] text-neutral-T50 uppercase tracking-wider">
                  {t('transaction.qtyLabel')} {tx.quantity}
                </Text>
              </View>
              {!isP2P && (
                <View className="px-2 py-1 rounded-md bg-neutral-T95">
                  <Text className="font-label font-bold text-[10px] text-neutral-T50 uppercase tracking-wider">
                    {(post.price * tx.quantity).toLocaleString('vi-VN')}đ
                  </Text>
                </View>
              )}
            </View>

            <View className="h-px bg-neutral-T90" />

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
            {tx.expiredAt && (
              <InfoRow
                icon="schedule"
                label={t('transaction.paymentExpiryLabel')}
                value={formatDate(tx.expiredAt)}
              />
            )}
          </View>

          {/* ── Role badge ── */}
          <View
            style={styles.card}
            className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-3"
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: isDonor ? '#DCFCE7' : '#EFF6FF' }}
            >
              <MaterialIcons
                name={isDonor ? 'volunteer-activism' : 'person'}
                size={20}
                color={isDonor ? '#15803D' : '#1D4ED8'}
              />
            </View>
            <View>
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                {t('transaction.yourRoleLabel')}
              </Text>
              <Text className="font-sans font-bold text-sm text-neutral-T10 mt-0.5">
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
            className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-3"
            activeOpacity={0.8}
            onPress={handleChat}
            disabled={isChatting}
          >
            <View className="w-10 h-10 rounded-xl bg-primary-T95 items-center justify-center">
              <MaterialIcons
                name="chat-bubble-outline"
                size={20}
                color="#296C24"
              />
            </View>
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                {t('transaction.contactSectionLabel')}
              </Text>
              <Text className="font-sans font-bold text-sm text-neutral-T10 mt-0.5">
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
          {showQrSection && isDonor && tx.verificationCode && (
            <DonorQrSection verificationCode={tx.verificationCode} />
          )}

          {showQrSection && isReceiver && (
            <ReceiverScanSection transactionId={tx._id} onCompleted={load} />
          )}

          {/* ── B2C ESCROWED: Buyer verification + dispute ── */}
          {tx.status === 'ESCROWED' &&
            !isP2P &&
            isReceiver &&
            tx.verificationCode && (
              <View
                style={styles.card}
                className="bg-neutral-T100 rounded-2xl p-5 gap-4"
              >
                <View className="gap-1">
                  <Text className="font-sans font-bold text-base text-neutral-T10">
                    {t('transaction.b2cPickupCodeTitle')}
                  </Text>
                  <Text className="font-body text-xs text-neutral-T50 leading-4">
                    {t('transaction.b2cPickupCodeDesc')}
                  </Text>
                </View>
                <View className="bg-primary-T95 border border-primary-T70 rounded-xl px-6 py-4 items-center">
                  <Text
                    className="font-body font-bold text-xl text-primary-T30 tracking-widest text-center"
                    selectable
                  >
                    {tx.verificationCode.slice(-8).toUpperCase()}
                  </Text>
                </View>
              </View>
            )}

          {tx.status === 'ESCROWED' && !isP2P && isDonor && (
            <ReceiverScanSection transactionId={tx._id} onCompleted={load} />
          )}

          {/* ── Dispute button for buyer on ESCROWED B2C orders ── */}
          {tx.status === 'ESCROWED' && !isP2P && isReceiver && (
            <View
              style={styles.card}
              className="bg-neutral-T100 rounded-2xl p-5 gap-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center">
                  <MaterialIcons
                    name="report-problem"
                    size={20}
                    color="#BE123C"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">
                    {t('transaction.issueSectionTitle')}
                  </Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    {t('transaction.issueSectionDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setDisputeReason('');
                  setDisputeError('');
                  setShowDisputeModal(true);
                }}
                activeOpacity={0.8}
                className="h-11 border border-rose-200 rounded-xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: '#FFF1F2' }}
              >
                <MaterialIcons
                  name="report-problem"
                  size={16}
                  color="#BE123C"
                />
                <Text
                  className="font-label font-semibold text-sm"
                  style={{ color: '#BE123C' }}
                >
                  {t('transaction.fileDisputeBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Disputed info ── */}
          {tx.status === 'DISPUTED' && tx.disputeReason && (
            <View
              style={styles.card}
              className="bg-neutral-T100 rounded-2xl p-5 gap-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center">
                  <MaterialIcons
                    name="report-problem"
                    size={20}
                    color="#BE123C"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">
                    {t('transaction.disputedTitle')}
                  </Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    {t('transaction.disputedDesc')}
                  </Text>
                </View>
              </View>
              <View className="bg-rose-50 rounded-xl p-4">
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider mb-1">
                  {t('transaction.disputeReasonLabel')}
                </Text>
                <Text className="font-body text-sm text-neutral-T10">
                  {tx.disputeReason}
                </Text>
              </View>
            </View>
          )}

          {/* ── Refund info ── */}
          {tx.status === 'REFUNDED' && (
            <View
              style={styles.card}
              className="bg-neutral-T100 rounded-2xl p-5 gap-3"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                  <MaterialIcons name="replay" size={20} color="#C2410C" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">
                    {t('transaction.refundedTitle')}
                  </Text>
                  {tx.refundReason && (
                    <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                      {tx.refundReason}
                    </Text>
                  )}
                </View>
              </View>
              {tx.refundedAt && (
                <Text className="font-body text-xs text-neutral-T50">
                  {t('transaction.refundedAtLabel')} {formatDate(tx.refundedAt)}
                </Text>
              )}
            </View>
          )}

          {/* PENDING state — P2P: chờ người cho xác nhận */}
          {tx.status === 'PENDING' && isReceiver && isP2P && (
            <View
              style={styles.card}
              className="bg-neutral-T100 rounded-2xl p-5 gap-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center">
                  <MaterialIcons
                    name="hourglass-empty"
                    size={20}
                    color="#A16207"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">
                    {t('transaction.pendingDonorWaitTitle')}
                  </Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    {t('transaction.pendingDonorWaitDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleCancelRequest}
                disabled={isCancelling}
                activeOpacity={0.8}
                className="h-11 border border-red-200 rounded-xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: '#FEF2F2' }}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={16} color="#DC2626" />
                    <Text
                      className="font-label font-semibold text-sm"
                      style={{ color: '#DC2626' }}
                    >
                      {t('transaction.cancelRequest')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* PENDING state — B2C: chờ chuyển khoản */}
          {tx.status === 'PENDING' && isReceiver && !isP2P && (
            <View
              style={styles.card}
              className="bg-neutral-T100 rounded-2xl p-5 gap-4"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center">
                  <MaterialIcons
                    name="account-balance"
                    size={20}
                    color="#B45309"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">
                    {t('transaction.pendingB2CWaitTitle')}
                  </Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    {t('transaction.pendingB2CWaitDesc')}
                  </Text>
                </View>
              </View>
              {tx.expiredAt && (
                <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex-row items-center gap-2">
                  <MaterialIcons name="schedule" size={15} color="#B45309" />
                  <Text className="font-body text-xs text-amber-800">
                    {t('transaction.expiresLabel')} {formatDate(tx.expiredAt)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/(transaction)/payment',
                    params: { transactionId: tx._id },
                  } as any)
                }
                activeOpacity={0.85}
                className="h-12 rounded-xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: '#296C24' }}
              >
                <MaterialIcons name="qr-code" size={18} color="#FFFFFF" />
                <Text
                  className="font-label font-bold text-base"
                  style={{ color: '#FFFFFF' }}
                >
                  {t('transaction.continuePaymentBtn')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelOrder}
                disabled={isCancelling}
                activeOpacity={0.8}
                className="h-11 border border-red-200 rounded-xl flex-row items-center justify-center gap-2"
                style={{ backgroundColor: '#FEF2F2' }}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={16} color="#DC2626" />
                    <Text
                      className="font-label font-semibold text-sm"
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
              className="bg-neutral-T100 rounded-2xl p-5 flex-row items-center gap-3"
            >
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                <MaterialIcons name="inbox" size={20} color="#1D4ED8" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-bold text-sm text-neutral-T10">
                  {t('transaction.pendingForDonorTitle')}
                </Text>
                <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                  {t('transaction.pendingForDonorDesc')}
                </Text>
              </View>
            </View>
          )}

          {/* ── Review CTA (COMPLETED transactions) ── */}
          {tx.status === 'COMPLETED' && (isDonor || isReceiver) && (
            <TouchableOpacity
              style={styles.card}
              className="bg-primary-T95 rounded-2xl px-5 py-4 flex-row items-center gap-3"
              activeOpacity={0.8}
              onPress={() => {
                const otherId = isDonor
                  ? typeof tx.requesterId === 'object'
                    ? tx.requesterId._id
                    : tx.requesterId
                  : tx.ownerId;
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
              <View className="w-10 h-10 rounded-xl bg-primary-T40 items-center justify-center">
                <MaterialIcons name="star" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-bold text-sm text-primary-T10">
                  {t('transaction.reviewCTATitle')}
                </Text>
                <Text className="font-body text-xs text-primary-T30 mt-0.5 leading-4">
                  {t('transaction.reviewCTADesc')}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#296C24" />
            </TouchableOpacity>
          )}

          {/* ── Report transaction ── */}
          {(isDonor || isReceiver) && (
            <TouchableOpacity
              style={styles.card}
              className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-3"
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(report)/create-report',
                  params: {
                    targetType: 'TRANSACTION',
                    targetId: tx._id,
                    targetTitle: post.title,
                  },
                } as any)
              }
            >
              <View className="w-10 h-10 rounded-xl bg-neutral-T95 items-center justify-center">
                <MaterialIcons name="flag" size={20} color="#757777" />
              </View>
              <View className="flex-1">
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                  {t('transaction.reportSectionLabel')}
                </Text>
                <Text className="font-sans font-bold text-sm text-neutral-T10 mt-0.5">
                  {t('transaction.reportTransactionTitle')}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#AAABAB" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ── Dispute modal ── */}
      <Modal
        visible={showDisputeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisputeModal(false)}
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
              onPress={() => setShowDisputeModal(false)}
            />
            <View
              style={styles.bottomSheet}
              className="bg-neutral-T100 rounded-t-3xl px-6 pt-5 pb-8 gap-5"
            >
              <View className="w-10 h-1 rounded-full bg-neutral-T80 self-center" />

              <View className="gap-1">
                <Text className="font-sans font-bold text-lg text-neutral-T10">
                  {t('transaction.disputeModalTitle')}
                </Text>
                <Text className="font-body text-sm text-neutral-T50">
                  {t('transaction.disputeModalDesc')}
                </Text>
              </View>

              <View className="gap-2">
                <TextInput
                  value={disputeReason}
                  onChangeText={(t) => {
                    setDisputeReason(t);
                    setDisputeError('');
                  }}
                  placeholder={t('transaction.disputePlaceholder')}
                  placeholderTextColor="#AAABAB"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-neutral-T95 rounded-xl px-4 py-3 font-body text-neutral-T10 border border-neutral-T90"
                  style={[
                    { minHeight: 100 },
                    disputeError ? styles.inputError : undefined,
                  ]}
                />
                {!!disputeError && (
                  <Text className="font-body text-xs text-red-500">
                    {disputeError}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={async () => {
                  if (disputeReason.trim().length < 10) {
                    setDisputeError(t('transaction.disputeMinCharsError'));
                    return;
                  }
                  setIsDisputing(true);
                  try {
                    await fileDisputeApi(tx._id, disputeReason.trim());
                    setShowDisputeModal(false);
                    Alert.alert(
                      t('transaction.disputeSentTitle'),
                      t('transaction.disputeSentMsg'),
                      [{ text: 'OK', onPress: load }]
                    );
                  } catch (e: any) {
                    setDisputeError(
                      e?.response?.data?.message ?? t('common.error')
                    );
                  } finally {
                    setIsDisputing(false);
                  }
                }}
                disabled={isDisputing}
                activeOpacity={0.85}
                className="h-14 rounded-xl items-center justify-center"
                style={{ backgroundColor: '#BE123C' }}
              >
                {isDisputing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-label font-bold text-base text-neutral-T100">
                    {t('transaction.sendDisputeBtn')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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

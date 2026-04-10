// app/(transaction)/transaction-detail.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { cancelRequestApi, fileDisputeApi, getTransactionByIdApi, scanQrApi, type ITransaction, type ITransactionRequester, type TransactionStatus } from '@/lib/transactionApi';
import { getOrCreateConversationApi } from '@/lib/chatApi';
import { useAuthStore } from '@/stores/authStore';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TransactionStatus, { label: string; bg: string; text: string; icon: string }> = {
  PENDING:   { label: 'Chờ xác nhận', bg: '#FEF9C3', text: '#A16207', icon: 'hourglass-empty' },
  ACCEPTED:  { label: 'Đã chấp nhận', bg: '#DBEAFE', text: '#1D4ED8', icon: 'check-circle' },
  ESCROWED:  { label: 'Đã thanh toán', bg: '#F3E8FF', text: '#7E22CE', icon: 'lock' },
  COMPLETED: { label: 'Hoàn thành',   bg: '#DCFCE7', text: '#15803D', icon: 'verified' },
  CANCELLED: { label: 'Đã hủy',       bg: '#F3F4F6', text: '#6B7280', icon: 'cancel' },
  REJECTED:  { label: 'Đã từ chối',   bg: '#FEE2E2', text: '#DC2626', icon: 'block' },
  REFUNDED:  { label: 'Đã hoàn tiền', bg: '#FFF7ED', text: '#C2410C', icon: 'replay' },
  DISPUTED:  { label: 'Đang khiếu nại', bg: '#FFF1F2', text: '#BE123C', icon: 'report-problem' },
};

// ── Workflow steps ────────────────────────────────────────────────────────────

const P2P_STEPS: { status: TransactionStatus; label: string }[] = [
  { status: 'PENDING',   label: 'Gửi yêu cầu' },
  { status: 'ACCEPTED',  label: 'Được chấp nhận' },
  { status: 'COMPLETED', label: 'Hoàn thành' },
];

function getStepIndex(status: TransactionStatus): number {
  if (status === 'COMPLETED') return 2;
  if (status === 'ACCEPTED')  return 1;
  return 0;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-neutral-T90">
      <View className="w-8 h-8 rounded-lg bg-neutral-T95 items-center justify-center">
        <MaterialIcons name={icon as any} size={16} color="#757777" />
      </View>
      <View className="flex-1">
        <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">{label}</Text>
        <Text className="font-body font-semibold text-sm text-neutral-T10 mt-0.5">{value}</Text>
      </View>
    </View>
  );
}

function StatusTimeline({ status }: { status: TransactionStatus }) {
  const currentStep = getStepIndex(status);
  const isCancelledOrRejected = status === 'CANCELLED' || status === 'REJECTED';

  return (
    <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-3">
      <Text className="font-label font-semibold text-xs text-neutral-T50 uppercase tracking-wider">
        Tiến trình giao dịch
      </Text>
      {isCancelledOrRejected ? (
        <View className="flex-row items-center gap-3">
          <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center">
            <MaterialIcons name="close" size={16} color="#DC2626" />
          </View>
          <Text className="font-body font-semibold text-sm text-red-600">
            {STATUS_CONFIG[status].label}
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
                      style={{ backgroundColor: i < currentStep ? '#296C24' : '#E5E7EB', minHeight: 20 }}
                    />
                  )}
                </View>
                {/* Label */}
                <View className="pb-4 justify-center">
                  <Text
                    className="font-body font-semibold text-sm"
                    style={{ color: done ? '#191C1C' : '#9CA3AF' }}
                  >
                    {step.label}
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
  return (
    <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-4">
      <View className="gap-1">
        <Text className="font-sans font-bold text-base text-neutral-T10">
          Mã xác minh QR
        </Text>
        <Text className="font-body text-xs text-neutral-T50 leading-4">
          Cho người nhận quét mã này khi gặp mặt để xác nhận hoàn tất giao dịch.
        </Text>
      </View>

      {/* QR code image */}
      <View className="items-center py-2">
        <View style={styles.qrContainer} className="bg-white rounded-2xl p-5 items-center gap-4">
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
          Hoặc đọc mã cho người nhận
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

function ReceiverScanSection({ transactionId, onCompleted }: ReceiverScanSectionProps) {
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
          'Cần quyền camera',
          'Vui lòng cấp quyền truy cập camera để quét mã QR.',
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
      Alert.alert('Thành công!', 'Giao dịch đã được xác nhận hoàn tất.', [
        { text: 'OK', onPress: onCompleted },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Mã không hợp lệ. Vui lòng thử lại.';
      Alert.alert('Lỗi xác minh', msg, [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!codeInput.trim()) {
      setInputError('Vui lòng nhập mã xác minh');
      return;
    }
    setIsSubmitting(true);
    setInputError('');
    try {
      await scanQrApi(codeInput.trim());
      setShowManualModal(false);
      Alert.alert('Thành công!', 'Giao dịch đã được xác nhận hoàn tất.', [
        { text: 'OK', onPress: onCompleted },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Mã không hợp lệ. Vui lòng thử lại.';
      setInputError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-4">
        <View className="gap-1">
          <Text className="font-sans font-bold text-base text-neutral-T10">
            Xác minh giao nhận
          </Text>
          <Text className="font-body text-xs text-neutral-T50 leading-4">
            Quét mã QR từ người cho hoặc nhập mã thủ công để xác nhận bạn đã nhận đồ.
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
                Quét mã QR
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
            Nhập mã thủ công
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
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
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
          <View style={StyleSheet.absoluteFill} pointerEvents="none" className="items-center justify-center">
            <View style={styles.scanFrame} />
            <Text className="text-white font-body text-sm mt-6 text-center px-8">
              Hướng camera vào mã QR của người cho
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
          <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <TouchableOpacity className="flex-1" onPress={() => setShowManualModal(false)} />
            <View style={styles.bottomSheet} className="bg-neutral-T100 rounded-t-3xl px-6 pt-5 pb-8 gap-5">
              <View className="w-10 h-1 rounded-full bg-neutral-T80 self-center" />

              <View className="gap-1">
                <Text className="font-sans font-bold text-lg text-neutral-T10">
                  Nhập mã xác minh
                </Text>
                <Text className="font-body text-sm text-neutral-T50">
                  Lấy mã từ người cho và nhập vào ô bên dưới.
                </Text>
              </View>

              <View className="gap-2">
                <TextInput
                  value={codeInput}
                  onChangeText={(t) => { setCodeInput(t); setInputError(''); }}
                  placeholder="Nhập mã xác minh..."
                  placeholderTextColor="#AAABAB"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="bg-neutral-T95 rounded-xl px-4 h-14 font-body text-neutral-T10 border border-neutral-T90"
                  style={inputError ? styles.inputError : undefined}
                />
                {!!inputError && (
                  <Text className="font-body text-xs text-red-500">{inputError}</Text>
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
                    Xác nhận
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
      setError('Không thể tải giao dịch. Vui lòng thử lại.');
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
        <StackHeader title="Chi tiết giao dịch" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View className="flex-1 bg-neutral">
        <StackHeader title="Chi tiết giao dịch" />
        <View className="flex-1 items-center justify-center px-8 gap-4">
          <Text className="font-body text-sm text-neutral-T50 text-center">{error ?? 'Không tìm thấy giao dịch'}</Text>
          <TouchableOpacity onPress={load} className="px-6 py-3 bg-primary-T40 rounded-xl" activeOpacity={0.85}>
            <Text className="font-label font-semibold text-neutral-T100">Thử lại</Text>
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
  const requesterId = typeof tx.requesterId === 'object' ? tx.requesterId._id : tx.requesterId;
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
      Alert.alert('Lỗi', 'Không thể mở cuộc trò chuyện.');
    } finally {
      setIsChatting(false);
    }
  };

  const handleCancelRequest = () => {
    Alert.alert(
      'Hủy yêu cầu',
      'Bạn có chắc muốn hủy yêu cầu xin đồ này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy yêu cầu',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await cancelRequestApi(tx._id);
              Alert.alert('Đã hủy', 'Yêu cầu xin đồ đã được hủy.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (e: any) {
              Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thể hủy yêu cầu.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const statusBadge = (
    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: cfg.bg }}>
      <Text className="font-label font-bold text-xs" style={{ color: cfg.text }}>
        {cfg.label.toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-neutral">
      <StackHeader title="Chi tiết giao dịch" rightElement={statusBadge} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1"
      >
        <View className="px-4 gap-3 pt-4">
          {/* ── Post Info Card ── */}
          <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-3">
            <Text className="font-label font-semibold text-[10px] text-neutral-T50 uppercase tracking-wider">
              Bài đăng
            </Text>
            <Text className="font-sans font-bold text-lg text-neutral-T10 leading-tight">
              {post.title}
            </Text>

            <View className="flex-row gap-2 flex-wrap">
              <View className="px-2 py-1 rounded-md" style={{ backgroundColor: isP2P ? '#DCFCE7' : '#FEF3C7' }}>
                <Text className="font-label font-bold text-[10px] uppercase tracking-wider" style={{ color: isP2P ? '#15803D' : '#92400E' }}>
                  {isP2P ? 'P2P – Miễn phí' : 'B2C – Túi mù'}
                </Text>
              </View>
              <View className="px-2 py-1 rounded-md bg-neutral-T95">
                <Text className="font-label font-bold text-[10px] text-neutral-T50 uppercase tracking-wider">
                  SL: {tx.quantity}
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

            <InfoRow icon="event" label="Ngày tạo" value={formatDate(tx.createdAt)} />
            <InfoRow icon="payment" label="Thanh toán" value={tx.paymentMethod} />
            {tx.expiredAt && (
              <InfoRow icon="schedule" label="Hết hạn thanh toán" value={formatDate(tx.expiredAt)} />
            )}
          </View>

          {/* ── Role badge ── */}
          <View style={styles.card} className="bg-neutral-T100 rounded-2xl px-5 py-4 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: isDonor ? '#DCFCE7' : '#EFF6FF' }}>
              <MaterialIcons
                name={isDonor ? 'volunteer-activism' : 'person'}
                size={20}
                color={isDonor ? '#15803D' : '#1D4ED8'}
              />
            </View>
            <View>
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                Vai trò của bạn
              </Text>
              <Text className="font-sans font-bold text-sm text-neutral-T10 mt-0.5">
                {isDonor ? 'Người cho (Donor)' : isReceiver ? 'Người nhận (Receiver)' : 'Người tham gia'}
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
              <MaterialIcons name="chat-bubble-outline" size={20} color="#296C24" />
            </View>
            <View className="flex-1">
              <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider">
                Liên hệ
              </Text>
              <Text className="font-sans font-bold text-sm text-neutral-T10 mt-0.5">
                {isDonor ? 'Nhắn tin với người nhận' : 'Nhắn tin với người cho'}
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
            <ReceiverScanSection
              transactionId={tx._id}
              onCompleted={load}
            />
          )}

          {/* ── B2C ESCROWED: Buyer verification + dispute ── */}
          {tx.status === 'ESCROWED' && !isP2P && isReceiver && tx.verificationCode && (
            <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-4">
              <View className="gap-1">
                <Text className="font-sans font-bold text-base text-neutral-T10">
                  Mã xác nhận nhận hàng
                </Text>
                <Text className="font-body text-xs text-neutral-T50 leading-4">
                  Đưa mã này cho cửa hàng khi đến nhận hàng.
                </Text>
              </View>
              <View className="bg-primary-T95 border border-primary-T70 rounded-xl px-6 py-4 items-center">
                <Text className="font-body font-bold text-xl text-primary-T30 tracking-widest text-center" selectable>
                  {tx.verificationCode.slice(-8).toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          {tx.status === 'ESCROWED' && !isP2P && isDonor && (
            <ReceiverScanSection
              transactionId={tx._id}
              onCompleted={load}
            />
          )}

          {/* ── Dispute button for buyer on ESCROWED B2C orders ── */}
          {tx.status === 'ESCROWED' && !isP2P && isReceiver && (
            <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center">
                  <MaterialIcons name="report-problem" size={20} color="#BE123C" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">Gặp vấn đề?</Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    Nếu sản phẩm không đúng mô tả, bạn có thể gửi khiếu nại.
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
                <MaterialIcons name="report-problem" size={16} color="#BE123C" />
                <Text className="font-label font-semibold text-sm" style={{ color: '#BE123C' }}>
                  Gửi khiếu nại
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Disputed info ── */}
          {tx.status === 'DISPUTED' && tx.disputeReason && (
            <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-rose-50 items-center justify-center">
                  <MaterialIcons name="report-problem" size={20} color="#BE123C" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">Đang khiếu nại</Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    Admin đang xem xét khiếu nại của bạn.
                  </Text>
                </View>
              </View>
              <View className="bg-rose-50 rounded-xl p-4">
                <Text className="font-label text-[10px] text-neutral-T50 uppercase tracking-wider mb-1">Lý do</Text>
                <Text className="font-body text-sm text-neutral-T10">{tx.disputeReason}</Text>
              </View>
            </View>
          )}

          {/* ── Refund info ── */}
          {tx.status === 'REFUNDED' && (
            <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                  <MaterialIcons name="replay" size={20} color="#C2410C" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">Đã hoàn tiền</Text>
                  {tx.refundReason && (
                    <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                      {tx.refundReason}
                    </Text>
                  )}
                </View>
              </View>
              {tx.refundedAt && (
                <Text className="font-body text-xs text-neutral-T50">
                  Hoàn tiền lúc: {formatDate(tx.refundedAt)}
                </Text>
              )}
            </View>
          )}

          {/* PENDING state */}
          {tx.status === 'PENDING' && isReceiver && (
            <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 gap-4">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center">
                  <MaterialIcons name="hourglass-empty" size={20} color="#A16207" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-sm text-neutral-T10">Chờ người cho xác nhận</Text>
                  <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                    Mã QR sẽ được tạo sau khi người cho chấp nhận yêu cầu của bạn.
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
                    <Text className="font-label font-semibold text-sm" style={{ color: '#DC2626' }}>
                      Hủy yêu cầu
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {tx.status === 'PENDING' && isDonor && (
            <View style={styles.card} className="bg-neutral-T100 rounded-2xl p-5 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                <MaterialIcons name="inbox" size={20} color="#1D4ED8" />
              </View>
              <View className="flex-1">
                <Text className="font-sans font-bold text-sm text-neutral-T10">Có yêu cầu đang chờ bạn</Text>
                <Text className="font-body text-xs text-neutral-T50 mt-0.5 leading-4">
                  Vào tab "Nhận yêu cầu" để chấp nhận hoặc từ chối yêu cầu này.
                </Text>
              </View>
            </View>
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
                  Báo cáo
                </Text>
                <Text className="font-sans font-bold text-sm text-neutral-T10 mt-0.5">
                  Báo cáo giao dịch này
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
          <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <TouchableOpacity className="flex-1" onPress={() => setShowDisputeModal(false)} />
            <View style={styles.bottomSheet} className="bg-neutral-T100 rounded-t-3xl px-6 pt-5 pb-8 gap-5">
              <View className="w-10 h-1 rounded-full bg-neutral-T80 self-center" />

              <View className="gap-1">
                <Text className="font-sans font-bold text-lg text-neutral-T10">
                  Khiếu nại đơn hàng
                </Text>
                <Text className="font-body text-sm text-neutral-T50">
                  Mô tả lý do khiếu nại (ít nhất 10 ký tự). Admin sẽ xem xét và xử lý.
                </Text>
              </View>

              <View className="gap-2">
                <TextInput
                  value={disputeReason}
                  onChangeText={(t) => { setDisputeReason(t); setDisputeError(''); }}
                  placeholder="Nhập lý do khiếu nại..."
                  placeholderTextColor="#AAABAB"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-neutral-T95 rounded-xl px-4 py-3 font-body text-neutral-T10 border border-neutral-T90"
                  style={[{ minHeight: 100 }, disputeError ? styles.inputError : undefined]}
                />
                {!!disputeError && (
                  <Text className="font-body text-xs text-red-500">{disputeError}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={async () => {
                  if (disputeReason.trim().length < 10) {
                    setDisputeError('Lý do khiếu nại phải có ít nhất 10 ký tự');
                    return;
                  }
                  setIsDisputing(true);
                  try {
                    await fileDisputeApi(tx._id, disputeReason.trim());
                    setShowDisputeModal(false);
                    Alert.alert('Đã gửi', 'Khiếu nại của bạn đã được gửi. Admin sẽ xem xét và xử lý.', [
                      { text: 'OK', onPress: load },
                    ]);
                  } catch (e: any) {
                    setDisputeError(e?.response?.data?.message ?? 'Không thể gửi khiếu nại');
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
                    Gửi khiếu nại
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
  qrCornerTL: { position: 'absolute', top: 10, left: 10, width: 20, height: 20, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#296C24', borderTopLeftRadius: 4 },
  qrCornerTR: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#296C24', borderTopRightRadius: 4 },
  qrCornerBL: { position: 'absolute', bottom: 10, left: 10, width: 20, height: 20, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#296C24', borderBottomLeftRadius: 4 },
  qrCornerBR: { position: 'absolute', bottom: 10, right: 10, width: 20, height: 20, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#296C24', borderBottomRightRadius: 4 },
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

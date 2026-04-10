import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import StackHeader from '@/components/shared/headers/StackHeader';

import { getPostByIdApi, type IPostDetail } from '@/lib/postApi';
import { createOrderApi, type PaymentMethod } from '@/lib/transactionApi';
import { initiatePaymentApi } from '@/lib/paymentApi';

// ── Payment method config ───────────────────────────────────────────────────

const PAYMENT_METHODS: {
  key: PaymentMethod;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
}[] = [
  {
    key: 'MOMO',
    label: 'MoMo',
    sublabel: 'Ví MoMo',
    icon: 'account-balance-wallet',
    color: '#A50064',
  },
  // TODO: Re-enable when ZaloPay is ready
  // {
  //   key: 'ZALOPAY',
  //   label: 'ZaloPay',
  //   sublabel: 'Ví ZaloPay',
  //   icon: 'account-balance-wallet',
  //   color: '#008FE5',
  // },
  // TODO: Re-enable when VNPay is ready
  // {
  //   key: 'VNPAY',
  //   label: 'VNPay',
  //   sublabel: 'ATM / Internet Banking / QR',
  //   icon: 'account-balance',
  //   color: '#E41E2B',
  // },
];

const PAYMENT_TIMEOUT_SECONDS = 10 * 60; // 10 minutes

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function PaymentScreen() {
  const router = useRouter();
  const { postId, quantity: qtyStr } = useLocalSearchParams<{
    postId: string;
    quantity?: string;
  }>();
  const quantity = Number(qtyStr) || 1;

  const [post, setPost] = useState<IPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('MOMO');
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [orderCreated, setOrderCreated] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load post
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const res = await getPostByIdApi(postId);
        setPost(res.data);
      } catch (e) {
        Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không thể tải bài đăng.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [postId]);

  // Countdown timer (starts after order is created)
  useEffect(() => {
    if (!orderCreated) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          Alert.alert(
            'Hết thời gian',
            'Thời gian thanh toán đã hết. Đơn hàng sẽ bị huỷ.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [orderCreated]);

  const formatCountdown = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handlePay = async () => {
    if (!post) return;
    setIsProcessing(true);

    try {
      // Step 1: Create order (if not yet)
      let txnId = transactionId;
      if (!txnId) {
        const orderRes = await createOrderApi(post._id, quantity, selectedMethod as 'MOMO');
        txnId = orderRes.data._id;
        setTransactionId(txnId);
        setOrderCreated(true);
      }

      // Step 2: Initiate payment → get payUrl
      const payRes = await initiatePaymentApi(txnId!);
      const { payUrl } = payRes.data;

      // Step 3: Open payment gateway in browser
      const result = await WebBrowser.openBrowserAsync(payUrl, {
        dismissButtonStyle: 'cancel',
        showTitle: true,
      });

      // After browser closes, navigate to result screen
      if (result.type === 'cancel') {
        // User closed browser — check payment status later
        Alert.alert(
          'Thanh toán chưa hoàn tất?',
          'Nếu bạn đã thanh toán, hệ thống sẽ cập nhật trạng thái trong giây lát.',
          [
            {
              text: 'Xem giao dịch',
              onPress: () =>
                router.replace({
                  pathname: '/(transaction)/payment-result',
                  params: { transactionId: txnId!, status: 'pending' },
                } as any),
            },
            { text: 'Đóng', style: 'cancel' },
          ]
        );
      } else {
        // Browser dismissed (deep-link or done) — go to result
        router.replace({
          pathname: '/(transaction)/payment-result',
          params: { transactionId: txnId!, status: 'pending' },
        } as any);
      }
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không thể xử lý thanh toán.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-neutral-DEFAULT">
        <StackHeader title="Thanh toán" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#296C24" />
        </View>
      </View>
    );
  }

  if (!post) return null;

  const totalAmount = post.price * quantity;

  const handleBack = () => {
    if (orderCreated) {
      Alert.alert(
        'Huỷ thanh toán?',
        'Đơn hàng đã được tạo. Bạn có chắc muốn thoát?',
        [
          { text: 'Ở lại', style: 'cancel' },
          { text: 'Thoát', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-1 bg-neutral-DEFAULT">
      <StackHeader title="Thanh toán" onBack={handleBack} />

      <View className="flex-1 px-5 pt-4 gap-5">
        {/* Order Summary */}
        <View className="bg-neutral-T100 rounded-2xl p-4 flex-row gap-3" style={styles.card}>
          {post.images?.[0] ? (
            <Image
              source={{ uri: post.images[0] }}
              className="w-16 h-16 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-16 h-16 rounded-xl bg-neutral-T90 items-center justify-center">
              <MaterialIcons name="fastfood" size={24} color="#AAABAB" />
            </View>
          )}
          <View className="flex-1 justify-center">
            <Text className="font-sans font-bold text-base text-neutral-T10" numberOfLines={2}>
              {post.title}
            </Text>
            <Text className="font-body text-sm text-neutral-T50 mt-1">
              {quantity} x {post.price.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          <View className="justify-center">
            <Text className="font-sans font-extrabold text-lg text-secondary-T30">
              {totalAmount.toLocaleString('vi-VN')}đ
            </Text>
          </View>
        </View>

        {/* Countdown (shown after order created) */}
        {orderCreated && (
          <View className="bg-secondary-T95 border border-secondary-T70 rounded-xl px-4 py-3 flex-row items-center gap-3">
            <MaterialIcons name="timer" size={20} color="#944A00" />
            <Text className="font-body text-sm text-secondary-T30 flex-1">
              Hoàn tất thanh toán trong
            </Text>
            <Text className="font-sans font-extrabold text-lg text-secondary-T20">
              {formatCountdown(countdown)}
            </Text>
          </View>
        )}

        {/* Payment Method Selection */}
        <View className="gap-2">
          <Text className="font-label text-xs font-semibold text-neutral-T50 uppercase tracking-wider">
            Phương thức thanh toán
          </Text>
          {PAYMENT_METHODS.map((method) => {
            // Only allow FREE-excluded methods
            if (method.key === 'FREE') return null;
            const isSelected = selectedMethod === method.key;
            return (
              <TouchableOpacity
                key={method.key}
                className={`flex-row items-center gap-4 p-4 rounded-xl border ${
                  isSelected ? 'border-primary-T40 bg-primary-T95' : 'border-neutral-T80 bg-neutral-T100'
                }`}
                onPress={() => {
                  if (!orderCreated) setSelectedMethod(method.key);
                }}
                disabled={orderCreated}
                activeOpacity={orderCreated ? 1 : 0.7}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: method.color + '15' }}
                >
                  <MaterialIcons
                    name={method.icon as any}
                    size={20}
                    color={method.color}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-sans font-bold text-base text-neutral-T10">
                    {method.label}
                  </Text>
                  <Text className="font-body text-xs text-neutral-T50">
                    {method.sublabel}
                  </Text>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isSelected ? 'border-primary-T40' : 'border-neutral-T70'
                  }`}
                >
                  {isSelected && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary-T40" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Pay Button */}
      <View className="px-5 pb-6 pt-3" style={styles.bottomBar}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-body text-sm text-neutral-T50">Tổng thanh toán</Text>
          <Text className="font-sans font-extrabold text-xl text-secondary-T20">
            {totalAmount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
        <TouchableOpacity
          className="w-full rounded-2xl items-center justify-center py-4"
          activeOpacity={0.85}
          onPress={handlePay}
          disabled={isProcessing || countdown === 0}
          style={[
            styles.payBtn,
            (isProcessing || countdown === 0) && { opacity: 0.5 },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-neutral-T100 font-sans font-black text-lg tracking-tight uppercase">
              {orderCreated ? 'Mở cổng thanh toán' : 'Thanh toán ngay'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  payBtn: {
    backgroundColor: '#944A00',
    shadowColor: '#944A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});

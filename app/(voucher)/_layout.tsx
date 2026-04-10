import { Stack } from 'expo-router';

export default function VoucherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="voucher-market" />
      <Stack.Screen name="voucher-detail" />
      <Stack.Screen name="my-vouchers" />
      <Stack.Screen name="point-history" />
      <Stack.Screen name="store-vouchers" />
      <Stack.Screen name="create-voucher" />
      <Stack.Screen name="edit-voucher" />
    </Stack>
  );
}

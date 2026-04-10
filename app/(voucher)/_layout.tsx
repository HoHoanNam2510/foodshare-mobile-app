import { Stack } from 'expo-router';
import StackHeader from '../../components/shared/headers/StackHeader';

export default function VoucherLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ options, route }) => (
          <StackHeader
            title={
              options.title ??
              route.name
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())
            }
          />
        ),
      }}
    >
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

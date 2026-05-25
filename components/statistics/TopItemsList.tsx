import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ITopItem, ITopCounterpart } from '@/types/statistics';
import { useRouter } from 'expo-router';

interface TopItemsListProps {
  topItems: ITopItem[];
  topCounterparts: ITopCounterpart[];
}

export default function TopItemsList({
  topItems,
  topCounterparts,
}: TopItemsListProps) {
  const router = useRouter();

  const handlePostPress = (postId: string) => {
    router.push(`/(post)/${postId}` as any);
  };

  const handleUserPress = (userId: string) => {
    router.push(`/(profile)/user/${userId}` as any);
  };

  return (
    <View className="mb-4">
      {/* Top Items Section */}
      <View className="dark:bg-neutral-T20 dark:border-neutral-T30 mb-4 rounded-2xl bg-white p-4 shadow-sm dark:border dark:shadow-none">
        <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 mb-3 text-lg">
          Sản phẩm bán chạy
        </Text>
        {topItems.length === 0 ? (
          <Text className="text-neutral-T50 dark:text-neutral-T60 text-sm italic">
            Chưa có dữ liệu
          </Text>
        ) : (
          topItems.map((item, index) => (
            <TouchableOpacity
              key={item.postId}
              onPress={() => handlePostPress(item.postId)}
              className={`flex-row items-center py-3 ${
                index < topItems.length - 1
                  ? 'border-neutral-T95 dark:border-neutral-T30 border-b'
                  : ''
              }`}
            >
              <View className="bg-neutral-T95 dark:bg-neutral-T30 mr-3 h-10 w-10 items-center justify-center rounded-lg">
                <Text className="text-neutral-T50 dark:text-neutral-T60 font-body-bold">
                  {index + 1}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="font-body-semibold text-neutral-T10 dark:text-neutral-T90 text-base"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-neutral-T50 dark:text-neutral-T60 text-sm">
                  {item.type === 'P2P_FREE' ? 'P2P Miễn phí' : 'B2C Túi Mù'} ·{' '}
                  {item.count} bữa ăn
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Top Counterparts Section */}
      <View className="dark:bg-neutral-T20 dark:border-neutral-T30 rounded-2xl bg-white p-4 shadow-sm dark:border dark:shadow-none">
        <Text className="font-body-bold text-neutral-T10 dark:text-neutral-T90 mb-3 text-lg">
          Khách hàng tích cực
        </Text>
        {topCounterparts.length === 0 ? (
          <Text className="text-neutral-T50 dark:text-neutral-T60 text-sm italic">
            Chưa có dữ liệu
          </Text>
        ) : (
          topCounterparts.map((counterpart, index) => (
            <TouchableOpacity
              key={counterpart.userId}
              onPress={() => handleUserPress(counterpart.userId)}
              className={`flex-row items-center py-3 ${
                index < topCounterparts.length - 1
                  ? 'border-neutral-T95 dark:border-neutral-T30 border-b'
                  : ''
              }`}
            >
              {counterpart.avatar ? (
                <Image
                  source={{ uri: counterpart.avatar }}
                  className="mr-3 h-10 w-10 rounded-full"
                />
              ) : (
                <View className="bg-primary-T95 dark:bg-primary-T20 mr-3 h-10 w-10 items-center justify-center rounded-full">
                  <Text className="text-primary-T40 dark:text-primary-T60 font-body-bold">
                    {counterpart.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="font-body-semibold text-neutral-T10 dark:text-neutral-T90 text-base"
                  numberOfLines={1}
                >
                  {counterpart.fullName}
                </Text>
                <Text className="text-neutral-T50 dark:text-neutral-T60 text-sm">
                  {counterpart.count} bữa ăn
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </View>
  );
}

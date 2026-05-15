import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ManagementHeader from '@/components/shared/headers/ManagementHeader';
import {
  deleteTemplateApi,
  getMyTemplatesApi,
  IPostTemplate,
} from '@/lib/postTemplateApi';

function TemplateCard({
  template,
  onPress,
  onDelete,
}: {
  template: IPostTemplate;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const isB2C = template.type === 'B2C_MYSTERY_BAG';

  return (
    <TouchableOpacity
      className="bg-neutral-T100 border-neutral-T90 mb-3 flex-row items-center gap-4 rounded-2xl border p-4 active:opacity-80"
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Type badge */}
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${isB2C ? 'bg-secondary-T95' : 'bg-primary-T95'}`}
      >
        <MaterialIcons
          name={isB2C ? 'shopping-bag' : 'volunteer-activism'}
          size={20}
          color={isB2C ? '#6B5E00' : '#296C24'}
        />
      </View>

      {/* Info */}
      <View className="flex-1 gap-0.5">
        <Text
          className="text-neutral-T10 font-sans text-sm font-bold"
          numberOfLines={1}
        >
          {template.templateName}
        </Text>
        <Text className="font-body text-neutral-T50 text-xs" numberOfLines={1}>
          {template.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <View
            className={`rounded-full px-2 py-0.5 ${isB2C ? 'bg-secondary-T95' : 'bg-primary-T95'}`}
          >
            <Text
              className={`font-label text-[10px] font-semibold ${isB2C ? 'text-secondary-T40' : 'text-primary-T40'}`}
            >
              {isB2C ? t('template.typeBag') : t('template.typeFree')}
            </Text>
          </View>
          <Text className="font-body text-neutral-T70 text-xs">
            {template.category}
          </Text>
          {isB2C && template.price > 0 && (
            <Text className="font-label text-secondary-T40 text-xs font-semibold">
              {template.price.toLocaleString('vi-VN')}₫
            </Text>
          )}
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity
        className="h-9 w-9 items-center justify-center rounded-xl active:opacity-70"
        style={{ backgroundColor: 'rgba(220,38,38,0.08)' }}
        onPress={onDelete}
        hitSlop={8}
      >
        <MaterialIcons name="delete-outline" size={20} color="#DC2626" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function MyTemplatesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [templates, setTemplates] = useState<IPostTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyTemplatesApi();
      setTemplates(data);
    } catch {
      Alert.alert(t('common.error'), t('template.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleDelete = (template: IPostTemplate) => {
    Alert.alert(
      t('template.deleteTitle'),
      t('template.deleteConfirm', { name: template.templateName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setTemplates((prev) =>
              prev.filter((tpl) => tpl._id !== template._id)
            );
            try {
              await deleteTemplateApi(template._id);
            } catch {
              setTemplates((prev) => [template, ...prev]);
              Alert.alert(t('common.error'), t('template.deleteError'));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="bg-neutral flex-1">
      <ManagementHeader
        title={t('template.screenTitle')}
        onBack={() => router.back()}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#296C24" />
          <Text className="font-body text-neutral-T50 text-sm">
            {t('common.loading')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={templates}
          keyExtractor={(item) => item._id}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center gap-4 px-8 py-20">
              <MaterialIcons name="bookmark-border" size={48} color="#C5C7C6" />
              <Text className="font-body text-neutral-T50 text-center text-sm">
                {t('template.emptyTitle')}
              </Text>
              <TouchableOpacity
                className="bg-primary-T40 h-12 flex-row items-center justify-center gap-2 rounded-xl px-6 shadow-sm active:opacity-80"
                onPress={() =>
                  router.push({
                    pathname: '/(post)/create-post',
                    params: { type: 'FREE_FOOD' },
                  } as any)
                }
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text className="font-label text-neutral-T100 text-sm font-semibold">
                  {t('template.emptyCtaButton')}
                </Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onPress={() =>
                router.push({
                  pathname: '/(post)/edit-template',
                  params: { id: item._id },
                } as any)
              }
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}
    </View>
  );
}

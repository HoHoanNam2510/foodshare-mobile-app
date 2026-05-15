import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getMyTemplatesApi, IPostTemplate } from '@/lib/postTemplateApi';

interface TemplatePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: IPostTemplate) => void;
  onManage: () => void;
}

function TemplateItem({
  template,
  onPress,
}: {
  template: IPostTemplate;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const isB2C = template.type === 'B2C_MYSTERY_BAG';

  return (
    <TouchableOpacity
      className="border-neutral-T90 flex-row items-center gap-3 border-b py-4"
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl ${isB2C ? 'bg-secondary-T95' : 'bg-primary-T95'}`}
      >
        <MaterialIcons
          name={isB2C ? 'shopping-bag' : 'volunteer-activism'}
          size={20}
          color={isB2C ? '#6B5E00' : '#296C24'}
        />
      </View>

      <View className="flex-1 gap-0.5">
        <Text
          className="text-neutral-T10 font-sans text-sm font-bold"
          numberOfLines={1}
        >
          {template.templateName}
        </Text>
        <Text className="font-body text-neutral-T50 text-xs" numberOfLines={1}>
          {template.title} · {template.category}
        </Text>
      </View>

      <View
        className={`rounded-full px-2 py-0.5 ${isB2C ? 'bg-secondary-T95' : 'bg-primary-T95'}`}
      >
        <Text
          className={`font-label text-[10px] font-semibold ${isB2C ? 'text-secondary-T40' : 'text-primary-T40'}`}
        >
          {isB2C ? t('template.typeBag') : t('template.typeFree')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TemplatePickerSheet({
  visible,
  onClose,
  onSelect,
  onManage,
}: TemplatePickerSheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<IPostTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    getMyTemplatesApi()
      .then(setTemplates)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      />

      <View
        className="bg-neutral-T100 rounded-t-3xl"
        style={{ maxHeight: '70%', paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* Handle + header */}
        <View className="gap-3 px-6 pb-2 pt-4">
          <View className="bg-neutral-T80 h-1 w-10 self-center rounded-full" />
          <View className="flex-row items-center justify-between">
            <Text className="text-neutral-T10 font-sans text-base font-bold">
              {t('template.pickerTitle')}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color="#757777" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#296C24" />
          </View>
        ) : templates.length === 0 ? (
          <View className="items-center justify-center gap-2 px-6 py-10">
            <MaterialIcons name="bookmark-border" size={40} color="#C5C7C6" />
            <Text className="font-body text-neutral-T50 text-center text-sm">
              {t('template.emptyPickerTitle')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={templates}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TemplateItem
                template={item}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Footer — manage link */}
        <TouchableOpacity
          className="border-neutral-T90 mx-6 mt-2 flex-row items-center justify-center gap-1 border-t pt-4"
          onPress={() => {
            onClose();
            onManage();
          }}
          activeOpacity={0.75}
        >
          <Text className="font-label text-primary-T40 text-sm font-semibold">
            {t('template.manageLink')}
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color="#296C24" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { pickImage } from '@/lib/imagePicker';
import { useTranslation } from 'react-i18next';

interface ImagePickerSectionProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImagePickerSection({
  images,
  onImagesChange,
  maxImages = 10,
}: ImagePickerSectionProps) {
  const { t } = useTranslation();
  const handleAddPhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      onImagesChange([...images, uri]);
    }
  };

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-label text-neutral-T50 text-sm font-semibold">
          {t('post.photos')}
        </Text>
        <Text className="font-label text-neutral-T70 text-xs">
          {images.length}/{maxImages}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
      >
        {images.length < maxImages && (
          <TouchableOpacity
            className="border-neutral-T80 bg-neutral-T95 h-28 w-28 items-center justify-center gap-1 rounded-2xl border border-dashed active:opacity-80"
            onPress={handleAddPhoto}
          >
            <MaterialIcons name="add-a-photo" size={28} color="#296C24" />
            <Text className="font-label text-primary-T40 text-xs font-semibold">
              {t('post.addPhoto')}
            </Text>
          </TouchableOpacity>
        )}
        {images.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            className="h-28 w-28 overflow-hidden rounded-2xl shadow-sm"
          >
            <Image
              source={{ uri }}
              className="h-full w-full"
              resizeMode="cover"
            />
            {index === 0 && (
              <View className="bg-primary-T40 absolute left-2 top-2 rounded-full px-2 py-0.5">
                <Text className="font-label text-neutral-T100 text-[10px] font-bold uppercase tracking-wider">
                  {t('post.cover')}
                </Text>
              </View>
            )}
            <TouchableOpacity
              className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-black/40 active:opacity-80"
              onPress={() => handleRemove(index)}
            >
              <MaterialIcons name="close" size={14} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

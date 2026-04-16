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
      <View className="flex-row justify-between items-center">
        <Text className="font-label font-semibold text-sm text-neutral-T50">
          {t('post.photos')}
        </Text>
        <Text className="font-label text-xs text-neutral-T70">
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
            className="w-28 h-28 rounded-2xl border border-dashed border-neutral-T80 bg-neutral-T95 items-center justify-center gap-1 active:opacity-80"
            onPress={handleAddPhoto}
          >
            <MaterialIcons name="add-a-photo" size={28} color="#296C24" />
            <Text className="font-label text-xs font-semibold text-primary-T40">
              {t('post.addPhoto')}
            </Text>
          </TouchableOpacity>
        )}
        {images.map((uri, index) => (
          <View
            key={`${uri}-${index}`}
            className="w-28 h-28 rounded-2xl overflow-hidden shadow-sm"
          >
            <Image
              source={{ uri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {index === 0 && (
              <View className="absolute top-2 left-2 bg-primary-T40 px-2 py-0.5 rounded-full">
                <Text className="font-label font-bold text-[10px] text-neutral-T100 uppercase tracking-wider">
                  {t('post.cover')}
                </Text>
              </View>
            )}
            <TouchableOpacity
              className="absolute top-2 right-2 w-6 h-6 bg-black/40 rounded-full items-center justify-center active:opacity-80"
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

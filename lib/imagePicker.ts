import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const IMAGE_COMPRESSION_QUALITY = 0.8;

interface PickImageOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

export async function pickImage(
  options: PickImageOptions = {}
): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission needed',
      'Please grant photo library access in Settings to add photos.'
    );
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: options.allowsEditing ?? false,
    aspect: options.aspect,
    quality: options.quality ?? IMAGE_COMPRESSION_QUALITY,
  });

  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }

  return null;
}

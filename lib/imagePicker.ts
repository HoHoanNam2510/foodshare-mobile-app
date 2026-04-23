import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// Giới hạn kích thước ảnh trước khi upload: max 1280px cạnh dài, JPEG 75%
// Giảm file từ 3–8MB xuống ~150–400KB, tăng tốc upload ~15x
const MAX_DIMENSION = 1280;
const UPLOAD_QUALITY = 0.75;

interface PickImageOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
}

async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    {
      compress: UPLOAD_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
  return result.uri;
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
    quality: 1, // Lấy ảnh gốc chất lượng cao, compression xử lý bằng manipulator
  });

  if (!result.canceled && result.assets[0]) {
    return compressImage(result.assets[0].uri);
  }

  return null;
}

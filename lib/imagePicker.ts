import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

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
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // iOS: hướng dẫn mở Settings vì sau khi từ chối không thể hỏi lại
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Cần quyền truy cập ảnh',
          'Vui lòng vào Cài đặt → FoodShare → Ảnh và cho phép truy cập.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Alert.alert(
          'Cần quyền truy cập ảnh',
          'Vui lòng cho phép truy cập thư viện ảnh để gửi ảnh.'
        );
      }
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: options.allowsEditing ?? false,
      aspect: options.aspect,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      return compressImage(result.assets[0].uri);
    }

    return null;
  } catch {
    Alert.alert('Không thể mở thư viện ảnh', 'Vui lòng thử lại.');
    return null;
  }
}

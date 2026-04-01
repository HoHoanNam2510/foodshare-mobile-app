import api from './axios';

type UploadFolder = 'avatars' | 'posts' | 'kyc' | 'reports' | 'chat';

interface UploadResult {
  url: string;
  publicId: string;
}

interface UploadResponse {
  success: boolean;
  data: UploadResult;
  message: string;
}

interface MultiUploadResponse {
  success: boolean;
  data: UploadResult[];
  message: string;
}

/**
 * Upload một ảnh từ local URI lên server (Cloudinary).
 *
 * @param uri - Local file URI từ ImagePicker (file:///...)
 * @param folder - Thư mục đích trên Cloudinary
 * @returns URL ảnh trên Cloudinary
 */
export async function uploadImage(
  uri: string,
  folder: UploadFolder = 'posts'
): Promise<UploadResult> {
  const formData = new FormData();

  const fileName = uri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(fileName);
  const mimeType = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

  formData.append('image', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const { data } = await api.post<UploadResponse>(
    `/upload/single?folder=${folder}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }
  );

  return data.data;
}

/**
 * Upload nhiều ảnh cùng lúc.
 *
 * @param uris - Mảng local file URI
 * @param folder - Thư mục đích trên Cloudinary
 * @returns Mảng URL ảnh trên Cloudinary
 */
export async function uploadMultipleImages(
  uris: string[],
  folder: UploadFolder = 'posts'
): Promise<UploadResult[]> {
  const formData = new FormData();

  for (const uri of uris) {
    const fileName = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(fileName);
    const mimeType = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';

    formData.append('images', {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }

  const { data } = await api.post<MultiUploadResponse>(
    `/upload/multiple?folder=${folder}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    }
  );

  return data.data;
}

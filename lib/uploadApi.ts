import api from './axios';

type UploadFolder =
  | 'avatars'
  | 'posts'
  | 'kyc'
  | 'reports'
  | 'chat'
  | 'feedbacks';

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

function getMimeType(uri: string): string {
  const ext = /\.(\w+)$/.exec(uri.split('/').pop() ?? '')?.[1]?.toLowerCase();
  return EXT_TO_MIME[ext ?? ''] ?? 'image/jpeg';
}

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
  formData.append('image', {
    uri,
    name: fileName,
    type: getMimeType(uri),
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
    formData.append('images', {
      uri,
      name: fileName,
      type: getMimeType(uri),
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

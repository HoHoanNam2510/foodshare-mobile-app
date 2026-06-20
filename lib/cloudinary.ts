export function optimizeCloudinaryUrl(
  url: string | undefined | null,
  width: number,
  quality: 'auto' | number = 'auto'
): string | undefined {
  if (!url) return undefined;
  if (!url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
}

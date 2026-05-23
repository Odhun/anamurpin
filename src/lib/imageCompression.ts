import imageCompression from 'browser-image-compression';

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.3,
  maxWidthOrHeight: 800,
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.75,
};

const BLOCKED_VIDEO_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'video/x-msvideo', 'video/mpeg',
];

export function isBlockedFileType(file: File): boolean {
  return BLOCKED_VIDEO_TYPES.includes(file.type);
}

export function isValidImageType(file: File): boolean {
  return file.type.startsWith('image/') && !isBlockedFileType(file);
}

export async function compressToWebP(file: File): Promise<File> {
  if (isBlockedFileType(file)) {
    throw new Error('Video yüklemek yasaktır. Lütfen resim seçin.');
  }
  if (!isValidImageType(file)) {
    throw new Error('Geçersiz dosya türü. Sadece resim dosyaları kabul edilir.');
  }

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
  return new File([compressed], `${Date.now()}.webp`, { type: 'image/webp' });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

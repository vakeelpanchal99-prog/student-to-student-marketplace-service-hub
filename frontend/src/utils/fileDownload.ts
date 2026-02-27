/**
 * Maps a MIME type string to the correct file extension.
 *
 * @param mimeType - The MIME type string (e.g., "video/mp4", "application/pdf")
 * @returns The file extension including the leading dot (e.g., ".mp4"), or an empty string if unknown.
 */
export function mimeTypeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    // Video
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/x-matroska': '.mkv',
    'video/3gpp': '.3gp',

    // Audio
    'audio/mpeg': '.mp3',
    'audio/ogg': '.ogg',
    'audio/wav': '.wav',
    'audio/webm': '.weba',
    'audio/aac': '.aac',

    // Images
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/bmp': '.bmp',
    'image/tiff': '.tiff',
    'image/heic': '.heic',
    'image/heif': '.heif',

    // Documents
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/vnd.oasis.opendocument.text': '.odt',
    'application/vnd.oasis.opendocument.spreadsheet': '.ods',
    'application/vnd.oasis.opendocument.presentation': '.odp',

    // Archives
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/x-tar': '.tar',
    'application/gzip': '.gz',

    // Android APK
    'application/vnd.android.package-archive': '.apk',

    // Text
    'text/plain': '.txt',
    'text/csv': '.csv',
    'text/html': '.html',
    'text/css': '.css',
    'text/javascript': '.js',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/xml': '.xml',
  };

  const normalized = (mimeType || '').toLowerCase().trim();
  return map[normalized] ?? '';
}

/**
 * Strips the file extension from a filename string.
 */
function stripExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return filename;
  return filename.substring(0, lastDot);
}

/**
 * Sanitizes a base filename by removing characters that are invalid in filenames.
 */
function sanitizeBaseName(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .trim();
}

/**
 * Produces a clean, human-readable download filename with the correct extension
 * derived from the MIME type.
 */
export function getDownloadFilename(
  mimeType: string,
  filename: string,
  fallback?: string,
): string {
  const correctExt = mimeTypeToExtension(mimeType);

  const rawBase = (filename || fallback || 'download').trim();

  if (!correctExt) {
    return rawBase;
  }

  const baseWithoutExt = stripExtension(rawBase);
  const sanitizedBase = sanitizeBaseName(baseWithoutExt) || 'download';

  return `${sanitizedBase}${correctExt}`;
}

/**
 * Downloads a file by fetching its bytes and creating a local blob URL.
 * This approach works correctly for cross-origin URLs where the browser
 * would otherwise ignore the `download` attribute.
 *
 * @param getBytes - Async function that returns the file bytes (e.g., ExternalBlob.getBytes())
 * @param mimeType - The MIME type of the file
 * @param filename - The stored filename from FileMetadata
 * @param fallback - Optional fallback base name used when filename is empty
 * @returns Promise that resolves when the download has been triggered
 */
export async function downloadFileWithCorrectName(
  getBytes: () => Promise<Uint8Array<ArrayBuffer>>,
  mimeType: string,
  filename: string,
  fallback?: string,
): Promise<void> {
  const bytes = await getBytes();
  const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' });
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = getDownloadFilename(mimeType, filename, fallback);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Revoke the blob URL after a short delay to free memory
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
}

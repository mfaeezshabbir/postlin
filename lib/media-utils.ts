/**
 * Image processing utilities
 * Note: Install 'sharp' package for image optimization
 * Run: npm install sharp
 */

/**
 * Convert base64 to buffer
 */
export function base64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Convert video base64 to buffer
 */
export function videoBase64ToBuffer(base64String: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:video\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Get file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
    'video/x-msvideo': 'avi',
  };
  
  return mimeToExt[mimeType] || 'bin';
}

/**
 * Extract MIME type from base64 data URL
 */
export function getMimeTypeFromBase64(base64String: string): string | null {
  const match = base64String.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
}

/**
 * Validate image dimensions (optional)
 */
export function validateImageDimensions(
  width: number,
  height: number,
  maxWidth: number = 4096,
  maxHeight: number = 4096
): boolean {
  return width <= maxWidth && height <= maxHeight;
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Optimize image using Sharp (if installed)
 * This is a placeholder - actual implementation requires 'sharp' package
 */
export async function optimizeImage(
  buffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  } = {}
): Promise<Buffer> {
  try {
    // Check if sharp is available
    const sharp = await import('sharp').catch(() => null);
    
    if (!sharp) {
      console.warn('Sharp not installed. Returning original image buffer.');
      return buffer;
    }
    
    let image = sharp.default(buffer);
    
    // Resize if dimensions are specified
    if (options.maxWidth || options.maxHeight) {
      image = image.resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    // Convert format and compress
    if (options.format === 'jpeg') {
      image = image.jpeg({ quality: options.quality || 85 });
    } else if (options.format === 'png') {
      image = image.png({ quality: options.quality || 85 });
    } else if (options.format === 'webp') {
      image = image.webp({ quality: options.quality || 85 });
    }
    
    return await image.toBuffer();
  } catch (error) {
    console.error('Error optimizing image:', error);
    return buffer; // Return original if optimization fails
  }
}

/**
 * Extract video metadata (placeholder - requires ffprobe or similar)
 */
export function extractVideoMetadata(buffer: Buffer): {
  duration?: number;
  width?: number;
  height?: number;
} {
  // This is a placeholder
  // In production, use ffprobe or similar tool to extract metadata
  console.warn('Video metadata extraction not implemented. Install ffprobe for full support.');
  return {};
}

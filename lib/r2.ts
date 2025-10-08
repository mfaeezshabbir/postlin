import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// Validate environment variables
if (!process.env.R2_ACCOUNT_ID) {
  throw new Error('R2_ACCOUNT_ID is not set in environment variables');
}
if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID is not set in environment variables');
}
if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY is not set in environment variables');
}
if (!process.env.R2_BUCKET_NAME) {
  throw new Error('R2_BUCKET_NAME is not set in environment variables');
}

// Create R2 client (S3-compatible)
export const r2Client = new S3Client({
  region: 'auto', // R2 uses 'auto' for region
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: for public access

/**
 * Generate a unique file name with timestamp and random string
 */
export function generateFileName(userId: string, originalName: string, type: 'image' | 'video'): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'bin';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${type}s/${userId}/${year}/${month}/${timestamp}-${random}.${ext}`;
}

/**
 * Upload file to R2
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );

    // Return the file URL
    // If public URL is configured, use it; otherwise, we'll generate signed URLs on demand
    if (R2_PUBLIC_URL) {
      return `${R2_PUBLIC_URL}/${fileName}`;
    }
    
    // Store the key; we'll generate signed URLs when needed
    return `r2://${R2_BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file to cloud storage');
  }
}

/**
 * Generate a signed URL for private file access
 * @param fileKey - The R2 object key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 */
export async function getSignedFileUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
  try {
    // If fileKey starts with r2://, extract the actual key
    const key = fileKey.startsWith('r2://') ? fileKey.split('/').slice(3).join('/') : fileKey;
    
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate file access URL');
  }
}

/**
 * Delete file from R2
 */
export async function deleteFromR2(fileUrl: string): Promise<void> {
  try {
    // Extract key from URL
    const key = extractKeyFromUrl(fileUrl);
    
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from cloud storage');
  }
}

/**
 * Extract R2 object key from URL
 */
function extractKeyFromUrl(url: string): string {
  if (url.startsWith('r2://')) {
    // Format: r2://bucket-name/path/to/file
    return url.split('/').slice(3).join('/');
  } else if (url.startsWith('http')) {
    // Format: https://bucket.r2.dev/path/to/file
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
  
  // Assume it's already a key
  return url;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Allowed file types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo', // .avi
];

/**
 * File size limits (in bytes)
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

export default r2Client;

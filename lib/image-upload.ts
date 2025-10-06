/**
 * Image Upload Utility - Compressed Base64 Storage
 * 
 * Stores images as highly compressed base64 strings directly in MongoDB.
 * Images are compressed to ~50-80KB to keep database lightweight.
 * 
 * Features:
 * - Aggressive compression (quality 60, resize to 800x800)
 * - Target size: <100KB per image
 * - No external dependencies (Cloudinary, S3, etc.)
 * - Simple and straightforward
 */

import sharp from 'sharp';

interface UploadResult {
  url: string; // Base64 data URL
  size: number; // Size in bytes
  format: string; // Image format (jpeg)
}

/**
 * Compress base64 image for database storage
 * Aggressively compresses to ~50-80KB to minimize database size
 */
export async function compressBase64(base64Image: string): Promise<UploadResult> {
  try {
    // Extract base64 data
    const matches = base64Image.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 image format');
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Get original size for logging
    const originalSizeKB = buffer.length / 1024;
    console.log(`📊 Original image size: ${originalSizeKB.toFixed(2)}KB`);

    // Compress aggressively to keep database lightweight
    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 60, 
        progressive: true,
        mozjpeg: true // Use mozjpeg for better compression
      })
      .toBuffer();

    // Convert back to base64
    const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

    // Check size
    const compressedSizeKB = compressedBuffer.length / 1024;
    console.log(`📊 Compressed image size: ${compressedSizeKB.toFixed(2)}KB (${((1 - compressedSizeKB / originalSizeKB) * 100).toFixed(1)}% reduction)`);
    
    if (compressedSizeKB > 100) {
      console.warn(`⚠️  Compressed image is ${compressedSizeKB.toFixed(2)}KB (target: <100KB)`);
    } else {
      console.log(`✅ Image compressed successfully to ${compressedSizeKB.toFixed(2)}KB`);
    }

    return {
      url: compressedBase64,
      size: compressedBuffer.length,
      format: 'jpeg',
    };
  } catch (error) {
    console.error('❌ Base64 compression failed:', error);
    throw error;
  }
}

/**
 * Main upload function - compresses and returns base64 for database storage
 */
export async function uploadImage(base64Image: string): Promise<UploadResult> {
  console.log('�️  Compressing image for database storage...');
  
  const result = await compressBase64(base64Image);
  
  console.log(`✅ Image ready for database storage: ${(result.size / 1024).toFixed(2)}KB`);
  return result;
}

/**
 * Delete image from storage
 * For base64 storage, images are deleted automatically with the database record
 */
export async function deleteImage(_imageUrl: string): Promise<void> {
  // Base64 images don't need separate deletion
  // They're removed when the database record is deleted
  console.log('ℹ️  Base64 image will be removed with database record');
}

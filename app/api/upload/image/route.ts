import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import getAuthOptions from '@/modules/auth';
import { uploadImage } from '@/lib/image-upload';
import { log } from '@/lib/logger';
import prisma from '@/lib/prisma';
import {
  base64ToBuffer,
  getMimeTypeFromBase64,
  formatFileSize,
  optimizeImage,
} from '@/lib/media-utils';

// For R2 upload (will work once dependencies are installed)
let uploadToR2: any, generateFileName: any, validateFileType: any, ALLOWED_IMAGE_TYPES: any, MAX_IMAGE_SIZE: any;

try {
  const r2Module = require('@/lib/r2');
  uploadToR2 = r2Module.uploadToR2;
  generateFileName = r2Module.generateFileName;
  validateFileType = r2Module.validateFileType;
  ALLOWED_IMAGE_TYPES = r2Module.ALLOWED_IMAGE_TYPES;
  MAX_IMAGE_SIZE = r2Module.MAX_IMAGE_SIZE;
} catch (error) {
  console.warn('R2 module not available. Falling back to existing upload strategy.');
}

/**
 * POST /api/upload/image
 * Upload an image (base64) and return the stored URL
 * 
 * This endpoint handles image upload with automatic storage strategy:
 * 1. Cloudinary (if configured) - Best for production
 * 2. Local filesystem - Good for development
 * 3. Compressed base64 - Fallback (not recommended)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Validate base64 format
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Expected base64 data URL.' },
        { status: 400 }
      );
    }

    log.info(`📤 Image upload requested by: ${session.user.email}`);

    // Try R2 upload first if configured
    if (uploadToR2 && generateFileName) {
      try {
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Extract MIME type and validate
        const mimeType = getMimeTypeFromBase64(image);
        if (!mimeType) {
          return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
        }

        // Convert and validate
        const imageBuffer = base64ToBuffer(image);
        const fileSize = imageBuffer.length;

        if (MAX_IMAGE_SIZE && fileSize > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            {
              error: 'Image too large',
              details: `Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}`,
            },
            { status: 400 }
          );
        }

        if (ALLOWED_IMAGE_TYPES && validateFileType && !validateFileType(mimeType, ALLOWED_IMAGE_TYPES)) {
          return NextResponse.json(
            { error: 'Invalid image type', details: `Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
            { status: 400 }
          );
        }

        // Optimize image
        const optimizedBuffer = await optimizeImage(imageBuffer, {
          maxWidth: 2048,
          maxHeight: 2048,
          quality: 85,
          format: mimeType.includes('png') ? 'png' : 'jpeg',
        });

        // Generate filename and upload to R2
        const fileName = generateFileName(user.id, `image.${mimeType.split('/')[1]}`, 'image');
        const fileUrl = await uploadToR2(optimizedBuffer, fileName, mimeType);

        // Save metadata to database
        const media = await prisma.media.create({
          data: {
            userId: user.id,
            fileName: fileName,
            fileUrl: fileUrl,
            fileType: mimeType,
            fileSize: optimizedBuffer.length,
            mediaType: 'image',
          },
        });

        log.info(`✅ Image uploaded to R2 successfully (${formatFileSize(media.fileSize)})`);

        return NextResponse.json({
          imageUrl: fileUrl,
          size: media.fileSize,
          strategy: 'r2',
          media: {
            id: media.id,
            fileName: media.fileName,
            uploadedAt: media.uploadedAt,
          },
        });
      } catch (r2Error) {
        log.error('R2 upload failed, falling back to existing strategy:', r2Error);
        // Continue to fallback
      }
    }

    // Fallback to existing upload strategy
    const result = await uploadImage(image);
    log.info(`✅ Image uploaded successfully (${(result.size / 1024).toFixed(2)}KB)`);

    return NextResponse.json({
      imageUrl: result.url,
      size: result.size,
      strategy: 'fallback',
    });
  } catch (error) {
    log.error('Image upload failed:', error);
    console.error('Image upload error:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

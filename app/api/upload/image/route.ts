import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import { uploadImage } from '@/lib/image-upload';
import { log } from '@/lib/logger';

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

    // Upload image using the appropriate strategy
    const result = await uploadImage(image);

    log.info(`✅ Image uploaded successfully (${(result.size / 1024).toFixed(2)}KB)`);

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      size: result.size,
      format: result.format,
    });
  } catch (error) {
    log.error('Error uploading image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

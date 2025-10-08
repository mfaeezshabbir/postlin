import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import getAuthOptions from '@/modules/auth';
import prisma from '@/lib/prisma';
import {
  videoBase64ToBuffer,
  getMimeTypeFromBase64,
  formatFileSize,
} from '@/lib/media-utils';

// For R2 upload (will work once dependencies are installed)
let uploadToR2: any, generateFileName: any, validateFileType: any, ALLOWED_VIDEO_TYPES: any, MAX_VIDEO_SIZE: any;

try {
  const r2Module = require('@/lib/r2');
  uploadToR2 = r2Module.uploadToR2;
  generateFileName = r2Module.generateFileName;
  validateFileType = r2Module.validateFileType;
  ALLOWED_VIDEO_TYPES = r2Module.ALLOWED_VIDEO_TYPES;
  MAX_VIDEO_SIZE = r2Module.MAX_VIDEO_SIZE;
} catch (error) {
  console.warn('R2 module not available. Video upload requires @aws-sdk/client-s3.');
}

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
    const { video, metadata } = body;

    if (!video) {
      return NextResponse.json(
        { error: 'No video provided' },
        { status: 400 }
      );
    }

    // Check if R2 is configured
    if (!uploadToR2 || !generateFileName) {
      return NextResponse.json(
        {
          error: 'Video upload not configured',
          details: 'Please install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner, then configure R2. See docs/R2_STORAGE_SETUP.md',
          setup: {
            step1: 'npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp',
            step2: 'Configure R2 environment variables in .env.local',
            step3: 'Follow docs/R2_STORAGE_SETUP.md for detailed setup',
          },
        },
        { status: 501 } // 501 Not Implemented
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract MIME type
    const mimeType = getMimeTypeFromBase64(video);
    if (!mimeType) {
      return NextResponse.json({ error: 'Invalid video format' }, { status: 400 });
    }

    // Validate file type
    if (validateFileType && !validateFileType(mimeType, ALLOWED_VIDEO_TYPES)) {
      return NextResponse.json(
        {
          error: 'Invalid video type',
          details: `Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const videoBuffer = videoBase64ToBuffer(video);
    const fileSize = videoBuffer.length;

    // Validate file size
    if (MAX_VIDEO_SIZE && fileSize > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error: 'Video too large',
          details: `Maximum size is ${formatFileSize(MAX_VIDEO_SIZE)}, your video is ${formatFileSize(fileSize)}`,
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = generateFileName(user.id, `video.${mimeType.split('/')[1]}`, 'video');

    // Upload to R2
    const fileUrl = await uploadToR2(videoBuffer, fileName, mimeType);

    // Save media metadata to database
    const media = await prisma.media.create({
      data: {
        userId: user.id,
        fileName: fileName,
        fileUrl: fileUrl,
        fileType: mimeType,
        fileSize: fileSize,
        mediaType: 'video',
        duration: metadata?.duration || null,
        width: metadata?.width || null,
        height: metadata?.height || null,
      },
    });

    console.log(`✅ Video uploaded to R2: ${formatFileSize(fileSize)}`);

    return NextResponse.json({
      success: true,
      videoUrl: fileUrl,
      media: {
        id: media.id,
        fileName: media.fileName,
        fileSize: formatFileSize(media.fileSize),
        fileType: media.fileType,
        duration: media.duration,
        uploadedAt: media.uploadedAt,
      },
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

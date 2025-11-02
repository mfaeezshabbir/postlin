import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/profile
 * Get user profile with feature flags
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        googleId: true,
        linkedInId: true,
        linkedInConnected: true,
        geminiApiKeyEncrypted: true,
        geminiKeyAddedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return profile with feature flags
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      hasGoogleAuth: !!user.googleId,
      hasLinkedInAuth: !!user.linkedInId,
      linkedInConnected: user.linkedInConnected,
      hasGeminiKey: !!user.geminiApiKeyEncrypted,
      geminiKeyAddedAt: user.geminiKeyAddedAt,
      createdAt: user.createdAt,
      // Feature flags
      features: {
        canUseGemini: !!user.geminiApiKeyEncrypted,
        canPostToLinkedIn: user.linkedInConnected && !!user.linkedInId,
        canUseManualPosting: true, // Always available
      },
    });
  } catch (error) {
    log.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

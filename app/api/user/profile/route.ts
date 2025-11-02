import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/user/profile
 * Get current user's profile with onboarding flags
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

    // Get user from database
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
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return profile with flags (don't expose encrypted key)
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      hasGeminiKey: !!user.geminiApiKeyEncrypted,
      linkedInConnected: user.linkedInConnected,
      geminiKeyAddedAt: user.geminiKeyAddedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      needsOnboarding: !user.geminiApiKeyEncrypted, // User needs onboarding if no Gemini key
    };

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    log.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

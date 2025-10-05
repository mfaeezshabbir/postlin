import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/linkedin/me
 * Get current user's LinkedIn profile information
 * Useful for debugging LinkedIn API issues
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
        linkedInId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get LinkedIn access token from session
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json({
        user,
        hasAccessToken: false,
        message: 'No LinkedIn access token found. Please log out and log in again.',
      });
    }

    // Try to fetch LinkedIn profile
    try {
      const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        log.error('LinkedIn profile fetch error:', {
          status: profileResponse.status,
          error: errorText,
        });

        return NextResponse.json({
          user,
          hasAccessToken: true,
          linkedInApiError: {
            status: profileResponse.status,
            message: 'Failed to fetch LinkedIn profile',
            details: errorText,
          },
        });
      }

      const profileData = await profileResponse.json();

      return NextResponse.json({
        user,
        hasAccessToken: true,
        linkedInProfile: profileData,
        message: 'Successfully connected to LinkedIn API',
      });
    } catch (error) {
      log.error('Error fetching LinkedIn profile:', error);
      
      return NextResponse.json({
        user,
        hasAccessToken: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    log.error('Error in /api/linkedin/me:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

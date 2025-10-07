import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';

/**
 * GET /api/posts/published
 * Get all published posts for the authenticated user
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
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch published posts
    const posts = await prisma.post.findMany({
      where: {
        userId: user.id,
        status: 'PUBLISHED',
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    // Calculate stats
    const stats = {
      total: posts.length,
      thisMonth: posts.filter((p: any) => {
        const publishedDate = new Date(p.publishedAt!);
        const now = new Date();
        return publishedDate.getMonth() === now.getMonth() &&
               publishedDate.getFullYear() === now.getFullYear();
      }).length,
    };

    return NextResponse.json({
      success: true,
      posts,
      stats,
    });
  } catch (error) {
    log.error('Error fetching published posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch published posts' },
      { status: 500 }
    );
  }
}

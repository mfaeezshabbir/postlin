// Analytics module: engagement tracking
import prisma from '../../lib/prisma';

export async function recordAnalytics(postId: string, data: Partial<{ impressions: number; likes: number; comments: number; shares: number }>) {
  // Upsert analytics for a post
  return prisma.analytics.upsert({
    where: { postId },
    update: data as any,
    create: { postId, ...data } as any,
  });
}

export async function fetchAnalyticsForPost(postId: string) {
  return prisma.analytics.findUnique({ where: { postId } });
}

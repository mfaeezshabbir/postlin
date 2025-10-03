// Drafts service: create/update drafts using Prisma
import prisma from '../../lib/prisma';

export async function createDraft(userId: string, draftText: string) {
  return prisma.post.create({
    data: {
      userId,
      draftText,
      status: 'DRAFT',
    },
  });
}

export async function updateDraft(id: string, updates: Partial<{ draftText: string; finalText: string; status: string }>) {
  return prisma.post.update({ where: { id }, data: updates as any });
}

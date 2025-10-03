// Users module: profile and preferences helpers
import prisma from '../../lib/prisma';

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function upsertPreferences(userId: string, prefs: any) {
  return prisma.preference.upsert({
    where: { userId },
    update: prefs,
    create: { userId, ...prefs },
  });
}

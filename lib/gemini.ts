import prisma from './prisma';
import { decrypt } from './encryption';
import { log } from './logger';

/**
 * Get decrypted Gemini API key for a user
 * @param userId - User ID
 * @returns Decrypted API key or null if not set
 */
export async function getUserGeminiKey(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiApiKeyEncrypted: true },
    });

    if (!user || !user.geminiApiKeyEncrypted) {
      return null;
    }

    // Decrypt the API key
    try {
      return decrypt(user.geminiApiKeyEncrypted);
    } catch (error) {
      log.error('Failed to decrypt Gemini API key for user', { userId, error });
      return null;
    }
  } catch (error) {
    log.error('Failed to fetch user Gemini key', { userId, error });
    return null;
  }
}

/**
 * Check if user has a Gemini API key
 * @param userId - User ID
 * @returns True if user has a key, false otherwise
 */
export async function userHasGeminiKey(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiApiKeyEncrypted: true },
    });

    return !!user?.geminiApiKeyEncrypted;
  } catch (error) {
    log.error('Failed to check user Gemini key', { userId, error });
    return false;
  }
}

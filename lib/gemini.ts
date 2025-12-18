import prisma from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption";
import { log } from "@/lib/logger";

/**
 * Helper function to get decrypted Gemini API key for a user
 * This should be used by other API endpoints that need the key
 */
export async function getUserGeminiKey(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { geminiApiKeyEncrypted: true },
    });

    if (!user?.geminiApiKeyEncrypted) {
      return null;
    }

    return decryptApiKey(user.geminiApiKeyEncrypted);
  } catch (error) {
    log.error("Error getting user Gemini key:", error);
    return null;
  }
}

/**
 * Factory for creating AI provider instances based on configuration
 */

import { AIProvider as AIProviderType } from "./types";
import { AIProvider } from "./providers/base";
import { GeminiProvider } from "./providers/gemini";
import { AIProviderConfig } from "./types";
import { TextEncoder } from "util";
import prisma from "@/lib/prisma";
import { getUserGeminiKey } from "@/lib/gemini";

(global as any).TextEncoder = TextEncoder;

/**
 * Create an AI provider instance based on the configuration
 */
export function createProvider(config: AIProviderConfig): AIProvider {
  switch (config.provider) {
    case "gemini":
      return new GeminiProvider(config);
    // Future providers can be added here
    // case "openai":
    //   return new OpenAIProvider(config);
    // case "huggingface":
    //   return new HuggingFaceProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

/**
 * Get provider from user configuration
 * This will fetch user's preferred provider and API key from the database
 */
export async function getProviderForUser(
  userId: string,
  provider?: AIProviderType,
): Promise<AIProvider> {
  // Get user's configuration
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      geminiApiKeyEncrypted: true,
      geminiModel: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // For now, we only support Gemini
  // Future: support multiple providers based on user preference
  const selectedProvider = provider || "gemini";

  if (selectedProvider === "gemini") {
    const apiKey = await getUserGeminiKey(userId);
    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    return createProvider({
      provider: "gemini",
      apiKey,
      model: user.geminiModel || undefined,
    });
  }

  throw new Error(`Provider ${selectedProvider} not yet supported`);
}

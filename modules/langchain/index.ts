/**
 * Main orchestration layer for AI chains using LangChain
 * This module provides high-level functions for LinkedIn post generation
 */

import { getProviderForUser } from "./factory";
import { PostGenerationInput, PostGenerationOutput, ImagePromptOutput } from "./types";
import { log } from "@/lib/logger";

/**
 * Generate a LinkedIn post using LangChain
 * This is the main entry point for post generation
 */
export async function generateLinkedInPost(
  userId: string,
  input: PostGenerationInput
): Promise<PostGenerationOutput> {
  try {
    log.info(`Generating LinkedIn post for user: ${userId}`);

    // Get the AI provider for the user
    const provider = await getProviderForUser(userId);

    // Generate the post
    const result = await provider.generatePost(
      input.prompt,
      input.tone || "professional",
      input.length || "medium"
    );

    log.info("LinkedIn post generated successfully");
    return result;
  } catch (error) {
    log.error("Error generating LinkedIn post:", error);
    throw error;
  }
}

/**
 * Generate an image prompt for a LinkedIn post
 */
export async function generateImagePromptForPost(
  userId: string,
  postContent: string
): Promise<ImagePromptOutput> {
  try {
    log.info(`Generating image prompt for user: ${userId}`);

    // Get the AI provider for the user
    const provider = await getProviderForUser(userId);

    // Generate the image prompt
    const result = await provider.generateImagePrompt(postContent);

    log.info("Image prompt generated successfully");
    return result;
  } catch (error) {
    log.error("Error generating image prompt:", error);
    throw error;
  }
}

/**
 * Validate user's API key
 */
export async function validateUserApiKey(userId: string): Promise<boolean> {
  try {
    const provider = await getProviderForUser(userId);
    return await provider.validateApiKey();
  } catch (error) {
    log.error("Error validating user API key:", error);
    return false;
  }
}

// Re-export types and utilities for convenience
export * from "./types";
export * from "./factory";
export * from "./utils";

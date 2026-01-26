/**
 * Base provider interface for AI models using LangChain
 */

import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIProviderConfig, PostGenerationOutput, ImagePromptOutput } from "../types";

/**
 * Abstract base class for AI providers
 */
export abstract class AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  /**
   * Get the underlying chat model instance
   */
  abstract getChatModel(): BaseChatModel;

  /**
   * Get the model name to use
   */
  abstract getModelName(): string;

  /**
   * Generate a LinkedIn post
   */
  abstract generatePost(
    prompt: string,
    tone: string,
    length: string
  ): Promise<PostGenerationOutput>;

  /**
   * Generate an image prompt
   */
  abstract generateImagePrompt(postContent: string): Promise<ImagePromptOutput>;

  /**
   * Validate the API key
   */
  abstract validateApiKey(): Promise<boolean>;
}

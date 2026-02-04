/**
 * Gemini AI provider implementation using LangChain
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIProvider } from "./base";
import {
  AIProviderConfig,
  PostGenerationOutput,
  ImagePromptOutput,
} from "../types";
import {
  POST_GENERATION_TEMPLATE,
  IMAGE_PROMPT_TEMPLATE,
  buildSystemPrompt,
} from "../prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { log } from "@/lib/logger";
import { retryWithBackoff, parseProviderError } from "../utils";

export class GeminiProvider extends AIProvider {
  private chatModel: ChatGoogleGenerativeAI;

  constructor(config: AIProviderConfig) {
    super(config);

    const modelName = config.model || "gemini-2.5-flash";

    this.chatModel = new ChatGoogleGenerativeAI({
      apiKey: config.apiKey,
      model: modelName,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
  }

  getChatModel(): ChatGoogleGenerativeAI {
    return this.chatModel;
  }

  getModelName(): string {
    return this.config.model || "gemini-2.5-flash";
  }

  async generatePost(
    prompt: string,
    tone: string = "professional",
    length: string = "medium",
  ): Promise<PostGenerationOutput> {
    try {
      const systemPrompt = buildSystemPrompt(tone, length);

      // Use retry with exponential backoff
      const result = await retryWithBackoff(
        async () => {
          // Format prompt
          const formatted = await POST_GENERATION_TEMPLATE.format({
            systemPrompt,
            prompt,
          });

          // Invoke model
          const response = await this.chatModel.invoke(formatted);

          // Parse output
          const parser = new JsonOutputParser<PostGenerationOutput>();
          return await parser.parse(response.content as string);
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        "Gemini post generation",
      );

      log.info("Post generated successfully with LangChain and Gemini");

      // Validate the result has required fields
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format from AI model");
      }

      return {
        content: result.content || "",
        hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
        summary: result.summary || "",
        wordCount: typeof result.wordCount === "number" ? result.wordCount : 0,
      };
    } catch (error) {
      const aiError = parseProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Gemini",
      );
      log.error("Error generating post with Gemini:", aiError);
      throw aiError;
    }
  }

  async generateImagePrompt(postContent: string): Promise<ImagePromptOutput> {
    try {
      // Use retry with exponential backoff
      const result = await retryWithBackoff(
        async () => {
          // Format prompt
          const formatted = await IMAGE_PROMPT_TEMPLATE.format({
            postContent,
          });

          // Invoke model
          const response = await this.chatModel.invoke(formatted);

          // Parse output
          const parser = new JsonOutputParser<ImagePromptOutput>();
          return await parser.parse(response.content as string);
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 10000,
          backoffMultiplier: 2,
        },
        "Gemini image prompt generation",
      );

      log.info("Image prompt generated successfully with LangChain and Gemini");

      // Validate the result has required fields
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format from AI model");
      }

      return {
        imagePrompt: result.imagePrompt || "",
        style: result.style || "professional",
        suggestedColors: Array.isArray(result.suggestedColors)
          ? result.suggestedColors
          : [],
        keyElements: Array.isArray(result.keyElements)
          ? result.keyElements
          : [],
        composition: result.composition || "",
        lighting: result.lighting || "",
        mood: result.mood || "",
      };
    } catch (error) {
      const aiError = parseProviderError(
        error instanceof Error ? error : new Error(String(error)),
        "Gemini",
      );
      log.error("Error generating image prompt with Gemini:", aiError);
      throw aiError;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Try a simple generation to validate the API key (without retry)
      await this.chatModel.invoke("Test");
      return true;
    } catch (error) {
      log.error("Gemini API key validation failed:", error);
      return false;
    }
  }
}

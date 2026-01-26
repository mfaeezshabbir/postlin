/**
 * Gemini AI provider implementation using LangChain
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIProvider } from "./base";
import { AIProviderConfig, PostGenerationOutput, ImagePromptOutput } from "../types";
import { POST_GENERATION_TEMPLATE, IMAGE_PROMPT_TEMPLATE, buildSystemPrompt } from "../prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { log } from "@/lib/logger";

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
    length: string = "medium"
  ): Promise<PostGenerationOutput> {
    try {
      const systemPrompt = buildSystemPrompt(tone, length);
      
      // Create the chain with JSON output parser
      const parser = new JsonOutputParser<PostGenerationOutput>();
      const chain = POST_GENERATION_TEMPLATE.pipe(this.chatModel).pipe(parser);

      // Generate the post
      const result = await chain.invoke({
        systemPrompt,
        prompt,
      });

      log.info("Post generated successfully with LangChain");

      return {
        content: result.content || "",
        hashtags: result.hashtags || [],
        summary: result.summary || "",
        wordCount: result.wordCount || 0,
      };
    } catch (error) {
      log.error("Error generating post with Gemini:", error);
      throw error;
    }
  }

  async generateImagePrompt(postContent: string): Promise<ImagePromptOutput> {
    try {
      // Create the chain with JSON output parser
      const parser = new JsonOutputParser<ImagePromptOutput>();
      const chain = IMAGE_PROMPT_TEMPLATE.pipe(this.chatModel).pipe(parser);

      // Generate the image prompt
      const result = await chain.invoke({
        postContent,
      });

      log.info("Image prompt generated successfully with LangChain");

      return {
        imagePrompt: result.imagePrompt || "",
        style: result.style || "professional",
        suggestedColors: result.suggestedColors || [],
        keyElements: result.keyElements || [],
        composition: result.composition || "",
        lighting: result.lighting || "",
        mood: result.mood || "",
      };
    } catch (error) {
      log.error("Error generating image prompt with Gemini:", error);
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Try a simple generation to validate the API key
      await this.chatModel.invoke("Test");
      return true;
    } catch (error) {
      log.error("Gemini API key validation failed:", error);
      return false;
    }
  }
}

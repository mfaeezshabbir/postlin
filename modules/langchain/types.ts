/**
 * Types and interfaces for LangChain-based AI providers
 */

export type AIProvider = "gemini" | "openai" | "huggingface";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface PostGenerationInput {
  prompt: string;
  tone?: string;
  length?: string;
  previousContext?: string;
}

export interface PostGenerationOutput {
  content: string;
  hashtags: string[];
  summary: string;
  wordCount: number;
}

export interface ImagePromptOutput {
  imagePrompt: string;
  style: string;
  suggestedColors: string[];
  keyElements: string[];
  composition: string;
  lighting: string;
  mood: string;
}

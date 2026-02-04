/**
 * Error handling and retry utilities for LangChain integration
 */

import { log } from "@/lib/logger";

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
): number {
  const delay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay,
  );
  // Add jitter (randomization) to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context: string = "operation",
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateBackoff(attempt - 1, config);
        log.info(
          `Retry attempt ${attempt}/${config.maxRetries} for ${context} after ${delay}ms`,
        );
        await sleep(delay);
      }

      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      if (!isRetryableError(lastError)) {
        log.error(`Non-retryable error in ${context}:`, lastError);
        throw lastError;
      }

      if (attempt === config.maxRetries) {
        log.error(
          `Max retries (${config.maxRetries}) exceeded for ${context}:`,
          lastError,
        );
        break;
      }

      log.warn(
        `Retryable error in ${context} (attempt ${attempt + 1}/${config.maxRetries}):`,
        lastError.message,
      );
    }
  }

  throw lastError || new Error(`Failed after ${config.maxRetries} retries`);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error || !error.message) {
    return true; // Default to retryable if no message
  }
  const message = String(error.message).toLowerCase();

  // Network errors - retryable
  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  ) {
    return true;
  }

  // Rate limit errors - retryable
  if (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("rate limit")
  ) {
    return true;
  }

  // Server errors (5xx) - retryable
  if (message.includes("500") || message.includes("503")) {
    return true;
  }

  // Authentication errors - not retryable
  if (
    message.includes("401") ||
    message.includes("403") ||
    message.includes("unauthorized") ||
    message.includes("api key")
  ) {
    return false;
  }

  // Client errors (4xx except 429) - not retryable
  if (
    message.includes("400") ||
    message.includes("404") ||
    message.includes("invalid")
  ) {
    return false;
  }

  // Default: retry unknown errors
  return true;
}

/**
 * Error types for better error handling
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public isRetryable: boolean = true,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export class RateLimitError extends AIProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for ${provider}${retryAfter ? `. Retry after ${retryAfter}s` : ""}`,
      provider,
      true,
    );
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends AIProviderError {
  constructor(provider: string) {
    super(
      `Authentication failed for ${provider}. Check API key.`,
      provider,
      false,
    );
    this.name = "AuthenticationError";
  }
}

export class ModelNotFoundError extends AIProviderError {
  constructor(provider: string, model: string) {
    super(`Model ${model} not found for provider ${provider}`, provider, false);
    this.name = "ModelNotFoundError";
  }
}

/**
 * Parse error and return appropriate error type
 */
export function parseProviderError(
  error: any,
  provider: string,
): AIProviderError {
  const originalMessage = error?.message || String(error);
  const message = String(originalMessage).toLowerCase();

  if (message.includes("429") || message.includes("rate limit")) {
    return new RateLimitError(provider);
  }

  if (
    message.includes("401") ||
    message.includes("403") ||
    message.includes("unauthorized") ||
    message.includes("api key")
  ) {
    return new AuthenticationError(provider);
  }

  if (message.includes("model") && message.includes("not found")) {
    return new ModelNotFoundError(provider, "unknown");
  }

  return new AIProviderError(
    String(originalMessage),
    provider,
    isRetryableError(error),
  );
}

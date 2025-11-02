/**
 * Validation utilities for user inputs
 */

/**
 * Validate Gemini API key format
 * @param apiKey - The API key to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateGeminiApiKey(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }

  // Basic validation - Gemini API keys typically start with "AIzaSy"
  if (!apiKey.startsWith('AIzaSy')) {
    return { isValid: false, error: 'Invalid Gemini API key format. Keys should start with "AIzaSy"' };
  }

  return { isValid: true };
}

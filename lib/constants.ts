/**
 * Application-wide constants
 */

// Gemini API key validation
export const GEMINI_API_KEY_MIN_LENGTH = 35;

// Available Gemini models for text generation
export const GEMINI_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Fast & Efficient)" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Balanced)" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro (Advanced)" },
  { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)" },
] as const;

// Default model if none selected
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// Other constants can be added here as needed

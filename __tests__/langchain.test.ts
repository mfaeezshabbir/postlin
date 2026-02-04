/**
 * Tests for LangChain integration
 */

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/gemini", () => ({
  getUserGeminiKey: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock LangChain modules
jest.mock("@langchain/google-genai", () => ({
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        content: "Test LinkedIn post content",
        hashtags: ["test", "linkedin", "ai"],
        summary: "A test post",
        wordCount: 5,
      }),
    }),
  })),
}));

const prisma = require("@/lib/prisma").default;
const { getUserGeminiKey } = require("@/lib/gemini");

describe("LangChain Integration", () => {
  jest.setTimeout(30000);
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Provider Factory", () => {
    it("should create Gemini provider with user config", async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: "encrypted_key",
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue("test_api_key");

      const { getProviderForUser } =
        await import("@/modules/langchain/factory");
      const provider = await getProviderForUser("user123");

      expect(provider).toBeDefined();
      expect(provider.getModelName()).toBe("gemini-2.5-flash");
    });

    it("should throw error when user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const { getProviderForUser } =
        await import("@/modules/langchain/factory");

      await expect(getProviderForUser("nonexistent")).rejects.toThrow(
        "User not found",
      );
    });

    it("should throw error when API key not configured", async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: null,
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue(null);

      const { getProviderForUser } =
        await import("@/modules/langchain/factory");

      await expect(getProviderForUser("user123")).rejects.toThrow(
        "Gemini API key not configured",
      );
    });
  });

  describe("Post Generation", () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: "encrypted_key",
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue("test_api_key");
    });

    it("should generate LinkedIn post using LangChain", async () => {
      const { generateLinkedInPost } = await import("@/modules/langchain");

      const result = await generateLinkedInPost("user123", {
        prompt: "Write about AI in business",
        tone: "professional",
        length: "medium",
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.hashtags).toBeDefined();
      expect(Array.isArray(result.hashtags)).toBe(true);
      expect(result.summary).toBeDefined();
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it("should handle different tone options", async () => {
      const { generateLinkedInPost } = await import("@/modules/langchain");

      const tones = [
        "professional",
        "casual",
        "enthusiastic",
        "informative",
        "inspirational",
      ];

      for (const tone of tones) {
        const result = await generateLinkedInPost("user123", {
          prompt: "Test prompt",
          tone,
          length: "medium",
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });

    it("should handle different length options", async () => {
      const { generateLinkedInPost } = await import("@/modules/langchain");

      const lengths = ["short", "medium", "long"];

      for (const length of lengths) {
        const result = await generateLinkedInPost("user123", {
          prompt: "Test prompt",
          tone: "professional",
          length,
        });

        expect(result).toBeDefined();
        expect(result.content).toBeDefined();
      }
    });
  });

  describe("Image Prompt Generation", () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: "encrypted_key",
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue("test_api_key");
    });

    it("should generate image prompt for post", async () => {
      const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
      ChatGoogleGenerativeAI.mockImplementation(() => ({
        invoke: jest.fn().mockResolvedValue({
          content: JSON.stringify({
            imagePrompt: "A professional LinkedIn image",
            style: "professional",
            suggestedColors: ["blue", "white", "gray"],
            keyElements: ["laptop", "office", "person"],
            composition: "Centered subject",
            lighting: "Natural soft lighting",
            mood: "Professional and focused",
          }),
        }),
      }));

      const { generateImagePromptForPost } =
        await import("@/modules/langchain");

      const result = await generateImagePromptForPost(
        "user123",
        "Test post content",
      );

      expect(result).toBeDefined();
      expect(result.imagePrompt).toBeDefined();
      expect(result.style).toBeDefined();
      expect(Array.isArray(result.suggestedColors)).toBe(true);
      expect(Array.isArray(result.keyElements)).toBe(true);
    });
  });

  describe("API Key Validation", () => {
    it("should validate user API key", async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: "encrypted_key",
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue("test_api_key");

      const { validateUserApiKey } = await import("@/modules/langchain");

      const isValid = await validateUserApiKey("user123");

      expect(isValid).toBe(true);
    });

    it("should return false for invalid API key", async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: "encrypted_key",
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue("invalid_key");

      const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
      ChatGoogleGenerativeAI.mockImplementation(() => ({
        invoke: jest.fn().mockRejectedValue(new Error("Invalid API key")),
      }));

      const { validateUserApiKey } = await import("@/modules/langchain");

      const isValid = await validateUserApiKey("user123");

      expect(isValid).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle LangChain errors gracefully", async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: "encrypted_key",
        geminiModel: "gemini-2.5-flash",
      });
      getUserGeminiKey.mockResolvedValue("test_api_key");

      const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
      ChatGoogleGenerativeAI.mockImplementation(() => ({
        invoke: jest.fn().mockRejectedValue(new Error("API Error")),
      }));

      const { generateLinkedInPost } = await import("@/modules/langchain");

      await expect(
        generateLinkedInPost("user123", {
          prompt: "Test prompt",
          tone: "professional",
          length: "medium",
        }),
      ).rejects.toThrow("API Error");
    });
  });
});

import {
  encryptApiKey,
  decryptApiKey,
  validateEncryption,
  generateEncryptionKey,
  resetKeyCache,
} from "@/lib/encryption";

// Set up test encryption key
const TEST_ENCRYPTION_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; // 32 bytes base64

describe("Encryption", () => {
  beforeAll(() => {
    process.env.GEMINI_KEYS_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
  });

  afterAll(() => {
    delete process.env.GEMINI_KEYS_ENCRYPTION_KEY;
    resetKeyCache();
  });

  describe("generateEncryptionKey", () => {
    it("should generate a valid base64 key", () => {
      const key = generateEncryptionKey();
      expect(key).toBeTruthy();
      expect(typeof key).toBe("string");

      // Should be base64
      const decoded = Buffer.from(key, "base64");
      expect(decoded.length).toBe(32); // 256 bits
    });

    it("should generate unique keys", () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe("encryptApiKey", () => {
    it("should encrypt an API key", () => {
      const apiKey = "test-api-key-12345";
      const encrypted = encryptApiKey(apiKey);

      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe("string");
      expect(encrypted).not.toBe(apiKey);
    });

    it("should produce different ciphertexts for the same input", () => {
      const apiKey = "test-api-key-12345";
      const encrypted1 = encryptApiKey(apiKey);
      const encrypted2 = encryptApiKey(apiKey);

      // Due to random nonce, same input should produce different ciphertext
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should throw error for empty string", () => {
      expect(() => encryptApiKey("")).toThrow();
    });

    it("should throw error for invalid input", () => {
      expect(() => encryptApiKey(null as any)).toThrow();
      expect(() => encryptApiKey(undefined as any)).toThrow();
    });
  });

  describe("decryptApiKey", () => {
    it("should decrypt an encrypted API key", () => {
      const apiKey = "test-api-key-12345";
      const encrypted = encryptApiKey(apiKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it("should handle special characters", () => {
      const apiKey = "AIzaSyC_test-key-with-special-chars_1234567890-_";
      const encrypted = encryptApiKey(apiKey);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    it('should throw "malformed or corrupted" error for invalid base64 data', () => {
      expect(() => decryptApiKey("invalid-base64-data")).toThrow(
        /malformed or corrupted/
      );
    });

    it("should throw error for empty string", () => {
      expect(() => decryptApiKey("")).toThrow();
    });

    it('should throw "authentication failed" when decrypting with wrong key', () => {
      const apiKey = "test-api-key-12345";
      const encrypted = encryptApiKey(apiKey);

      // Temporarily change the encryption key
      const originalKey = process.env.GEMINI_KEYS_ENCRYPTION_KEY;
      const wrongKey = generateEncryptionKey();
      process.env.GEMINI_KEYS_ENCRYPTION_KEY = wrongKey;
      resetKeyCache(); // Force reload of key

      try {
        expect(() => decryptApiKey(encrypted)).toThrow(/authentication failed/);
      } finally {
        // Restore key
        process.env.GEMINI_KEYS_ENCRYPTION_KEY = originalKey;
        resetKeyCache(); // Ensure original key is reloaded
      }
    });

    it('should throw "authentication failed" when auth tag is tampered', () => {
      const apiKey = "test-api-key-12345";
      const encrypted = encryptApiKey(apiKey);
      const buffer = Buffer.from(encrypted, "base64");

      // The auth tag is at the end (last 16 bytes). Let's modify the last byte.
      buffer[buffer.length - 1] ^= 1;

      const tampered = buffer.toString("base64");
      expect(() => decryptApiKey(tampered)).toThrow(/authentication failed/);
    });
  });

  describe("validateEncryption", () => {
    it("should validate successful encryption/decryption", () => {
      const apiKey = "test-api-key-12345";
      expect(validateEncryption(apiKey)).toBe(true);
    });

    it("should return false for invalid input", () => {
      expect(validateEncryption("")).toBe(false);
    });
  });

  describe("encryption without key", () => {
    it("should throw error when encryption key is not set", () => {
      delete process.env.GEMINI_KEYS_ENCRYPTION_KEY;
      resetKeyCache(); // Force reload to see missing key

      expect(() => encryptApiKey("test")).toThrow(/GEMINI_KEYS_ENCRYPTION_KEY/);

      // Restore for other tests
      process.env.GEMINI_KEYS_ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
      resetKeyCache();
    });
  });

  describe("round-trip encryption", () => {
    it("should handle various API key formats", () => {
      const apiKeys = [
        "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO2345",
        "sk-proj-abcdefghijklmnopqrstuvwxyz123456",
        "simple-key",
        "key-with-dashes-and-numbers-123",
      ];

      apiKeys.forEach((key) => {
        const encrypted = encryptApiKey(key);
        const decrypted = decryptApiKey(encrypted);
        expect(decrypted).toBe(key);
      });
    });
  });
});

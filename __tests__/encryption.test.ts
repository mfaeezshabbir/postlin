import { encrypt, decrypt, generateEncryptionKey, isEncrypted } from '@/lib/encryption';

// Set a test encryption key
const TEST_ENCRYPTION_KEY = 'a'.repeat(64); // 64 hex characters = 32 bytes
process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;

describe('Encryption utilities', () => {
  describe('generateEncryptionKey', () => {
    it('generates a 64-character hex string', () => {
      const key = generateEncryptionKey();
      expect(key).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
    });

    it('generates unique keys', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('encrypt', () => {
    it('encrypts a string', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(plaintext);
      expect(typeof encrypted).toBe('string');
    });

    it('produces different ciphertext for same input', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      // Different because of random IV
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('throws error for empty text', () => {
      expect(() => encrypt('')).toThrow('Cannot encrypt empty text');
    });

    it('returns encrypted text in correct format', () => {
      const plaintext = 'test-api-key';
      const encrypted = encrypt(plaintext);
      
      // Format: iv:authTag:ciphertext
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);
    });
  });

  describe('decrypt', () => {
    it('decrypts encrypted text correctly', () => {
      const plaintext = 'test-gemini-api-key-abc123';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('decrypts complex strings', () => {
      const plaintext = 'AIzaSyD-1234567890abcdefghijklmnopqrstuvwxyz';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('throws error for empty text', () => {
      expect(() => decrypt('')).toThrow('Cannot decrypt empty text');
    });

    it('throws error for invalid format', () => {
      expect(() => decrypt('invalid-format')).toThrow('Invalid encrypted text format');
    });
  });

  describe('isEncrypted', () => {
    it('returns true for encrypted text', () => {
      const plaintext = 'test-api-key';
      const encrypted = encrypt(plaintext);
      
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(isEncrypted('plain-text-api-key')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });

    it('returns false for invalid format', () => {
      expect(isEncrypted('invalid:format')).toBe(false);
    });
  });

  describe('round-trip encryption', () => {
    const testCases = [
      'simple-key',
      'AIzaSyD-1234567890',
      'complex!@#$%^&*()key',
      'very-long-api-key-with-lots-of-characters-to-test-encryption-123456789',
    ];

    testCases.forEach((testCase) => {
      it(`encrypts and decrypts correctly: ${testCase.substring(0, 20)}...`, () => {
        const encrypted = encrypt(testCase);
        const decrypted = decrypt(encrypted);
        
        expect(decrypted).toBe(testCase);
      });
    });
  });
});

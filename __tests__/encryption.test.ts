// Set test encryption key before importing the module
const testKey = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const originalEnv = process.env.GEMINI_KEYS_ENCRYPTION_KEY;
process.env.GEMINI_KEYS_ENCRYPTION_KEY = testKey;

import { encrypt, decrypt, generateEncryptionKey } from '@/lib/encryption';

describe('Encryption Service', () => {
  beforeEach(() => {
    // Ensure test key is set before each test
    process.env.GEMINI_KEYS_ENCRYPTION_KEY = testKey;
  });
  
  afterAll(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.GEMINI_KEYS_ENCRYPTION_KEY = originalEnv;
    } else {
      delete process.env.GEMINI_KEYS_ENCRYPTION_KEY;
    }
  });
  
  describe('generateEncryptionKey', () => {
    it('should generate a 64 character hex string', () => {
      const key = generateEncryptionKey();
      expect(key).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(key)).toBe(true);
    });
    
    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      expect(key1).not.toBe(key2);
    });
  });
  
  describe('encrypt', () => {
    it('should encrypt a plaintext string', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted = encrypt(plaintext);
      
      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
    });
    
    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      
      expect(encrypted1).not.toBe(encrypted2);
    });
    
    it('should throw error if encryption key is not set', () => {
      delete process.env.GEMINI_KEYS_ENCRYPTION_KEY;
      
      expect(() => encrypt('test')).toThrow('Failed to encrypt data');
      
      // Restore for next test
      process.env.GEMINI_KEYS_ENCRYPTION_KEY = testKey;
    });
  });
  
  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
    
    it('should decrypt complex strings with special characters', () => {
      const plaintext = 'AIzaSyD_1234567890-abcdefghijklmnopqrstuvwxyz!@#$%^&*()';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
    
    it('should throw error for invalid encrypted data format', () => {
      expect(() => decrypt('invalid-data')).toThrow();
    });
    
    it('should throw error if decryption key is not set', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted = encrypt(plaintext);
      
      delete process.env.GEMINI_KEYS_ENCRYPTION_KEY;
      
      expect(() => decrypt(encrypted)).toThrow('Failed to decrypt data');
      
      // Restore for next test
      process.env.GEMINI_KEYS_ENCRYPTION_KEY = testKey;
    });
    
    it('should throw error for tampered data', () => {
      const plaintext = 'test-api-key-12345';
      const encrypted = encrypt(plaintext);
      
      // Tamper with the encrypted data by modifying the base64 encoded string
      const decoded = Buffer.from(encrypted, 'base64').toString('utf8');
      const parts = decoded.split(':');
      // Corrupt the auth tag
      parts[2] = 'ff'.repeat(16);
      const tamperedDecoded = parts.join(':');
      const tamperedData = Buffer.from(tamperedDecoded).toString('base64');
      
      expect(() => decrypt(tamperedData)).toThrow('Failed to decrypt data');
    });
  });
  
  describe('encrypt/decrypt round-trip', () => {
    it('should handle empty strings', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
    
    it('should handle long strings', () => {
      const plaintext = 'a'.repeat(1000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
    
    it('should handle unicode characters', () => {
      const plaintext = '🔑 API Key: test-émoji-日本語-12345';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });
});

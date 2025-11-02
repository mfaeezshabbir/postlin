import crypto from 'crypto';

// AES-256-GCM encryption for sensitive data like API keys
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const NONCE_LENGTH = 12; // 96 bits (recommended for GCM)
const TAG_LENGTH = 16; // 128 bits (authentication tag)

/**
 * Get encryption key from environment variable
 * The key should be a base64-encoded 32-byte string
 */
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.GEMINI_KEYS_ENCRYPTION_KEY;
  
  if (!keyEnv) {
    throw new Error('GEMINI_KEYS_ENCRYPTION_KEY environment variable not set');
  }

  try {
    const key = Buffer.from(keyEnv, 'base64');
    if (key.length !== KEY_LENGTH) {
      throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (base64-encoded)`);
    }
    return key;
  } catch (error) {
    throw new Error('Invalid GEMINI_KEYS_ENCRYPTION_KEY format. Must be base64-encoded 32 bytes.');
  }
}

/**
 * Generate a secure encryption key (for initial setup)
 * Run this once and store the result as GEMINI_KEYS_ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Encrypt a Gemini API key
 * Returns base64-encoded string containing: nonce + ciphertext + auth_tag
 */
export function encryptApiKey(apiKey: string): string {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key must be a non-empty string');
  }

  const key = getEncryptionKey();
  const nonce = crypto.randomBytes(NONCE_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, nonce);
  
  const encrypted = Buffer.concat([
    cipher.update(apiKey, 'utf8'),
    cipher.final(),
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine nonce + encrypted + authTag for storage
  const combined = Buffer.concat([nonce, encrypted, authTag]);
  
  return combined.toString('base64');
}

/**
 * Decrypt a Gemini API key
 * Takes base64-encoded string containing: nonce + ciphertext + auth_tag
 */
export function decryptApiKey(encryptedData: string): string {
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Encrypted data must be a non-empty string');
  }

  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, 'base64');
  
  // Extract components
  const nonce = combined.subarray(0, NONCE_LENGTH);
  const authTag = combined.subarray(combined.length - TAG_LENGTH);
  const encrypted = combined.subarray(NONCE_LENGTH, combined.length - TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAuthTag(authTag);
  
  try {
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error('Failed to decrypt API key. Data may be corrupted or encryption key is wrong.');
  }
}

/**
 * Validate that an API key can be encrypted and decrypted
 */
export function validateEncryption(apiKey: string): boolean {
  try {
    const encrypted = encryptApiKey(apiKey);
    const decrypted = decryptApiKey(encrypted);
    return decrypted === apiKey;
  } catch {
    return false;
  }
}

import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { log } from './logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit auth tag for GCM
const KEY_LENGTH = 32; // 256-bit key

/**
 * Get encryption key from environment variable
 * Must be a 32-byte (64 hex character) string
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.GEMINI_KEYS_ENCRYPTION_KEY;
  
  if (!keyHex) {
    throw new Error('GEMINI_KEYS_ENCRYPTION_KEY environment variable is not set');
  }
  
  // Convert hex string to buffer
  const key = Buffer.from(keyHex, 'hex');
  
  if (key.length !== KEY_LENGTH) {
    throw new Error(`GEMINI_KEYS_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters). Current length: ${key.length} bytes`);
  }
  
  return key;
}

/**
 * Encrypt a plaintext string using AES-256-GCM
 * Returns: base64 encoded string in format: iv:ciphertext:authTag
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);
    
    const cipher = createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv, ciphertext, and authTag
    const result = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    
    return Buffer.from(result).toString('base64');
  } catch (error) {
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown';
    log.error('Encryption error:', { type: errorType, message: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt an encrypted string using AES-256-GCM
 * Input: base64 encoded string in format: iv:ciphertext:authTag
 * Returns: plaintext string
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    
    // Decode from base64
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
    const parts = decoded.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown';
    log.error('Decryption error:', { type: errorType, message: error instanceof Error ? error.message : 'Unknown error' });
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Generate a random encryption key for GEMINI_KEYS_ENCRYPTION_KEY
 * This is a utility function for initial setup
 */
export function generateEncryptionKey(): string {
  return randomBytes(KEY_LENGTH).toString('hex');
}

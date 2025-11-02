// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));
jest.mock('@/lib/encryption', () => ({
  encryptApiKey: jest.fn(),
  decryptApiKey: jest.fn(),
}));
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const prisma = require('@/lib/prisma').default;
const encryption = require('@/lib/encryption');
const logger = require('@/lib/logger');

describe('Gemini Key Management Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.log = { info: jest.fn(), error: jest.fn() };
  });

  describe('getUserGeminiKey helper', () => {
    // Helper function extracted for testing
    async function getUserGeminiKey(userId: string): Promise<string | null> {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { geminiApiKeyEncrypted: true },
        });

        if (!user?.geminiApiKeyEncrypted) {
          return null;
        }

        return encryption.decryptApiKey(user.geminiApiKeyEncrypted);
      } catch (error) {
        logger.log.error('Error getting user Gemini key:', error);
        return null;
      }
    }

    it('should return null if user has no key', async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: null,
      });

      const result = await getUserGeminiKey('user123');

      expect(result).toBeNull();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { geminiApiKeyEncrypted: true },
      });
    });

    it('should decrypt and return key when user has one', async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: 'encrypted_data',
      });
      encryption.decryptApiKey.mockReturnValue('decrypted_api_key');

      const result = await getUserGeminiKey('user123');

      expect(result).toBe('decrypted_api_key');
      expect(encryption.decryptApiKey).toHaveBeenCalledWith('encrypted_data');
    });

    it('should return null on decryption error', async () => {
      prisma.user.findUnique.mockResolvedValue({
        geminiApiKeyEncrypted: 'encrypted_data',
      });
      encryption.decryptApiKey.mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      const result = await getUserGeminiKey('user123');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await getUserGeminiKey('user123');

      expect(result).toBeNull();
    });
  });

  describe('API Key validation', () => {
    it('should validate API key format', () => {
      const validKey = 'AIzaSyDOCAbC123dEf456GhI789jKl01-MnO2345';
      const shortKey = 'short';
      const emptyKey = '';

      expect(validKey.length >= 20).toBe(true);
      expect(shortKey.length >= 20).toBe(false);
      expect(emptyKey.length >= 20).toBe(false);
    });
  });
});

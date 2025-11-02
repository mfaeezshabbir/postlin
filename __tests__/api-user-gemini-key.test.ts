// Mock next/server, next-auth, prisma, and encryption before importing route
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: any, opts?: any) => ({ status: opts?.status || 200, json: async () => body }),
  },
}));
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('@/lib/encryption', () => ({
  encrypt: jest.fn((text: string) => `encrypted_${text}`),
  decrypt: jest.fn((text: string) => text.replace('encrypted_', '')),
}));
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const nextAuth = require('next-auth');
const prismaMock = require('@/lib/prisma');
const route = require('@/app/api/user/gemini-key/route');

describe('POST /api/user/gemini-key', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 401 if not authenticated', async () => {
    nextAuth.getServerSession.mockResolvedValue(null);

    const req = { json: async () => ({ apiKey: 'AIzaSyTest123' }) } as any;
    const response = await route.POST(req);
    expect(response.status).toBe(401);
  });

  test('returns 400 if apiKey is missing', async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    const req = { json: async () => ({}) } as any;
    const response = await route.POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('required');
  });

  test('returns 400 if apiKey format is invalid', async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });

    const req = { json: async () => ({ apiKey: 'invalid_key' }) } as any;
    const response = await route.POST(req);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid');
  });

  test('successfully saves encrypted Gemini API key', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.user.update.mockResolvedValue({
      ...mockUser,
      geminiApiKeyEncrypted: 'encrypted_AIzaSyTest123',
      geminiKeyAddedAt: new Date(),
    });

    const req = { json: async () => ({ apiKey: 'AIzaSyTest123' }) } as any;
    const response = await route.POST(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user123' },
        data: expect.objectContaining({
          geminiApiKeyEncrypted: 'encrypted_AIzaSyTest123',
        }),
      })
    );
  });
});

describe('DELETE /api/user/gemini-key', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 401 if not authenticated', async () => {
    nextAuth.getServerSession.mockResolvedValue(null);

    const req = {} as any;
    const response = await route.DELETE(req);
    expect(response.status).toBe(401);
  });

  test('successfully deletes Gemini API key', async () => {
    const mockUser = { 
      id: 'user123', 
      email: 'test@example.com',
      geminiApiKeyEncrypted: 'encrypted_key',
    };
    
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.user.update.mockResolvedValue({
      ...mockUser,
      geminiApiKeyEncrypted: null,
      geminiKeyAddedAt: null,
    });

    const req = {} as any;
    const response = await route.DELETE(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user123' },
        data: {
          geminiApiKeyEncrypted: null,
          geminiKeyAddedAt: null,
        },
      })
    );
  });
});

describe('GET /api/user/gemini-key', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 401 if not authenticated', async () => {
    nextAuth.getServerSession.mockResolvedValue(null);

    const req = {} as any;
    const response = await route.GET(req);
    expect(response.status).toBe(401);
  });

  test('returns hasKey true when user has Gemini key', async () => {
    const mockUser = { 
      geminiApiKeyEncrypted: 'encrypted_key',
      geminiKeyAddedAt: new Date('2024-01-01'),
    };
    
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const req = {} as any;
    const response = await route.GET(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.hasKey).toBe(true);
    expect(data.addedAt).toBeDefined();
  });

  test('returns hasKey false when user has no Gemini key', async () => {
    const mockUser = { 
      geminiApiKeyEncrypted: null,
      geminiKeyAddedAt: null,
    };
    
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    const req = {} as any;
    const response = await route.GET(req);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.hasKey).toBe(false);
  });
});

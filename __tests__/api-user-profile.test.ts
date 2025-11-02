// Mock next/server, next-auth, and prisma before importing route
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
  },
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
const route = require('@/app/api/user/profile/route');

describe('GET /api/user/profile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 401 if not authenticated', async () => {
    nextAuth.getServerSession.mockResolvedValue(null);

    const req = {} as any;
    const response = await route.GET(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized');
  });

  test('returns 404 if user not found', async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: 'test@example.com' },
    });
    
    prismaMock.user.findUnique.mockResolvedValue(null);

    const req = {} as any;
    const response = await route.GET(req);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('User not found');
  });

  test('returns user profile with hasGeminiKey true', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
      googleId: 'google123',
      linkedInId: 'linkedin123',
      linkedInConnected: true,
      geminiApiKeyEncrypted: 'encrypted_key',
      geminiKeyAddedAt: new Date('2024-01-01'),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01'),
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
    expect(data.profile).toMatchObject({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      hasGeminiKey: true,
      linkedInConnected: true,
      needsOnboarding: false,
    });
    // Ensure encrypted key is not exposed
    expect(data.profile.geminiApiKeyEncrypted).toBeUndefined();
  });

  test('returns user profile with hasGeminiKey false and needsOnboarding true', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      googleId: 'google123',
      linkedInId: null,
      linkedInConnected: false,
      geminiApiKeyEncrypted: null,
      geminiKeyAddedAt: null,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-01'),
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
    expect(data.profile).toMatchObject({
      id: 'user123',
      email: 'test@example.com',
      hasGeminiKey: false,
      linkedInConnected: false,
      needsOnboarding: true,
    });
  });
});

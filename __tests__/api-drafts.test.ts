// Mock next/server Request/Response, next-auth getServerSession, and prisma before importing route
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: any, opts?: any) => ({ status: opts?.status || 200, json: async () => body }),
  },
}));
// Mock the package the route imports: 'next-auth'
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock the app logger so tests don't print to console and so we can assert calls
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
const loggerMock = require('@/lib/logger');
const route = require('@/app/api/drafts/route');

describe('API /api/drafts', () => {
  afterEach(() => jest.resetAllMocks());

  test('GET returns 401 when not authenticated', async () => {
    nextAuth.getServerSession.mockResolvedValue(null);
    const res = await route.GET({} as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('POST returns 400 when content missing', async () => {
    const mockSession = { user: { email: 'a@b.com' } };
    nextAuth.getServerSession.mockResolvedValue(mockSession);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    const request = {
      json: async () => ({}),
    } as any;

    const res = await route.POST(request as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Content is required');
    // logger.warn should have been called for missing content
    expect(loggerMock.log.warn).toHaveBeenCalledWith(expect.stringContaining('Content is required'));
  });
});

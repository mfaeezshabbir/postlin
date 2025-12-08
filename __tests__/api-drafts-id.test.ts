// Tests for app/api/drafts/[id]/route.ts
jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: any, opts?: any) => ({ status: opts?.status || 200, json: async () => body }),
  },
}));

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

describe('API /api/drafts/[id]', () => {
  afterEach(() => jest.resetAllMocks());

  test('GET returns 401 when not authenticated', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const prismaMock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => prismaMock);
    const nextAuth = require('next-auth');
    const route = require('@/app/api/drafts/[id]/route');
    nextAuth.getServerSession.mockResolvedValue(null);
    const res = await route.GET({} as any, { params: Promise.resolve({ id: 'd1' }) });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('GET returns 404 when user not found', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const prismaMock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => prismaMock);
    const nextAuth = require('next-auth');
    const route = require('@/app/api/drafts/[id]/route');
    nextAuth.getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await route.GET({} as any, { params: Promise.resolve({ id: 'd1' }) });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('User not found');
  });

  test('GET returns draft when found', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const prismaMock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => prismaMock);
    const nextAuth = require('next-auth');
    const route = require('@/app/api/drafts/[id]/route');
    const mockUser = { id: 'u1', email: 'a@b.com' };
    const mockDraft = { id: 'd1', userId: 'u1', draftText: 'hello', imageUrl: null, videoUrl: null };
    nextAuth.getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.post.findFirst.mockResolvedValue(mockDraft);

    const res = await route.GET({} as any, { params: Promise.resolve({ id: 'd1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.draft).toEqual(mockDraft);
  });
});

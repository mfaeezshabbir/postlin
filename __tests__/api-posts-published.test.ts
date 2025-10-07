// Tests for app/api/posts/published/route.ts
// Initialize next/server mock
require('../test/helpers/mockNextServer')();
jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/logger', () => ({ log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() } }));

describe('API /api/posts/published', () => {
  afterEach(() => jest.resetAllMocks());

  test('GET returns 401 when not authenticated', async () => {
    const nextAuth = require('next-auth');
    const route = require('@/app/api/posts/published/route');
    nextAuth.getServerSession.mockResolvedValue(null);
    const res = await route.GET({} as any);
    expect(res.status).toBe(401);
  });

  test('GET returns posts and stats when available', async () => {
  // Ensure module cache is reset so our manual mock is used when requiring the route
  jest.resetModules();
  const { makePrismaMock } = require('../test/helpers/mockPrisma');
  const prismaMock = makePrismaMock();
  jest.doMock('@/lib/prisma', () => prismaMock);
    const nextAuth = require('next-auth');
    const route = require('@/app/api/posts/published/route');

    const mockUser = { id: 'u1', email: 'a@b.com' };
    const mockPosts = [ { id: 'p1', userId: 'u1', publishedAt: new Date().toISOString() } ];

    nextAuth.getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.post.findMany.mockResolvedValue(mockPosts);

    const res = await route.GET({} as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.posts).toEqual(mockPosts);
    expect(body.stats.total).toBe(mockPosts.length);
  });
});

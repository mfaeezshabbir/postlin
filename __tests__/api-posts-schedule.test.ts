require('../test/helpers/mockNextServer')();

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/lib/logger', () => ({ log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() } }));

describe('API /api/posts/schedule', () => {
  afterEach(() => jest.resetAllMocks());

  test('POST returns 401 when unauthenticated', async () => {
    const nextAuth = require('next-auth');
    const route = require('@/app/api/posts/schedule/route');
    nextAuth.getServerSession.mockResolvedValue(null);
    const res = await route.POST({} as any);
    expect(res.status).toBe(401);
  });

  test('POST returns 400 when missing data', async () => {
  jest.resetModules();
  const { makePrismaMock } = require('../test/helpers/mockPrisma');
  const prismaMock = makePrismaMock();
  jest.doMock('@/lib/prisma', () => prismaMock);
    const nextAuth = require('next-auth');
    const route = require('@/app/api/posts/schedule/route');

    nextAuth.getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });

    const request = { json: async () => ({}) } as any;
    const res = await route.POST(request);
    expect(res.status).toBe(400);
  });

  test('POST schedules a post when valid', async () => {
  jest.resetModules();
  const { makePrismaMock } = require('../test/helpers/mockPrisma');
  const prismaMock = makePrismaMock();
  jest.doMock('@/lib/prisma', () => prismaMock);
    // Mock worker import to provide a reschedule method
    jest.doMock('@/workers/scheduler', () => ({ scheduledPostWorker: { reschedule: jest.fn() } }));

    const nextAuth = require('next-auth');
    const route = require('@/app/api/posts/schedule/route');

    nextAuth.getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    prismaMock.post.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });
    prismaMock.post.update.mockResolvedValue({ id: 'p1', userId: 'u1', status: 'SCHEDULED' });

    const future = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const request = { json: async () => ({ postId: 'p1', scheduledAt: future }) } as any;
    const res = await route.POST(request);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('DELETE cancels schedule', async () => {
  jest.resetModules();
  const { makePrismaMock } = require('../test/helpers/mockPrisma');
  const prismaMock = makePrismaMock();
  jest.doMock('@/lib/prisma', () => prismaMock);
    jest.doMock('@/workers/scheduler', () => ({ scheduledPostWorker: { reschedule: jest.fn() } }));

    const nextAuth = require('next-auth');
    const route = require('@/app/api/posts/schedule/route');

    nextAuth.getServerSession.mockResolvedValue({ user: { email: 'a@b.com' } });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
    prismaMock.post.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });
    prismaMock.post.update.mockResolvedValue({ id: 'p1', status: 'DRAFT' });

    const url = 'https://example.com?postId=p1';
    const request: any = { url };
    const res = await route.DELETE(request as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

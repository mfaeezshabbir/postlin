jest.mock('@/lib/logger', () => ({
  log: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

describe('ScheduledPostWorker – atomic claim and retry logic', () => {
  afterEach(() => jest.clearAllMocks());

  function buildPost(overrides: Record<string, unknown> = {}) {
    return {
      id: 'p1',
      draftText: 'Hello LinkedIn',
      imageUrl: null,
      retryCount: 0,
      scheduledAt: new Date(Date.now() - 1000),
      user: { email: 'a@b.com', accessToken: 'tok' },
      ...overrides,
    };
  }

  test('skips post when atomic claim fails (another worker took it)', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const mock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => mock);

    const { ScheduledPostWorker } = require('@/workers/scheduler');
    const worker = new ScheduledPostWorker();

    mock.post.findMany.mockResolvedValue([{ id: 'p1' }]);
    mock.post.updateMany.mockResolvedValue({ count: 0 }); // claim lost

    const count = await (worker as any).checkAndPublishScheduledPosts();

    expect(count).toBe(0);
    // Should not attempt to fetch or publish the post
    expect(mock.post.findUnique).not.toHaveBeenCalled();
    expect(mock.post.update).not.toHaveBeenCalled();
  });

  test('publishes post when atomic claim succeeds', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const mock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => mock);

    const { ScheduledPostWorker } = require('@/workers/scheduler');
    const worker = new ScheduledPostWorker();
    const post = buildPost();

    mock.post.findMany.mockResolvedValue([{ id: 'p1' }]);
    mock.post.updateMany.mockResolvedValue({ count: 1 }); // claim won
    mock.post.findUnique.mockResolvedValue(post);
    jest
      .spyOn(worker as any, 'publishToLinkedIn')
      .mockResolvedValue({ success: true, linkedInPostId: 'li-abc' });
    mock.post.update.mockResolvedValue({});

    const count = await (worker as any).checkAndPublishScheduledPosts();

    expect(count).toBe(1);
    expect(mock.post.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      })
    );
  });

  test('reverts to SCHEDULED (not DRAFT) on failure when retryCount < MAX_RETRY_COUNT', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const mock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => mock);

    const { ScheduledPostWorker } = require('@/workers/scheduler');
    const worker = new ScheduledPostWorker();
    const post = buildPost({ retryCount: 0 });

    mock.post.findMany.mockResolvedValue([{ id: 'p1' }]);
    mock.post.updateMany.mockResolvedValue({ count: 1 });
    mock.post.findUnique.mockResolvedValue(post);
    jest
      .spyOn(worker as any, 'publishToLinkedIn')
      .mockResolvedValue({ success: false, error: 'LinkedIn 503' });
    mock.post.update.mockResolvedValue({});

    const count = await (worker as any).checkAndPublishScheduledPosts();

    expect(count).toBe(0);
    expect(mock.post.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'SCHEDULED',
          retryCount: 1,
          lastError: 'LinkedIn 503',
        }),
      })
    );
  });

  test('marks as FAILED after MAX_RETRY_COUNT failures', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const mock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => mock);

    const { ScheduledPostWorker, MAX_RETRY_COUNT } = require('@/workers/scheduler');
    const worker = new ScheduledPostWorker();
    // retryCount is already at the threshold; one more failure triggers FAILED
    const post = buildPost({ retryCount: MAX_RETRY_COUNT - 1 });

    mock.post.findMany.mockResolvedValue([{ id: 'p1' }]);
    mock.post.updateMany.mockResolvedValue({ count: 1 });
    mock.post.findUnique.mockResolvedValue(post);
    jest
      .spyOn(worker as any, 'publishToLinkedIn')
      .mockResolvedValue({ success: false, error: 'Persistent error' });
    mock.post.update.mockResolvedValue({});

    const count = await (worker as any).checkAndPublishScheduledPosts();

    expect(count).toBe(0);
    expect(mock.post.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FAILED',
          retryCount: MAX_RETRY_COUNT,
          lastError: 'Persistent error',
        }),
      })
    );
  });

  test('handles missing access token via retry/FAILED logic (not DRAFT)', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const mock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => mock);

    const { ScheduledPostWorker } = require('@/workers/scheduler');
    const worker = new ScheduledPostWorker();
    const post = buildPost({ user: { email: 'a@b.com', accessToken: null }, retryCount: 0 });

    mock.post.findMany.mockResolvedValue([{ id: 'p1' }]);
    mock.post.updateMany.mockResolvedValue({ count: 1 });
    mock.post.findUnique.mockResolvedValue(post);
    mock.post.update.mockResolvedValue({});

    const count = await (worker as any).checkAndPublishScheduledPosts();

    expect(count).toBe(0);
    // Must NOT revert to DRAFT (old behaviour); should use SCHEDULED or FAILED
    const updateCall = mock.post.update.mock.calls[0][0];
    expect(updateCall.data.status).not.toBe('DRAFT');
    expect(['SCHEDULED', 'FAILED']).toContain(updateCall.data.status);
    expect(updateCall.data.retryCount).toBe(1);
    expect(updateCall.data.lastError).toBeDefined();
  });

  test('MAX_RETRY_COUNT is exported and equals 3', () => {
    jest.resetModules();
    const { MAX_RETRY_COUNT } = require('@/workers/scheduler');
    expect(MAX_RETRY_COUNT).toBe(3);
  });
});

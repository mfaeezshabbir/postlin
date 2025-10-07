// Tests for modules/drafts
jest.mock('@/lib/prisma', () => ({
  post: { create: jest.fn(), update: jest.fn() },
}));

describe('modules/drafts', () => {
  afterEach(() => jest.resetAllMocks());

  test('createDraft calls prisma.post.create', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const prismaMock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => prismaMock);
    const drafts = require('@/modules/drafts');
    const fake = { id: 'd1', userId: 'u1', draftText: 'hi' };
    prismaMock.post.create.mockResolvedValue(fake);

    const res = await drafts.createDraft('u1', 'hi');
    expect(prismaMock.post.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'u1', draftText: 'hi' }) }));
    expect(res).toEqual(fake);
  });

  test('updateDraft calls prisma.post.update', async () => {
    jest.resetModules();
    const { makePrismaMock } = require('../test/helpers/mockPrisma');
    const prismaMock = makePrismaMock();
    jest.doMock('@/lib/prisma', () => prismaMock);
    const drafts = require('@/modules/drafts');
    const fake = { id: 'd1', draftText: 'updated' };
    prismaMock.post.update.mockResolvedValue(fake);

    const res = await drafts.updateDraft('d1', { draftText: 'updated' });
    expect(prismaMock.post.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'd1' }, data: expect.any(Object) }));
    expect(res).toEqual(fake);
  });
});

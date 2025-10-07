// Mock getServerSession before importing the module to avoid loading next-auth internals
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

const nextAuth = require('next-auth/next');
const { getCurrentUser } = require('@/lib/auth');

describe('getCurrentUser', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns null when no session', async () => {
    nextAuth.getServerSession.mockResolvedValue(null);
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });

  test('returns user object when session exists', async () => {
    const mockSession = { user: { id: '1', email: 'a@b.com' } };
    nextAuth.getServerSession.mockResolvedValue(mockSession);
    const user = await getCurrentUser();
    expect(user).toEqual(expect.objectContaining({ id: '1', email: 'a@b.com' }));
  });
});

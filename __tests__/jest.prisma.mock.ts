// Provide a lightweight mock for @prisma/client used during tests

const PrismaClient = function () {
  return {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
};

module.exports = { PrismaClient };

// Minimal smoke test so Jest treats this as a valid test suite
test('prisma mock placeholder', () => {
  expect(true).toBe(true);
});

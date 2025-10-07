// Mock @prisma/client globally for tests
const jestMock = require('jest-mock');

jest.mock('@prisma/client', () => {
  const PrismaClient = function () {
    return {
      user: {
        findUnique: jestMock.fn(),
        update: jestMock.fn(),
        create: jestMock.fn(),
      },
      post: {
        findMany: jestMock.fn(),
        create: jestMock.fn(),
      },
    };
  };
  return { PrismaClient };
});

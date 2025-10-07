// Shared Prisma mock for tests (moved out of __tests__ so Jest won't treat it as a test file)
const makePrismaMock = () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  post: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

module.exports = { makePrismaMock };

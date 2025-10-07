module.exports = function mockNextServer() {
  jest.mock('next/server', () => ({
    NextRequest: class {},
    NextResponse: {
      json: (body: any, opts?: any) => ({ status: opts?.status || 200, json: async () => body }),
    },
  }));
};

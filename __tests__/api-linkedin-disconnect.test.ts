// Mock dependencies
jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: any, opts?: any) => ({
      status: opts?.status || 200,
      json: async () => body,
    }),
  },
}));

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));

jest.mock("@/lib/prisma", () => ({
  user: {
    update: jest.fn(),
  },
}));

// Mock logger
jest.mock("@/lib/logger", () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const nextAuth = require("next-auth");
const prismaMock = require("@/lib/prisma");
const loggerMock = require("@/lib/logger");
// Dynamic import of route after mocks
const route = require("@/app/api/linkedin/disconnect/route");

describe("API /api/linkedin/disconnect", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("POST returns 401 when not authenticated", async () => {
    nextAuth.getServerSession.mockResolvedValue(null);

    const res = await route.POST({} as any);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("POST successfully disconnects LinkedIn", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });

    // Mock user update return
    prismaMock.user.update.mockResolvedValue({
      id: "user123",
      linkedInConnected: false,
    });

    const res = await route.POST({} as any);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.linkedInConnected).toBe(false);

    // Verify update call checks
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      data: {
        linkedInConnected: false,
        linkedInOauthData: null,
        accessToken: null,
        refreshToken: null,
      },
      select: expect.any(Object),
    });

    expect(loggerMock.log.info).toHaveBeenCalledWith("LinkedIn disconnected", {
      userId: "user123",
    });
  });

  test("POST returns 500 on database error", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    prismaMock.user.update.mockRejectedValue(new Error("Database error"));

    const res = await route.POST({} as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to disconnect LinkedIn account");
    expect(loggerMock.log.error).toHaveBeenCalled();
  });
});

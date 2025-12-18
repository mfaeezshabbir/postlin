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
    findUnique: jest.fn(),
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
const route = require("@/app/api/profile/route");

describe("API /api/profile", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("GET", () => {
    test("returns 401 when not authenticated", async () => {
      nextAuth.getServerSession.mockResolvedValue(null);

      const res = await route.GET({} as any);
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe("Unauthorized");
    });

    test("returns 404 when user not found in database", async () => {
      nextAuth.getServerSession.mockResolvedValue({
        user: { email: "test@example.com" },
      });
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await route.GET({} as any);
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("User not found");
    });

    test("returns profile data with correct feature flags", async () => {
      nextAuth.getServerSession.mockResolvedValue({
        user: { email: "test@example.com" },
      });

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        image: "http://example.com/image.jpg",
        googleId: "google123",
        linkedInId: "linkedin123",
        linkedInConnected: true,
        geminiApiKeyEncrypted: "encrypted_key",
        geminiKeyAddedAt: new Date(),
        createdAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await route.GET({} as any);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.id).toBe(mockUser.id);
      expect(body.email).toBe(mockUser.email);
      expect(body.hasGoogleAuth).toBe(true);
      expect(body.hasLinkedInAuth).toBe(true);
      expect(body.hasGeminiKey).toBe(true);

      // Verify feature flags
      expect(body.features).toEqual({
        canUseGemini: true,
        canPostToLinkedIn: true,
        canUseManualPosting: true,
      });
    });

    test("calculates feature flags correctly when services are missing", async () => {
      nextAuth.getServerSession.mockResolvedValue({
        user: { email: "test@example.com" },
      });

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
        image: null,
        googleId: null,
        linkedInId: null,
        linkedInConnected: false,
        geminiApiKeyEncrypted: null,
        geminiKeyAddedAt: null,
        createdAt: new Date(),
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const res = await route.GET({} as any);
      const body = await res.json();

      expect(body.hasGoogleAuth).toBe(false);
      expect(body.hasLinkedInAuth).toBe(false);
      expect(body.hasGeminiKey).toBe(false);

      // Verify feature flags
      expect(body.features).toEqual({
        canUseGemini: false,
        canPostToLinkedIn: false,
        canUseManualPosting: true,
      });
    });

    test("returns 500 on database error", async () => {
      nextAuth.getServerSession.mockResolvedValue({
        user: { email: "test@example.com" },
      });
      prismaMock.user.findUnique.mockRejectedValue(new Error("Database error"));

      const res = await route.GET({} as any);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal server error");
      expect(loggerMock.log.error).toHaveBeenCalled();
    });
  });
});

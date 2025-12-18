// Mock dependencies
jest.mock("next/server", () => ({
  NextRequest: class {
    nextUrl: any;
    cookies: any;
    url: string;
    constructor(url: string) {
      this.url = url;
      this.nextUrl = {
        searchParams: new URLSearchParams(),
      };
      this.cookies = {
        get: jest.fn(),
        delete: jest.fn(),
      };
    }
  },
  NextResponse: {
    redirect: jest.fn((url) => ({
      cookies: { delete: jest.fn() },
    })),
  },
}));

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));

jest.mock("@/lib/prisma", () => ({
  user: {
    update: jest.fn(),
  },
}));

jest.mock("@/lib/logger", () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("@/lib/encryption", () => ({
  decryptApiKey: jest.fn(),
}));

const nextAuth = require("next-auth");
const encryption = require("@/lib/encryption");
const route = require("@/app/api/linkedin/callback/route");
const { NextResponse, NextRequest } = require("next/server");

describe("API /api/linkedin/callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.LINKEDIN_CLIENT_ID = "client_id";
    process.env.LINKEDIN_CLIENT_SECRET = "client_secret";
  });

  test("GET returns redirect to login on unauthorized", async () => {
    nextAuth.getServerSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/linkedin/callback");

    await route.GET(req);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/login",
        search: "?error=unauthorized",
      })
    );
  });

  test("GET handles error query param", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const req = new NextRequest("http://localhost:3000/api/linkedin/callback");
    req.nextUrl.searchParams.set("error", "access_denied");

    await route.GET(req);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining("error=linkedin_access_denied"),
      })
    );
  });

  test("GET handles state mismatch (CSRF)", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const req = new NextRequest("http://localhost:3000/api/linkedin/callback");
    req.nextUrl.searchParams.set("state", "returned_state");
    req.cookies.get.mockImplementation((name: string) => {
      if (name === "linkedin_oauth_state")
        return { value: "encrypted_stored_state" };
      return null;
    });

    encryption.decryptApiKey.mockReturnValue("different_state");

    await route.GET(req);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining("error=state_mismatch"),
      })
    );
  });

  test("GET handles missing code", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const req = new NextRequest("http://localhost:3000/api/linkedin/callback");
    req.nextUrl.searchParams.set("state", "valid_state");
    req.cookies.get.mockImplementation((name: string) => {
      if (name === "linkedin_oauth_state")
        return { value: "encrypted_valid_state" };
      return null;
    });
    encryption.decryptApiKey.mockReturnValue("valid_state");

    await route.GET(req);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining("error=no_code"),
      })
    );
  });

  test("GET handles token exchange failure", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const req = new NextRequest("http://localhost:3000/api/linkedin/callback");
    req.nextUrl.searchParams.set("state", "valid_state");
    req.nextUrl.searchParams.set("code", "auth_code");
    req.cookies.get.mockImplementation((name: string) => {
      if (name === "linkedin_oauth_state")
        return { value: "encrypted_valid_state" };
      return null;
    });
    encryption.decryptApiKey.mockReturnValue("valid_state");

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve("Token error"),
    });

    await route.GET(req);

    expect(NextResponse.redirect).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining("error=token_exchange_failed"),
      })
    );
  });
});

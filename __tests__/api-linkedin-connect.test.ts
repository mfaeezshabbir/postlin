// Mock dependencies
// Mock dependencies
jest.mock("next/server", () => ({
  NextRequest: class {
    nextUrl: any;
    cookies: any;
    url: string;
    constructor(url: string) {
      this.url = url;
      this.nextUrl = {
        searchParams: new URLSearchParams(url.split("?")[1]),
      };
      this.cookies = {
        set: jest.fn(),
        get: jest.fn(),
      };
    }
  },
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
    redirect: jest.fn((url) => {
      const cookies = new Map();
      return {
        cookies: {
          set: jest.fn((key, value, options) => {
            cookies.set(key, { value, options });
          }),
          get: jest.fn((key) => cookies.get(key)),
        },
        url,
      };
    }),
  },
}));

jest.mock("next-auth", () => ({ getServerSession: jest.fn() }));

jest.mock("@/lib/logger", () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/lib/encryption", () => ({
  encryptApiKey: jest.fn((val) => `encrypted_${val}`),
}));

const nextAuth = require("next-auth");
const encryption = require("@/lib/encryption");
const route = require("@/app/api/linkedin/connect/route");
const { NextRequest, NextResponse } = require("next/server");

describe("API /api/linkedin/connect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.LINKEDIN_CLIENT_ID = "test_client_id";
  });

  test("GET returns 401 if unauthorized", async () => {
    nextAuth.getServerSession.mockResolvedValue(null);
    const req = new NextRequest("http://localhost:3000/api/linkedin/connect");

    const res = await route.GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("GET redirects to LinkedIn with correct params and sets cookies", async () => {
    nextAuth.getServerSession.mockResolvedValue({
      user: { email: "test@example.com" },
    });
    const req = new NextRequest(
      "http://localhost:3000/api/linkedin/connect?callbackUrl=/dashboard/custom"
    );

    const res = await route.GET(req);

    // Verify Redirect
    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectUrl = new URL(res.url);
    expect(redirectUrl.origin).toBe("https://www.linkedin.com");
    expect(redirectUrl.pathname).toBe("/oauth/v2/authorization");
    expect(redirectUrl.searchParams.get("client_id")).toBe("test_client_id");
    expect(redirectUrl.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/linkedin/callback"
    );
    expect(redirectUrl.searchParams.get("response_type")).toBe("code");
    expect(redirectUrl.searchParams.get("scope")).toBe(
      "openid profile email w_member_social"
    );

    // Check state param exists
    const state = redirectUrl.searchParams.get("state");
    expect(state).toBeTruthy();

    // Verify Cookies
    expect(res.cookies.set).toHaveBeenCalledTimes(2);

    // 1. State cookie (encrypted)
    expect(res.cookies.set).toHaveBeenCalledWith(
      "linkedin_oauth_state",
      `encrypted_${state}`, // Our mock adds "encrypted_" prefix
      expect.objectContaining({
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      })
    );

    // 2. Callback URL cookie
    expect(res.cookies.set).toHaveBeenCalledWith(
      "linkedin_callback_url",
      "/dashboard/custom",
      expect.objectContaining({
        httpOnly: true,
        path: "/",
      })
    );

    // Verify Encryption called
    expect(encryption.encryptApiKey).toHaveBeenCalledWith(state);
  });

  test("GET returns 500 on internal error", async () => {
    nextAuth.getServerSession.mockRejectedValue(new Error("Session error"));
    const req = new NextRequest("http://localhost:3000/api/linkedin/connect");

    const res = await route.GET(req);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Failed to initiate LinkedIn connection");
  });
});

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import prisma from "@/lib/prisma";
import { encryptApiKey, decryptApiKey } from "@/lib/encryption";
import { log } from "@/lib/logger";
import { GEMINI_API_KEY_MIN_LENGTH } from "@/lib/constants";

/**
 * GET /api/gemini-key
 * Check if user has a Gemini API key configured
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        geminiApiKeyEncrypted: true,
        geminiKeyAddedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasGeminiKey: !!user.geminiApiKeyEncrypted,
      geminiKeyAddedAt: user.geminiKeyAddedAt,
    });
  } catch (error) {
    log.error("Error in GET /api/gemini-key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gemini-key
 * Add or update user's Gemini API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Basic validation for Gemini API key format
    const trimmedKey = apiKey.trim();
    if (trimmedKey.length < GEMINI_API_KEY_MIN_LENGTH) {
      return NextResponse.json(
        {
          error: `API key must be at least ${GEMINI_API_KEY_MIN_LENGTH} characters`,
        },
        { status: 400 }
      );
    }

    // Encrypt the API key
    let encryptedKey: string;
    try {
      encryptedKey = encryptApiKey(trimmedKey);
    } catch (error) {
      log.error("Failed to encrypt API key:", error);
      return NextResponse.json(
        { error: "Failed to encrypt API key. Check server configuration." },
        { status: 500 }
      );
    }

    // Store encrypted key in database
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        geminiApiKeyEncrypted: encryptedKey,
        geminiKeyAddedAt: new Date(),
      },
      select: {
        id: true,
        geminiKeyAddedAt: true,
      },
    });

    log.info("Gemini API key added/updated", { userId: user.id });

    return NextResponse.json({
      success: true,
      message: "Gemini API key saved successfully",
      geminiKeyAddedAt: user.geminiKeyAddedAt,
    });
  } catch (error) {
    log.error("Error in POST /api/gemini-key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gemini-key
 * Remove user's Gemini API key
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        geminiApiKeyEncrypted: null,
        geminiKeyAddedAt: null,
      },
      select: {
        id: true,
      },
    });

    log.info("Gemini API key deleted", { userId: user.id });

    return NextResponse.json({
      success: true,
      message: "Gemini API key removed successfully",
    });
  } catch (error) {
    log.error("Error in DELETE /api/gemini-key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

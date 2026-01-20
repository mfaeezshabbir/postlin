import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import prisma from "@/lib/prisma";
import { encryptApiKey, decryptApiKey } from "@/lib/encryption";
import { log } from "@/lib/logger";
import { GEMINI_API_KEY_MIN_LENGTH, GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "@/lib/constants";

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
        geminiModel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      hasGeminiKey: !!user.geminiApiKeyEncrypted,
      geminiKeyAddedAt: user.geminiKeyAddedAt,
      geminiModel: user.geminiModel || DEFAULT_GEMINI_MODEL,
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
    const { apiKey, model } = body;

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

    // Validate model if provided
    const selectedModel = model || DEFAULT_GEMINI_MODEL;
    const validModels = GEMINI_MODELS.map((m) => m.value);
    if (!validModels.includes(selectedModel)) {
      return NextResponse.json(
        {
          error: `Invalid model. Please select one of: ${validModels.join(", ")}`,
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

    // Store encrypted key and selected model in database
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        geminiApiKeyEncrypted: encryptedKey,
        geminiKeyAddedAt: new Date(),
        geminiModel: selectedModel,
      },
      select: {
        id: true,
        geminiKeyAddedAt: true,
        geminiModel: true,
      },
    });

    log.info("Gemini API key and model added/updated", { userId: user.id, model: selectedModel });

    return NextResponse.json({
      success: true,
      message: "Gemini API key saved successfully",
      geminiKeyAddedAt: user.geminiKeyAddedAt,
      geminiModel: user.geminiModel,
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
        geminiModel: null,
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

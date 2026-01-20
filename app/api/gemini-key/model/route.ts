import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import prisma from "@/lib/prisma";
import { log } from "@/lib/logger";
import { GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from "@/lib/constants";

/**
 * PATCH /api/gemini-key/model
 * Update user's preferred Gemini model without requiring API key re-entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { model } = body;

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

    // Check if user has an API key configured
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, geminiApiKeyEncrypted: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.geminiApiKeyEncrypted) {
      return NextResponse.json(
        {
          error: "Please configure your Gemini API key before selecting a model",
        },
        { status: 400 }
      );
    }

    // Update only the model
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        geminiModel: selectedModel,
      },
      select: {
        id: true,
        geminiModel: true,
      },
    });

    log.info("Gemini model updated", { userId: updatedUser.id, model: selectedModel });

    return NextResponse.json({
      success: true,
      message: "Gemini model updated successfully",
      geminiModel: updatedUser.geminiModel,
    });
  } catch (error) {
    log.error("Error in PATCH /api/gemini-key/model:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

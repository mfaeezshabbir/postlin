import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "@/lib/logger";
import { getUserGeminiKey } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { generateLinkedInPost, generateImagePromptForPost } from "@/modules/langchain";

/**
 * POST /api/ai/generate
 * Generate LinkedIn post content using user's personal Gemini API key
 * Now powered by LangChain for advanced AI workflows
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database to retrieve their user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, geminiModel: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's Gemini API key
    const userApiKey = await getUserGeminiKey(user.id);
    if (!userApiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key not configured",
          message:
            "Please add your Gemini API key in settings to use AI features.",
          requiresSetup: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      tone = "professional",
      length = "medium",
      generateImage = false,
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use user's selected model or default
    const selectedModel = user.geminiModel || "gemini-2.5-flash";

    // Generate content using LangChain orchestration
    const postResult = await generateLinkedInPost(user.id, {
      prompt,
      tone,
      length,
    });

    const generatedContent = postResult.content;
    const aiHashtags = postResult.hashtags;

    log.info(`AI content generated for user: ${session.user.email} using LangChain`);

    // Generate image if requested
    let imageUrl = null;
    let imageBase64 = null;
    let imagePrompt = null; // Store the prompt for user to use manually

    if (generateImage) {
      try {
        log.info("Generating AI image prompt using LangChain...");
        
        // First, generate the image prompt using LangChain
        const imagePromptResult = await generateImagePromptForPost(user.id, generatedContent);
        imagePrompt = imagePromptResult; // Store the structured prompt
        
        log.info("Image prompt generated, attempting image generation...");
        
        // Then use the prompt to generate the actual image using Gemini 2.5 Flash Image
        const genAI_Image = new GoogleGenerativeAI(userApiKey);
        const imageModel = genAI_Image.getGenerativeModel({
          model: "gemini-2.5-flash-image",
        });

        const imageResult = await imageModel.generateContent(imagePromptResult.imagePrompt);
        const response = imageResult.response;

        // Extract image data from response
        if (response.candidates && response.candidates[0]?.content?.parts) {
          const parts = response.candidates[0].content.parts;

          for (const part of parts) {
            if ("inlineData" in part && part.inlineData) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";

              imageBase64 = `data:${mimeType};base64,${base64Data}`;
              log.info("✅ AI image generated successfully");
              break;
            }
          }
        }
      } catch (imageError: any) {
        log.error("Failed to generate image:", imageError);

        // Check if it's a rate limit error
        if (
          imageError.message?.includes("429") ||
          imageError.message?.includes("quota")
        ) {
          log.warn(
            "⚠️  Rate limit hit for image generation. Content will be generated without image."
          );
          log.warn(
            "💡 Tip: Wait a few minutes or reduce image generation frequency."
          );
        }

        // Image prompt should already be available even if image generation fails
        if (!imagePrompt) {
          log.info("💡 Attempting to generate image prompt even though image failed");
          try {
            imagePrompt = await generateImagePromptForPost(user.id, generatedContent);
          } catch (promptError) {
            log.error("Failed to generate image prompt:", promptError);
          }
        }

        // Continue without image if generation fails - graceful degradation
      }
    }

    return NextResponse.json({
      success: true,
      content: generatedContent,
      hashtags: aiHashtags, // Return structured hashtags from JSON
      prompt,
      image: imageBase64
        ? {
            url: imageUrl,
            base64: imageBase64,
            aspectRatio: "1:1",
          }
        : null,
      imagePrompt: imagePrompt, // Always return the prompt if available, even if image generation failed
      metadata: {
        tone,
        length,
        wordCount: postResult.wordCount || generatedContent.split(/\s+/).length,
        hasImage: !!imageBase64,
        summary: postResult.summary || null, // Include AI-generated summary
        model: selectedModel, // Include the model used for generation
        usedLangChain: true, // Flag to indicate LangChain was used
      },
    });
  } catch (error) {
    // Log the full error for debugging
    console.error("Error generating AI content:", error);
    log.error("AI Generation Error Details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      // More detailed error messages
      if (
        error.message.includes("API key") ||
        error.message.includes("API_KEY")
      ) {
        return NextResponse.json(
          {
            error: "AI service configuration error. Please check your API key.",
          },
          { status: 500 }
        );
      }

      if (error.message.includes("quota") || error.message.includes("limit")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 }
        );
      }

      // Handle model not found or unsupported
      if (
        error.message.includes("model") ||
        error.message.includes("not found") ||
        error.message.includes("unsupported") ||
        error.message.includes("404")
      ) {
        return NextResponse.json(
          {
            error: "The selected AI model is not available or supported with your API key. Please try a different model in settings.",
            modelError: true,
          },
          { status: 400 }
        );
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        {
          error: "Failed to generate content",
          details: error.message, // Include error details for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

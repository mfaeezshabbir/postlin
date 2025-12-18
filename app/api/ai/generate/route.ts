import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "@/lib/logger";
import { getUserGeminiKey } from "@/lib/gemini";
import prisma from "@/lib/prisma";

/**
 * POST /api/ai/generate
 * Generate LinkedIn post content using user's personal Gemini API key
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
      select: { id: true },
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

    // Initialize Gemini with user's API key
    const genAI = new GoogleGenerativeAI(userApiKey);
    const genAI_Image = new GoogleGenerativeAI(userApiKey);

    // Build system prompt based on preferences (now uses JSON format)
    const systemPrompt = buildSystemPrompt(tone, length);

    // Generate content - using Gemini 2.5 Flash with JSON mode for structured responses
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const fullPrompt = `${systemPrompt}

User request: ${prompt}

Generate a LinkedIn post that is engaging, professional, and ready to publish.

You MUST respond with valid JSON in this exact format:
{
  "content": "The full LinkedIn post text with line breaks and emojis",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "summary": "A one-sentence summary of the post",
  "wordCount": 150
}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const jsonText = response.text();

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonText);
    } catch (parseError) {
      log.error("Failed to parse JSON response:", jsonText);
      throw new Error("AI returned invalid JSON format");
    }

    const generatedContent = parsedResponse.content;
    const aiHashtags = parsedResponse.hashtags || [];

    log.info(`AI content generated for user: ${session.user.email}`);

    // Generate image if requested
    let imageUrl = null;
    let imageBase64 = null;
    let imagePrompt = null; // Store the prompt for user to use manually

    if (generateImage) {
      try {
        log.info("Generating AI image for post...");
        const imageData = await generatePostImage(
          prompt,
          generatedContent,
          genAI,
          genAI_Image
        );
        imageUrl = imageData.url;
        imageBase64 = imageData.base64;
        imagePrompt = imageData.prompt; // Save the prompt
        log.info("AI image generated successfully");
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

        // Extract the image prompt if it was generated before the failure
        if (imageError.prompt) {
          imagePrompt = imageError.prompt;
          log.info("💡 Image prompt available for manual generation");
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
        wordCount:
          parsedResponse.wordCount || generatedContent.split(/\s+/).length,
        hasImage: !!imageBase64,
        summary: parsedResponse.summary || null, // Include AI-generated summary
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

/**
 * Build system prompt based on user preferences
 */
function buildSystemPrompt(tone: string, length: string): string {
  const toneInstructions: Record<string, string> = {
    professional:
      "Use a professional, business-appropriate tone. Be clear, confident, and authoritative.",
    casual:
      "Use a friendly, conversational tone. Be approachable and personable while maintaining professionalism.",
    enthusiastic:
      "Use an energetic, passionate tone. Show excitement and positivity while remaining credible.",
    informative:
      "Use an educational, fact-based tone. Focus on providing value and insights.",
    inspirational:
      "Use a motivational, uplifting tone. Inspire and encourage your audience.",
  };

  const lengthInstructions: Record<string, string> = {
    short:
      "Keep it brief and punchy (100-150 words). Get straight to the point.",
    medium:
      "Write a moderate length post (150-250 words). Balance detail with readability.",
    long: "Write a comprehensive post (250-400 words). Provide depth and thorough explanation.",
  };

  return `You are an expert LinkedIn content creator specializing in human-like, authentic writing that avoids AI detection.

TONE: ${toneInstructions[tone] || toneInstructions.professional}

LENGTH: ${lengthInstructions[length] || lengthInstructions.medium}

# WRITING STYLE - HUMANIZE YOUR OUTPUT:

SHOULD use clear, simple language.
SHOULD be spartan and informative.
SHOULD use short, impactful sentences.
SHOULD use active voice, avoid passive voice.
SHOULD focus on practical, actionable insights.
SHOULD use bullet point lists for readability (use • symbol, not - or *).
SHOULD use data and examples when possible.
SHOULD use "you" and "your" to directly address the reader.
SHOULD write in a conversational yet professional manner.
SHOULD sound natural and authentic.

AVOID em dashes (—) anywhere. Use commas, periods, or semicolons instead.
AVOID constructions like "not just this, but also this".
AVOID metaphors and clichés.
AVOID generalizations.
AVOID setup language like "in conclusion", "in closing", etc.
AVOID unnecessary adjectives and adverbs.
AVOID hashtags in the content (provide separately).
AVOID semicolons.
AVOID markdown formatting (no **, *, __, etc.).
AVOID asterisks for any purpose.
AVOID these AI-sounding words: "can, may, just, that, very, really, literally, actually, certainly, probably, basically, could, maybe, delve, embark, enlightening, esteemed, shed light, craft, crafting, imagine, realm, game-changer, unlock, discover, skyrocket, abyss, not alone, in a world where, revolutionize, disruptive, utilize, utilizing, dive deep, tapestry, illuminate, unveil, pivotal, intricate, elucidate, hence, furthermore, however, harness, exciting, groundbreaking, cutting-edge, remarkable, remains to be seen, glimpse into, navigating, landscape, stark, testament, in summary, in conclusion, moreover, boost, skyrocketing, opened up, powerful, inquiries, ever-evolving"

CONTENT GUIDELINES:
- Start with a compelling hook that grabs attention
- Use short paragraphs and line breaks for readability (use \\n for line breaks in JSON)
- Include relevant emojis sparingly (1-2 maximum, only if natural)
- End with a call-to-action or thought-provoking question
- Generate 3-5 relevant hashtags separately (without # symbol)
- Focus on providing value, insights, or entertainment
- Make it authentic and relatable
- Write like a real human would speak

JSON OUTPUT REQUIREMENTS:
- Return ONLY valid JSON, no other text
- "content" field: The complete post text in PLAIN TEXT (NO markdown, NO hashtags)
- "hashtags" field: Array of hashtag strings without # symbol
- "summary" field: One sentence describing the post
- "wordCount" field: Actual word count of the content
- Use proper JSON escaping for special characters and newlines

IMPORTANT: Review your response to ensure no markdown formatting, no em dashes, and natural human-like writing!`;
}

/**
 * Generate an image for the post using Google's Imagen 3
 */
async function generatePostImage(
  prompt: string,
  postContent: string,
  genAI: GoogleGenerativeAI,
  genAI_Image: GoogleGenerativeAI
): Promise<{ url: string | null; base64: string; prompt: any }> {
  let imagePromptObject: any = null;
  let imagePromptText = "";

  try {
    // Extract the main topic from the post for better image generation using JSON mode
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const imagePromptResult = await model.generateContent(`
Based on this LinkedIn post, create a DETAILED, STRUCTURED image generation prompt that would create a professional, 
visually appealing image suitable for LinkedIn. The image should be relevant, eye-catching, and enhance the post.

Post content: ${postContent}

Requirements for the image prompt:
- Professional and suitable for LinkedIn
- Clear, specific visual description with detailed elements
- Modern and clean aesthetic
- Business/professional context
- Include specific objects, colors, lighting, and composition details
- No text or words in the image
- Highly relevant to the post topic
- Photo-realistic or high-quality illustration style
- Proper aspect ratio mention (1:1 for LinkedIn)

Respond with valid JSON in this EXACT format:
{
  "imagePrompt": "A detailed, comprehensive image generation prompt with specific visual elements, composition, lighting, colors, and style - minimum 50 words",
  "style": "professional/modern/creative/minimalist/corporate/etc",
  "suggestedColors": ["color1", "color2", "color3"],
  "keyElements": ["specific element1", "specific element2", "specific element3", "specific element4"],
  "composition": "Description of layout and framing",
  "lighting": "Description of lighting style",
  "mood": "The emotional tone and atmosphere of the image"
}

Make the imagePrompt field extremely detailed and comprehensive for best AI image generation results.`);

    const imagePromptJson = (await imagePromptResult.response).text();
    imagePromptObject = JSON.parse(imagePromptJson);
    imagePromptText = imagePromptObject.imagePrompt;

    log.info("Generated structured image prompt:", imagePromptObject);
    log.info("🎨 Attempting to generate image with Gemini 2.5 Flash Image...");
    log.info(
      `📌 Using ${
        process.env.GEMINI_IMAGE_API_KEY ? "separate" : "shared"
      } API key for images`
    );

    // Use Gemini 2.5 Flash Image model for image generation
    // Using genAI_Image instance which has separate API key (if configured)
    // Reference: https://ai.google.dev/gemini-api/docs/image-generation
    const imageModel = genAI_Image.getGenerativeModel({
      model: "gemini-2.5-flash-image",
    });

    // Generate image with the detailed text prompt
    const imageResult = await imageModel.generateContent(imagePromptText);

    const response = imageResult.response;

    // Extract image data from response
    // Response contains parts with inlineData containing the image
    if (response.candidates && response.candidates[0]?.content?.parts) {
      const parts = response.candidates[0].content.parts;

      // Find the image part (could be text + image or just image)
      for (const part of parts) {
        if ("inlineData" in part && part.inlineData) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || "image/png";

          log.info(
            "✅ Successfully generated image with Gemini 2.5 Flash Image"
          );

          return {
            url: null, // Returns base64, not URL
            base64: `data:${mimeType};base64,${base64Data}`,
            prompt: imagePromptObject, // Return the full structured prompt object
          };
        }
      }
    }

    // If we reach here, image wasn't generated but we have the prompt
    const error: any = new Error(
      "Gemini image generation did not return image data. Please ensure your GEMINI_API_KEY has image generation enabled and is in a supported region."
    );
    error.prompt = imagePromptObject; // Attach structured prompt to error for fallback
    throw error;
  } catch (error) {
    log.error("Image generation error:", error);
    // Attach the structured prompt to the error so it can be used as fallback
    if (imagePromptObject && error instanceof Error) {
      (error as any).prompt = imagePromptObject;
    }
    throw error;
  }
}

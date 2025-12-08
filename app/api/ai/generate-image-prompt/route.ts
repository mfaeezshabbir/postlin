import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { log } from '@/lib/logger';
import prisma from '@/lib/prisma';

// Initialize Gemini for text generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/ai/generate-image-prompt
 * Generate an image prompt based on existing post content
 * Optional: Save the prompt to the database if draftId is provided
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postContent, draftId, regenerate } = body;

    if (!postContent || postContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    log.info('Generating image prompt for post content...');

    // Generate image prompt from post content using JSON mode
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
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
    let imagePromptObject;

    try {
      imagePromptObject = JSON.parse(imagePromptJson);
    } catch (parseError) {
      log.error('Failed to parse image prompt JSON:', imagePromptJson);
      throw new Error('AI returned invalid JSON format for image prompt');
    }

    log.info('Generated structured image prompt:', imagePromptObject);

    // Save prompt to database if draftId is provided
    if (draftId) {
      try {
        const promptJsonString = JSON.stringify(imagePromptObject);
        
        const updatedPost = await prisma.post.update({
          where: { id: draftId },
          data: { imagePrompt: promptJsonString },
        });
        
        log.info('Saved image prompt to database for post:', {
          postId: draftId,
          promptLength: promptJsonString.length,
          regenerate,
        });
      } catch (dbError) {
        log.error('Failed to save image prompt to database:', {
          error: dbError instanceof Error ? dbError.message : 'Unknown error',
          postId: draftId,
        });
        // Don't fail the request if DB save fails - still return the prompt
      }
    }

    return NextResponse.json({
      success: true,
      imagePrompt: imagePromptObject.imagePrompt,
      fullPromptObject: imagePromptObject,
    });
  } catch (error) {
    console.error('Error generating image prompt:', error);
    log.error('Image Prompt Generation Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error) {
      if (
        error.message.includes('API key') ||
        error.message.includes('API_KEY')
      ) {
        return NextResponse.json(
          {
            error:
              'AI service configuration error. Please check your API key.',
          },
          { status: 500 }
        );
      }

      // Handle service overload (503)
      if (
        error.message.includes('503') ||
        error.message.includes('Service Unavailable') ||
        error.message.includes('overloaded')
      ) {
        return NextResponse.json(
          { 
            error: 'AI service is temporarily busy. Please try again in a few moments.',
            details: error.message,
          },
          { status: 503 }
        );
      }

      if (
        error.message.includes('quota') ||
        error.message.includes('limit')
      ) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to generate image prompt',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate image prompt' },
      { status: 500 }
    );
  }
}

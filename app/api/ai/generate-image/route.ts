import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { log } from '@/lib/logger';

// Initialize Gemini - separate keys for text and image generation
const genAI_Text = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const imageApiKey = process.env.GEMINI_IMAGE_API_KEY || '';
if (!process.env.GEMINI_IMAGE_API_KEY) {
  log.warn('⚠️  GEMINI_IMAGE_API_KEY not set, using GEMINI_API_KEY for images');
  log.warn('💡 Set a separate key to avoid rate limit conflicts between text and image generation');
}
const genAI_Image = new GoogleGenerativeAI(imageApiKey || process.env.GEMINI_API_KEY || '');

/**
 * POST /api/ai/generate-image
 * Generate an image based on existing post content
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
    const { postContent } = body;

    if (!postContent || postContent.trim().length === 0) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    log.info('Generating image for post content...');

    // Generate image prompt from post content using text API key
    const model = genAI_Text.getGenerativeModel({
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

    const imagePromptText = imagePromptObject.imagePrompt;

    log.info('Generated structured image prompt:', imagePromptObject);
    log.info('🎨 Attempting to generate image with Gemini 2.5 Flash Image...');

    // Use Gemini 2.5 Flash Image model for image generation
    const imageModel = genAI_Image.getGenerativeModel({
      model: 'gemini-2.5-flash-image',
    });

    // Generate image with the detailed text prompt
    try {
      const imageResult = await imageModel.generateContent(imagePromptText);

      const response = imageResult.response;

      // Extract image data from response
      if (response.candidates && response.candidates[0]?.content?.parts) {
        const parts = response.candidates[0].content.parts;

        // Find the image part
        for (const part of parts) {
          if ('inlineData' in part && part.inlineData) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';

            log.info('✅ Successfully generated image with Gemini 2.5 Flash Image');

            return NextResponse.json({
              success: true,
              image: {
                base64: `data:${mimeType};base64,${base64Data}`,
                mimeType,
                aspectRatio: '1:1',
              },
              imagePrompt: imagePromptObject,
            });
          }
        }
      }

      // If we reach here, image wasn't generated
      throw new Error('Image generation did not return image data');
    } catch (imageError: any) {
      // Check if it's a quota/rate limit error or service overload
      const errorMessage = imageError.message || '';
      
      if (
        errorMessage.includes('429') ||
        errorMessage.includes('Too Many Requests') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('limit')
      ) {
        log.warn('⚠️  Image generation quota exceeded, returning prompt instead');
        log.warn('💡 Tip: To generate images, upgrade to a paid Gemini API plan');

        // Graceful fallback: return the prompt so user can generate image manually
        return NextResponse.json({
          success: true,
          image: null,
          imagePrompt: imagePromptObject,
          message: 'Image generation quota exceeded. You can use the prompt with free tools like Google AI Studio or Leonardo AI.',
        });
      }

      // Check for service unavailable (503) or overloaded errors
      if (
        errorMessage.includes('503') ||
        errorMessage.includes('Service Unavailable') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('overload')
      ) {
        log.warn('⚠️  Gemini API service is temporarily overloaded, returning prompt instead');

        // Graceful fallback: return the prompt so user can generate image manually
        return NextResponse.json({
          success: true,
          image: null,
          imagePrompt: imagePromptObject,
          message: 'AI service is temporarily busy. Please use the prompt with free tools like Google AI Studio or Leonardo AI to generate your image.',
        });
      }

      // For other errors, throw to be caught by main error handler
      throw imageError;
    }
  } catch (error) {
    console.error('Error generating image:', error);
    log.error('Image Generation Error:', {
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
          error: 'Failed to generate image',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

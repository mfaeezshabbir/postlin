import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { log } from '@/lib/logger';

// Initialize Gemini - check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * POST /api/ai/generate
 * Generate LinkedIn post content using Gemini AI
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
    const { prompt, tone = 'professional', length = 'medium' } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build system prompt based on preferences
    const systemPrompt = buildSystemPrompt(tone, length);
    
    // Generate content - using Gemini 2.5 Flash for faster responses
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
    
    const fullPrompt = `${systemPrompt}

User request: ${prompt}

Generate a LinkedIn post that is engaging, professional, and ready to publish.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedContent = response.text();

    log.info(`AI content generated for user: ${session.user.email}`);

    return NextResponse.json({
      success: true,
      content: generatedContent,
      prompt,
      metadata: {
        tone,
        length,
        wordCount: generatedContent.split(/\s+/).length,
      },
    });
  } catch (error) {
    // Log the full error for debugging
    console.error('Error generating AI content:', error);
    log.error('AI Generation Error Details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      // More detailed error messages
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please check your API key.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        { 
          error: 'Failed to generate content',
          details: error.message // Include error details for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

/**
 * Build system prompt based on user preferences
 */
function buildSystemPrompt(tone: string, length: string): string {
  const toneInstructions: Record<string, string> = {
    professional: 'Use a professional, business-appropriate tone. Be clear, confident, and authoritative.',
    casual: 'Use a friendly, conversational tone. Be approachable and personable while maintaining professionalism.',
    enthusiastic: 'Use an energetic, passionate tone. Show excitement and positivity while remaining credible.',
    informative: 'Use an educational, fact-based tone. Focus on providing value and insights.',
    inspirational: 'Use a motivational, uplifting tone. Inspire and encourage your audience.',
  };

  const lengthInstructions: Record<string, string> = {
    short: 'Keep it brief and punchy (100-150 words). Get straight to the point.',
    medium: 'Write a moderate length post (150-250 words). Balance detail with readability.',
    long: 'Write a comprehensive post (250-400 words). Provide depth and thorough explanation.',
  };

  return `You are an expert LinkedIn content creator. Create engaging LinkedIn posts that drive engagement and provide value.

TONE: ${toneInstructions[tone] || toneInstructions.professional}

LENGTH: ${lengthInstructions[length] || lengthInstructions.medium}

GUIDELINES:
- Start with a compelling hook that grabs attention
- Use short paragraphs and line breaks for readability
- Include relevant emojis sparingly (1-3 maximum)
- End with a call-to-action or thought-provoking question
- Avoid hashtags (they'll be added separately)
- Focus on providing value, insights, or entertainment
- Make it authentic and relatable
- Use active voice and strong verbs

OUTPUT FORMAT:
- Plain text only
- No markdown formatting
- No hashtags
- Ready to post directly to LinkedIn`;
}

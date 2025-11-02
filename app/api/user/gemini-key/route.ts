import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { log } from '@/lib/logger';
import { encrypt, decrypt } from '@/lib/encryption';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/user/gemini-key
 * Add or update Gemini API key for current user
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
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Validate the API key by making a test request
    try {
      const testAI = new GoogleGenerativeAI(apiKey.trim());
      const model = testAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });
      
      // Simple test prompt to validate the key
      await model.generateContent('Hello');
      
      log.info('Gemini API key validated successfully');
    } catch (validationError: any) {
      log.error('Gemini API key validation failed:', validationError);
      return NextResponse.json(
        { error: 'Invalid Gemini API key. Please check and try again.' },
        { status: 400 }
      );
    }

    // Encrypt the API key
    const encryptedKey = encrypt(apiKey.trim());

    // Update user with encrypted key
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        geminiApiKey: encryptedKey,
        geminiKeyAddedAt: new Date(),
      },
    });

    log.info('Gemini API key saved for user', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Gemini API key saved successfully',
      geminiKeyAddedAt: user.geminiKeyAddedAt,
    });
  } catch (error) {
    log.error('Error saving Gemini API key:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/gemini-key
 * Remove Gemini API key for current user
 */
export async function DELETE() {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Remove the API key from user
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        geminiApiKey: null,
        geminiKeyAddedAt: null,
      },
    });

    log.info('Gemini API key removed for user', { email: session.user.email });

    return NextResponse.json({
      success: true,
      message: 'Gemini API key removed successfully',
    });
  } catch (error) {
    log.error('Error removing Gemini API key:', error);
    return NextResponse.json(
      { error: 'Failed to remove API key' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get user's Gemini API key (decrypted)
 * This is exported for use by other API routes
 */
export async function getUserGeminiKey(userEmail: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { geminiApiKey: true },
    });

    if (!user?.geminiApiKey) {
      return null;
    }

    // Decrypt and return the key
    return decrypt(user.geminiApiKey);
  } catch (error) {
    log.error('Error fetching user Gemini key:', error);
    return null;
  }
}

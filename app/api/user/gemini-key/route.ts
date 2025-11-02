import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/modules/auth';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { log } from '@/lib/logger';

/**
 * POST /api/user/gemini-key
 * Add or update Gemini API key for the authenticated user
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

    // Basic validation - Gemini API keys typically start with "AIzaSy"
    if (!apiKey.startsWith('AIzaSy')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key format. Keys should start with "AIzaSy"' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Encrypt the API key
    let encryptedKey: string;
    try {
      encryptedKey = encrypt(apiKey.trim());
    } catch (error) {
      log.error('Failed to encrypt Gemini API key:', error);
      return NextResponse.json(
        { error: 'Failed to encrypt API key' },
        { status: 500 }
      );
    }

    // Update user with encrypted key
    await prisma.user.update({
      where: { id: user.id },
      data: {
        geminiApiKeyEncrypted: encryptedKey,
        geminiKeyAddedAt: new Date(),
      },
    });

    log.info('Gemini API key added/updated for user', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Gemini API key saved successfully',
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
 * Delete Gemini API key for the authenticated user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the encrypted key
    await prisma.user.update({
      where: { id: user.id },
      data: {
        geminiApiKeyEncrypted: null,
        geminiKeyAddedAt: null,
      },
    });

    log.info('Gemini API key deleted for user', { userId: user.id });

    return NextResponse.json({
      success: true,
      message: 'Gemini API key deleted successfully',
    });
  } catch (error) {
    log.error('Error deleting Gemini API key:', error);
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/gemini-key
 * Check if user has a Gemini API key (without exposing the key)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        geminiApiKeyEncrypted: true,
        geminiKeyAddedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hasKey: !!user.geminiApiKeyEncrypted,
      addedAt: user.geminiKeyAddedAt,
    });
  } catch (error) {
    log.error('Error checking Gemini API key:', error);
    return NextResponse.json(
      { error: 'Failed to check API key' },
      { status: 500 }
    );
  }
}

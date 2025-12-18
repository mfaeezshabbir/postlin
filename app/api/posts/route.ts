import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import prisma from "@/lib/prisma";
import { log } from "@/lib/logger";

/**
 * GET /api/posts
 * Fetch all posts for the authenticated user, optionally filtered by status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query
    const whereClause: any = {
      userId: user.id,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    // Fetch posts
    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        draftText: true,
        status: true,
        imageUrl: true,
        scheduledAt: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    log.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

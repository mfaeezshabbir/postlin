import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/modules/auth";
import prisma from "@/lib/prisma";
import { log } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(getAuthOptions());

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use groupBy to get counts for all statuses in one query
    const postCounts = await prisma.post.groupBy({
      by: ["status"],
      where: {
        userId: user.id,
      },
      _count: {
        _all: true,
      },
    });

    // Initialize defaults
    const stats = {
      drafts: 0,
      scheduled: 0,
      published: 0,
    };

    // Map results to stats object
    postCounts.forEach((group: { _count: { _all: any }; status: any }) => {
      const count = group._count._all;
      const status = group.status; // 'DRAFT', 'SCHEDULED', 'PUBLISHED'

      if (status === "DRAFT") stats.drafts = count;
      else if (status === "SCHEDULED") stats.scheduled = count;
      else if (status === "PUBLISHED") stats.published = count;
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    log.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

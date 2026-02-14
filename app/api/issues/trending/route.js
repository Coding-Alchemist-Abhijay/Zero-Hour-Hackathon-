import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/issues/trending — issues sorted by votes + recency (trending algorithm) */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const issues = await prisma.issue.findMany({
      where: { status: { notIn: ["Resolved", "Verified"] } },
      take: limit * 3,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, slug: true } },
        _count: { select: { votes: true, comments: true } },
      },
    });
    issues.sort((a, b) => b._count.votes - a._count.votes || new Date(b.createdAt) - new Date(a.createdAt));
    const trimmed = issues.slice(0, limit);

    return NextResponse.json({ success: true, data: trimmed });
  } catch (err) {
    console.error("GET /api/issues/trending", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

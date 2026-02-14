import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/timeline?issueId= — timeline entries for an issue (public) */
export async function GET(req) {
  try {
    const issueId = req.nextUrl.searchParams.get("issueId");
    if (!issueId) {
      return NextResponse.json({ success: false, message: "issueId required" }, { status: 400 });
    }

    const entries = await prisma.issueTimeline.findMany({
      where: { issueId },
      orderBy: { createdAt: "asc" },
      include: {
        updatedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (err) {
    console.error("GET /api/timeline", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

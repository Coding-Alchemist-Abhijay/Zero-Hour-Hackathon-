import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

/** GET /api/notifications — list for current user (auth required) */
export async function GET(req) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });

    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 50, 100);
    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") === "true";

    const where = { userId: user.id };
    if (unreadOnly) where.read = false;

    const notifications = await prisma.notification.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (err) {
    console.error("GET /api/notifications", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

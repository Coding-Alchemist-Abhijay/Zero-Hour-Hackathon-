import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Notification } from "@/models";
import { requireAuth } from "@/lib/api-auth";
import { toResponse } from "@/lib/mongo-utils";

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });

    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 50, 100);
    const unreadOnly = req.nextUrl.searchParams.get("unreadOnly") === "true";

    await connect();
    const filter = { userId: auth.user.id };
    if (unreadOnly) filter.read = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    return NextResponse.json({ success: true, data: toResponse(notifications) });
  } catch (err) {
    console.error("GET /api/notifications", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

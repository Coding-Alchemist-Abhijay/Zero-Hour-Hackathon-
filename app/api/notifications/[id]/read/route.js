import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Notification } from "@/models";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });

    const { id } = await params;
    await connect();
    const n = await Notification.findOne({ _id: id, userId: auth.user.id });
    if (!n) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    await Notification.updateOne({ _id: id }, { read: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/notifications/[id]/read", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

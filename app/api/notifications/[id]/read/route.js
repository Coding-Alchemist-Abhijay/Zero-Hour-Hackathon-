import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

/** PATCH /api/notifications/[id]/read — mark as read (auth required) */
export async function PATCH(req, { params }) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });

    const id = params.id;
    const n = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });
    if (!n) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/notifications/[id]/read", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Vote } from "@/models";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const voteSchema = z.object({ issueId: z.string() });

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });

    const body = await req.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { issueId } = parsed.data;
    await connect();

    const existing = await Vote.findOne({ issueId, userId: auth.user.id });
    if (existing) {
      await Vote.deleteOne({ issueId, userId: auth.user.id });
      return NextResponse.json({ success: true, data: { voted: false } });
    }
    await Vote.create({ issueId, userId: auth.user.id });
    return NextResponse.json({ success: true, data: { voted: true } });
  } catch (err) {
    console.error("POST /api/votes", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

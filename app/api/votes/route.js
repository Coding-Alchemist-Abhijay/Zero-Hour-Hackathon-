import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const voteSchema = z.object({ issueId: z.string().cuid() });

/** POST /api/votes — toggle vote (upvote) on an issue (auth required) */
export async function POST(req) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });

    const body = await req.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { issueId } = parsed.data;
    const existing = await prisma.vote.findUnique({
      where: { issueId_userId: { issueId, userId: user.id } },
    });

    if (existing) {
      await prisma.vote.delete({
        where: { issueId_userId: { issueId, userId: user.id } },
      });
      return NextResponse.json({ success: true, data: { voted: false } });
    }

    await prisma.vote.create({
      data: { issueId, userId: user.id },
    });
    return NextResponse.json({ success: true, data: { voted: true } });
  } catch (err) {
    console.error("POST /api/votes", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

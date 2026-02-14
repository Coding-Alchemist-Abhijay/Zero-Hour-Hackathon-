import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { z } from "zod";

const createCommentSchema = z.object({
  issueId: z.string().cuid(),
  body: z.string().min(1).max(2000),
  parentId: z.string().cuid().optional().nullable(),
});

/** GET /api/comments?issueId= — list comments for an issue (public) */
export async function GET(req) {
  try {
    const issueId = req.nextUrl.searchParams.get("issueId");
    if (!issueId) {
      return NextResponse.json({ success: false, message: "issueId required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true } },
        replies: {
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    const topLevel = comments.filter((c) => !c.parentId);
    const byParent = comments.filter((c) => c.parentId).reduce((acc, c) => {
      if (!acc[c.parentId]) acc[c.parentId] = [];
      acc[c.parentId].push(c);
      return acc;
    }, {});

    const withReplies = topLevel.map((c) => ({
      ...c,
      replies: (byParent[c.id] || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));

    return NextResponse.json({ success: true, data: withReplies });
  } catch (err) {
    console.error("GET /api/comments", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/comments — add comment (auth required) */
export async function POST(req) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        ...parsed.data,
        authorId: user.id,
      },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Comment } from "@/models";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import { toResponse } from "@/lib/mongo-utils";

const createCommentSchema = z.object({
  issueId: z.string(),
  body: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

export async function GET(req) {
  try {
    const issueId = req.nextUrl.searchParams.get("issueId");
    if (!issueId) {
      return NextResponse.json({ success: false, message: "issueId required" }, { status: 400 });
    }

    await connect();
    const comments = await Comment.find({ issueId })
      .sort({ createdAt: 1 })
      .populate("authorId", "name")
      .lean();

    const topLevel = comments.filter((c) => !c.parentId);
    const byParent = comments.filter((c) => c.parentId).reduce((acc, c) => {
      const pid = c.parentId?.toString();
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push(c);
      return acc;
    }, {});

    const withReplies = topLevel.map((c) => ({
      ...c,
      replies: (byParent[c._id.toString()] || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));

    const data = toResponse(withReplies).map((c) => ({
      ...c,
      author: c.authorId && typeof c.authorId === "object" ? c.authorId : { id: c.authorId, name: "" },
    }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/comments", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connect();
    const comment = await Comment.create({
      ...parsed.data,
      authorId: auth.user.id,
    });
    const populated = await Comment.findById(comment._id).populate("authorId", "name").lean();
    const out = toResponse(populated);
    if (out.authorId && typeof out.authorId === "object") out.author = out.authorId;
    return NextResponse.json({ success: true, data: out }, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

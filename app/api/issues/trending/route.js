import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Issue, Vote, Comment } from "@/models";
import { toResponse } from "@/lib/mongo-utils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    await connect();
    const issues = await Issue.find({ status: { $nin: ["Resolved", "Verified"] } })
      .sort({ createdAt: -1 })
      .limit(limit * 3)
      .populate("createdById", "name")
      .populate("departmentId", "name slug")
      .lean();

    const withVoteCount = await Promise.all(
      issues.map(async (i) => {
        const votes = await Vote.countDocuments({ issueId: i._id });
        return { ...i, _count: { votes, comments: await Comment.countDocuments({ issueId: i._id }) } };
      })
    );
    withVoteCount.sort((a, b) => b._count.votes - a._count.votes || new Date(b.createdAt) - new Date(a.createdAt));
    const trimmed = withVoteCount.slice(0, limit);

    const data = toResponse(trimmed).map((i) => ({
      ...i,
      createdBy: i.createdById && typeof i.createdById === "object" ? i.createdById : { id: i.createdById, name: "" },
      department: i.departmentId && typeof i.departmentId === "object" ? i.departmentId : (i.departmentId ? { id: i.departmentId } : null),
    }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/issues/trending", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

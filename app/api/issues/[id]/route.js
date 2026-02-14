import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connect } from "@/lib/db";
import { Issue, Vote, Comment, IssueImage } from "@/models";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/api-auth";
import { updateIssueSchema } from "@/lib/validations/issue";
import { toResponse } from "@/lib/mongo-utils";
import { IssueTimeline } from "@/models";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });
    }
    await connect();
    const user = await getCurrentUser(req);

    const issue = await Issue.findById(id)
      .populate("createdById", "name")
      .populate("assignedToId", "name")
      .populate("departmentId", "name slug")
      .lean();
    if (!issue) return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });

    const [voteCount, commentCount, images, userVoted] = await Promise.all([
      Vote.countDocuments({ issueId: id }),
      Comment.countDocuments({ issueId: id }),
      IssueImage.find({ issueId: id }).sort({ order: 1 }).lean(),
      user?.id ? Vote.findOne({ issueId: id, userId: user.id }).lean().then((v) => !!v) : false,
    ]);

    const out = toResponse({ ...issue, _count: { votes: voteCount, comments: commentCount }, images, userVoted });
    if (out.createdById && typeof out.createdById === "object") out.createdBy = out.createdById;
    if (out.assignedToId && typeof out.assignedToId === "object") out.assignedTo = out.assignedToId;
    if (out.departmentId && typeof out.departmentId === "object") out.department = out.departmentId;
    return NextResponse.json({ success: true, data: out });
  } catch (err) {
    console.error("GET /api/issues/[id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });
    const roleCheck = requireRole(auth.user, ["OFFICIAL", "ADMIN"]);
    if (!roleCheck.ok) return NextResponse.json(roleCheck.body, { status: roleCheck.status });

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });
    }
    const body = await req.json();
    const parsed = updateIssueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connect();
    const issue = await Issue.findById(id).lean();
    if (!issue) return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });

    const { note, ...updates } = parsed.data;
    const newStatus = updates.status ?? issue.status;
    const updateData = {
      ...updates,
      ...(newStatus === "Resolved" || newStatus === "Verified" ? { resolvedAt: new Date() } : {}),
    };

    const updated = await Issue.findByIdAndUpdate(id, updateData, { new: true })
      .populate("createdById", "name")
      .populate("assignedToId", "name")
      .populate("departmentId", "name")
      .lean();

    await IssueTimeline.create({ issueId: id, status: newStatus, note: note ?? null, updatedById: auth.user.id });

    const [voteCount, commentCount] = await Promise.all([
      Vote.countDocuments({ issueId: id }),
      Comment.countDocuments({ issueId: id }),
    ]);
    const images = await IssueImage.find({ issueId: id }).sort({ order: 1 }).lean();
    const out = toResponse({ ...updated, _count: { votes: voteCount, comments: commentCount }, images });
    if (out.createdById && typeof out.createdById === "object") out.createdBy = out.createdById;
    if (out.assignedToId && typeof out.assignedToId === "object") out.assignedTo = out.assignedToId;
    if (out.departmentId && typeof out.departmentId === "object") out.department = out.departmentId;
    return NextResponse.json({ success: true, data: out });
  } catch (err) {
    console.error("PATCH /api/issues/[id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

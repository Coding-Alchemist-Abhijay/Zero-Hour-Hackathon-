import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Issue, IssueImage, IssueTimeline, Vote, Comment } from "@/models";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/api-auth";
import { createIssueSchema } from "@/lib/validations/issue";
import { toResponse } from "@/lib/mongo-utils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const departmentId = searchParams.get("departmentId");
    const createdByMe = searchParams.get("createdBy") === "me";
    const skip = (page - 1) * limit;

    const user = await getCurrentUser(req);
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (departmentId) filter.departmentId = departmentId;
    if (createdByMe && user?.id) filter.createdById = user.id;

    await connect();
    const [issues, total] = await Promise.all([
      Issue.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdById", "name")
        .populate("departmentId", "name slug")
        .lean(),
      Issue.countDocuments(filter),
    ]);

    const withCounts = await Promise.all(
      issues.map(async (i) => {
        const [votes, comments] = await Promise.all([
          Vote.countDocuments({ issueId: i._id }),
          Comment.countDocuments({ issueId: i._id }),
        ]);
        return { ...i, _count: { votes, comments } };
      })
    );

    const data = toResponse(withCounts).map((i) => ({
      ...i,
      createdBy: i.createdById && typeof i.createdById === "object" ? i.createdById : { id: i.createdById, name: "" },
      department: i.departmentId && typeof i.departmentId === "object" ? i.departmentId : (i.departmentId ? { id: i.departmentId, name: "" } : null),
    }));
    return NextResponse.json({ success: true, data, pagination: { page, limit, total } });
  } catch (err) {
    console.error("GET /api/issues", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });
    const roleCheck = requireRole(auth.user, ["RESIDENT", "ADMIN"]);
    if (!roleCheck.ok) return NextResponse.json(roleCheck.body, { status: roleCheck.status });

    const body = await req.json();
    const parsed = createIssueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { imageUrls, ...data } = parsed.data;
    const priorityScore = data.severity === "Critical" ? 10 : data.severity === "High" ? 7 : 4;

    await connect();
    const issue = await Issue.create({
      ...data,
      createdById: auth.user.id,
      priorityScore,
    });

    if (imageUrls?.length) {
      await IssueImage.insertMany(imageUrls.map((url, order) => ({ issueId: issue._id, url, order })));
    }
    await IssueTimeline.create({ issueId: issue._id, status: "Submitted", updatedById: auth.user.id });

    const created = await Issue.findById(issue._id).populate("createdById", "name").lean();
    const images = await IssueImage.find({ issueId: issue._id }).sort({ order: 1 }).lean();
    const out = toResponse({ ...created, images });
    if (out.createdById && typeof out.createdById === "object") out.createdBy = out.createdById;
    return NextResponse.json({ success: true, data: out }, { status: 201 });
  } catch (err) {
    console.error("POST /api/issues", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

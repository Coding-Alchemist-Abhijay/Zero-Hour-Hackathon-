import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/lib/api-auth";
import { createIssueSchema, paginationSchema } from "@/lib/validations/issue";

/** GET /api/issues — list issues (public), with optional auth for filters */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const departmentId = searchParams.get("departmentId");
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (departmentId) where.departmentId = departmentId;

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: "desc" }],
        include: {
          createdBy: { select: { id: true, name: true } },
          department: { select: { id: true, name: true, slug: true } },
          _count: { select: { votes: true, comments: true } },
        },
      }),
      prisma.issue.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: issues,
      pagination: { page, limit, total },
    });
  } catch (err) {
    console.error("GET /api/issues", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/issues — create issue (auth required) */
export async function POST(req) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });
    const roleCheck = requireRole(user, ["RESIDENT", "ADMIN"]);
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
    const issue = await prisma.issue.create({
      data: {
        ...data,
        createdById: user.id,
        priorityScore: data.severity === "Critical" ? 10 : data.severity === "High" ? 7 : 4,
      },
    });

    if (imageUrls?.length) {
      await prisma.issueImage.createMany({
        data: imageUrls.map((url, order) => ({ issueId: issue.id, url, order })),
      });
    }

    await prisma.issueTimeline.create({
      data: { issueId: issue.id, status: "Submitted", updatedById: user.id },
    });

    const created = await prisma.issue.findUnique({
      where: { id: issue.id },
      include: {
        createdBy: { select: { id: true, name: true } },
        images: true,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/issues", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/api-auth";
import { updateIssueSchema } from "@/lib/validations/issue";

/** GET /api/issues/[id] — single issue (public); includes userVoted when authenticated */
export async function GET(req, { params }) {
  try {
    const id = params.id;
    const { user } = getCurrentUser(req);
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, slug: true } },
        images: true,
        _count: { select: { votes: true, comments: true } },
      },
    });
    if (!issue) return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });
    let userVoted = false;
    if (user?.id) {
      const vote = await prisma.vote.findUnique({
        where: { issueId_userId: { issueId: id, userId: user.id } },
      });
      userVoted = !!vote;
    }
    return NextResponse.json({ success: true, data: { ...issue, userVoted } });
  } catch (err) {
    console.error("GET /api/issues/[id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/** PATCH /api/issues/[id] — update status/assign (official/admin) */
export async function PATCH(req, { params }) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });
    const roleCheck = requireRole(user, ["OFFICIAL", "ADMIN"]);
    if (!roleCheck.ok) return NextResponse.json(roleCheck.body, { status: roleCheck.status });

    const id = params.id;
    const body = await req.json();
    const parsed = updateIssueSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const issue = await prisma.issue.findUnique({ where: { id } });
    if (!issue) return NextResponse.json({ success: false, message: "Issue not found" }, { status: 404 });

    const { note, ...updates } = parsed.data;
    const newStatus = updates.status ?? issue.status;

    const [updated] = await prisma.$transaction([
      prisma.issue.update({
        where: { id },
        data: {
          ...updates,
          ...(newStatus === "Resolved" || newStatus === "Verified" ? { resolvedAt: new Date() } : {}),
        },
        include: {
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          images: true,
          _count: { select: { votes: true, comments: true } },
        },
      }),
      prisma.issueTimeline.create({
        data: { issueId: id, status: newStatus, note: note ?? null, updatedById: user.id },
      }),
    ]);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/issues/[id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

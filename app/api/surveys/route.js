import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/api-auth";
import { z } from "zod";

const createSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  departmentId: z.string().cuid().optional().nullable(),
  startsAt: z.string().datetime().or(z.date()),
  endsAt: z.string().datetime().or(z.date()),
  published: z.boolean().optional(),
  questions: z.array(z.object({
    text: z.string().min(1),
    order: z.number().int().min(0),
    options: z.array(z.string()),
  })),
});

/** GET /api/surveys — list published surveys (public), or all for official/admin */
export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    const publishedOnly = !user || !["OFFICIAL", "ADMIN"].includes(user?.role ?? "");

    const where = publishedOnly ? { published: true, endsAt: { gte: new Date() } } : {};

    const surveys = await prisma.survey.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        questions: { orderBy: { order: "asc" } },
        _count: { select: { responses: true } },
      },
    });

    return NextResponse.json({ success: true, data: surveys });
  } catch (err) {
    console.error("GET /api/surveys", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/** POST /api/surveys — create survey (official/admin) */
export async function POST(req) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });
    const roleCheck = requireRole(user, ["OFFICIAL", "ADMIN"]);
    if (!roleCheck.ok) return NextResponse.json(roleCheck.body, { status: roleCheck.status });

    const body = await req.json();
    const parsed = createSurveySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { questions, ...data } = parsed.data;
    const survey = await prisma.survey.create({
      data: {
        ...data,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        published: data.published ?? false,
        createdById: user.id,
      },
    });

    await prisma.surveyQuestion.createMany({
      data: questions.map((q) => ({
        surveyId: survey.id,
        text: q.text,
        order: q.order,
        options: q.options,
      })),
    });

    const created = await prisma.survey.findUnique({
      where: { id: survey.id },
      include: { questions: true },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/surveys", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

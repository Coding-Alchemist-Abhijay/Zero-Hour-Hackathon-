import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Survey, SurveyQuestion, SurveyResponse } from "@/models";
import { getCurrentUser, requireAuth, requireRole } from "@/lib/api-auth";
import { z } from "zod";
import { toResponse } from "@/lib/mongo-utils";

const createSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  departmentId: z.string().optional().nullable(),
  startsAt: z.string().datetime().or(z.date()),
  endsAt: z.string().datetime().or(z.date()),
  published: z.boolean().optional(),
  questions: z.array(
    z.object({
      text: z.string().min(1),
      order: z.number().int().min(0),
      options: z.array(z.string()),
    })
  ),
});

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    const publishedOnly = !user || !["OFFICIAL", "ADMIN"].includes(user?.role ?? "");

    await connect();
    const filter = {};
    if (publishedOnly) {
      filter.published = true;
      filter.endsAt = { $gte: new Date() };
    }

    const surveys = await Survey.find(filter)
      .sort({ createdAt: -1 })
      .populate("questions")
      .lean();

    const withCounts = await Promise.all(
      surveys.map(async (s) => {
        const responses = await SurveyResponse.countDocuments({ surveyId: s._id });
        return { ...s, _count: { responses } };
      })
    );

    return NextResponse.json({ success: true, data: toResponse(withCounts) });
  } catch (err) {
    console.error("GET /api/surveys", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });
    const roleCheck = requireRole(auth.user, ["OFFICIAL", "ADMIN"]);
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
    await connect();

    const survey = await Survey.create({
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      published: data.published ?? false,
      createdById: auth.user.id,
    });

    await SurveyQuestion.insertMany(
      questions.map((q) => ({
        surveyId: survey._id,
        text: q.text,
        order: q.order,
        options: q.options,
      }))
    );

    const created = await Survey.findById(survey._id).populate("questions").lean();
    return NextResponse.json({ success: true, data: toResponse(created) }, { status: 201 });
  } catch (err) {
    console.error("POST /api/surveys", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

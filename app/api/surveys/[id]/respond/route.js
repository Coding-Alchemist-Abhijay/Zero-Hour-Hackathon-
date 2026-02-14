import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Survey, SurveyResponse } from "@/models";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const respondSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.union([z.string(), z.number()]),
    })
  ),
});

export async function POST(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return NextResponse.json(auth.response.body, { status: auth.response.status });

    const { id: surveyId } = await params;
    await connect();
    const survey = await Survey.findById(surveyId).populate("questions").lean();

    if (!survey || !survey.published) {
      return NextResponse.json({ success: false, message: "Survey not found or closed" }, { status: 404 });
    }
    if (new Date(survey.endsAt) < new Date()) {
      return NextResponse.json({ success: false, message: "Survey has ended" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = respondSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const questionIds = survey.questions.map((q) => q._id.toString());
    for (const a of parsed.data.answers) {
      if (!questionIds.includes(a.questionId)) continue;
      const answer = a.value;
      await SurveyResponse.findOneAndUpdate(
        { surveyId, questionId: a.questionId, userId: auth.user.id },
        { $set: { answer } },
        { upsert: true, new: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/surveys/[id]/respond", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

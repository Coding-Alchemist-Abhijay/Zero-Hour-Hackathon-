import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const respondSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().cuid(),
    answer: z.union([z.string(), z.number()]),
  })),
});

/** POST /api/surveys/[id]/respond — submit survey response (auth required) */
export async function POST(req, { params }) {
  try {
    const { user, response } = await requireAuth(req);
    if (response) return NextResponse.json(response.body, { status: response.status });

    const surveyId = params.id;
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: { questions: true },
    });

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

    const questionIds = survey.questions.map((q) => q.id);
    for (const a of parsed.data.answers) {
      if (!questionIds.includes(a.questionId)) continue;
      const existing = await prisma.surveyResponse.findFirst({
        where: { surveyId, questionId: a.questionId, userId: user.id },
      });
      if (existing) {
        await prisma.surveyResponse.update({
          where: { id: existing.id },
          data: { answer: a.answer },
        });
      } else {
        await prisma.surveyResponse.create({
          data: { surveyId, questionId: a.questionId, userId: user.id, answer: a.answer },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/surveys/[id]/respond", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

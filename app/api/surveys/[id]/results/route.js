import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/surveys/[id]/results — aggregate results (public for published survey) */
export async function GET(req, { params }) {
  try {
    const id = params.id;
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!survey) return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId: id },
    });

    const byQuestion = {};
    for (const q of survey.questions) {
      const qResponses = responses.filter((r) => r.questionId === q.id);
      const options = Array.isArray(q.options) ? q.options : [];
      const counts = options.map((_, i) => ({ option: options[i], count: 0 }));
      for (const r of qResponses) {
        const ans = r.answer;
        if (typeof ans === "number" && counts[ans]) counts[ans].count++;
        else if (typeof ans === "string") {
          const idx = options.indexOf(ans);
          if (idx >= 0 && counts[idx]) counts[idx].count++;
        }
      }
      byQuestion[q.id] = { text: q.text, options: counts, total: qResponses.length };
    }

    return NextResponse.json({
      success: true,
      data: { surveyId: id, title: survey.title, byQuestion, totalResponses: responses.length },
    });
  } catch (err) {
    console.error("GET /api/surveys/[id]/results", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

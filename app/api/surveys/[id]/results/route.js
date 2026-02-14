import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Survey, SurveyResponse } from "@/models";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connect();
    const survey = await Survey.findById(id).populate("questions").lean();

    if (!survey) return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });

    const responses = await SurveyResponse.find({ surveyId: id }).lean();

    const byQuestion = {};
    for (const q of survey.questions) {
      const qid = q._id.toString();
      const qResponses = responses.filter((r) => r.questionId?.toString() === qid);
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
      byQuestion[qid] = { text: q.text, options: counts, total: qResponses.length };
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

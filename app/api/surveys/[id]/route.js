import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/surveys/[id] — single survey with questions (public if published) */
export async function GET(req, { params }) {
  try {
    const id = params.id;
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!survey) return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });
    if (!survey.published || new Date(survey.endsAt) < new Date()) {
      return NextResponse.json({ success: false, message: "Survey not available" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: survey });
  } catch (err) {
    console.error("GET /api/surveys/[id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

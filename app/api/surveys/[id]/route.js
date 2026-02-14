import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Survey } from "@/models";
import { toResponse } from "@/lib/mongo-utils";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connect();
    const survey = await Survey.findById(id).populate("questions").lean();

    if (!survey) return NextResponse.json({ success: false, message: "Survey not found" }, { status: 404 });
    if (!survey.published || new Date(survey.endsAt) < new Date()) {
      return NextResponse.json({ success: false, message: "Survey not available" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toResponse(survey) });
  } catch (err) {
    console.error("GET /api/surveys/[id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

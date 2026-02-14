import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { IssueTimeline } from "@/models";
import { toResponse } from "@/lib/mongo-utils";

export async function GET(req) {
  try {
    const issueId = req.nextUrl.searchParams.get("issueId");
    if (!issueId) {
      return NextResponse.json({ success: false, message: "issueId required" }, { status: 400 });
    }

    await connect();
    const entries = await IssueTimeline.find({ issueId })
      .sort({ createdAt: 1 })
      .populate("updatedById", "name")
      .lean();

    const data = toResponse(entries).map((e) => ({
      ...e,
      updatedBy: e.updatedById && typeof e.updatedById === "object" ? e.updatedById : { id: e.updatedById, name: "" },
    }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/timeline", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

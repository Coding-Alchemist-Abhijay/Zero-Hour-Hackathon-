import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Department } from "@/models";
import { toResponse } from "@/lib/mongo-utils";

export async function GET() {
  try {
    await connect();
    const departments = await Department.find().sort({ name: 1 }).select("name slug city description").lean();
    return NextResponse.json({ success: true, data: toResponse(departments) });
  } catch (err) {
    console.error("GET /api/departments", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

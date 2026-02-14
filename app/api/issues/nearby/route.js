import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Issue, Vote, Comment } from "@/models";
import { nearbyQuerySchema } from "@/lib/validations/issue";
import { toResponse } from "@/lib/mongo-utils";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = nearbyQuerySchema.safeParse({
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng"),
      radiusKm: searchParams.get("radiusKm"),
      limit: searchParams.get("limit"),
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { lat, lng, radiusKm, limit } = parsed.data;
    const dLat = radiusKm / 111;
    const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    await connect();
    const issues = await Issue.find({
      latitude: { $gte: lat - dLat, $lte: lat + dLat },
      longitude: { $gte: lng - dLng, $lte: lng + dLng },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("createdById", "name")
      .lean();

    const withCounts = await Promise.all(
      issues.map(async (i) => ({
        ...i,
        _count: {
          votes: await Vote.countDocuments({ issueId: i._id }),
          comments: await Comment.countDocuments({ issueId: i._id }),
        },
      }))
    );

    const data = toResponse(withCounts).map((i) => ({ ...i, createdBy: i.createdById && typeof i.createdById === "object" ? i.createdById : { id: i.createdById, name: "" } }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("GET /api/issues/nearby", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

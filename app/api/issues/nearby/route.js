import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nearbyQuerySchema } from "@/lib/validations/issue";

/** GET /api/issues/nearby?lat=&lng=&radiusKm= — geo query (approx, no PostGIS) */
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
    // Approx: 1° lat ~ 111km, 1° lng ~ 111*cos(lat) km
    const dLat = radiusKm / 111;
    const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const issues = await prisma.issue.findMany({
      where: {
        latitude: { gte: lat - dLat, lte: lat + dLat },
        longitude: { gte: lng - dLng, lte: lng + dLng },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { votes: true, comments: true } },
      },
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (err) {
    console.error("GET /api/issues/nearby", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

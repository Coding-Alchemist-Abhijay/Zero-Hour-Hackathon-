import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { User } from "@/models";
import { getBearerToken, verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Missing or invalid authorization" }, { status: 401 });
    }
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 });
    }

    await connect();
    const user = await User.findById(decoded.id).select("email name role avatarUrl emailVerified createdAt").lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { ...user, id: user._id.toString() } });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

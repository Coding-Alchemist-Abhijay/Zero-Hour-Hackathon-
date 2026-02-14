import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBearerToken, verifyToken } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Authorization: Bearer <token>
 * Returns: { user } or 401
 */
export async function GET(req) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid authorization" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

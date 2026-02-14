import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { User } from "@/models";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name, role } = parsed.data;

    await connect();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name,
      role: role ?? "RESIDENT",
    });

    const safe = { id: user._id.toString(), email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
    const accessToken = signToken({ id: user._id.toString(), email: user.email, role: user.role });

    return NextResponse.json({ success: true, user: safe, accessToken });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

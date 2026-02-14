import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { User } from "@/models";
import { verifyPassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    await connect();
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 });
    }

    const safeUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
    const accessToken = signToken({ id: user._id.toString(), email: user.email, role: user.role });

    return NextResponse.json({ success: true, user: safeUser, accessToken });
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

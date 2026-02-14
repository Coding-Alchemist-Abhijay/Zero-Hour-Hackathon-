import { getBearerToken, verifyToken } from "@/lib/auth";
import { connect } from "@/lib/db";
import { User } from "@/models";

export async function getCurrentUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    await connect();
    const user = await User.findById(decoded.id).select("-passwordHash").lean();
    if (!user) return null;
    return { ...user, id: user._id.toString() };
  } catch {
    return null;
  }
}

export async function requireAuth(req) {
  const user = await getCurrentUser(req);
  if (!user) {
    return { user: null, response: { status: 401, body: { success: false, message: "Unauthorized" } } };
  }
  return { user, response: null };
}

export function requireRole(user, roles) {
  if (!user || !roles.includes(user.role)) {
    return { ok: false, status: 403, body: { success: false, message: "Forbidden" } };
  }
  return { ok: true };
}

/**
 * Helper to get current user from request (Bearer token).
 * Use in API routes for protected endpoints.
 */
import { getBearerToken, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getCurrentUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, departmentId: true },
    });
    return user;
  } catch {
    return null;
  }
}

/** Require auth; returns 401 JSON if not logged in */
export async function requireAuth(req) {
  const user = await getCurrentUser(req);
  if (!user) {
    return { user: null, response: { status: 401, body: { success: false, message: "Unauthorized" } } };
  }
  return { user, response: null };
}

/** Require one of the given roles */
export function requireRole(user, roles) {
  if (!user || !roles.includes(user.role)) {
    return { ok: false, status: 403, body: { success: false, message: "Forbidden" } };
  }
  return { ok: true };
}

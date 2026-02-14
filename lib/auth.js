/**
 * Auth utilities: JWT sign/verify, password hashing.
 * Used by auth API routes and optional middleware.
 */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "7d";

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET must be set in production");
}

/**
 * Hash a plain password. Use 12 rounds for production.
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 12);
}

/**
 * Compare plain password with stored hash.
 */
export async function verifyPassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Sign a JWT with user id and role. Safe to send to client.
 */
export function signToken(payload) {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    },
    JWT_SECRET ?? "dev-secret-change-in-production",
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verify and decode JWT. Throws if invalid/expired.
 */
export function verifyToken(token) {
  return jwt.verify(
    token,
    JWT_SECRET ?? "dev-secret-change-in-production"
  );
}

/**
 * Extract Bearer token from Authorization header.
 * Returns null if missing or invalid format.
 */
export function getBearerToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim();
}

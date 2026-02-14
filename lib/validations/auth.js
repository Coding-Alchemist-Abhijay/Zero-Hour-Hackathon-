/**
 * Zod schemas for auth request bodies.
 */
import { z } from "zod";

const roleEnum = z.enum(["RESIDENT", "OFFICIAL", "JOURNALIST", "ADMIN"]);

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must include uppercase, lowercase, and a number"
    ),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: roleEnum.default("RESIDENT"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

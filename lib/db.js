/**
 * Prisma client for CivicBridge.
 * Prisma 7 requires an adapter for Neon; we use @prisma/adapter-neon with DATABASE_URL.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis;

// Create Prisma client singleton to avoid multiple instances in dev
function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is missing in .env. Add your Neon pooled connection string."
    );
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

// Use singleton in development to avoid hot reload issues
export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

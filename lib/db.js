import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const db = globalForPrisma.db ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;

export { db };
export const prisma = db;
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

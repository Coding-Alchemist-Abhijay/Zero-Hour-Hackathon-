import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const db = globalForPrisma.db ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;

export { db };
export const prisma = db;
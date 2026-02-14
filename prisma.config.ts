// Prisma CLI (migrate, db pull, etc.) uses DIRECT_URL.
// App runtime uses DATABASE_URL with Neon adapter in lib/db.js.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct connection for migrations (no -pooler in host)
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});

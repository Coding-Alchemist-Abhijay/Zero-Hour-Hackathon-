# Neon database connection

## 1. Add these to your `.env` file

Use **two** URLs for Neon:

- **DATABASE_URL** – pooled connection (host has `-pooler`). Used by the app at runtime.
- **DIRECT_URL** – direct connection (host **without** `-pooler`). Used by Prisma CLI for `migrate`, `db pull`, etc.

Replace with your real password if needed. Example for your project:

```env
# Pooled (for Next.js app)
DATABASE_URL="postgresql://neondb_owner:npg_N7U5eGEOlQcq@ep-cold-truth-ai75eguh-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Direct (for prisma migrate) – no "-pooler", and add connect_timeout for Neon cold start
DIRECT_URL="postgresql://neondb_owner:npg_N7U5eGEOlQcq@ep-cold-truth-ai75eguh.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=15"
```

Make sure:
- `.env` is in the **project root** (same folder as `package.json`).
- No spaces around `=`, and the value is in double quotes.
- No extra spaces or line breaks inside the URL.

**If you get "Can't reach database server" (P1001):** Neon’s compute may be sleeping (cold start). Add `&connect_timeout=15` to **DIRECT_URL** and run `npx prisma migrate dev` again; the second run often works once the compute is awake.

## 2. Run migrations

```bash
npx prisma migrate dev --name init
```

## 3. Start the app

```bash
npm run dev
```

The app uses `@prisma/adapter-neon` with `DATABASE_URL`; Prisma CLI uses `DIRECT_URL` from `prisma.config.ts`.

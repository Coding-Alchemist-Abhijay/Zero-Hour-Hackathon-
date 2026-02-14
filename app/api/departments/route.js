import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/departments — list departments (public, for dropdowns/filters) */
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, city: true },
    });
    return NextResponse.json({ success: true, data: departments });
  } catch (err) {
    console.error("GET /api/departments", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

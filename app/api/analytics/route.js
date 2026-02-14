import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** GET /api/analytics — aggregate stats for transparency/dashboards (public) */
export async function GET(req) {
  try {
    const [
      totalIssues,
      byStatus,
      byCategory,
      byDepartment,
      recentCount,
    ] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.issue.groupBy({
        by: ["category"],
        _count: { id: true },
      }),
      prisma.issue.groupBy({
        by: ["departmentId"],
        _count: { id: true },
        where: { departmentId: { not: null } },
      }),
      prisma.issue.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const departmentIds = [...new Set(byDepartment.map((d) => d.departmentId).filter(Boolean))];
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true, slug: true },
    });
    const deptMap = Object.fromEntries(departments.map((d) => [d.id, d]));

    const byDepartmentNamed = byDepartment.map((d) => ({
      departmentId: d.departmentId,
      department: d.departmentId ? deptMap[d.departmentId] : null,
      count: d._count.id,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalIssues,
        last30Days: recentCount,
        byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.id])),
        byCategory: Object.fromEntries(byCategory.map((c) => [c.category, c._count.id])),
        byDepartment: byDepartmentNamed,
      },
    });
  } catch (err) {
    console.error("GET /api/analytics", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

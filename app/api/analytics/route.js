import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { Issue, Department } from "@/models";

export async function GET(req) {
  try {
    await connect();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [totalIssues, byStatus, byCategory, byDepartment, recentCount] = await Promise.all([
      Issue.countDocuments(),
      Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Issue.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      Issue.aggregate([
        { $match: { departmentId: { $ne: null } } },
        { $group: { _id: "$departmentId", count: { $sum: 1 } } },
      ]),
      Issue.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    const departmentIds = [...new Set(byDepartment.map((d) => d._id?.toString()).filter(Boolean))];
    const departments = await Department.find({ _id: { $in: departmentIds } }).select("name slug").lean();
    const deptMap = Object.fromEntries(departments.map((d) => [d._id.toString(), d]));

    const byDepartmentNamed = byDepartment.map((d) => ({
      departmentId: d._id?.toString(),
      department: d._id ? deptMap[d._id.toString()] ?? null : null,
      count: d.count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalIssues,
        last30Days: recentCount,
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
        byCategory: Object.fromEntries(byCategory.map((c) => [c._id, c.count])),
        byDepartment: byDepartmentNamed,
      },
    });
  } catch (err) {
    console.error("GET /api/analytics", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

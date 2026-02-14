"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

export default function OfficialAnalyticsPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    analyticsApi.get(accessToken).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    );
  }

  const byStatus = data?.byStatus ? Object.entries(data.byStatus).map(([name, value]) => ({ name, value })) : [];
  const byCategory = data?.byCategory ? Object.entries(data.byCategory).map(([name, value]) => ({ name, value })) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <p className="mt-1 text-muted-foreground">Charts and department performance.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold text-foreground">By status</h2>
          <div className="mt-4 h-64">
            {byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
            )}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-foreground">By category</h2>
          <div className="mt-4 h-64">
            {byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-foreground">Summary</h2>
        <p className="mt-2 text-muted-foreground">
          Total issues: {data?.totalIssues ?? 0} · Last 30 days: {data?.last30Days ?? 0}
        </p>
      </Card>
    </div>
  );
}

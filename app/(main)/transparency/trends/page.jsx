"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransparencyTrendsPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    analyticsApi.get(accessToken).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [accessToken]);

  const byCategory = data?.byCategory ? Object.entries(data.byCategory).map(([name, value]) => ({ name, value })) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Trends</h1>
      <p className="mt-1 text-muted-foreground">Patterns and category distribution.</p>

      {loading ? (
        <Skeleton className="mt-8 h-64 w-full" />
      ) : (
        <Card className="mt-8 p-6">
          <h2 className="font-semibold text-foreground">By category</h2>
          <div className="mt-4 h-64">
            {byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory}>
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
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResponseTimesPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    analyticsApi.get(accessToken).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Response times</h1>
      <p className="mt-1 text-muted-foreground">Performance and resolution speed.</p>

      {loading ? (
        <Skeleton className="mt-8 h-48 w-full" />
      ) : (
        <Card className="mt-8 p-6">
          <p className="text-muted-foreground">
            Total issues: {data?.totalIssues ?? 0}. Last 30 days: {data?.last30Days ?? 0}.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Connect to SLATracking and issue timeline data for detailed response time metrics.
          </p>
        </Card>
      )}
    </div>
  );
}

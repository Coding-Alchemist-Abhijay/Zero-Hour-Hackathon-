"use client";

import { useEffect, useState } from "react";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueMap } from "@/components/map/IssueMap";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_CENTER = [28.5355, 77.391];

export default function HeatmapPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    issuesApi.list({ limit: "100" }, accessToken).then((r) => setIssues(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Heatmap</h1>
      <p className="mt-1 text-muted-foreground">Problem hotspots — issue density by location.</p>

      {loading ? (
        <Skeleton className="mt-8 h-[400px] w-full rounded-lg" />
      ) : (
        <Card className="mt-8 overflow-hidden rounded-lg border-0 p-0">
          <IssueMap
            issues={issues}
            center={DEFAULT_CENTER}
            zoom={10}
            height={450}
          />
          <p className="border-t border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
            Each marker is an issue. Zoom in to see clusters. Data from last 100 issues.
          </p>
        </Card>
      )}
    </div>
  );
}

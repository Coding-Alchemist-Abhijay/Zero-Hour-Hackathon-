"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi, analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileWarning, Clock, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OfficialDashboardPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      issuesApi.list({ limit: "20" }, accessToken),
      analyticsApi.get(accessToken).catch(() => ({ data: null })),
    ]).then(([issuesRes, analyticsRes]) => {
      setIssues(issuesRes.data ?? []);
      setAnalytics(analyticsRes?.data ?? null);
    }).finally(() => setLoading(false));
  }, [accessToken]);

  const pending = issues.filter((i) => !["Resolved", "Verified"].includes(i.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Official dashboard</h1>
      <p className="mt-1 text-muted-foreground">Pending issues, SLA, and department stats.</p>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileWarning className="size-5" />
                <span>Pending issues</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{pending.length}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-5" />
                <span>Total issues</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{analytics?.totalIssues ?? issues.length}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BarChart3 className="size-5" />
                <span>Last 30 days</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{analytics?.last30Days ?? "—"}</p>
            </Card>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Issue queue</h2>
              <Button asChild size="sm">
                <Link href="/official/issues">View queue</Link>
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {pending.length} issues need attention. <Link href="/official/issues" className="text-primary underline">Open queue</Link>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

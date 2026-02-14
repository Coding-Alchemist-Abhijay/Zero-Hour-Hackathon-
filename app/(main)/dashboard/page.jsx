"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileWarning, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { issuesApi, analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const user = useAuthStoreImpl((s) => s.user);
  const [issues, setIssues] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([
      issuesApi.list({ limit: "5" }, accessToken),
      analyticsApi.get(accessToken).catch(() => ({ data: null })),
    ]).then(([issuesRes, analyticsRes]) => {
      setIssues(issuesRes.data ?? []);
      setAnalytics(analyticsRes?.data ?? null);
    }).finally(() => setLoading(false));
  }, [accessToken]);

  const myIssues = issues.filter((i) => i.createdById === user?.id);
  const pending = issues.filter((i) => !["Resolved", "Verified"].includes(i.status));
  const resolved = issues.filter((i) => ["Resolved", "Verified"].includes(i.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Overview of your activity and recent issues.</p>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileWarning className="size-5" />
                <span className="text-sm">Total issues</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{analytics?.totalIssues ?? issues.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-5" />
                <span className="text-sm">Pending</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{pending.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="size-5" />
                <span className="text-sm">Resolved</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{resolved.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="size-5" />
                <span className="text-sm">My reports</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{myIssues.length}</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
              <Button asChild size="sm">
                <Link href="/dashboard/issues">View all</Link>
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {issues.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  No issues yet. <Link href="/dashboard/issues/new" className="text-primary underline">Report one</Link>.
                </p>
              ) : (
                issues.slice(0, 5).map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

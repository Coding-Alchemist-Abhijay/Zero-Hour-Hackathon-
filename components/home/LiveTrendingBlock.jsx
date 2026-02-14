"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function LiveTrendingBlock() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStoreImpl((s) => s.accessToken);

  useEffect(() => {
    issuesApi.trending(6, accessToken)
      .then((r) => setIssues(r.data ?? []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
        No trending issues yet. Be the first to report one.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
        <Link
          key={issue.id}
          href={`/dashboard/issues/${issue.id}`}
          className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground line-clamp-2">{issue.title}</h3>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {issue.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{issue.category} · {issue.severity}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{issue._count?.votes ?? 0} votes</span>
            <span>{issue._count?.comments ?? 0} comments</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

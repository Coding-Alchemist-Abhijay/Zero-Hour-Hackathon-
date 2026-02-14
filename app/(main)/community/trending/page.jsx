"use client";

import { useEffect, useState } from "react";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrendingPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.trending(30, accessToken).then((r) => setIssues(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Trending issues</h1>
      <p className="mt-2 text-muted-foreground">Top issues by votes and recent activity.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {issues.length === 0 ? (
            <p className="text-muted-foreground">No trending issues.</p>
          ) : (
            issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} href={`/dashboard/issues/${issue.id}`} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

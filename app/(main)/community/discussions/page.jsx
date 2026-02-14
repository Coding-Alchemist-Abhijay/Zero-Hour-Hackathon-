"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscussionsPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.list({ limit: "30" }, accessToken).then((r) => {
      const data = r.data ?? [];
      setIssues(data.sort((a, b) => (b._count?.comments ?? 0) - (a._count?.comments ?? 0)));
    }).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Discussions</h1>
      <p className="mt-2 text-muted-foreground">Issues with the most comments.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {issues.length === 0 ? (
            <p className="text-muted-foreground">No discussions yet.</p>
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

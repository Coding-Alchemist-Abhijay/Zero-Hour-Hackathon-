"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.list({ limit: "30" }, accessToken).then((r) => setIssues(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Community</h1>
      <p className="mt-2 text-muted-foreground">Explore public issues reported by citizens.</p>

      <div className="mt-6 flex gap-4">
        <Link href="/community/trending" className="text-sm font-medium text-primary underline">Trending</Link>
        <Link href="/community/discussions" className="text-sm font-medium text-muted-foreground hover:text-foreground">Discussions</Link>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {issues.length === 0 ? (
            <p className="text-muted-foreground">No issues yet.</p>
          ) : (
            issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} href={`/community/issues/${issue.id}`} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

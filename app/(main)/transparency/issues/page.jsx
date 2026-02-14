"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransparencyIssuesPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    const params = status ? { status } : { limit: "50" };
    issuesApi.list(params, accessToken).then((r) => setIssues(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken, status]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Public issue explorer</h1>
      <p className="mt-1 text-muted-foreground">All reported issues for transparency.</p>

      <div className="mt-6 flex gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Assigned">Assigned</option>
          <option value="InProgress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Verified">Verified</option>
        </select>
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
            <p className="text-muted-foreground">No issues.</p>
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

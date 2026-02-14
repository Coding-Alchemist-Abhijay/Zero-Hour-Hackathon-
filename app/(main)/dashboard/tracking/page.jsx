"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackingPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const user = useAuthStoreImpl((s) => s.user);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    issuesApi.list({}, accessToken).then((r) => setIssues(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  const myIssues = issues.filter((i) => i.createdById === user?.id);
  const open = myIssues.filter((i) => !["Resolved", "Verified"].includes(i.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Tracking</h1>
      <p className="mt-1 text-muted-foreground">Track all issues. Your reports and estimated resolution.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground">
            You have {open.length} open report(s) and {myIssues.length - open.length} resolved.
          </p>
          <div className="mt-6 space-y-3">
            {myIssues.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border py-8 text-center text-muted-foreground">
                No issues yet. <Link href="/dashboard/issues/new" className="text-primary underline">Report one</Link>.
              </p>
            ) : (
              myIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}

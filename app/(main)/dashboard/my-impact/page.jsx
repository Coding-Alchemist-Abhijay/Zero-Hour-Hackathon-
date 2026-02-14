"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { CheckCircle, FileWarning, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyImpactPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    issuesApi.list({ createdBy: "me" }, accessToken).then((r) => setIssues(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  const resolved = issues.filter((i) => ["Resolved", "Verified"].includes(i.status));
  const open = issues.filter((i) => !["Resolved", "Verified"].includes(i.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">My impact</h1>
      <p className="mt-1 text-muted-foreground">Your reports and community contribution.</p>

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
                <span>Issues reported</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{issues.length}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="size-5" />
                <span>Resolved</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{resolved.length}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="size-5" />
                <span>Citizen score</span>
              </div>
              <p className="mt-2 text-3xl font-bold text-foreground">{resolved.length * 10 + open.length}</p>
            </Card>
          </div>

          <p className="mt-8 text-muted-foreground">
            Keep reporting and voting to improve your community. <Link href="/dashboard/issues/new" className="text-primary underline">Report an issue</Link>.
          </p>
        </>
      )}
    </div>
  );
}

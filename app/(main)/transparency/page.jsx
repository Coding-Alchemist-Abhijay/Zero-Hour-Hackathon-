"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, FileWarning, BarChart3, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransparencyOverviewPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    analyticsApi.get(accessToken).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [accessToken]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Transparency dashboard</h1>
      <p className="mt-1 text-muted-foreground">Open governance and public accountability.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <Shield className="size-5 text-muted-foreground" />
          <p className="mt-2 text-2xl font-bold text-foreground">{data?.totalIssues ?? 0}</p>
          <p className="text-sm text-muted-foreground">Total issues</p>
        </Card>
        <Card className="p-6">
          <FileWarning className="size-5 text-muted-foreground" />
          <p className="mt-2 text-2xl font-bold text-foreground">—</p>
          <p className="text-sm text-muted-foreground">Open issues</p>
        </Card>
        <Card className="p-6">
          <BarChart3 className="size-5 text-muted-foreground" />
          <p className="mt-2 text-2xl font-bold text-foreground">{data?.last30Days ?? 0}</p>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
        </Card>
        <Card className="p-6">
          <Clock className="size-5 text-muted-foreground" />
          <p className="mt-2 text-2xl font-bold text-foreground">—</p>
          <p className="text-sm text-muted-foreground">Avg response time</p>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/transparency/issues">Issue explorer</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/transparency/departments">Departments</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/transparency/response-times">Response times</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/transparency/trends">Trends</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/transparency/data">Open data</Link>
        </Button>
      </div>
    </div>
  );
}

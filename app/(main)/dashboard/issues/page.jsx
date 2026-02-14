"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { issuesApi, departmentsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ISSUE_CATEGORIES, ISSUE_SEVERITIES } from "@/types";

export default function IssuesListPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!accessToken) return;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    issuesApi.list(Object.fromEntries(params), accessToken).then((r) => {
      setIssues(r.data ?? []);
    }).finally(() => setLoading(false));
    departmentsApi.list(accessToken).then((r) => setDepartments(r.data ?? [])).catch(() => {});
  }, [accessToken, status, category, search]);

  const filtered = issues.filter((i) => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-foreground">Issues</h1>
        <Button asChild>
          <Link href="/dashboard/issues/new">Report issue</Link>
        </Button>
      </div>
      <p className="mt-1 text-muted-foreground">Browse and filter civic issues.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {ISSUE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
              No issues match your filters.
            </p>
          ) : (
            filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/Card";
import { issuesApi, timelineApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueTimeline } from "@/components/issues/IssueTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const STATUSES = ["Submitted", "Acknowledged", "Assigned", "InProgress", "Resolved", "Verified"];

export default function OfficialIssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!id || !accessToken) return;
    Promise.all([
      issuesApi.get(id, accessToken),
      timelineApi.list(id, accessToken),
    ]).then(([issueRes, timelineRes]) => {
      setIssue(issueRes.data);
      setNewStatus(issueRes.data?.status ?? "");
      setTimeline(timelineRes.data ?? []);
    }).catch(() => {
      toast.error("Failed to load issue.");
      router.push("/official/issues");
    }).finally(() => setLoading(false));
  }, [id, accessToken, router]);

  async function handleUpdate(e) {
    e.preventDefault();
    if (!accessToken || !id) return;
    setUpdating(true);
    try {
      const res = await issuesApi.update(id, { status: newStatus, note: note || undefined }, accessToken);
      setIssue(res.data);
      const timelineRes = await timelineApi.list(id, accessToken);
      setTimeline(timelineRes.data ?? []);
      setNote("");
      toast.success("Issue updated.");
    } catch (err) {
      toast.error(err.message ?? "Update failed.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading || !issue) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/official/issues">← Back to queue</Link>
      </Button>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{issue.status}</Badge>
            <Badge variant="secondary">{issue.category}</Badge>
            <Badge variant="outline">{issue.severity}</Badge>
          </div>
        </div>
      </div>

      <p className="mt-6 text-muted-foreground">{issue.description}</p>

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-foreground">Update status</h2>
        <form onSubmit={handleUpdate} className="mt-4 flex flex-wrap gap-4">
          <div>
            <Label>Status</Label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="mt-1.5"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={updating}>
              {updating ? "Updating…" : "Update"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-foreground">Timeline</h2>
        <div className="mt-4">
          <IssueTimeline entries={timeline} />
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { issuesApi, timelineApi, commentsApi, votesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/Card";
import { IssueTimeline } from "@/components/issues/IssueTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function CommunityIssueDetailPage() {
  const params = useParams();
  const id = params.id;
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      issuesApi.get(id, accessToken),
      timelineApi.list(id, accessToken),
      commentsApi.list(id, accessToken),
    ]).then(([issueRes, timelineRes, commentsRes]) => {
      setIssue(issueRes.data);
      setTimeline(timelineRes.data ?? []);
      setComments(commentsRes.data ?? []);
    }).catch(() => toast.error("Failed to load issue")).finally(() => setLoading(false));
  }, [id, accessToken]);

  async function handleVote() {
    if (!accessToken) {
      toast.error("Sign in to vote.");
      return;
    }
    try {
      await votesApi.toggle(id, accessToken);
      const res = await issuesApi.get(id, accessToken);
      setIssue(res.data);
      toast.success("Vote updated.");
    } catch (e) {
      toast.error(e.message ?? "Vote failed.");
    }
  }

  if (loading || !issue) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/community">← Community</Link>
      </Button>

      <div className="mt-6">
        <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{issue.status}</Badge>
          <Badge variant="secondary">{issue.category}</Badge>
          <Badge variant="outline">{issue.severity}</Badge>
          <span className="text-sm text-muted-foreground">
            {issue._count?.votes ?? 0} votes · {comments.length} comments
          </span>
        </div>
      </div>

      <p className="mt-6 text-muted-foreground">{issue.description}</p>

      {accessToken && (
        <div className="mt-6">
          <Button variant="outline" size="sm" onClick={handleVote}>
            {issue.userVoted ? "Remove vote" : "Vote"}
          </Button>
          <Button variant="outline" size="sm" asChild className="ml-2">
            <Link href={`/dashboard/issues/${id}`}>Open in dashboard</Link>
          </Button>
        </div>
      )}

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-foreground">Timeline</h2>
        <div className="mt-4">
          <IssueTimeline entries={timeline} />
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold text-foreground">Comments</h2>
        <div className="mt-4 space-y-2">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded border border-border p-3 text-sm">
                <span className="font-medium text-foreground">{c.author?.name ?? "User"}</span>
                <p className="mt-1 text-muted-foreground">{c.body}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

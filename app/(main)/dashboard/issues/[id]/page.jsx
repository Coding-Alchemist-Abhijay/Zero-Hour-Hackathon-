"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/Card";
import { issuesApi, commentsApi, votesApi, timelineApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueTimeline } from "@/components/issues/IssueTimeline";
import { IssueMap } from "@/components/map/IssueMap";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ThumbsUp, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function IssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const user = useAuthStoreImpl((s) => s.user);
  const [issue, setIssue] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!id || !accessToken) return;
    Promise.all([
      issuesApi.get(id, accessToken),
      timelineApi.list(id, accessToken),
      commentsApi.list(id, accessToken),
    ]).then(([issueRes, timelineRes, commentsRes]) => {
      setIssue(issueRes.data);
      setTimeline(timelineRes.data ?? []);
      setComments(commentsRes.data ?? []);
    }).catch(() => {
      toast.error("Failed to load issue.");
      router.push("/dashboard/issues");
    }).finally(() => setLoading(false));
  }, [id, accessToken, router]);

  async function handleVote() {
    if (!accessToken) {
      toast.error("Sign in to vote.");
      return;
    }
    try {
      const res = await votesApi.toggle(id, accessToken);
      setVoted(res.data?.voted ?? false);
      setIssue((prev) => prev ? { ...prev, _count: { ...prev._count, votes: (prev._count?.votes ?? 0) + (res.data?.voted ? 1 : -1) } } : null);
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentBody.trim() || !accessToken) return;
    try {
      await commentsApi.create({ issueId: id, body: commentBody.trim() }, accessToken);
      const res = await commentsApi.list(id, accessToken);
      setComments(res.data ?? []);
      setCommentBody("");
      toast.success("Comment added.");
    } catch (e) {
      toast.error(e.message);
    }
  }

  if (loading || !issue) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    );
  }

  return (
    <div>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/issues">← Back to issues</Link>
      </Button>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{issue.status}</Badge>
            <Badge variant="secondary">{issue.category}</Badge>
            <Badge variant="outline">{issue.severity}</Badge>
            {issue.department?.name && (
              <span className="text-sm text-muted-foreground">Department: {issue.department.name}</span>
            )}
          </div>
          {issue.address && (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" /> {issue.address}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleVote}>
          <ThumbsUp className="size-4 mr-1" /> {issue._count?.votes ?? 0} votes
        </Button>
      </div>

      <p className="mt-6 text-muted-foreground">{issue.description}</p>

      {issue.latitude != null && issue.longitude != null && (
        <Card className="mt-8 overflow-hidden p-0">
          <div className="px-6 pt-6">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="size-4" /> Location
            </h2>
          </div>
          <div className="p-4 pt-2">
            <IssueMap
              issues={[issue]}
              center={[Number(issue.latitude), Number(issue.longitude)]}
              zoom={15}
              height={280}
            />
          </div>
        </Card>
      )}

      {issue.images?.length > 0 && (
        <Card className="mt-8 p-6">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="size-4" /> Photos
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {issue.images.map((img) => (
              <a
                key={img.id ?? img.url}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border-2 border-border bg-muted/30 transition hover:border-primary/50"
              >
                <img
                  src={img.url}
                  alt="Issue photo"
                  className="h-48 w-full object-cover"
                />
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-foreground">Timeline</h2>
        <div className="mt-4">
          <IssueTimeline entries={timeline} />
        </div>
      </Card>

      <Card className="mt-8 p-6">
        <h2 className="font-semibold text-foreground">Comments ({comments.length})</h2>
        {user && (
          <form onSubmit={handleComment} className="mt-4 flex gap-2">
            <input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button type="submit" size="sm">Post</Button>
          </form>
        )}
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md bg-muted/50 p-3">
              <p className="text-sm font-medium">{c.author?.name ?? "Anonymous"}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{c.body}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunityPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.trending(20, accessToken).then((r) => setTrending(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Community</h1>
      <p className="mt-1 text-muted-foreground">Trending and most urgent issues.</p>

      <h2 className="mt-8 text-lg font-semibold">Trending</h2>
      {loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {trending.length === 0 ? (
            <p className="text-muted-foreground">No trending issues.</p>
          ) : (
            trending.map((issue) => <IssueCard key={issue.id} issue={issue} />)
          )}
        </div>
      )}
    </div>
  );
}

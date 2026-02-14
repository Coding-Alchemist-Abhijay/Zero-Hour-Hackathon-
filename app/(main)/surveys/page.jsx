"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { surveysApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurveysListPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    surveysApi.list(accessToken).then((r) => setSurveys(r.data ?? [])).catch(() => setSurveys([])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground">Surveys</h1>
      <p className="mt-2 text-muted-foreground">Share your feedback on civic issues.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {surveys.length === 0 ? (
            <p className="text-muted-foreground">No surveys available.</p>
          ) : (
            surveys.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description || "No description"}</p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/surveys/${s.id}`}>Respond</Link>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

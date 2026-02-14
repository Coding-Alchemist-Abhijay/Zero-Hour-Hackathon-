"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { surveysApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";

export default function OfficialSurveysPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    surveysApi.list(accessToken).then((r) => setSurveys(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Surveys</h1>
      <p className="mt-1 text-muted-foreground">Create and manage public feedback surveys.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {surveys.length === 0 ? (
            <p className="text-muted-foreground">No surveys yet.</p>
          ) : (
            surveys.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s._count?.responses ?? 0} responses</p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/surveys/${s.id}/results`}>Results</Link>
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

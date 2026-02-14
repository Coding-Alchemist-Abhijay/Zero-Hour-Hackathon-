"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { surveysApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SurveyResultsPage() {
  const params = useParams();
  const id = params.id;
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [survey, setSurvey] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      surveysApi.get(id, accessToken),
      surveysApi.results(id, accessToken),
    ]).then(([surveyRes, resultsRes]) => {
      setSurvey(surveyRes.data);
      setResults(resultsRes.data);
    }).catch(() => setResults(null)).finally(() => setLoading(false));
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (!survey || !results) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <p className="text-muted-foreground">Survey or results not found.</p>
        <Button asChild className="mt-4">
          <Link href="/surveys">Back to surveys</Link>
        </Button>
      </div>
    );
  }

  const byQuestion = results.byQuestion ?? {};

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/surveys">← Surveys</Link>
      </Button>

      <h1 className="mt-6 text-2xl font-bold text-foreground">{survey.title} — Results</h1>
      <p className="mt-2 text-muted-foreground">Total responses: {results.totalResponses ?? 0}</p>

      <div className="mt-8 space-y-6">
        {(survey.questions ?? []).map((q) => {
          const block = byQuestion[q.id];
          const options = block?.options ?? [];
          return (
            <Card key={q.id} className="p-6">
              <h3 className="font-medium text-foreground">{block?.text ?? q.text}</h3>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {options.length === 0 ? (
                  <li>No answers yet.</li>
                ) : (
                  options.map((o, i) => (
                    <li key={i}>{o.option} — {o.count}</li>
                  ))
                )}
                {block?.total != null && <li className="mt-2 font-medium">Total: {block.total}</li>}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { surveysApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SurveyRespondPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    surveysApi.get(id, accessToken).then((r) => setSurvey(r.data)).catch(() => toast.error("Survey not found")).finally(() => setLoading(false));
  }, [id, accessToken]);

  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Sign in to respond.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, value]) => ({ questionId, value: String(value) }));
      await surveysApi.respond(id, payload, accessToken);
      toast.success("Response recorded.");
      router.push("/surveys");
    } catch (err) {
      toast.error(err.message ?? "Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !survey) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  const questions = survey.questions ?? [];

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/surveys">← Surveys</Link>
      </Button>

      <h1 className="mt-6 text-2xl font-bold text-foreground">{survey.title}</h1>
      {survey.description && <p className="mt-2 text-muted-foreground">{survey.description}</p>}

      <Card className="mt-8 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q) => (
            <div key={q.id}>
              <Label>{q.text}</Label>
              <Input
                className="mt-2"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Your answer"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/surveys">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

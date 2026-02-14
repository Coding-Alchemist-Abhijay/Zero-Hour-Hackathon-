"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/Card";
import { issuesApi, departmentsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { ISSUE_CATEGORIES, ISSUE_SEVERITIES } from "@/types";
import { toast } from "sonner";

export default function NewIssuePage() {
  const router = useRouter();
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Road");
  const [severity, setSeverity] = useState("Medium");
  const [latitude, setLatitude] = useState(28.5355);
  const [longitude, setLongitude] = useState(77.391);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Please sign in to report an issue.");
      return;
    }
    setLoading(true);
    try {
      const res = await issuesApi.create(
        {
          title,
          description,
          category,
          severity,
          latitude,
          longitude,
          address: address || undefined,
          city: city || undefined,
        },
        accessToken
      );
      toast.success("Issue reported successfully.");
      router.push(`/dashboard/issues/${res.data.id}`);
    } catch (err) {
      toast.error(err.message ?? "Failed to submit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/issues">← Back</Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Report an issue</h1>
      </div>
      <p className="mt-1 text-muted-foreground">Submit a civic issue with location. Live preview below.</p>

      <Card className="mt-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short description of the issue"
              minLength={5}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              minLength={20}
              required
              rows={4}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Severity</Label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {ISSUE_SEVERITIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label>Address (optional)</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, area"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>City (optional)</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City name"
              className="mt-1.5"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Map picker and GPS auto-detect can be added here. Using manual lat/lng for now.
          </p>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit issue"}
          </Button>
        </form>
      </Card>

      <div className="mt-8 max-w-2xl rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        Live preview: {title || "Your issue title"} · {category} · {severity}
      </div>
    </div>
  );
}

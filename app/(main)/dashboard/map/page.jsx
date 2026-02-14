"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { Card } from "@/components/ui/Card";
import { MapPin } from "lucide-react";

export default function MapPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [lat, setLat] = useState(28.5355);
  const [lng, setLng] = useState(77.391);
  const [radius, setRadius] = useState(5);

  useEffect(() => {
    issuesApi.nearby(lat, lng, radius, accessToken).then((r) => setIssues(r.data ?? [])).catch(() => setIssues([]));
  }, [lat, lng, radius, accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Map</h1>
      <p className="mt-1 text-muted-foreground">Nearby issues. Interactive map and clusters can be added with Mapbox/Google Maps.</p>

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Lat</label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            className="w-24 rounded border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Lng</label>
          <input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(Number(e.target.value))}
            className="w-24 rounded border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Radius (km)</label>
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          >
            <option value={1}>1</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-16 text-muted-foreground">
        <div className="text-center">
          <MapPin className="mx-auto size-12" />
          <p className="mt-2">Map placeholder</p>
          <p className="text-sm">Integrate Mapbox or Google Maps for clusters and heatmap.</p>
          <Link href="/dashboard/issues/new" className="mt-4 inline-block text-primary underline">Report issue at this location</Link>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Nearby issues ({issues.length})</h2>
      <div className="mt-4 space-y-3">
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground">No issues in this radius.</p>
        ) : (
          issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
}

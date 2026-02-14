"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { issuesApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { IssueCard } from "@/components/issues/IssueCard";
import { IssueMap } from "@/components/map/IssueMap";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Locate } from "lucide-react";

const DEFAULT_LAT = 28.5355;
const DEFAULT_LNG = 77.391;

export default function MapPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [issues, setIssues] = useState([]);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    issuesApi.nearby(lat, lng, radius, accessToken).then((r) => setIssues(r.data ?? [])).catch(() => setIssues([])).finally(() => setLoading(false));
  }, [lat, lng, radius, accessToken]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      () => {},
      { enableHighAccuracy: true }
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Map</h1>
      <p className="mt-1 text-muted-foreground">Nearby issues. Click a marker to open the issue.</p>

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
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
          <Locate className="size-4" />
          Use my location
        </Button>
      </Card>

      <div className="mt-6">
        <IssueMap
          issues={issues}
          center={[lat, lng]}
          zoom={radius <= 1 ? 14 : radius <= 5 ? 12 : 10}
          height={400}
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nearby issues ({issues.length})</h2>
        <Button asChild size="sm">
          <Link href="/dashboard/issues/new">
            <MapPin className="size-4" />
            Report issue
          </Link>
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {issues.length === 0 && !loading ? (
          <p className="text-sm text-muted-foreground">No issues in this radius.</p>
        ) : (
          issues.slice(0, 10).map((issue) => <IssueCard key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
}

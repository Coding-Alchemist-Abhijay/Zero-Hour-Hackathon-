"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const IssueMapInner = dynamic(
  () => import("./IssueMapInner").then((m) => m.IssueMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
        Loading map…
      </div>
    ),
  }
);

export function IssueMap({
  issues = [],
  center = [28.5355, 77.391],
  zoom = 12,
  height = 400,
  onLocationSelect,
  showHeatLayer = false,
}) {
  const bounds = useMemo(() => {
    if (issues.length === 0) return null;
    const lats = issues.map((i) => i.latitude);
    const lngs = issues.map((i) => i.longitude);
    return {
      south: Math.min(...lats),
      north: Math.max(...lats),
      west: Math.min(...lngs),
      east: Math.max(...lngs),
    };
  }, [issues]);

  return (
    <div style={{ height: `${height}px` }} className="w-full overflow-hidden rounded-lg border border-border">
      <IssueMapInner
        issues={issues}
        center={center}
        zoom={zoom}
        bounds={bounds}
        onLocationSelect={onLocationSelect}
        showHeatLayer={showHeatLayer}
      />
    </div>
  );
}

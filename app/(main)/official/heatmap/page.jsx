"use client";

import { Card } from "@/components/ui/Card";
import { MapPin } from "lucide-react";

export default function HeatmapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Heatmap</h1>
      <p className="mt-1 text-muted-foreground">Problem hotspots. Integrate Mapbox/Google for geo visualization.</p>
      <Card className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center text-muted-foreground">
        <MapPin className="size-16" />
        <p className="mt-4 font-medium">Heatmap placeholder</p>
        <p className="text-sm">Use /api/issues/nearby and /api/analytics with a map library for density layers.</p>
      </Card>
    </div>
  );
}

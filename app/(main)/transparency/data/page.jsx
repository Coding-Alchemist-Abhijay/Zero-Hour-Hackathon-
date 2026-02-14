"use client";

import { Card } from "@/components/ui/Card";
import { Download } from "lucide-react";

export default function OpenDataPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Open data</h1>
      <p className="mt-1 text-muted-foreground">Export and data filters for journalists.</p>

      <Card className="mt-8 p-6">
        <p className="text-muted-foreground">
          Open data export and pattern detection can be added here. Use GET /api/issues and GET /api/analytics
          with query params for filtered exports (e.g. CSV/JSON download).
        </p>
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="size-4" />
          <span>Export placeholder — wire to API with format and filters.</span>
        </div>
      </Card>
    </div>
  );
}

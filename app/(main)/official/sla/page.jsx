"use client";

import { Card } from "@/components/ui/Card";
import { Clock } from "lucide-react";

export default function SLAPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">SLA tracking</h1>
      <p className="mt-1 text-muted-foreground">Delay tracking and response time targets.</p>
      <Card className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24 text-center text-muted-foreground">
        <Clock className="size-16" />
        <p className="mt-4 font-medium">SLA dashboard placeholder</p>
        <p className="text-sm">Connect to SLATracking and issue timelines for breach alerts.</p>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/Card";
import { MapPin, MessageSquare, ThumbsUp } from "lucide-react";

export function IssueCard({ issue, href }) {
  const link = href ?? `/dashboard/issues/${issue.id}`;
  return (
    <Link href={link} className="block">
      <Card className="p-4 transition-colors hover:bg-accent/30">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground line-clamp-2">{issue.title}</h3>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {issue.status}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {issue.category} · {issue.severity}
          {issue.address && (
            <span className="ml-1 inline-flex items-center gap-0.5">
              <MapPin className="size-3" /> {issue.address}
            </span>
          )}
        </p>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="size-3.5" /> {issue._count?.votes ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" /> {issue._count?.comments ?? 0}
          </span>
          {issue.createdBy?.name && (
            <span>By {issue.createdBy.name}</span>
          )}
        </div>
      </Card>
    </Link>
  );
}

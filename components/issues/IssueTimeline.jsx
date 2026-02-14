"use client";

import { formatDistanceToNow } from "date-fns";

export function IssueTimeline({ entries }) {
  if (!entries?.length) {
    return <p className="text-sm text-muted-foreground">No timeline entries yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {entries.map((entry, i) => (
        <li key={entry.id} className="relative flex gap-4 pl-6 before:absolute before:left-[7px] before:top-4 before:bottom-0 before:w-px before:bg-border">
          <span className="absolute left-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {i + 1}
          </span>
          <div>
            <p className="font-medium text-foreground">{entry.status}</p>
            {entry.note && <p className="mt-0.5 text-sm text-muted-foreground">{entry.note}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              {entry.updatedBy?.name ?? "System"} · {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

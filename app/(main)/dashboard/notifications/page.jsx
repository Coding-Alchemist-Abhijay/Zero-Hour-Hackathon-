"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notificationsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    notificationsApi.list({}, accessToken).then((r) => setNotifications(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
      <p className="mt-1 text-muted-foreground">Status changes, comments, and surveys.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {notifications.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} className={`p-4 ${!n.read ? "border-primary/50 bg-primary/5" : ""}`}>
                <Link href={n.link || "#"} className="block">
                  <p className="font-medium text-foreground">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                </Link>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

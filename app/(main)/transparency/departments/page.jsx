"use client";

import { useEffect, useState } from "react";
import { departmentsApi, analyticsApi } from "@/lib/api";
import { useAuthStoreImpl } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransparencyDepartmentsPage() {
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    departmentsApi.list(accessToken).then((r) => setDepartments(r.data ?? [])).finally(() => setLoading(false));
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Departments leaderboard</h1>
      <p className="mt-1 text-muted-foreground">Department performance and issue counts.</p>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {departments.length === 0 ? (
            <p className="text-muted-foreground">No departments.</p>
          ) : (
            departments.map((d, i) => (
              <Card key={d.id} className="flex items-center justify-between p-4">
                <span className="font-medium text-foreground">#{i + 1} {d.name}</span>
                <span className="text-sm text-muted-foreground">{d.description || "—"}</span>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

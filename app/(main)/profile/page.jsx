"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStoreImpl } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isHydrated, fetchMe } = useAuthStoreImpl();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchMe();
  }, [isHydrated, user, router, fetchMe]);

  if (!isHydrated || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  const dashboardHref =
    (user.role === "OFFICIAL" || user.role === "ADMIN") ? "/official"
    : user.role === "JOURNALIST" ? "/transparency"
    : "/dashboard";

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Profile</h1>

      <Card className="mt-6 p-6">
        <p className="text-sm text-muted-foreground">Name</p>
        <p className="font-medium text-foreground">{user.name}</p>
        <p className="mt-4 text-sm text-muted-foreground">Email</p>
        <p className="font-medium text-foreground">{user.email}</p>
        <p className="mt-4 text-sm text-muted-foreground">Role</p>
        <p className="font-medium text-foreground">{user.role}</p>
        <div className="mt-6">
          <Button asChild>
            <Link href={dashboardHref}>Go to dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

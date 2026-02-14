"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStoreImpl, ROLES } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStoreImpl((s) => s.user);
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const logout = useAuthStoreImpl((s) => s.logout);
  const isHydrated = useAuthStoreImpl((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (!accessToken && !user) {
      router.replace("/login");
    }
  }, [isHydrated, accessToken, user, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-[var(--foreground)] no-underline">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold">
              C
            </span>
            <span className="font-semibold">CivicBridge</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted)]">
              {user.name} · {ROLES[user.role] ?? user.role}
            </span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); router.replace("/login"); }}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">
          Dashboard
        </h1>
        <p className="text-[var(--muted)] mb-8">
          You’re signed in. Issue reporting and dashboards will go here.
        </p>
        <Card>
          <p className="text-[var(--muted)]">
            Welcome, {user.name}. Your role is <strong>{ROLES[user.role] ?? user.role}</strong>.
          </p>
        </Card>
      </main>
    </div>
  );
}

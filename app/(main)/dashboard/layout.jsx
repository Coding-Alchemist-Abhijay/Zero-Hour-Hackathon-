"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { useAuthStoreImpl } from "@/store/authStore";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, accessToken, isHydrated } = useAuthStoreImpl();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user && !accessToken) {
      router.replace("/login");
      return;
    }
    if (user?.role === "OFFICIAL" || user?.role === "ADMIN") {
      router.replace("/official");
      return;
    }
    if (user?.role === "JOURNALIST") {
      router.replace("/transparency");
      return;
    }
  }, [isHydrated, user, accessToken, router]);

  if (!isHydrated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh]">
      <DashboardSidebar role={user.role} />
      <div className="flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useAuthStoreImpl } from "@/store/authStore";

/**
 * Rehydrates persisted auth and fetches current user when token exists.
 */
export function AuthProvider({ children }) {
  const fetchMe = useAuthStoreImpl((s) => s.fetchMe);
  const accessToken = useAuthStoreImpl((s) => s.accessToken);
  const isHydrated = useAuthStoreImpl((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;
    if (accessToken) fetchMe();
  }, [isHydrated, accessToken, fetchMe]);

  return children;
}

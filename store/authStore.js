/**
 * Zustand store for auth state.
 * Persists token in localStorage; syncs user on mount via /api/auth/me.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = "/api/auth";

export const ROLES = {
  RESIDENT: "Resident",
  OFFICIAL: "Government Official",
  JOURNALIST: "Journalist / NGO",
  ADMIN: "Admin",
};

export function useAuthStore() {
  return useAuthStoreImpl.getState();
}

export const useAuthStoreImpl = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message ?? "Login failed");
          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.message };
        }
      },

      register: async (payload) => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (!res.ok) {
            set({ isLoading: false });
            return {
              success: false,
              message: data.message ?? "Registration failed",
              errors: data.errors,
            };
          }
          set({
            user: data.user,
            accessToken: data.accessToken,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.message ?? "Registration failed" };
        }
      },

      logout: () => set({ user: null, accessToken: null }),

      fetchMe: async () => {
        const token = get().accessToken;
        if (!token) return;
        try {
          const res = await fetch(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) set({ user: data.user });
          else set({ user: null, accessToken: null });
        } catch {
          set({ user: null, accessToken: null });
        }
      },
    }),
    {
      name: "civicbridge-auth",
      partialize: (s) => ({ accessToken: s.accessToken, user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.();
      },
    }
  )
);

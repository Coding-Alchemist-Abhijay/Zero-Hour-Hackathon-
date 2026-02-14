"use client";

import { SiteHeaderAuth } from "@/components/site-header-auth";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeaderAuth />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-50"
          style={{ background: "var(--gradient-mesh)" }}
          aria-hidden
        />
        <main className="w-full max-w-md">{children}</main>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Transparent communication between citizens and government.
        </p>
      </div>
    </div>
  );
}

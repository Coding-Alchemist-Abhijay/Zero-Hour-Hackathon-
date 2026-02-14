"use client";

import Link from "next/link";

/**
 * Auth layout: centered card, logo, and link to other auth page.
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      {/* Decorative background */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[var(--accent)]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[var(--primary)]/[0.02]" />
      </div>

      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-[var(--foreground)] no-underline transition opacity hover:opacity-90"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary)] text-white font-bold text-lg">
          C
        </span>
        <span className="text-xl font-semibold tracking-tight">CivicBridge</span>
      </Link>

      <main className="w-full max-w-md">{children}</main>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Transparent communication between citizens and government.
      </p>
    </div>
  );
}

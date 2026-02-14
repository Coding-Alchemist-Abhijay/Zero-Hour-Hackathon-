"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/Button";

/** Compact header for auth pages (login/register) – logo, theme toggle, back link */
export function SiteHeaderAuth() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-md items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground no-underline"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            C
          </span>
          <span className="font-semibold text-sm">CivicBridge</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

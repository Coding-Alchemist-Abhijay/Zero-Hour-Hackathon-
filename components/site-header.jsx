"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/Button";

export function SiteHeader({ showAuth = true }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-foreground no-underline transition-opacity hover:opacity-90"
        >
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            C
          </span>
          <span className="font-semibold text-lg tracking-tight">
            CivicBridge
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showAuth && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

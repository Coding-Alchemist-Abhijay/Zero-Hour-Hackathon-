"use client";

import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/transparency", label: "Transparency" },
  { href: "/community", label: "Community" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 text-foreground no-underline">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">C</span>
              <span className="font-semibold">CivicBridge</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Transparent civic communication between citizens and government.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-4 sm:flex sm:gap-8">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CivicBridge. Built for transparent governance.
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Bell, User, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStoreImpl, ROLES } from "@/store/authStore";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/features", label: "Features" },
  { href: "/transparency", label: "Transparency" },
  { href: "/community", label: "Community" },
  { href: "/surveys", label: "Surveys" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, accessToken, logout, isHydrated } = useAuthStoreImpl();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    notificationsApi.list({ limit: "10" }, accessToken)
      .then((r) => setNotifications(r.data ?? []))
      .catch(() => {});
  }, [accessToken]);

  const dashboardHref = user?.role === "OFFICIAL" || user?.role === "ADMIN" ? "/official" : user?.role === "JOURNALIST" ? "/transparency" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-foreground no-underline">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            C
          </span>
          <span className="font-semibold text-lg tracking-tight hidden sm:inline">CivicBridge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isHydrated && (
            <>
              {user ? (
                <>
                  <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="size-5" />
                        {notifications.some((n) => !n.read) && (
                          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-destructive" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="px-2 py-1.5 font-medium text-sm">Notifications</div>
                      {notifications.length === 0 ? (
                        <p className="px-2 py-4 text-sm text-muted-foreground">No notifications</p>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <DropdownMenuItem key={n.id} asChild>
                            <Link
                              href={n.link || "/dashboard/notifications"}
                              className="flex flex-col gap-0.5 px-2 py-2"
                              onClick={() => setNotifOpen(false)}
                            >
                              <span className="font-medium text-sm">{n.title}</span>
                              {n.body && <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>}
                            </Link>
                          </DropdownMenuItem>
                        ))
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/notifications" onClick={() => setNotifOpen(false)}>
                          View all
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <User className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                      <div className="px-2 text-xs text-muted-foreground">{ROLES[user.role] ?? user.role}</div>
                      <DropdownMenuItem asChild>
                        <Link href={dashboardHref} className="flex items-center gap-2">
                          <LayoutDashboard className="size-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center gap-2">
                          <User className="size-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          logout();
                          window.location.href = "/";
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <LogOut className="size-4 mr-2" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm">Sign in</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Get started</Button>
                  </Link>
                </>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link href="/register" className="rounded-md px-3 py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Get started</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

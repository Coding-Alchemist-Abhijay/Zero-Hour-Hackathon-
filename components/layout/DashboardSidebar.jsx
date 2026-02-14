"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileWarning,
  MapPin,
  ListTodo,
  Users,
  Bell,
  TrendingUp,
  Shield,
  BarChart3,
  Layers,
  Clock,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const residentLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/issues", label: "Issues", icon: FileWarning },
  { href: "/dashboard/issues/new", label: "Report issue", icon: FileWarning },
  { href: "/dashboard/map", label: "Map", icon: MapPin },
  { href: "/dashboard/tracking", label: "Tracking", icon: ListTodo },
  { href: "/dashboard/community", label: "Community", icon: Users },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/my-impact", label: "My impact", icon: TrendingUp },
];

const officialLinks = [
  { href: "/official", label: "Overview", icon: LayoutDashboard },
  { href: "/official/issues", label: "Issue queue", icon: FileWarning },
  { href: "/official/heatmap", label: "Heatmap", icon: Layers },
  { href: "/official/sla", label: "SLA", icon: Clock },
  { href: "/official/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/official/surveys", label: "Surveys", icon: ClipboardList },
];

const transparencyLinks = [
  { href: "/transparency", label: "Overview", icon: Shield },
  { href: "/transparency/issues", label: "Issues", icon: FileWarning },
  { href: "/transparency/departments", label: "Departments", icon: BarChart3 },
  { href: "/transparency/response-times", label: "Response times", icon: Clock },
  { href: "/transparency/trends", label: "Trends", icon: TrendingUp },
  { href: "/transparency/data", label: "Open data", icon: ClipboardList },
];

export function DashboardSidebar({ role }) {
  const pathname = usePathname();
  const links =
    role === "OFFICIAL" ? officialLinks
    : role === "ADMIN" ? [...officialLinks, { href: "/transparency", label: "Transparency", icon: Shield }]
    : role === "JOURNALIST" ? transparencyLinks
    : residentLinks;

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-muted/20 md:flex">
      <nav className="flex flex-col gap-1 p-3">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

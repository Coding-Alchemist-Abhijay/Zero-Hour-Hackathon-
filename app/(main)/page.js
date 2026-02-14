import Link from "next/link";
import {
  MapPin,
  FileCheck,
  Users,
  Newspaper,
  Shield,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  MapPinned,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveTrendingBlock } from "@/components/home/LiveTrendingBlock";

export const metadata = {
  title: "CivicBridge – Transparent Civic Communication",
  description: "Connect citizens and government with transparent issue tracking.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative border-b border-border/80 bg-gradient-to-b from-muted/30 to-background px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Transparent governance · Accountability · Public trust
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Where citizens and government meet
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            CivicBridge is a transparent, two-way platform for reporting civic
            issues, tracking resolution, and holding officials accountable.
            Every step is visible to the public.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Report an issue</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/transparency">Explore transparency</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why CivicBridge */}
      <section className="border-b border-border/80 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Why CivicBridge</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Trust · Accountability · Open governance. Unlike traditional complaint
            systems where issues disappear after submission, every report stays
            visible from submission to resolution.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              "Full public timeline for each issue",
              "Photo and location-based reporting",
              "Official responses and status updates",
              "No hidden backlogs — everything is visible",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-muted-foreground">
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Live preview: trending + map snapshot */}
      <section className="border-b border-border/80 bg-muted/20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            Live preview
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
            Trending issues and real-time status. See what your community is reporting.
          </p>
          <div className="mt-10">
            <LiveTrendingBlock />
          </div>
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/community/trending" className="inline-flex items-center gap-2">
                <MapPinned className="size-4" /> View all trending
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Who uses */}
      <section className="border-b border-border/80 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            Who uses CivicBridge
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Designed for residents, government staff, and the press.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Residents</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Report issues with photo and location. Track progress, upvote and comment.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileCheck className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Government officials</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Manage issue queues, update status, monitor SLAs, use heatmaps.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Newspaper className="size-6" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Journalists & NGOs</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Monitor performance, analyze patterns, access open data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency commitment */}
      <section className="border-b border-border/80 bg-muted/20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="size-6" />
            </div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Our commitment to transparency
            </h2>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            All status changes are logged, timelines are public, and performance
            data is available for analysis.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {[
              { icon: MessageSquare, label: "Public timelines" },
              { icon: BarChart3, label: "Performance dashboards" },
              { icon: Users, label: "Community engagement" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="size-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Get started today</h2>
          <p className="mt-4 text-muted-foreground">
            Create a free account and join transparent civic communication.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

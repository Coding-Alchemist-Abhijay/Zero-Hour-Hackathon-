import {
  FileWarning,
  MapPin,
  Clock,
  Users,
  BarChart3,
  ClipboardList,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Features – CivicBridge",
  description: "Issue reporting, map, timeline, voting, analytics, surveys.",
};

const features = [
  { icon: FileWarning, title: "Issue reporting", desc: "Report with title, description, category, severity, photos, and location." },
  { icon: MapPin, title: "Map", desc: "View issues on a map, report from location, see nearby problems and clusters." },
  { icon: Clock, title: "Timeline", desc: "Public timeline for every issue from submission to resolution." },
  { icon: Users, title: "Community voting", desc: "Upvote issues, comment, and threaded discussions." },
  { icon: BarChart3, title: "Analytics", desc: "Trends, heatmaps, category patterns, and department performance." },
  { icon: ClipboardList, title: "Surveys", desc: "Official surveys and public feedback with results visualization." },
  { icon: Sparkles, title: "Smart features", desc: "Duplicate detection, categorization, and SLA tracking." },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-foreground">Features</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Everything you need for transparent civic issue management.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <h2 className="mt-4 font-semibold text-foreground">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { FileEdit, Eye, MessageSquare, BarChart3 } from "lucide-react";

export const metadata = {
  title: "How it works – CivicBridge",
  description: "Report, track, government responds, public transparency.",
};

const steps = [
  {
    icon: FileEdit,
    title: "Report",
    body: "Residents submit issues with title, description, category, severity, photo, and location. The report is public immediately.",
  },
  {
    icon: Eye,
    title: "Track",
    body: "Every issue has a public timeline. See when it was acknowledged, assigned, and updated. No hidden backlogs.",
  },
  {
    icon: MessageSquare,
    title: "Government responds",
    body: "Officials update status, add notes and photos, and meet SLAs. The public sees who did what and when.",
  },
  {
    icon: BarChart3,
    title: "Public transparency",
    body: "Dashboards show response times, resolution rates, and trends. Open data supports journalism and oversight.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-foreground">How it works</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        From report to resolution — four clear steps, all visible to the public.
      </p>

      <ol className="mt-12 space-y-10">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={i} className="flex gap-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
                </div>
                <p className="mt-2 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

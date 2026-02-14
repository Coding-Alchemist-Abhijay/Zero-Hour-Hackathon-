import { Shield, Users, Target } from "lucide-react";

export const metadata = {
  title: "About – CivicBridge",
  description: "Vision, smart city future, and transparency.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-foreground">About CivicBridge</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        CivicBridge is built on the belief that transparency between citizens and
        government creates trust, accountability, and better outcomes for everyone.
      </p>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="size-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Our vision</h2>
        </div>
        <p className="mt-4 text-muted-foreground">
          A future where every civic issue is visible from report to resolution,
          where governments respond with clarity, and where communities can hold
          officials accountable through open data and public timelines.
        </p>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="size-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Why transparency matters</h2>
        </div>
        <p className="mt-4 text-muted-foreground">
          When issue handling is public, response times improve, backlogs become
          visible, and citizens can see exactly who did what and when. Transparency
          is the foundation of accountable governance.
        </p>
      </section>

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Government and citizen collaboration</h2>
        </div>
        <p className="mt-4 text-muted-foreground">
          CivicBridge connects residents who report issues, officials who resolve
          them, and journalists who monitor performance. Everyone works from the
          same transparent timeline and data.
        </p>
      </section>
    </div>
  );
}

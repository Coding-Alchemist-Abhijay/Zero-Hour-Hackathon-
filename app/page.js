import Link from "next/link";

export const metadata = {
  title: "CivicBridge – Transparent Civic Communication",
  description: "Connect citizens and government with transparent issue tracking.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      </div>

      <header className="border-b border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2 text-[var(--foreground)]">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--primary)] text-white font-bold text-lg">
              C
            </span>
            <span className="font-semibold text-lg">CivicBridge</span>
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] btn-transition"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] tracking-tight max-w-2xl mb-6">
          Transparent communication between citizens and government
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mb-10">
          Report issues, track progress, and hold officials accountable. CivicBridge brings full transparency to civic issue resolution.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-[var(--primary)] px-8 text-base font-medium text-white transition hover:bg-[var(--primary-hover)] btn-transition"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius)] border-2 border-[var(--card-border)] bg-transparent px-8 text-base font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary-light)] btn-transition"
          >
            Sign in
          </Link>
        </div>
      </main>

      <footer className="border-t border-[var(--card-border)] py-6">
        <p className="text-center text-sm text-[var(--muted)]">
          CivicBridge · Hackathon build · Transparent governance
        </p>
      </footer>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuthStoreImpl, ROLES } from "@/store/authStore";

const ROLE_OPTIONS = [
  { value: "RESIDENT", label: ROLES.RESIDENT, desc: "Report and track issues" },
  { value: "OFFICIAL", label: ROLES.OFFICIAL, desc: "Manage and resolve issues" },
  { value: "JOURNALIST", label: ROLES.JOURNALIST, desc: "Monitor and analyze" },
  { value: "ADMIN", label: ROLES.ADMIN, desc: "Full system access" },
];

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStoreImpl((s) => s.register);
  const isLoading = useAuthStoreImpl((s) => s.isLoading);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RESIDENT");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const result = await register({ email, password, name, role });
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.message ?? "Registration failed");
      if (result.errors) setFieldErrors(result.errors);
    }
  }

  return (
    <Card className="opacity-0 animate-scale-in border-[var(--card-border)] shadow-[var(--shadow-lg)]">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
        Create your account
      </h1>
      <p className="mt-1.5 text-[var(--muted)]">
        Join CivicBridge and choose how you want to participate.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div
            className="rounded-[var(--radius-sm)] border border-[var(--error)]/20 bg-[var(--error)]/10 px-4 py-3 text-sm text-[var(--error)]"
            role="alert"
          >
            {error}
          </div>
        )}

        <Input
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name?.[0]}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email?.[0]}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters, with upper, lower & number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password?.[0]}
          required
        />

        <div>
          <span className="mb-3 block text-sm font-medium text-[var(--foreground)]">
            I am a…
          </span>
          <div
            className="grid grid-cols-2 gap-3"
            role="group"
            aria-label="Account type"
          >
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`
                  rounded-[var(--radius)] border-2 px-4 py-3.5 text-left text-sm text-[var(--foreground)]
                  transition-all duration-200
                  ${role === opt.value
                    ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] shadow-sm"
                    : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--muted)] hover:bg-[var(--muted-bg)]"
                  }
                `}
              >
                <span className="font-semibold block">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={isLoading}
        >
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-[var(--primary)] link-underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}

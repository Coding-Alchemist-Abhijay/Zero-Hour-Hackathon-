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
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-1">
        Create your account
      </h1>
      <p className="text-[var(--muted)] mb-6">
        Join CivicBridge and choose how you want to participate.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="rounded-[var(--radius-sm)] bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]"
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
          placeholder="At least 8 chars, upper, lower, number"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password?.[0]}
          required
        />

        <div>
          <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
            I am a…
          </span>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account type">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`
                  rounded-[var(--radius-sm)] border-2 px-3 py-3 text-left text-sm
                  transition btn-transition
                  ${role === opt.value
                    ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                    : "border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--muted)]"
                  }
                `}
              >
                <span className="font-medium block">{opt.label}</span>
                <span className="text-[var(--muted)] text-xs">{opt.desc}</span>
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

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--primary)] hover:underline transition underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}

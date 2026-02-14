"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuthStoreImpl } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStoreImpl((s) => s.login);
  const isLoading = useAuthStoreImpl((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.message ?? "Login failed");
    }
  }

  return (
    <Card className="opacity-0 animate-scale-in border-[var(--card-border)] shadow-[var(--shadow-lg)]">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
        Welcome back
      </h1>
      <p className="mt-1.5 text-[var(--muted)]">
        Sign in to your CivicBridge account.
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
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={isLoading}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[var(--primary)] link-underline"
        >
          Create one
        </Link>
      </p>
    </Card>
  );
}

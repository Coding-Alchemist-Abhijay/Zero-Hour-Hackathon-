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
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-1">
        Welcome back
      </h1>
      <p className="text-[var(--muted)] mb-6">
        Sign in to your CivicBridge account.
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
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={null}
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
          error={null}
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

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[var(--primary)] hover:underline transition underline-offset-2"
        >
          Create one
        </Link>
      </p>
    </Card>
  );
}

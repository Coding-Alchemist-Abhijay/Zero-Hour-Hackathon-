"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
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
    <Card className="w-full max-w-md border-2 border-border bg-card/95 shadow-xl backdrop-blur-sm opacity-0 animate-scale-in">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to your CivicBridge account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-foreground">Email</Label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border-2 border-input focus-visible:ring-2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-foreground">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border-2 border-input focus-visible:ring-2"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </Card>
  );
}

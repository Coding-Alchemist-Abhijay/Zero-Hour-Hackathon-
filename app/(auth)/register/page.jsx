"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
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
    <Card className="w-full max-w-md border-2 border-border bg-card/95 shadow-xl backdrop-blur-sm opacity-0 animate-scale-in">
      <div className="p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join CivicBridge and choose how you want to participate.
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
            <Label htmlFor="reg-name" className="text-foreground">Full name</Label>
            <Input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border-2 border-input focus-visible:ring-2"
              required
            />
            {fieldErrors.name?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-foreground">Email</Label>
            <Input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border-2 border-input focus-visible:ring-2"
              required
            />
            {fieldErrors.email?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-password" className="text-foreground">Password</Label>
            <Input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters, with upper, lower & number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border-2 border-input focus-visible:ring-2"
              required
            />
            {fieldErrors.password?.[0] && (
              <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-foreground">I am a…</Label>
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Account type">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`rounded-lg border-2 px-4 py-3.5 text-left text-sm transition-all duration-200
                    ${role === opt.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-muted/30 text-foreground hover:border-muted-foreground/40 hover:bg-muted/50"
                    }`}
                >
                  <span className="font-semibold block">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2 rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground border-t border-border pt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}

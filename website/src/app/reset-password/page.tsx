"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="card text-center space-y-3">
        <p className="text-danger font-medium">Invalid reset link</p>
        <p className="text-sm text-muted-foreground">This link is missing a token.</p>
        <Link href="/forgot-password" className="btn-primary w-full justify-center inline-flex">
          Request a new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/login?reset=1");
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          New password
        </label>
        <input
          type="password"
          name="password"
          className="input"
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Confirm password
        </label>
        <input
          type="password"
          name="confirm"
          className="input"
          placeholder="••••••••"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full justify-center mt-2"
        disabled={loading}
      >
        {loading ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password</p>
        </div>

        <Suspense fallback={<div className="card text-center text-muted-foreground text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="hover:text-accent transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

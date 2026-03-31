"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">NFCSOC Labs</h1>
          <p className="text-sm text-muted-foreground mt-1">Create your account</p>
        </div>

        {/* Form */}
        <form className="card space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full name
            </label>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Jane Smith"
              required
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Password
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

          <button
            type="submit"
            className="btn-primary w-full justify-center mt-2"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

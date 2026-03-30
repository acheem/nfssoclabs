import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">NFCSOC Labs</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <form className="card space-y-4" action="/api/auth/login" method="POST">
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
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center mt-2">
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-accent transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

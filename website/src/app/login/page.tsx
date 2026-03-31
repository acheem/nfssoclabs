import Link from "next/link";
import { Shield } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;
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

        {registered && (
          <p className="text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2 mb-4 text-center">
            Account created — sign in below.
          </p>
        )}

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

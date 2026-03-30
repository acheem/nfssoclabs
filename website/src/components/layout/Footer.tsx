import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[--border] bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="font-bold text-base tracking-tight">
              NFC<span className="text-accent">SOC</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/labs" className="hover:text-foreground transition-colors">Labs</Link>
            <Link href="/ctf" className="hover:text-foreground transition-colors">CTF</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NFCSOC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

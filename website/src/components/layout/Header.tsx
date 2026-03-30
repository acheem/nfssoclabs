"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, ChevronRight, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/labs", label: "Labs" },
  { href: "/ctf", label: "CTF" },
  { href: "/pricing", label: "Pricing" },
];

export function Header({ user }: { user?: { name: string; role: string } | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass border-b border-[--border]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              NFC<span className="text-accent">SOC</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-surface-raised border border-[--border] hover:border-accent/30 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs text-accent font-bold">
                    {user.name[0].toUpperCase()}
                  </span>
                  <span className="text-foreground">{user.name.split(" ")[0]}</span>
                  <ChevronRight className={cn("w-3 h-3 text-muted-foreground transition-transform", dropdownOpen && "rotate-90")} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-[--border] bg-surface-raised shadow-xl overflow-hidden z-50">
                    <Link
                      href="/dashboard/learner"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-surface-overlay transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-accent" />
                      Dashboard
                    </Link>
                    <div className="border-t border-[--border]" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:text-danger hover:bg-surface-overlay transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm py-2 px-4">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Start free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[--border] bg-surface">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-[--border] flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/dashboard/learner" onClick={() => setOpen(false)} className="btn-ghost">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="btn-ghost text-left text-muted-foreground hover:text-danger flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn-ghost">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary">
                    Start free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

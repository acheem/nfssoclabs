"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Zap, Building2, Shield, Tag, X, Loader2 } from "lucide-react";

export default function PricingPage() {
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);

  async function applyCode() {
    if (!couponInput.trim()) return;
    setLoading(true);
    setCouponError("");
    setCoupon(null);

    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput.trim() }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.valid) {
      setCoupon({ code: data.code, discountPct: data.discountPct });
    } else {
      setCouponError(data.message ?? "Invalid code.");
    }
  }

  function removeCode() {
    setCoupon(null);
    setCouponInput("");
    setCouponError("");
  }

  function discountedPrice(base: number) {
    if (!coupon) return null;
    const discounted = base * (1 - coupon.discountPct / 100);
    return discounted === 0 ? "$0" : `$${discounted.toFixed(2)}`;
  }

  const PLANS = [
    {
      name: "Free",
      icon: Shield,
      basePrice: 0,
      display: "$0",
      period: "forever",
      description: "Get started with core labs and CTF challenges.",
      cta: "Get started",
      href: "/register",
      primary: false,
      features: [
        "Access to all 6 labs",
        "CTF challenge board",
        "SPL query reference",
        "MITRE ATT&CK mappings",
        "Community support",
      ],
    },
    {
      name: "Pro",
      icon: Zap,
      basePrice: 9.99,
      display: "$9.99",
      period: "/ month",
      description: "Full platform access with progress tracking and certificates.",
      cta: "Start Pro",
      href: "/register",
      primary: true,
      features: [
        "Everything in Free",
        "Progress tracking dashboard",
        "Completion certificates",
        "Splunk practice environment",
        "Priority support",
        "New labs on release",
      ],
    },
    {
      name: "Business",
      icon: Building2,
      basePrice: 19.99,
      display: "$19.99",
      period: "/ month",
      description: "Team training with admin dashboard and usage analytics.",
      cta: "Contact sales",
      href: "mailto:sales@nfcsoc.com",
      primary: false,
      features: [
        "Everything in Pro",
        "Up to 10 team seats",
        "Company admin dashboard",
        "Team progress reports",
        "Custom lab scenarios",
        "Dedicated onboarding",
      ],
    },
  ];

  return (
    <>
      <Header user={null} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Heading */}
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Coupon input */}
        <div className="max-w-sm mx-auto mb-10">
          {coupon ? (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                <Tag className="w-4 h-4" />
                <span>{coupon.code}</span>
                <span className="text-emerald-300">— {coupon.discountPct}% off</span>
              </div>
              <button onClick={removeCode} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Have a coupon code?"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && applyCode()}
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={applyCode}
                  disabled={loading || !couponInput.trim()}
                  className="btn-ghost text-sm px-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-400">{couponError}</p>
              )}
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const discounted = plan.basePrice > 0 ? discountedPrice(plan.basePrice) : null;
            return (
              <div
                key={plan.name}
                className={`card rounded-xl flex flex-col ${
                  plan.primary
                    ? "border-accent/30 bg-accent/5 ring-1 ring-accent/20"
                    : ""
                }`}
              >
                {plan.primary && (
                  <div className="text-xs font-semibold text-accent text-center mb-3 -mt-1">
                    Most popular
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <plan.icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="font-semibold text-foreground">{plan.name}</span>
                </div>

                <div className="mb-4 flex items-end gap-2">
                  {discounted ? (
                    <>
                      <span className="text-3xl font-bold text-foreground">{discounted}</span>
                      <span className="text-lg text-muted-foreground line-through">{plan.display}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-foreground">{plan.display}</span>
                  )}
                  <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                </div>

                {coupon && plan.basePrice > 0 && (
                  <p className="text-xs text-emerald-400 mb-2 font-medium">
                    {coupon.discountPct}% off applied
                  </p>
                )}

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={plan.primary ? "btn-primary w-full justify-center" : "btn-ghost w-full justify-center"}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            Questions?{" "}
            <a href="mailto:hello@nfcsoc.com" className="text-accent hover:underline">
              hello@nfcsoc.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle, Zap, Building2, Shield } from "lucide-react";

export const metadata = { title: "Pricing" };

const PLANS = [
  {
    name: "Free",
    icon: Shield,
    price: "$0",
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
    price: "$9.99",
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
    price: "$19.99",
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

export default async function PricingPage() {
  const session = await auth();

  return (
    <>
      <Header user={session?.user ?? null} />
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

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
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

              <div className="mb-4">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
              </div>

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
          ))}
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

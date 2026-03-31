import Link from "next/link";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Terminal, Flag, ArrowRight, Target, Zap } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <Header user={session?.user ?? null} />
      <main className="min-h-screen grid-bg flex flex-col">
        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <div className="inline-flex items-center gap-2 badge-cyan mb-6 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            SOC Analyst Training Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mb-6">
            <span className="gradient-text">Real-world labs.</span>
            <br />
            <span className="text-foreground">Analyst-level skills.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
            Master incident response, threat hunting, Splunk SIEM, and packet analysis through
            hands-on labs and CTF challenges designed for SOC professionals.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {session ? (
              <Link href="/dashboard/learner" className="btn-primary">
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary">
                  Get started free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="btn-ghost">
                  Sign in
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto w-full px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Terminal,
              title: "6 Hands-on Labs",
              desc: "Clipboard theft, FIN7 hunting, malicious OneNote, phishing IR, and more.",
            },
            {
              icon: Flag,
              title: "CTF Challenges",
              desc: "Flag-capture scenarios to test your detection and analysis skills.",
            },
            {
              icon: Target,
              title: "MITRE ATT&CK Mapped",
              desc: "Every lab maps to real adversary techniques used in the wild.",
            },
          ].map((f) => (
            <div key={f.title} className="card-hover">
              <f.icon className="w-6 h-6 text-accent mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

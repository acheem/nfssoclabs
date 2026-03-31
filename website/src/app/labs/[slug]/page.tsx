import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LABS } from "@/lib/labs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { labContent } from "@/lib/labContent";
import { StartLabButton } from "@/components/StartLabButton";
import {
  ArrowLeft,
  Terminal,
  BookOpen,
  Flag,
  ExternalLink,
} from "lucide-react";

export async function generateStaticParams() {
  return LABS.map((lab) => ({ slug: lab.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = LABS.find((l) => l.slug === slug);
  if (!lab) return { title: "Lab Not Found" };
  return { title: lab.title };
}

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "badge-green",
  intermediate: "badge-cyan",
  advanced: "badge-amber",
};

export default async function LabPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = LABS.find((l) => l.slug === slug);
  if (!lab) notFound();

  const session = await auth();
  const content = labContent[slug];

  return (
    <>
      <Header user={session?.user ?? null} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <Link
          href="/labs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All labs
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`${DIFFICULTY_BADGE[lab.difficulty]} text-xs`}>
              {lab.difficulty}
            </span>
            <span className="badge-slate text-xs">{lab.category}</span>
            {lab.ctfScenario && (
              <span className="badge-cyan text-xs">CTF Scenario {lab.ctfScenario}</span>
            )}
            <span className="badge-amber text-xs">{lab.points} pts</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {lab.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            {lab.description}
          </p>

          {/* Tools + MITRE row */}
          <div className="mt-5 flex flex-wrap gap-2">
            {lab.tools.map((t) => (
              <span key={t} className="badge-slate text-xs">{t}</span>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {lab.mitre.map((m) => (
              <a
                key={m}
                href={`https://attack.mitre.org/techniques/${m.replace(".", "/")}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="badge-amber text-xs hover:opacity-80 transition-opacity"
              >
                {m} ↗
              </a>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            {content?.overview && (
              <section className="card rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-foreground">Attack Overview</h2>
                </div>
                <div className="prose-sm text-muted-foreground leading-relaxed space-y-3">
                  {content.overview.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Key artifacts */}
            {content?.artifacts && (
              <section className="card rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-foreground">Key Artifacts</h2>
                </div>
                <ul className="space-y-2">
                  {content.artifacts.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-accent mt-1 flex-shrink-0">›</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* SPL Queries */}
            {content?.queries && (
              <section className="card rounded-xl">
                <div className="flex items-center gap-2 mb-5">
                  <Terminal className="w-4 h-4 text-accent" />
                  <h2 className="font-semibold text-foreground">SPL Queries</h2>
                </div>
                <div className="space-y-5">
                  {content.queries.map((q, i) => (
                    <div key={i}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        {q.label}
                      </p>
                      <div className="code-block rounded-lg overflow-x-auto">
                        <pre className="text-sm text-emerald-300 whitespace-pre-wrap">{q.spl}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Lab launcher */}
            {lab.launcher && (
              <StartLabButton
                slug={lab.slug}
                isLoggedIn={!!session}
                localCommands={lab.launcher.localCommands}
              />
            )}

            {/* CTF link */}
            {lab.ctfScenario && (
              <div className="card rounded-xl bg-accent/5 border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Flag className="w-4 h-4 text-accent" />
                  <h3 className="font-semibold text-foreground text-sm">CTF Challenge</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  This lab maps to Scenario {lab.ctfScenario} in the CTF. Submit your flag to earn{" "}
                  {lab.points} points.
                </p>
                <Link href="/ctf" className="btn-primary text-xs py-2 px-3 w-full justify-center">
                  Go to CTF board
                </Link>
              </div>
            )}

            {/* MITRE links */}
            <div className="card rounded-xl">
              <h3 className="font-semibold text-foreground text-sm mb-3">MITRE ATT&CK</h3>
              <div className="space-y-2">
                {lab.mitre.map((m) => (
                  <a
                    key={m}
                    href={`https://attack.mitre.org/techniques/${m.replace(".", "/")}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-raised hover:bg-surface-overlay transition-colors text-xs"
                  >
                    <span className="font-mono text-accent">{m}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="card rounded-xl">
              <h3 className="font-semibold text-foreground text-sm mb-3">Tools Used</h3>
              <div className="flex flex-wrap gap-2">
                {lab.tools.map((t) => (
                  <span key={t} className="badge-slate text-xs">{t}</span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="card rounded-xl">
              <h3 className="font-semibold text-foreground text-sm mb-3">Other Labs</h3>
              <div className="space-y-1">
                {LABS.filter((l) => l.slug !== slug).map((l) => (
                  <Link
                    key={l.slug}
                    href={`/labs/${l.slug}`}
                    className="block text-xs text-muted-foreground hover:text-accent transition-colors py-1"
                  >
                    → {l.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

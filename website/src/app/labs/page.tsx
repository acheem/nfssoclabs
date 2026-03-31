import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LABS } from "@/lib/labs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, CheckCircle, Target, Flag } from "lucide-react";

export const metadata = { title: "Labs" };

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "badge-green",
  intermediate: "badge-cyan",
  advanced: "badge-amber",
};

export default async function LabsPage() {
  const session = await auth();

  let labStatus = new Map<string, { status: string; score: number }>();
  if (session) {
    const progress = await db.progress.findMany({
      where: { userId: session.user.id },
    });
    progress.forEach((p) => labStatus.set(p.labSlug, { status: p.status, score: p.score }));
  }

  return (
    <>
      <Header user={session?.user ?? null} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Labs</h1>
          <p className="text-muted-foreground mt-2">
            Six hands-on cybersecurity labs covering IR, SIEM, threat hunting, network forensics, and malware analysis.
          </p>
        </div>

        {/* Lab cards */}
        <div className="space-y-4">
          {LABS.map((lab) => {
            const s = labStatus.get(lab.slug);
            const status = s?.status ?? "NOT_STARTED";
            const score = s?.score ?? 0;

            return (
              <Link
                key={lab.slug}
                href={`/labs/${lab.slug}`}
                className="card-hover flex items-start gap-5 p-5"
              >
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  status === "COMPLETED"
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : status === "IN_PROGRESS"
                    ? "bg-accent/10 border-accent/20"
                    : "bg-surface-overlay border-[--border]"
                }`}>
                  {status === "COMPLETED" ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Target className={`w-5 h-5 ${status === "IN_PROGRESS" ? "text-accent" : "text-muted-foreground"}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`${DIFFICULTY_BADGE[lab.difficulty]} text-xs`}>
                      {lab.difficulty}
                    </span>
                    <span className="badge-slate text-xs">{lab.category}</span>
                    {lab.ctfScenario && (
                      <span className="badge-cyan text-xs flex items-center gap-1">
                        <Flag className="w-2.5 h-2.5" />
                        CTF {lab.ctfScenario}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-foreground mb-1">{lab.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{lab.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {lab.tools.map((t) => (
                      <span key={t} className="badge-slate text-xs">{t}</span>
                    ))}
                  </div>
                </div>

                {/* Points + arrow */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {status === "COMPLETED" ? (
                    <span className="badge-green text-xs">{score} pts earned</span>
                  ) : (
                    <span className="badge-amber text-xs">{lab.points} pts</span>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}

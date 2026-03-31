import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LABS } from "@/lib/labs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Flag, CheckCircle, Lock, ArrowRight, Trophy } from "lucide-react";

export const metadata = { title: "CTF Challenges" };

const CTF_LABS = LABS.filter((l) => l.ctfScenario !== undefined);

export default async function CTFPage() {
  const session = await auth();

  let labStatus = new Map<string, { status: string; score: number }>();
  if (session) {
    const progress = await db.progress.findMany({
      where: { userId: session.user.id },
    });
    progress.forEach((p) => labStatus.set(p.labSlug, { status: p.status, score: p.score }));
  }

  const totalEarned = CTF_LABS.reduce((sum, lab) => {
    const s = labStatus.get(lab.slug);
    return sum + (s?.status === "COMPLETED" ? s.score : 0);
  }, 0);
  const totalAvailable = CTF_LABS.reduce((sum, l) => sum + l.points, 0);
  const completedCount = CTF_LABS.filter((l) => labStatus.get(l.slug)?.status === "COMPLETED").length;

  return (
    <>
      <Header user={session?.user ?? null} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Heading */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Flag className="w-5 h-5 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">CTF Challenges</h1>
          </div>
          <p className="text-muted-foreground">
            Each CTF scenario maps to a lab. Complete the lab, find the flags, and submit them here to earn points.
          </p>
        </div>

        {/* Score summary */}
        {session && (
          <div className="card mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm font-semibold text-foreground">Your Score</div>
                <div className="text-xs text-muted-foreground">{completedCount} of {CTF_LABS.length} scenarios completed</div>
              </div>
            </div>
            <div className="text-2xl font-bold text-accent">
              {totalEarned} <span className="text-base text-muted-foreground font-normal">/ {totalAvailable} pts</span>
            </div>
          </div>
        )}

        {/* Scenarios */}
        <div className="space-y-4">
          {CTF_LABS.map((lab) => {
            const s = labStatus.get(lab.slug);
            const completed = s?.status === "COMPLETED";

            return (
              <div key={lab.slug} className={`card rounded-xl ${completed ? "border-emerald-500/20 bg-emerald-500/5" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    completed
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-accent/10 border-accent/20"
                  }`}>
                    {completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Flag className="w-5 h-5 text-accent" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-accent">Scenario {lab.ctfScenario}</span>
                      {completed && <span className="badge-green text-xs">Completed</span>}
                    </div>
                    <h2 className="text-base font-semibold text-foreground mb-1">{lab.title}</h2>
                    <p className="text-sm text-muted-foreground">{lab.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold ${completed ? "text-emerald-400" : "text-accent"}`}>
                      {completed ? `${s!.score} pts` : `${lab.points} pts`}
                    </span>
                    <Link
                      href={`/labs/${lab.slug}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                    >
                      {completed ? "Review lab" : "Start lab"} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Flag submission — only for logged-in users who haven't completed */}
                {session && !completed && (
                  <div className="mt-4 pt-4 border-t border-[--border] flex gap-2">
                    <input
                      type="text"
                      placeholder="Submit flag: FLAG{...}"
                      className="input text-sm flex-1"
                      disabled
                    />
                    <button className="btn-primary text-sm py-2 px-4" disabled>
                      Submit
                    </button>
                  </div>
                )}

                {!session && (
                  <div className="mt-4 pt-4 border-t border-[--border] flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="w-4 h-4" />
                    <Link href="/login" className="hover:text-accent transition-colors">
                      Sign in to submit flags
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}

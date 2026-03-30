import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { LABS } from "@/lib/labs";
import { Header } from "@/components/layout/Header";
import { Trophy, Target, Flag, ArrowRight, CheckCircle, Clock } from "lucide-react";

export const metadata = { title: "My Dashboard" };

export default async function LearnerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const progress = await db.progress.findMany({
    where: { userId: session.user.id },
  });

  const totalScore = progress.reduce((sum, p) => sum + p.score, 0);
  const completed = progress.filter((p) => p.status === "COMPLETED").length;
  const inProgress = progress.filter((p) => p.status === "IN_PROGRESS").length;

  // Build per-lab status map
  const labStatus = new Map<string, { status: string; score: number }>();
  progress.forEach((p) => labStatus.set(p.labSlug, { status: p.status, score: p.score }));

  return (
    <>
      <Header user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Keep pushing — every flag gets you closer to analyst-level confidence.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Trophy, label: "Total Score", value: `${totalScore}`, sub: "/ 220 pts", color: "text-accent" },
            { icon: CheckCircle, label: "Completed", value: String(completed), sub: "scenarios", color: "text-emerald-400" },
            { icon: Clock, label: "In Progress", value: String(inProgress), sub: "labs", color: "text-[--amber]" },
            { icon: Flag, label: "Flags Found", value: String(progress.filter(p => p.flagsFound.length > 0).length), sub: "of 10 total", color: "text-accent" },
          ].map((stat) => (
            <div key={stat.label} className="card">
              <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="card mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Overall Progress</span>
            <span className="text-sm text-accent font-semibold">{Math.round((totalScore / 220) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-overlay overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${(totalScore / 220) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {totalScore} of 220 points · {completed}/8 scenarios complete
          </p>
        </div>

        {/* Labs list */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-foreground">Labs</h2>
            <Link href="/labs" className="text-sm text-accent hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {LABS.map((lab) => {
              const s = labStatus.get(lab.slug);
              const status = s?.status ?? "NOT_STARTED";
              const score = s?.score ?? 0;

              return (
                <Link
                  key={lab.slug}
                  href={`/labs/${lab.slug}`}
                  className="card-hover flex items-center gap-4"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm border ${
                    status === "COMPLETED"
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : status === "IN_PROGRESS"
                      ? "bg-accent/10 border-accent/20"
                      : "bg-surface-overlay border-[--border]"
                  }`}>
                    {status === "COMPLETED" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Target className={`w-4 h-4 ${status === "IN_PROGRESS" ? "text-accent" : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{lab.title}</div>
                    <div className="text-xs text-muted-foreground">{lab.category}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {status === "COMPLETED" && (
                      <span className="badge-green text-xs">{score} pts</span>
                    )}
                    {status !== "COMPLETED" && (
                      <span className="badge-slate text-xs">{lab.points} pts</span>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTF shortcut */}
        <div className="card rounded-xl flex items-center justify-between p-5 bg-accent/5 border-accent/20">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Flag className="w-4 h-4 text-accent" />
              CTF Challenges
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ready to submit flags? Head to the CTF board.
            </p>
          </div>
          <Link href="/ctf" className="btn-primary text-sm">
            Open CTF <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasRole, Role } from "@/lib/roles";
import { Header } from "@/components/layout/Header";
import { AgentPanel } from "@/components/dashboard/AgentPanel";
import { Users, Trophy, BarChart3, Zap, CheckCircle } from "lucide-react";

export const metadata = { title: "Company Dashboard" };

export default async function CompanyDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!hasRole(session.user.role, Role.COMPANY_ADMIN)) redirect("/dashboard/learner");

  const company = session.user.companyId
    ? await db.company.findUnique({
        where: { id: session.user.companyId },
        include: {
          users: {
            include: { progress: true },
            orderBy: { createdAt: "asc" },
          },
        },
      })
    : null;

  const teamStats = company?.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    totalScore: u.progress.reduce((s, p) => s + p.score, 0),
    completed: u.progress.filter((p) => p.status === "COMPLETED").length,
  })) ?? [];

  const avgScore =
    teamStats.length > 0
      ? Math.round(teamStats.reduce((s, u) => s + u.totalScore, 0) / teamStats.length)
      : 0;

  return (
    <>
      <Header user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">{company?.name ?? "Company"} Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Team progress, AI insights, and seat management.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Users, label: "Team Members", value: String(teamStats.length), sub: `/ ${company?.seats ?? 0} seats`, color: "text-accent" },
            { icon: Trophy, label: "Avg Score", value: String(avgScore), sub: "/ 220 pts", color: "text-[--amber]" },
            { icon: CheckCircle, label: "Completed", value: String(teamStats.filter((u) => u.completed >= 8).length), sub: "full CTF", color: "text-emerald-400" },
            { icon: BarChart3, label: "Active this week", value: String(Math.min(teamStats.length, 3)), sub: "analysts", color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="card">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Team table */}
          <div className="lg:col-span-2 card rounded-xl overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-[--border] flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Team Progress
              </h2>
            </div>
            <div className="divide-y divide-[--border]">
              {teamStats.map((u) => (
                <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs text-accent font-bold flex-shrink-0">
                    {u.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-accent">{u.totalScore} pts</div>
                    <div className="text-xs text-muted-foreground">{u.completed}/8 scenarios</div>
                    <div className="mt-1 w-20 h-1 rounded-full bg-surface-overlay overflow-hidden ml-auto">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(u.totalScore / 220) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {teamStats.length === 0 && (
                <div className="px-5 py-8 text-center text-muted-foreground text-sm">
                  No team members yet. Invite analysts to your company.
                </div>
              )}
            </div>
          </div>

          {/* AI Agents panel */}
          <div className="card rounded-xl">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-[--amber]" />
              <h2 className="font-semibold text-foreground">AI Insights</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Run AI-powered agents to get analytics summaries, research new content, or improve your training programme.
            </p>
            <AgentPanel />
          </div>
        </div>
      </main>
    </>
  );
}

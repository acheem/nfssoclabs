import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPlatformAdmin } from "@/lib/roles";
import { Header } from "@/components/layout/Header";
import { Users, Building2, Trophy, Database } from "lucide-react";

export const metadata = { title: "Platform Admin" };

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!isPlatformAdmin(session.user.role)) redirect("/dashboard/learner");

  const [userCount, companyCount, progressCount] = await Promise.all([
    db.user.count(),
    db.company.count(),
    db.progress.count({ where: { status: "COMPLETED" } }),
  ]);

  const topUsers = await db.user.findMany({
    take: 10,
    include: { progress: true },
    orderBy: { createdAt: "desc" },
  });

  const leaderboard = topUsers
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      score: u.progress.reduce((s, p) => s + p.score, 0),
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <>
      <Header user={session.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="badge-amber inline-flex mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide">Platform Admin</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Platform Overview</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Users, label: "Total Users", value: String(userCount), color: "text-accent" },
            { icon: Building2, label: "Companies", value: String(companyCount), color: "text-[--amber]" },
            { icon: Trophy, label: "Flags Captured", value: String(progressCount), color: "text-emerald-400" },
            { icon: Database, label: "Active Sessions", value: "–", color: "text-accent" },
          ].map((s) => (
            <div key={s.label} className="card">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="card rounded-xl overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-[--border]">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[--amber]" />
              Global Leaderboard (recent users)
            </h2>
          </div>
          <div className="divide-y divide-[--border]">
            {leaderboard.map((u, i) => (
              <div key={u.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-[--amber]" : "text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs text-accent font-bold flex-shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge-slate text-xs">{u.role}</span>
                  <span className="text-sm font-semibold text-accent">{u.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

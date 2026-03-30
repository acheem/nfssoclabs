"use client";

import { useState } from "react";
import { Zap, Loader2, CheckCircle } from "lucide-react";

const AGENTS = [
  { id: "progress-summary", label: "Progress Summary", desc: "Summarise team performance across all labs." },
  { id: "weak-areas", label: "Weak Areas Report", desc: "Identify labs where the team is struggling." },
  { id: "recommendations", label: "Training Recommendations", desc: "Suggest next labs based on current progress." },
];

export function AgentPanel() {
  const [running, setRunning] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function runAgent(id: string) {
    setRunning(id);
    setDone(null);
    await new Promise((r) => setTimeout(r, 1800));
    setRunning(null);
    setDone(id);
  }

  return (
    <div className="space-y-3">
      {AGENTS.map((agent) => (
        <div key={agent.id} className="rounded-lg border border-[--border] bg-surface-raised p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">{agent.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{agent.desc}</div>
            </div>
            <button
              onClick={() => runAgent(agent.id)}
              disabled={running !== null}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running === agent.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : done === agent.id ? (
                <CheckCircle className="w-3 h-3 text-emerald-400" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              {done === agent.id ? "Done" : "Run"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

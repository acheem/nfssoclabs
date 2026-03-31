"use client";

import { useState } from "react";
import { ExternalLink, ChevronDown, ChevronUp, Copy, Check, Zap, Github, Terminal, UserPlus } from "lucide-react";

interface StartLabButtonProps {
  slug: string;
  isLoggedIn: boolean;
  killercodaUrl?: string;
  playWithDockerCmd: string;
  localCommands: {
    start: string;
    connect: string;
    stop: string;
  };
}

export function StartLabButton({
  slug,
  isLoggedIn,
  killercodaUrl,
  playWithDockerCmd,
  localCommands,
}: StartLabButtonProps) {
  const [showMore, setShowMore] = useState(false);
  const [showLocal, setShowLocal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [killercodaStep, setKillercodaStep] = useState<"idle" | "register">("idle");

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-3">

      {/* Option 1 — Killercoda */}
      {killercodaUrl && (
        <div className="card rounded-xl bg-accent/5 border-accent/20 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">Run in Browser</span>
            <span className="badge-green text-xs ml-auto">Free</span>
          </div>

          {killercodaStep === "idle" && (
            <>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Opens a terminal directly in your browser via Killercoda.
                Nothing to install. Environment is destroyed when you close it.
              </p>
              <button
                onClick={() => setKillercodaStep("register")}
                className="btn-primary w-full justify-center"
              >
                Open Lab in Browser
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}

          {killercodaStep === "register" && (
            <>
              <p className="text-sm font-medium text-foreground">
                You need a free Killercoda account
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Killercoda provides the browser terminal for this lab.
                It&apos;s free — takes 30 seconds to sign up.
              </p>
              <div className="space-y-2">
                <a
                  href="https://killercoda.com/users/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  Create free Killercoda account
                </a>
                <a
                  href={killercodaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full justify-center text-sm"
                >
                  I already have an account — Open Lab
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <button
                onClick={() => setKillercodaStep("idle")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </>
          )}
        </div>
      )}

      {/* More options toggle */}
      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
      >
        <span>Other ways to run this lab</span>
        {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {showMore && (
        <div className="space-y-3">

          {/* Option 2 — GitHub Codespaces */}
          <div className="card rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">GitHub Codespaces</span>
              <span className="badge-slate text-xs ml-auto">Free GitHub account</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Runs in your GitHub account. 60 free hours/month.
              Automatically deleted when you complete the lab.
            </p>
            <a
              href={isLoggedIn ? `/api/labs/github/connect?slug=${slug}` : `/login?redirect=/labs/${slug}`}
              className="btn-ghost w-full justify-center text-sm"
            >
              Launch with GitHub
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Option 3 — Play with Docker */}
          <div className="card rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Play with Docker</span>
              <span className="badge-slate text-xs ml-auto">Free · 4h session</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Go to{" "}
              <a
                href="https://labs.play-with-docker.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                labs.play-with-docker.com
              </a>
              , start a session, then paste this command:
            </p>
            <div className="code-block rounded-lg flex items-center gap-2">
              <pre className="text-xs text-emerald-300 flex-1 overflow-x-auto whitespace-pre-wrap break-all">
                {playWithDockerCmd}
              </pre>
              <button
                onClick={() => copy(playWithDockerCmd, "pwd")}
                className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                aria-label="Copy"
              >
                {copied === "pwd"
                  ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                  : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Option 4 — Run locally */}
          <div className="card rounded-xl">
            <button
              onClick={() => setShowLocal(!showLocal)}
              className="w-full flex items-center justify-between text-sm font-medium text-foreground"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                Run on your own computer
              </span>
              {showLocal
                ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showLocal && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">Requires Docker installed on your machine.</p>
                {[
                  { label: "1. Start", cmd: localCommands.start },
                  { label: "2. Connect", cmd: localCommands.connect },
                  { label: "3. Delete when done", cmd: localCommands.stop },
                ].map(({ label, cmd }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <div className="code-block rounded-lg flex items-center gap-2">
                      <pre className="text-xs text-emerald-300 flex-1 overflow-x-auto">{cmd}</pre>
                      <button
                        onClick={() => copy(cmd, label)}
                        className="flex-shrink-0 text-muted-foreground hover:text-accent"
                        aria-label="Copy"
                      >
                        {copied === label
                          ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                          : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

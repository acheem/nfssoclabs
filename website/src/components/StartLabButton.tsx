"use client";

import { useState, useEffect } from "react";
import { Play, Loader2, ExternalLink, CheckCircle, Github, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface StartLabButtonProps {
  slug: string;
  isLoggedIn: boolean;
  localCommands: {
    start: string;
    connect: string;
    stop: string;
  };
}

type State = "idle" | "needs_github" | "creating" | "ready" | "error";

export function StartLabButton({ slug, isLoggedIn, localCommands }: StartLabButtonProps) {
  const [state, setState] = useState<State>("idle");
  const [labUrl, setLabUrl] = useState<string | null>(null);
  const [showLocal, setShowLocal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Check if lab is already ready (returning from OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("lab_ready")) {
      setState("creating"); // poll for codespace URL
      pollForCodespace();
    }
    if (params.get("error")) {
      const err = params.get("error");
      setErrorMsg(
        err === "github_cancelled" ? "GitHub authorisation was cancelled." :
        err === "codespace_failed" ? "Could not start the lab. Please try again." :
        "Something went wrong. Please try again."
      );
      setState("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pollForCodespace(attempts = 0) {
    if (attempts > 20) {
      setErrorMsg("Lab is taking too long to start. Try again.");
      setState("error");
      return;
    }
    const res = await fetch(`/api/labs/status?slug=${slug}`);
    const data = await res.json();
    if (data.url) {
      setLabUrl(data.url);
      setState("ready");
    } else {
      setTimeout(() => pollForCodespace(attempts + 1), 3000);
    }
  }

  async function handleStart() {
    if (!isLoggedIn) {
      window.location.href = `/login?redirect=/labs/${slug}`;
      return;
    }

    setState("creating");

    // Try to launch directly — API will tell us if GitHub needs connecting first
    const res = await fetch("/api/labs/launch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const data = await res.json();

    if (data.needsGitHub) {
      setState("needs_github");
      return;
    }
    if (data.url) {
      setLabUrl(data.url);
      setState("ready");
      return;
    }
    if (data.error) {
      setErrorMsg(data.error);
      setState("error");
    }
  }

  function handleGitHubConnect() {
    window.location.href = `/api/labs/github/connect?slug=${slug}`;
  }

  function copyCmd(cmd: string, key: string) {
    navigator.clipboard.writeText(cmd);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  if (state === "idle") {
    return (
      <div className="space-y-3">
        <button onClick={handleStart} className="btn-primary w-full justify-center">
          <Play className="w-4 h-4" />
          Start Lab
        </button>
        <LocalInstructions
          show={showLocal}
          toggle={() => setShowLocal(!showLocal)}
          commands={localCommands}
          copied={copied}
          onCopy={copyCmd}
        />
      </div>
    );
  }

  if (state === "needs_github") {
    return (
      <div className="card rounded-xl bg-surface-raised space-y-4">
        <h3 className="font-semibold text-foreground text-sm">One thing needed</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This lab runs entirely in your browser — no downloads, no setup.
          You just need a <strong className="text-foreground">free GitHub account</strong> to run it.
        </p>
        <div className="space-y-2">
          <button onClick={handleGitHubConnect} className="btn-primary w-full justify-center">
            <Github className="w-4 h-4" />
            I have a GitHub account — continue
          </button>
          <a
            href="https://github.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full justify-center text-sm"
          >
            Create free GitHub account
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          The lab environment will be automatically deleted when you complete the challenge.
        </p>
        <button onClick={() => setState("idle")} className="text-xs text-muted-foreground hover:text-foreground">
          ← Back
        </button>
      </div>
    );
  }

  if (state === "creating") {
    return (
      <div className="card rounded-xl bg-surface-raised text-center space-y-3 py-6">
        <Loader2 className="w-7 h-7 text-accent animate-spin mx-auto" />
        <p className="text-sm font-medium text-foreground">Starting your lab environment…</p>
        <p className="text-xs text-muted-foreground">This usually takes 30–60 seconds.</p>
      </div>
    );
  }

  if (state === "ready" && labUrl) {
    return (
      <div className="space-y-3">
        <div className="card rounded-xl bg-emerald-500/5 border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-foreground">Lab is ready</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your lab is running in the cloud. Click below to open it in a new tab.
            It will be <strong className="text-foreground">automatically deleted</strong> when you submit the correct flag.
          </p>
          <a href={labUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center">
            Open Lab
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <LocalInstructions
          show={showLocal}
          toggle={() => setShowLocal(!showLocal)}
          commands={localCommands}
          copied={copied}
          onCopy={copyCmd}
        />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-3">
        <div className="card rounded-xl bg-danger/5 border-danger/20 space-y-3">
          <p className="text-sm text-danger">{errorMsg}</p>
          <button onClick={() => setState("idle")} className="btn-ghost w-full justify-center text-sm">
            Try again
          </button>
        </div>
        <LocalInstructions
          show={showLocal}
          toggle={() => setShowLocal(!showLocal)}
          commands={localCommands}
          copied={copied}
          onCopy={copyCmd}
        />
      </div>
    );
  }

  return null;
}

function LocalInstructions({
  show, toggle, commands, copied, onCopy
}: {
  show: boolean;
  toggle: () => void;
  commands: { start: string; connect: string; stop: string };
  copied: string | null;
  onCopy: (cmd: string, key: string) => void;
}) {
  return (
    <div className="card rounded-xl">
      <button onClick={toggle} className="w-full flex items-center justify-between text-xs text-muted-foreground">
        <span>Prefer to run locally?</span>
        {show ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {show && (
        <div className="mt-3 space-y-2">
          {[
            { label: "1. Start", cmd: commands.start },
            { label: "2. Connect", cmd: commands.connect },
            { label: "3. Delete when done", cmd: commands.stop },
          ].map(({ label, cmd }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <div className="code-block rounded-lg flex items-center gap-2">
                <pre className="text-xs text-emerald-300 flex-1 overflow-x-auto">{cmd}</pre>
                <button onClick={() => onCopy(cmd, label)} className="flex-shrink-0 text-muted-foreground hover:text-accent">
                  {copied === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

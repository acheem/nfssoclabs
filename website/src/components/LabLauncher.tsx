"use client";

import { useState } from "react";
import { ExternalLink, Terminal, Trash2, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface LabLauncherProps {
  slug: string;
  devcontainerPath: string;
  localCommands: {
    start: string;
    connect: string;
    stop: string;
  };
}

const CODESPACES_BASE = "https://codespaces.new/acheem/nfssoclabs";
const GITPOD_BASE = "https://gitpod.io/#";
const REPO_URL = "https://github.com/acheem/nfssoclabs";

export function LabLauncher({ slug, devcontainerPath, localCommands }: LabLauncherProps) {
  const [showLocal, setShowLocal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const codespacesUrl = `${CODESPACES_BASE}?devcontainer_path=${encodeURIComponent(devcontainerPath)}`;
  const gitpodUrl = `${GITPOD_BASE}${REPO_URL}`;

  function copyCmd(cmd: string, key: string) {
    navigator.clipboard.writeText(cmd);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Primary — GitHub Codespaces */}
      <div className="card rounded-xl bg-accent/5 border-accent/20">
        <h3 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent" />
          Launch in Browser
        </h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Runs entirely in your browser — no installation needed. The lab environment starts automatically.
          <strong className="text-foreground"> Delete the Codespace when done</strong> to avoid using your free quota.
        </p>
        <div className="space-y-2">
          <a
            href={codespacesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center text-sm"
          >
            Open in GitHub Codespaces
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href={gitpodUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost w-full justify-center text-sm"
          >
            Open in Gitpod
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Cleanup reminder */}
        <div className="mt-4 pt-4 border-t border-[--border]">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Trash2 className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-danger">When finished:</strong> delete your Codespace at{" "}
              <a
                href="https://github.com/codespaces"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                github.com/codespaces
              </a>
              {" "}or run <code className="font-mono bg-surface-overlay px-1 rounded">gh cs delete</code>.
              Gitpod workspaces auto-delete after 14 days of inactivity.
            </span>
          </div>
        </div>
      </div>

      {/* Secondary — Run locally */}
      <div className="card rounded-xl">
        <button
          onClick={() => setShowLocal(!showLocal)}
          className="w-full flex items-center justify-between text-sm font-medium text-foreground"
        >
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            Run locally with Docker
          </span>
          {showLocal ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {showLocal && (
          <div className="mt-4 space-y-3">
            {[
              { label: "1. Start the lab", cmd: localCommands.start },
              { label: "2. Connect", cmd: localCommands.connect },
              { label: "3. Stop & delete when done", cmd: localCommands.stop },
            ].map(({ label, cmd }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="code-block rounded-lg flex items-center justify-between gap-2">
                  <pre className="text-xs text-emerald-300 flex-1 overflow-x-auto">{cmd}</pre>
                  <button
                    onClick={() => copyCmd(cmd, label)}
                    className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                    aria-label="Copy"
                  >
                    {copied === label ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

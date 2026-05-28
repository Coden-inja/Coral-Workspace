"use client";

import type { ReactNode } from "react";

export type TopbarMetric = {
  id: string;
  label: string;
  value: string;
  tone?: "default" | "healthy" | "warning" | "critical";
};

type TopbarProps = {
  title?: string;
  environment?: string;
  metrics: TopbarMetric[];
  onMenuClick?: () => void;
  actions?: ReactNode;
};

const toneClasses: Record<NonNullable<TopbarMetric["tone"]>, string> = {
  default: "border-zinc-700 bg-zinc-900 text-zinc-300",
  healthy: "border-emerald-800/60 bg-emerald-950/40 text-emerald-300",
  warning: "border-amber-800/60 bg-amber-950/40 text-amber-300",
  critical: "border-red-800/60 bg-red-950/40 text-red-300",
};

export function Topbar({
  title = "Operations Control Plane",
  environment = "Production",
  metrics,
  onMenuClick,
  actions,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-200 transition-colors hover:bg-zinc-800 lg:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">{title}</p>
            <p className="truncate text-xs text-zinc-400">{environment}</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className={[
                "rounded-lg border px-2.5 py-1 text-xs",
                toneClasses[metric.tone ?? "default"],
              ].join(" ")}
            >
              <span className="mr-1 text-zinc-400">{metric.label}:</span>
              <span className="font-medium">{metric.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-t border-zinc-800 px-4 py-2 xl:hidden">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={[
              "whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs",
              toneClasses[metric.tone ?? "default"],
            ].join(" ")}
          >
            <span className="mr-1 text-zinc-400">{metric.label}:</span>
            <span className="font-medium">{metric.value}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M3 5.75A.75.75 0 0 1 3.75 5h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 5.75Zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 10Zm0 4.25a.75.75 0 0 1 .75-.75h12.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" />
    </svg>
  );
}

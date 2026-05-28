"use client";

import type { ReactNode } from "react";

import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";

type MetricTrend = "up" | "down" | "flat";

type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: MetricTrend;
  delta?: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  icon?: ReactNode;
  className?: string;
};

const trendStyles: Record<MetricTrend, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  flat: "text-zinc-400",
};

export function MetricCard({
  label,
  value,
  hint,
  trend = "flat",
  delta,
  statusLabel,
  statusTone = "neutral",
  icon,
  className,
}: MetricCardProps) {
  return (
    <article
      className={[
        "rounded-lg border border-zinc-800/90 bg-zinc-900/75 p-4 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_8px_20px_rgba(2,6,23,0.3)]",
        "transition-colors hover:border-zinc-700/90",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold leading-none tracking-tight text-zinc-100">{value}</p>
        </div>
        {icon ? <div className="text-zinc-400">{icon}</div> : null}
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        {delta ? (
          <span className={["text-xs font-semibold", trendStyles[trend]].join(" ")}>{delta}</span>
        ) : null}
        {statusLabel ? <StatusBadge label={statusLabel} tone={statusTone} size="sm" /> : null}
      </div>

      {hint ? <p className="mt-2 text-xs leading-relaxed text-zinc-400">{hint}</p> : null}
    </article>
  );
}

export type { MetricCardProps, MetricTrend };

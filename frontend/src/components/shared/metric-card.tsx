"use client";

import type { ReactNode } from "react";

import { StatusBadge, type StatusTone } from "@/components/shared/status-badge";
import { cardSurfaceClass } from "@/components/shared/surfaces";

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

export function MetricCard({
  label,
  value,
  hint,
  delta,
  statusLabel,
  statusTone = "neutral",
  icon,
  className,
}: MetricCardProps) {
  return (
    <article
      className={[
        cardSurfaceClass,
        "p-5 transition-colors hover:border-zinc-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">{label}</p>
          <p className="mt-2 text-4xl font-bold leading-none tracking-tight text-zinc-50">{value}</p>
        </div>
        {icon ? <div className="text-zinc-500">{icon}</div> : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {delta ? <span className="text-xs text-zinc-500">{delta}</span> : null}
        {statusLabel ? <StatusBadge label={statusLabel} tone={statusTone} size="sm" /> : null}
      </div>

      {hint ? <p className="mt-2 text-sm leading-relaxed text-zinc-500">{hint}</p> : null}
    </article>
  );
}

export type { MetricCardProps, MetricTrend };

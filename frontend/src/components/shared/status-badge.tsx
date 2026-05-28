"use client";

import type { StatusTone } from "@/types/common";

type StatusSize = "sm" | "md";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  size?: StatusSize;
  className?: string;
};

const toneStyles: Record<StatusTone, string> = {
  neutral: "border-zinc-700/90 bg-zinc-900/90 text-zinc-300",
  healthy: "border-emerald-800/70 bg-emerald-950/45 text-emerald-300",
  warning: "border-amber-800/70 bg-amber-950/45 text-amber-300",
  critical: "border-red-800/70 bg-red-950/45 text-red-300",
  info: "border-blue-800/70 bg-blue-950/45 text-blue-300",
};

const sizeStyles: Record<StatusSize, string> = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

export function StatusBadge({
  label,
  tone = "neutral",
  size = "md",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border font-semibold uppercase tracking-[0.04em]",
        toneStyles[tone],
        sizeStyles[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </span>
  );
}

export type { StatusBadgeProps, StatusSize, StatusTone };

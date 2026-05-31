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
  neutral: "border-zinc-700/80 bg-zinc-900/70 text-zinc-400/90",
  healthy: "border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.08)] text-emerald-300/65",
  warning: "border-[rgba(245,158,11,0.18)] bg-[rgba(245,158,11,0.08)] text-amber-300/65",
  critical: "border-[rgba(239,68,68,0.18)] bg-[rgba(239,68,68,0.08)] text-red-300/65",
  info: "border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.08)] text-blue-300/65",
};

const sizeStyles: Record<StatusSize, string> = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-[11px]",
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
        "inline-flex items-center rounded border font-medium uppercase tracking-[0.05em]",
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

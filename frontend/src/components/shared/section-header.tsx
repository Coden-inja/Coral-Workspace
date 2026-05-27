"use client";

import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div className={["flex items-start justify-between gap-3", className].filter(Boolean).join(" ")}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 truncate text-base font-semibold tracking-tight text-zinc-100">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-relaxed text-zinc-400">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export type { SectionHeaderProps };

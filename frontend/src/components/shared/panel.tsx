"use client";

import type { ReactNode } from "react";

type PanelPadding = "none" | "sm" | "md" | "lg";

type PanelProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  padding?: PanelPadding;
  className?: string;
};

const paddingStyles: Record<PanelPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Panel({
  children,
  title,
  description,
  actions,
  padding = "md",
  className,
}: PanelProps) {
  return (
    <section
      className={[
        "rounded-lg border border-zinc-800/90 bg-zinc-900/70 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_10px_24px_rgba(2,6,23,0.35)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title || description || actions ? (
        <header className="flex items-start justify-between gap-3 border-b border-zinc-800/90 bg-zinc-950/35 px-4 py-3">
          <div className="min-w-0">
            {title ? <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-100">{title}</h3> : null}
            {description ? <p className="mt-1 text-xs leading-relaxed text-zinc-400">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}

      <div className={paddingStyles[padding]}>{children}</div>
    </section>
  );
}

export type { PanelPadding, PanelProps };

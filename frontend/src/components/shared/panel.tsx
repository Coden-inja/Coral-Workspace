"use client";

import type { ReactNode } from "react";

import { cardSurfaceClass } from "@/components/shared/surfaces";

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
    <section className={[cardSurfaceClass, className].filter(Boolean).join(" ")}>
      {title || description || actions ? (
        <header className="flex items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3.5">
          <div className="min-w-0">
            {title ? <h3 className="truncate text-xl font-semibold tracking-tight text-zinc-100">{title}</h3> : null}
            {description ? <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}

      <div className={paddingStyles[padding]}>{children}</div>
    </section>
  );
}

export type { PanelPadding, PanelProps };

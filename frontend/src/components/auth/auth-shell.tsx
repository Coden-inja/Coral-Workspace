"use client";

import type { ReactNode } from "react";

import { Panel } from "@/components/shared/panel";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <header className="text-center">
          <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">CoralOps</p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{description}</p>
        </header>

        <Panel padding="lg" className="shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_16px_40px_rgba(2,6,23,0.45)]">
          {children}
        </Panel>

        {footer ? <footer className="text-center text-sm text-zinc-400">{footer}</footer> : null}
      </div>
    </div>
  );
}

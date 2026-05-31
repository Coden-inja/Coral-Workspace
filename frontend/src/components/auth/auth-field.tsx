"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

type AuthFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-[0.04em] text-zinc-400">{label}</label>
      {children}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export function AuthInput({ hasError, className, ...props }: AuthInputProps) {
  return (
    <input
      className={[
        "h-10 w-full rounded-md border bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-600",
        hasError ? "border-red-800/80" : "border-zinc-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

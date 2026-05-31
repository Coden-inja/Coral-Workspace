"use client";

import { useState, type InputHTMLAttributes } from "react";

import { AuthField } from "@/components/auth/auth-field";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
};

export function PasswordField({ label, error, className, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField label={label} error={error}>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete}
          className={[
            "h-10 w-full rounded-md border bg-zinc-950 px-3 pr-16 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-600",
            error ? "border-red-800/80" : "border-zinc-700",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </AuthField>
  );
}

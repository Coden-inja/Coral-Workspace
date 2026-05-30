"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { ToastEvent } from "@/contracts";
import type { ToastTone } from "@/types/common";

type ToastItem = {
  id: string;
} & ToastEvent;

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClass: Record<ToastTone, string> = {
  info: "border-[rgba(59,130,246,0.2)] bg-zinc-950/80 text-zinc-300 backdrop-blur-md",
  warning: "border-[rgba(245,158,11,0.2)] bg-zinc-950/80 text-zinc-300 backdrop-blur-md",
  critical: "border-[rgba(239,68,68,0.2)] bg-zinc-950/80 text-zinc-300 backdrop-blur-md",
  success: "border-[rgba(34,197,94,0.2)] bg-zinc-950/80 text-zinc-300 backdrop-blur-md",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev.slice(-2), { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-3 right-3 z-[70] flex flex-col gap-1.5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "w-[260px] rounded-md border px-2.5 py-2 shadow-lg animate-[toast-slide-in_0.22s_ease-out]",
              toneClass[toast.tone],
            ].join(" ")}
          >
            <p className="text-[11px] font-medium text-zinc-200">{toast.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

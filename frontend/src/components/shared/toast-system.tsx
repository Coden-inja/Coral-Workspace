"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastTone = "info" | "warning" | "critical" | "success";

type ToastItem = {
  id: string;
  title: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClass: Record<ToastTone, string> = {
  info: "border-blue-800/70 bg-blue-950/35 text-blue-200",
  warning: "border-amber-800/70 bg-amber-950/35 text-amber-200",
  critical: "border-red-800/70 bg-red-950/35 text-red-200",
  success: "border-emerald-800/70 bg-emerald-950/35 text-emerald-200",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev.slice(-3), { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] space-y-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={["w-[320px] rounded-lg border p-3 shadow-xl", toneClass[toast.tone]].join(" ")}>
            <p className="text-xs font-semibold">{toast.title}</p>
            <p className="mt-1 text-xs opacity-90">{toast.message}</p>
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


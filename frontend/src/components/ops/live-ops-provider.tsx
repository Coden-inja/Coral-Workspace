"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ToastProvider, useToast } from "@/components/shared/toast-system";
import { subscribeToMockOpsEvents } from "@/lib/live/ops-event-stream";
import { getAllInvestigations } from "@/lib/mock-data";

type LiveOpsProviderProps = {
  children: ReactNode;
};

function LiveOpsEventsBridge() {
  const { pushToast } = useToast();

  useEffect(() => {
    return subscribeToMockOpsEvents((event) => {
      if (event.type === "alert_update") {
        pushToast({ title: "New Alert Update", message: `Alert ${event.alertId} -> ${event.value}`, tone: event.severity === "critical" ? "critical" : event.severity === "warning" ? "warning" : "info" });
      }
      if (event.type === "escalation") {
        pushToast({ title: "Escalation", message: `${event.incidentId}: ${event.message}`, tone: "critical" });
      }
      if (event.type === "containment_completed") {
        pushToast({ title: "Containment Completed", message: `${event.incidentId}: ${event.message}`, tone: "success" });
      }
      if (event.type === "connector_status" && event.status === "offline") {
        pushToast({ title: "Connector Offline", message: `${event.connector} is offline`, tone: "warning" });
      }
    }, 4500);
  }, [pushToast]);

  return null;
}

function CommandPalette() {
  const router = useRouter();
  const investigations = useMemo(() => getAllInvestigations(), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const staticActions = useMemo(
    () => [
      { id: "go-overview", label: "Go to Overview", run: () => router.push("/overview") },
      { id: "go-agents", label: "Go to Agents", run: () => router.push("/agents") },
      { id: "go-connectors", label: "Go to Connectors", run: () => router.push("/connectors") },
      { id: "go-workspaces", label: "Go to Workspaces", run: () => router.push("/workspaces") },
      { id: "go-investigations", label: "Open Investigation Queue", run: () => router.push("/investigations") },
    ],
    [router],
  );

  const investigationActions = useMemo(
    () =>
      investigations.map((incident) => ({
        id: incident.id,
        label: `Open ${incident.id} - ${incident.title}`,
        run: () => router.push(`/investigations/${incident.id}/timeline`),
      })),
    [investigations, router],
  );

  const actions = useMemo(() => {
    const all = [...staticActions, ...investigationActions];
    const q = query.trim().toLowerCase();
    return q ? all.filter((item) => item.label.toLowerCase().includes(q)) : all;
  }, [investigationActions, query, staticActions]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[65] flex items-start justify-center bg-black/50 pt-24">
      <div className="w-full max-w-xl rounded-lg border border-zinc-700 bg-zinc-950 p-3 shadow-2xl">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search incident or action"
          className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-blue-600"
        />
        <div className="mt-2 max-h-80 overflow-y-auto space-y-1">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.run();
                setOpen(false);
                setQuery("");
              }}
              className="w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LiveOpsProvider({ children }: LiveOpsProviderProps) {
  return (
    <ToastProvider>
      <LiveOpsEventsBridge />
      <CommandPalette />
      {children}
    </ToastProvider>
  );
}


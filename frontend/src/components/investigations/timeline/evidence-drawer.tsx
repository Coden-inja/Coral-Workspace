"use client";

import { useEffect, useState } from "react";

import type { EvidenceDrawerItem } from "@/contracts";
import { StatusBadge } from "@/components/shared/status-badge";

type EvidenceDrawerProps = {
  evidence: EvidenceDrawerItem | null;
  onClose: () => void;
};

export function EvidenceDrawer({ evidence, onClose }: EvidenceDrawerProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "telemetry" | "events" | "ai">("summary");

  useEffect(() => {
    if (!evidence) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [evidence, onClose]);

  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 transition-opacity duration-200">
      <button type="button" className="h-full flex-1 cursor-default" onClick={onClose} aria-label="Close drawer" />

      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-zinc-700 bg-zinc-950 p-4 shadow-[0_20px_48px_rgba(2,6,23,0.7)] transition-transform duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Evidence Detail</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-zinc-100">{evidence.title}</h3>
            <p className="mt-0.5 text-xs text-zinc-400">{evidence.evidenceType}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800"
          >
            Close
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge label={`Confidence ${evidence.confidence}%`} tone="info" size="sm" />
          <StatusBadge label={`Risk ${evidence.riskScore}`} tone="warning" size="sm" />
          <StatusBadge label={evidence.timestamp} tone="neutral" size="sm" />
          <StatusBadge label={evidence.entityId} tone="neutral" size="sm" />
        </div>

        <div className="mt-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {([
              ["summary", "Summary"],
              ["telemetry", "Raw Telemetry"],
              ["events", "Related Events"],
              ["ai", "AI Notes"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={[
                  "rounded-md border px-2.5 py-1 text-xs",
                  activeTab === id
                    ? "border-blue-700/70 bg-blue-950/40 text-blue-200"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "summary" ? (
            <div className="space-y-3">
              <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Detection Source</p>
                <p className="mt-1 text-sm text-zinc-200">{evidence.detectionSource}</p>
                <p className="mt-1 text-xs text-zinc-400">Connector: {evidence.sourceConnector}</p>
              </section>
              <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Summary</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{evidence.summary}</p>
              </section>
            </div>
          ) : null}

          {activeTab === "events" ? (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Related entities</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {evidence.relatedEntities.map((entity) => (
                  <span key={entity} className="rounded-md border border-zinc-800 bg-zinc-950/60 px-2 py-0.5 text-[11px] text-zinc-300">
                    {entity}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "ai" ? (
            <section className="space-y-3">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">AI reasoning summary</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{evidence.aiReasoningSummary}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Analyst notes</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-300">{evidence.analystNotes}</p>
              </div>
            </section>
          ) : null}

          {activeTab === "telemetry" ? (
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Raw Telemetry</p>
              <pre className="mt-1 max-h-[380px] overflow-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-2 text-[11px] text-zinc-300">
                {JSON.stringify(evidence.rawTelemetry, null, 2)}
              </pre>
            </section>
          ) : null}
        </div>
      </aside>
    </div>
  );
}


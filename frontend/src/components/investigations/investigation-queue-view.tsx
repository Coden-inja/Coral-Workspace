"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import type { InvestigationSummary } from "@/contracts";

type InvestigationQueueViewProps = {
  investigations: InvestigationSummary[];
};

const severityFilters = ["All", "Critical", "High", "Medium", "Low"] as const;
const statusFilters = ["All", "Investigating", "Contained", "Awaiting Analyst", "Resolved"] as const;

export function InvestigationQueueView({ investigations }: InvestigationQueueViewProps) {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<(typeof severityFilters)[number]>("All");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return investigations.filter((item) => {
      const severityMatch = severity === "All" || item.severity === severity;
      const statusMatch = status === "All" || item.status === status;
      const textMatch =
        query.length === 0 ||
        item.id.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.assignedAnalyst.toLowerCase().includes(query);
      return severityMatch && statusMatch && textMatch;
    });
  }, [investigations, search, severity, status]);

  return (
    <div className="space-y-3">
      <SectionHeader
        eyebrow="Investigation Queue"
        title="Incident Investigations"
        description="Central investigation queue with analyst ownership and live status."
      />

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by incident ID, title, or analyst"
            className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-blue-600"
            aria-label="Search investigations"
          />

          <div className="flex flex-wrap gap-1.5">
            {severityFilters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSeverity(option)}
                className={[
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  severity === option
                    ? "border-blue-700/70 bg-blue-950/40 text-blue-200"
                    : "border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900",
                ].join(" ")}
              >
                {option}
              </button>
            ))}
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof statusFilters)[number])}
            className="h-9 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-xs text-zinc-200 outline-none focus:border-blue-600"
            aria-label="Filter by status"
          >
            {statusFilters.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 overflow-hidden rounded-md border border-zinc-800">
          <div className="grid grid-cols-[1.1fr_0.6fr_0.8fr_0.8fr_0.9fr] gap-2 bg-zinc-950/80 px-3 py-2 text-[11px] uppercase tracking-[0.08em] text-zinc-500">
            <span>Incident</span>
            <span>Severity</span>
            <span>Status</span>
            <span>Updated</span>
            <span>Analyst</span>
          </div>
          <div className="divide-y divide-zinc-800 bg-zinc-950/40">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-zinc-400">Empty investigation queue state.</div>
            ) : (
              filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/investigations/${item.id}/timeline`}
                  className="grid cursor-pointer grid-cols-[1.1fr_0.6fr_0.8fr_0.8fr_0.9fr] gap-2 px-3 py-2 transition-colors hover:bg-zinc-900/70 active:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">{item.title}</p>
                    <p className="truncate text-xs text-zinc-500">{item.id}</p>
                  </div>
                  <div className="self-center">
                    <StatusBadge label={item.severity} tone={item.severityTone} size="sm" />
                  </div>
                  <div className="self-center">
                    <StatusBadge label={item.status} tone={item.statusTone} size="sm" />
                  </div>
                  <p className="self-center text-xs text-zinc-400">{item.updatedAt.replace("Updated ", "")}</p>
                  <p className="self-center text-xs text-zinc-300">{item.assignedAnalyst}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


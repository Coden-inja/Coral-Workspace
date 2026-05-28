"use client";

import type { EvidenceCardModel } from "@/components/investigations/timeline/types";
import { StatusBadge } from "@/components/shared/status-badge";
import type { StatusTone } from "@/components/shared/status-badge";

function confidenceTone(confidence: number): StatusTone {
  if (confidence >= 90) return "critical";
  if (confidence >= 80) return "warning";
  if (confidence >= 70) return "info";
  return "neutral";
}

type EvidenceCardProps = {
  evidence: EvidenceCardModel;
  onOpen?: (evidence: EvidenceCardModel) => void;
};

export function EvidenceCard({ evidence, onOpen }: EvidenceCardProps) {
  const tone = confidenceTone(evidence.confidence);

  return (
    <button
      type="button"
      onClick={() => onOpen?.(evidence)}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 text-left shadow-[0_1px_0_rgba(255,255,255,0.02)_inset] transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-100">{evidence.title}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{evidence.evidenceType}</p>
        </div>

        <div className="shrink-0">
          <StatusBadge label={`${evidence.confidence}%`} tone={tone} size="sm" />
        </div>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{evidence.summary}</p>

      <div className="mt-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded bg-zinc-900">
            <div
              className="h-1.5 rounded bg-blue-500/60"
              style={{ width: `${Math.max(0, Math.min(100, evidence.confidence))}%` }}
            />
          </div>
        </div>

        {evidence.tags && evidence.tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {evidence.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-0.5 text-[11px] text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Linked systems</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {evidence.relatedSystems.map((s) => (
              <span
                key={s}
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-0.5 text-[11px] text-zinc-300"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Linked events</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {evidence.relatedEvents.map((e) => (
              <span
                key={e}
                className="rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-0.5 text-[11px] text-zinc-300"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}


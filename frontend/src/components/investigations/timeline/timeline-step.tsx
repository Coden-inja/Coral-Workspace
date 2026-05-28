import type { InvestigationTimelineStepModel } from "@/components/investigations/timeline/types";
import { EvidenceCard } from "@/components/investigations/timeline/evidence-card";
import { AiReasoningPanel } from "@/components/investigations/timeline/ai-reasoning-panel";
import { StatusBadge } from "@/components/shared/status-badge";

const severityToneBg: Record<InvestigationTimelineStepModel["severityTone"], string> = {
  neutral: "bg-zinc-500/20",
  healthy: "bg-emerald-500/20",
  warning: "bg-amber-500/20",
  critical: "bg-red-500/20",
  info: "bg-blue-500/20",
};

const severityToneBorder: Record<InvestigationTimelineStepModel["severityTone"], string> = {
  neutral: "border-zinc-700",
  healthy: "border-emerald-800/60",
  warning: "border-amber-800/60",
  critical: "border-red-800/60",
  info: "border-blue-800/60",
};

type TimelineStepProps = {
  step: InvestigationTimelineStepModel;
  isActive?: boolean;
  isSelected?: boolean;
  isExpanded?: boolean;
  isGraphHighlighted?: boolean;
  isGraphHovered?: boolean;
  onSelect?: () => void;
  onToggleExpanded?: () => void;
  onEvidenceOpen?: (evidence: InvestigationTimelineStepModel["evidence"][number]) => void;
  onLinkedSystemOpen?: (system: string) => void;
  onLinkedEventOpen?: (eventLabel: string) => void;
};

export function TimelineStep({
  step,
  isActive = false,
  isSelected = false,
  isExpanded = false,
  isGraphHighlighted = false,
  isGraphHovered = false,
  onSelect,
  onToggleExpanded,
  onEvidenceOpen,
  onLinkedSystemOpen,
  onLinkedEventOpen,
}: TimelineStepProps) {
  return (
    <div className="relative flex gap-3">
      <div className="relative flex w-8 justify-center pt-0.5">
        <div
          className={[
            "absolute left-1/2 top-7 h-[calc(100%+10px)] w-px -translate-x-1/2",
            isActive
              ? "bg-gradient-to-b from-blue-400/60 to-zinc-700/80"
              : "bg-gradient-to-b from-zinc-700/80 to-zinc-800/90",
          ].join(" ")}
        />
        <div
          className={[
            "mt-1.5 h-7 w-7 rounded-full border bg-zinc-950/40 flex items-center justify-center",
            isActive ? "ring-1 ring-blue-400/60" : "",
            severityToneBg[step.severityTone],
            severityToneBorder[step.severityTone],
          ].join(" ")}
        >
          <span className={["font-mono text-[11px]", isActive ? "text-blue-200" : "text-zinc-100"].join(" ")}>
            {step.index}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={[
            "rounded-lg border bg-zinc-900/40 p-3 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]",
            isSelected
              ? "border-blue-700/70 bg-zinc-900/55"
              : isGraphHovered
                ? "border-blue-800/60"
                : isGraphHighlighted
                  ? "border-amber-700/60"
                  : isActive
                    ? "border-blue-800/60"
                    : "border-zinc-800",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onSelect}
            className="w-full text-left"
            aria-pressed={isSelected}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <StatusBadge label={`Step ${step.index}`} tone={step.severityTone} size="sm" />
                  <span className="font-mono text-[11px] text-zinc-500">{step.timeLabel}</span>
                </div>
                <h3 className="mt-1.5 truncate text-sm font-semibold tracking-tight text-zinc-100">
                  {step.title}
                </h3>
              </div>
              <div>
                <StatusBadge label={isExpanded ? "Expanded" : "Collapsed"} tone="neutral" size="sm" />
              </div>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{step.narrative}</p>
          </button>

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <div className="min-w-0">
              <div className="rounded-md border border-zinc-800/80 bg-zinc-950/35 p-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Linked systems</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {step.linkedSystems.map((s) => (
                    <button
                      type="button"
                      onClick={() => onLinkedSystemOpen?.(s)}
                      key={s}
                      className="cursor-pointer rounded-md border border-zinc-800 bg-zinc-950/20 px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-900"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-md border border-zinc-800/80 bg-zinc-950/35 p-2">
              <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Linked events</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {step.linkedEvents.map((e) => (
                  <button
                    type="button"
                    onClick={() => onLinkedEventOpen?.(e)}
                    key={e}
                    className="cursor-pointer rounded-md border border-zinc-800 bg-zinc-950/20 px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-900"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onToggleExpanded}
              className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-900"
            >
              {isExpanded ? "Collapse details" : "Expand details"}
            </button>
          </div>

          {isExpanded ? (
            <div className="mt-3 grid gap-2.5 transition-all">
              <div className="rounded-md border border-zinc-800/90 bg-zinc-950/30 p-2">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Evidence correlation</p>
                <div className="mt-1.5 grid gap-1.5 md:grid-cols-2">
                  {step.evidence.map((ev) => (
                    <EvidenceCard key={ev.id} evidence={ev} onOpen={onEvidenceOpen} />
                  ))}
                </div>
              </div>

              <AiReasoningPanel steps={step.aiReasoning} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


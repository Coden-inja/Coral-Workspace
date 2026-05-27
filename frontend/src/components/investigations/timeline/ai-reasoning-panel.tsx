import type { AiReasoningStepModel } from "@/components/investigations/timeline/types";
import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";

type AiReasoningPanelProps = {
  steps: AiReasoningStepModel[];
};

export function AiReasoningPanel({ steps }: AiReasoningPanelProps) {
  return (
    <Panel
      title="AI-Generated Reasoning"
      description="Mock model rationale and confidence for investigation steps."
      padding="sm"
      className="border-blue-900/50 bg-blue-950/10"
    >
      <div className="space-y-1.5">
        {steps.map((step) => (
          <div
            key={step.id}
            className="rounded-lg border border-blue-900/40 bg-zinc-950/70 p-2.5 shadow-[0_1px_0_rgba(147,197,253,0.08)_inset]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">{step.stepLabel}</p>
                <p className="mt-0.5 text-sm font-medium text-zinc-100">{step.hypothesis}</p>
              </div>
              <div className="shrink-0">
                <StatusBadge
                  label={`Confidence ${step.confidence}%`}
                  tone={step.confidenceTone}
                  size="sm"
                  className="whitespace-nowrap border-blue-800/60"
                />
              </div>
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{step.modelRationale}</p>

            <div className="mt-1.5">
              <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Sources</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {step.sources.map((src) => (
                  <span
                    key={src}
                    className="rounded-md border border-zinc-800 bg-zinc-950/30 px-2 py-0.5 text-[11px] text-zinc-300"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}


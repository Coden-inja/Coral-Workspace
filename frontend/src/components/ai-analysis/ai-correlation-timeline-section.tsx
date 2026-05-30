import type { AiCorrelationEvent } from "@/contracts/ai-analysis";

import { aiPageInnerCardClass, aiPagePanelClass } from "@/components/ai-analysis/styles";
import { Panel } from "@/components/shared/panel";

type AiCorrelationTimelineSectionProps = {
  events: AiCorrelationEvent[];
};

export function AiCorrelationTimelineSection({ events }: AiCorrelationTimelineSectionProps) {
  return (
    <Panel
      title="Correlation Timeline"
      description="Cross-source event sequence with AI confidence and reasoning."
      padding="sm"
      className={aiPagePanelClass}
    >
      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            <div className="relative flex w-8 shrink-0 justify-center">
              {index < events.length - 1 ? (
                <div className="absolute left-1/2 top-4 h-[calc(100%+8px)] w-px -translate-x-1/2 bg-blue-500/45" />
              ) : null}
              <div className="relative z-10 mt-1 h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]" />
            </div>

            <div className={[aiPageInnerCardClass, "min-w-0 flex-1 border-zinc-700 p-4"].join(" ")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-base font-semibold text-zinc-100">{event.title}</h3>
                <span className="font-mono text-[11px] text-zinc-500">{event.timestamp}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Confidence <span className="font-bold text-zinc-400">{event.confidencePercent}%</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{event.reasoningNote}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

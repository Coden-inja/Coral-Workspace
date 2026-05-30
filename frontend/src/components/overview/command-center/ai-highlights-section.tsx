import type { AiHighlight } from "@/contracts/command-center";

import { Panel } from "@/components/shared/panel";

type AiHighlightsSectionProps = {
  highlights: AiHighlight[];
};

export function AiHighlightsSection({ highlights }: AiHighlightsSectionProps) {
  return (
    <Panel title="AI Analysis" description="Unified operational signals from Coral analysis." padding="sm">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="grid divide-y divide-zinc-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="px-5 py-4">
              <p className="text-sm font-medium text-zinc-300">{highlight.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{highlight.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

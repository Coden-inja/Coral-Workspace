import type { ContainmentRecommendationModel } from "@/components/investigations/timeline/types";
import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";

type ContainmentRecommendationsProps = {
  items: ContainmentRecommendationModel[];
};

export function ContainmentRecommendations({ items }: ContainmentRecommendationsProps) {
  return (
    <Panel
      title="Containment Recommendations"
      description="Staged actions to limit blast radius while preserving evidence telemetry."
      padding="sm"
      className="h-full border-zinc-700/90 bg-zinc-900/75"
    >
      <div className="space-y-1.5">
        {items.map((rec) => (
          <div
            key={rec.id}
            className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{rec.title}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{rec.action}</p>
              </div>
              <StatusBadge label={rec.status} tone={rec.tone} size="sm" />
            </div>

            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Owner</p>
                <p className="mt-1 text-xs text-zinc-300">{rec.owner}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Due</p>
                <p className="mt-1 text-xs text-zinc-300">{rec.dueIn}</p>
              </div>
            </div>

            <p className="mt-2 text-xs text-zinc-500">Impact: {rec.impact}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}


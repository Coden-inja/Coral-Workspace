import { Check } from "lucide-react";

import type { AiRecommendedAction } from "@/contracts/ai-analysis";

import { aiPageInnerCardClass, aiPagePanelClass } from "@/components/ai-analysis/styles";
import { Panel } from "@/components/shared/panel";

type AiRecommendedActionsSectionProps = {
  actions: AiRecommendedAction[];
};

export function AiRecommendedActionsSection({ actions }: AiRecommendedActionsSectionProps) {
  return (
    <Panel
      title="Recommended Actions"
      description="Response checklist prioritized by AI correlation confidence."
      padding="sm"
      className={aiPagePanelClass}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <div
            key={action.id}
            className={[
              aiPageInnerCardClass,
              "flex cursor-pointer items-center gap-3 p-3.5 transition-colors",
              "hover:border-zinc-600 hover:bg-zinc-800/70",
            ].join(" ")}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/90">
              <Check className="h-3 w-3 text-zinc-400" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-zinc-200">{action.label}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

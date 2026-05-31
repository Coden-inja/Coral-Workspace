import Link from "next/link";

import type { AiRelatedInvestigation } from "@/contracts/ai-analysis";

import { aiPageInnerCardClass, aiPagePanelClass } from "@/components/ai-analysis/styles";
import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";

type AiRelatedInvestigationsSectionProps = {
  investigations: AiRelatedInvestigation[];
};

export function AiRelatedInvestigationsSection({ investigations }: AiRelatedInvestigationsSectionProps) {
  return (
    <Panel
      title="Related Investigations"
      description="Linked incidents for deeper timeline review."
      padding="sm"
      className={aiPagePanelClass}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {investigations.map((investigation) => (
          <Link
            key={investigation.id}
            href={`/investigations/${investigation.id}/timeline`}
            className={[
              aiPageInnerCardClass,
              "group block p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-800/70",
            ].join(" ")}
          >
            <p className="font-mono text-base font-semibold text-zinc-200 group-hover:text-zinc-50">{investigation.id}</p>
            <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{investigation.title}</p>
            <div className="mt-3">
              <StatusBadge label={investigation.severity} tone={investigation.severityTone} size="sm" />
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}

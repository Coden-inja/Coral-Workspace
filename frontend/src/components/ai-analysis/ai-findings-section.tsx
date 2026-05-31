import type { AiFindingCard } from "@/contracts/ai-analysis";

import { aiPageInnerCardClass, aiPagePanelClass } from "@/components/ai-analysis/styles";
import { Panel } from "@/components/shared/panel";

type AiFindingsSectionProps = {
  findings: AiFindingCard[];
};

const FINDING_ACCENT: Record<string, string> = {
  "high-risk-signal": "border-l-[3px] border-l-red-500/70",
  "deployment-risk": "border-l-[3px] border-l-amber-500/65",
  "lateral-movement": "border-l-[3px] border-l-violet-500/65",
  "repository-exposure": "border-l-[3px] border-l-blue-500/70",
};

export function AiFindingsSection({ findings }: AiFindingsSectionProps) {
  return (
    <Panel
      title="AI Findings"
      description="Prioritized signals from correlated operational telemetry."
      padding="sm"
      className={aiPagePanelClass}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {findings.map((finding) => (
          <div
            key={finding.id}
            className={[
              aiPageInnerCardClass,
              FINDING_ACCENT[finding.id] ?? "border-l-[3px] border-l-zinc-600",
              "p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-800/70",
            ].join(" ")}
          >
            <p className="text-base font-semibold text-zinc-100">{finding.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{finding.description}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

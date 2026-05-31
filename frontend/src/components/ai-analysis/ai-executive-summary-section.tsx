import type { AiExecutiveSummary } from "@/contracts/ai-analysis";

import { aiPageCardClass } from "@/components/ai-analysis/styles";
import { StatusBadge } from "@/components/shared/status-badge";

type AiExecutiveSummarySectionProps = {
  summary: AiExecutiveSummary;
};

export function AiExecutiveSummarySection({ summary }: AiExecutiveSummarySectionProps) {
  return (
    <section className={[aiPageCardClass, "p-6 lg:p-8"].join(" ")}>
      <p className="text-sm font-medium text-zinc-500">Executive Summary</p>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Incident</p>
            <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-50">{summary.incidentTitle}</p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Severity</dt>
              <dd className="mt-1.5">
                <StatusBadge label={summary.severity} tone={summary.severityTone} size="sm" />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Confidence</dt>
              <dd className="mt-1.5 text-4xl font-bold tracking-tight text-zinc-50">{summary.confidencePercent}%</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Status</dt>
              <dd className="mt-1.5">
                <StatusBadge label={summary.status} tone={summary.statusTone} size="sm" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-zinc-700 border-l-[3px] border-l-blue-500/55 bg-zinc-900/95 p-6 shadow-[0_4px_14px_rgba(0,0,0,0.3)]">
          <p className="text-lg font-semibold text-zinc-100">AI Summary</p>
          <p className="mt-4 text-sm leading-7 text-zinc-300">{summary.summary}</p>
        </div>
      </div>
    </section>
  );
}

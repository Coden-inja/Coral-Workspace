"use client";

import { useEffect, useState } from "react";

import type { AiConfidenceMetric } from "@/contracts/ai-analysis";

import { aiPagePanelClass } from "@/components/ai-analysis/styles";
import { Panel } from "@/components/shared/panel";

type AiConfidenceBreakdownSectionProps = {
  metrics: AiConfidenceMetric[];
};

const METRIC_FILL: Record<string, string> = {
  identity: "bg-blue-500/70",
  cloud: "bg-cyan-500/70",
  repository: "bg-slate-500/75",
  containment: "bg-emerald-500/70",
};

function ConfidenceBar({ metricId, percent }: { metricId: string; percent: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(percent));
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return (
    <div className="h-3.5 overflow-hidden rounded-full bg-zinc-800">
      <div
        className={[
          "h-full rounded-full transition-[width] duration-700 ease-out",
          METRIC_FILL[metricId] ?? "bg-slate-500/70",
        ].join(" ")}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function AiConfidenceBreakdownSection({ metrics }: AiConfidenceBreakdownSectionProps) {
  return (
    <Panel
      title="AI Confidence Breakdown"
      description="Model confidence across correlated signal domains."
      padding="sm"
      className={aiPagePanelClass}
    >
      <div className="space-y-5">
        {metrics.map((metric) => (
          <div key={metric.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-zinc-300">{metric.label}</p>
              <p className="text-sm font-bold tabular-nums text-zinc-100">{metric.percent}%</p>
            </div>
            <ConfidenceBar metricId={metric.id} percent={metric.percent} />
          </div>
        ))}
      </div>
    </Panel>
  );
}

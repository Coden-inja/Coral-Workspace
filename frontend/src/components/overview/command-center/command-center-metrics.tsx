import type { CommandCenterMetric } from "@/contracts/command-center";

import { MetricCard } from "@/components/shared/metric-card";

type CommandCenterMetricsProps = {
  metrics: CommandCenterMetric[];
};

export function CommandCenterMetrics({ metrics }: CommandCenterMetricsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          trend={metric.trend}
          delta={metric.delta}
          statusLabel={metric.statusLabel}
          statusTone={metric.statusTone}
          hint={metric.hint}
        />
      ))}
    </div>
  );
}

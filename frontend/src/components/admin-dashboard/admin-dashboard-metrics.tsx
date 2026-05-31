import type { AdminDashboardMetric } from "@/contracts/admin-dashboard";

import { adminCardSurfaceClass } from "@/components/admin-dashboard/styles";
import { MetricCard } from "@/components/shared/metric-card";

type AdminDashboardMetricsProps = {
  metrics: AdminDashboardMetric[];
};

export function AdminDashboardMetrics({ metrics }: AdminDashboardMetricsProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          statusLabel={metric.statusLabel}
          statusTone={metric.statusTone}
          hint={metric.hint}
          className={[adminCardSurfaceClass, "p-4"].join(" ")}
        />
      ))}
    </div>
  );
}

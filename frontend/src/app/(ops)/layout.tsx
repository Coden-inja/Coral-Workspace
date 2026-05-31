import type { ReactNode } from "react";

import { OpsRouteGuard } from "@/components/auth/ops-route-guard";
import { LiveOpsProvider } from "@/components/ops/live-ops-provider";
import { OpsDashboardShell } from "@/components/shell/ops-dashboard-shell";
import type { TopbarMetric } from "@/components/shell/topbar";
import { getRecentAlerts } from "@/services/api";

type OpsLayoutProps = {
  children: ReactNode;
};

export default async function OpsLayout({ children }: OpsLayoutProps) {
  const alerts = await getRecentAlerts();
  const metrics: TopbarMetric[] = alerts.map((alert) => ({
    id: alert.id,
    label: alert.label,
    value: alert.value,
    tone: alert.tone === "healthy" || alert.tone === "warning" || alert.tone === "critical"
      ? alert.tone
      : "default",
  }));

  return (
    <OpsRouteGuard>
      <OpsDashboardShell
        workspaceName="CoralTeams SOC"
        topbarTitle="CoralTeams Investigation Operations"
        environment="Production"
        metrics={metrics}
      >
        <LiveOpsProvider>{children}</LiveOpsProvider>
      </OpsDashboardShell>
    </OpsRouteGuard>
  );
}


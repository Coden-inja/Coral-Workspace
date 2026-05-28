import type { ReactNode } from "react";

import { DashboardShell } from "@/components/shell/dashboard-shell";
import { LiveOpsProvider } from "@/components/ops/live-ops-provider";
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
    <DashboardShell
      workspaceName="CoralOps SOC"
      topbarTitle="CoralOps Investigation Operations"
      environment="Production"
      metrics={metrics}
    >
      <LiveOpsProvider>{children}</LiveOpsProvider>
    </DashboardShell>
  );
}


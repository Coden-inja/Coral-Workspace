import { OverviewDashboardRouter } from "@/components/overview/overview-dashboard-router";
import { getAdminDashboardSnapshot, getCommandCenterSnapshot, getInvestigations } from "@/services/api";

export default async function OverviewPage() {
  const [adminSnapshot, commandSnapshot, incidents] = await Promise.all([
    getAdminDashboardSnapshot(),
    getCommandCenterSnapshot(),
    getInvestigations(),
  ]);

  return (
    <OverviewDashboardRouter
      adminSnapshot={adminSnapshot}
      commandSnapshot={commandSnapshot}
      incidents={incidents}
    />
  );
}

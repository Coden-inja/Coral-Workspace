import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { getInvestigations, getRecentAlerts } from "@/services/api";

export default async function OverviewPage() {
  const [alerts, incidents] = await Promise.all([getRecentAlerts(), getInvestigations()]);
  return <OverviewDashboard alerts={alerts} incidents={incidents} />;
}


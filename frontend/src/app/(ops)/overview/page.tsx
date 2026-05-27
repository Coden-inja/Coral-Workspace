import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { fetchInvestigationSummaries, fetchRecentAlerts } from "@/lib/services/investigation-service";

export default async function OverviewPage() {
  const [alerts, incidents] = await Promise.all([fetchRecentAlerts(), fetchInvestigationSummaries()]);
  return <OverviewDashboard alerts={alerts} incidents={incidents} />;
}


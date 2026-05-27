import { InvestigationQueueView } from "@/components/investigations/investigation-queue-view";
import { fetchInvestigationSummaries } from "@/lib/services/investigation-service";

export default async function InvestigationsPage() {
  const investigations = await fetchInvestigationSummaries();
  return <InvestigationQueueView investigations={investigations} />;
}


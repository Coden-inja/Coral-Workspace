import { InvestigationQueueView } from "@/components/investigations/investigation-queue-view";
import { getInvestigations } from "@/services/api";

export default async function InvestigationsPage() {
  const investigations = await getInvestigations();
  return <InvestigationQueueView investigations={investigations} />;
}


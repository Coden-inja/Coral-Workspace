import { getInvestigationById } from "@/lib/mock-data";
import type { InvestigationModel } from "@/components/investigations/timeline/types";

export function getMockInvestigation(incidentId?: string | null): InvestigationModel {
  return getInvestigationById(incidentId);
}


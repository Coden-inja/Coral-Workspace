import type { Investigation, InvestigationSummary, RecentAlert, TimelineStep } from "@/contracts";
import { getMockInvestigationById, getMockInvestigations, getMockRecentAlerts, getMockTimeline } from "@/services/mock/investigations";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInvestigations(): Promise<InvestigationSummary[]> {
  await delay(250);
  return getMockInvestigations();
}

export async function getInvestigationById(incidentId?: string): Promise<Investigation> {
  await delay(320);
  if (incidentId?.toUpperCase() === "INC-FAIL") {
    throw new Error("Graph query failure while loading investigation.");
  }
  return getMockInvestigationById(incidentId);
}

export async function getTimeline(incidentId?: string): Promise<TimelineStep[]> {
  await delay(180);
  return getMockTimeline(incidentId);
}

export async function getRecentAlerts(): Promise<RecentAlert[]> {
  await delay(180);
  return getMockRecentAlerts();
}

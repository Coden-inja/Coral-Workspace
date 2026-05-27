import { getAllInvestigations, getInvestigationById, getRecentAlerts } from "@/lib/mock-data";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchInvestigationSummaries() {
  await delay(250);
  return getAllInvestigations();
}

export async function fetchRecentAlerts() {
  await delay(180);
  return getRecentAlerts();
}

export async function fetchInvestigationDetail(incidentId?: string) {
  await delay(320);
  if (incidentId?.toUpperCase() === "INC-FAIL") {
    throw new Error("Graph query failure while loading investigation.");
  }
  return getInvestigationById(incidentId);
}


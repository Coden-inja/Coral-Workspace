import type { AdminDashboardSnapshot } from "@/contracts/admin-dashboard";
import { getMockAdminDashboardSnapshot } from "@/services/mock/admin-dashboard";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  await delay(200);
  return getMockAdminDashboardSnapshot();
}

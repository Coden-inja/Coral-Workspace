import type { SettingsPageSnapshot } from "@/contracts/settings";
import { getMockSettingsPageSnapshot } from "@/services/mock/settings";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getSettingsPageSnapshot(): Promise<SettingsPageSnapshot> {
  await delay(200);
  return getMockSettingsPageSnapshot();
}

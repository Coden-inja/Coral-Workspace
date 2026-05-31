import type { CommandCenterSnapshot } from "@/contracts/command-center";
import { getMockCommandCenterSnapshot } from "@/services/mock/command-center";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getCommandCenterSnapshot(): Promise<CommandCenterSnapshot> {
  await delay(200);
  return getMockCommandCenterSnapshot();
}

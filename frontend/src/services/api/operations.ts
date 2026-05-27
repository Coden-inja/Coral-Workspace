import type { AgentRuntime, ConnectorStatus } from "@/contracts";
import { initialMockAgentRuntime, initialMockConnectorStatus } from "@/services/mock/operations";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getConnectorStatus(): Promise<ConnectorStatus[]> {
  await delay(140);
  return initialMockConnectorStatus;
}

export async function getAgentRuntime(): Promise<AgentRuntime[]> {
  await delay(140);
  return initialMockAgentRuntime;
}

import type { AgentRuntime, ConnectorStatus } from "@/contracts";

export const initialMockAgentRuntime: AgentRuntime[] = [
  { id: "task-1", model: "Coral-Agent-Sigma", progress: 42, confidence: 81, state: "running" },
  { id: "task-2", model: "Coral-Agent-Delta", progress: 10, confidence: 70, state: "queued" },
  { id: "task-3", model: "Coral-Agent-Orion", progress: 88, confidence: 92, state: "running" },
];

export const initialMockConnectorStatus: ConnectorStatus[] = [
  { id: "okta-connector", status: "healthy", latencyMs: 54, ingestionPerMin: 3200 },
  { id: "aws-cloudtrail-connector", status: "healthy", latencyMs: 38, ingestionPerMin: 9400 },
  { id: "github-enterprise-connector", status: "degraded", latencyMs: 120, ingestionPerMin: 1800 },
  { id: "slack-enterprise-connector", status: "healthy", latencyMs: 70, ingestionPerMin: 2400 },
];

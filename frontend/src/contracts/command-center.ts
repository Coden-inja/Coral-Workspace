import type { StatusTone } from "@/types/common";

export type CommandCenterMetric = {
  id: string;
  label: string;
  value: string;
  trend: "up" | "down" | "flat";
  delta: string;
  statusLabel: string;
  statusTone: StatusTone;
  hint?: string;
};

export type ActivitySource = "github" | "slack" | "sentry" | "investigation";

export type LiveActivityEvent = {
  id: string;
  source: ActivitySource;
  message: string;
  timeLabel: string;
  tone: StatusTone;
};

export type AiHighlight = {
  id: string;
  title: string;
  summary: string;
  tone: StatusTone;
};

export type IntegrationHealthItem = {
  id: string;
  name: string;
  connectionStatus: "Connected" | "Degraded" | "Offline";
  healthStatus: "Healthy" | "Warning" | "Critical";
  lastSync: string;
  connectionTone: StatusTone;
  healthTone: StatusTone;
};

export type CommandCenterSnapshot = {
  metrics: CommandCenterMetric[];
  activities: LiveActivityEvent[];
  aiHighlights: AiHighlight[];
  integrations: IntegrationHealthItem[];
};

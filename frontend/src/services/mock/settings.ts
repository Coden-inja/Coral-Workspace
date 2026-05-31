import type { SettingsPageSnapshot } from "@/contracts/settings";
import type { StatusTone } from "@/types/common";

const tone = {
  neutral: "neutral",
  healthy: "healthy",
  warning: "warning",
  critical: "critical",
  info: "info",
} satisfies Record<string, StatusTone>;

export function getMockSettingsPageSnapshot(): SettingsPageSnapshot {
  return {
    integrations: [
      {
        id: "github",
        name: "GitHub",
        connectionStatus: "Connected",
        healthStatus: "Healthy",
        healthTone: tone.healthy,
        lastSync: "38s ago",
      },
      {
        id: "slack",
        name: "Slack",
        connectionStatus: "Connected",
        healthStatus: "Healthy",
        healthTone: tone.healthy,
        lastSync: "52s ago",
      },
      {
        id: "sentry",
        name: "Sentry",
        connectionStatus: "Connected",
        healthStatus: "Warning",
        healthTone: tone.warning,
        lastSync: "1m ago",
      },
      {
        id: "aws",
        name: "AWS",
        connectionStatus: "Connected",
        healthStatus: "Healthy",
        healthTone: tone.healthy,
        lastSync: "44s ago",
      },
    ],
    systemHealth: [
      { id: "api", label: "API Status", status: "Operational", statusTone: tone.healthy },
      { id: "websocket", label: "WebSocket Status", status: "Operational", statusTone: tone.healthy },
      { id: "database", label: "Database Status", status: "Operational", statusTone: tone.healthy },
      { id: "ai", label: "AI Service Status", status: "Degraded", statusTone: tone.warning },
    ],
    platform: {
      version: "v0.8.4",
      environment: "Production",
      lastDeployment: "2026-05-26 14:32 UTC",
    },
  };
}

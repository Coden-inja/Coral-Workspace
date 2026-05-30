import type { StatusTone } from "@/types/common";

export type SettingsIntegration = {
  id: string;
  name: string;
  connectionStatus: "Connected" | "Degraded" | "Offline";
  healthStatus: string;
  healthTone: StatusTone;
  lastSync: string;
};

export type SystemHealthItem = {
  id: string;
  label: string;
  status: string;
  statusTone: StatusTone;
};

export type PlatformInformation = {
  version: string;
  environment: string;
  lastDeployment: string;
};

export type SettingsPageSnapshot = {
  integrations: SettingsIntegration[];
  systemHealth: SystemHealthItem[];
  platform: PlatformInformation;
};

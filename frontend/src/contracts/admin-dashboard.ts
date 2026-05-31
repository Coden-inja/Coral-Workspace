import type { UserRole } from "@/contracts/auth";
import type { InvestigationStatus, SeverityLevel, StatusTone } from "@/types/common";

export type AdminDashboardMetric = {
  id: string;
  label: string;
  value: string;
  statusLabel?: string;
  statusTone?: StatusTone;
  hint?: string;
};

export type AdminRecentIncident = {
  id: string;
  severity: SeverityLevel;
  severityTone: StatusTone;
  source: string;
  status: InvestigationStatus;
  statusTone: StatusTone;
  assignedAnalyst: string;
};

export type AdminIntegrationHealth = {
  id: string;
  name: string;
  connectionStatus: "Connected" | "Degraded" | "Offline";
  lastSync: string;
  healthStatus: string;
  healthTone: StatusTone;
};

export type AdminUserPreview = {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  status: "Active" | "Invited" | "Suspended";
  statusTone: StatusTone;
};

export type AdminActivitySource = "github" | "slack" | "investigation" | "ai";

export type AdminActivityEvent = {
  id: string;
  source: AdminActivitySource;
  message: string;
  timeLabel: string;
};

export type AdminDashboardSnapshot = {
  metrics: AdminDashboardMetric[];
  recentIncidents: AdminRecentIncident[];
  integrations: AdminIntegrationHealth[];
  users: AdminUserPreview[];
  activities: AdminActivityEvent[];
};

export const SEVERITY_LEVELS = ["Critical", "High", "Medium", "Low"] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const INVESTIGATION_STATUSES = ["Investigating", "Contained", "Awaiting Analyst", "Resolved"] as const;
export type InvestigationStatus = (typeof INVESTIGATION_STATUSES)[number];

export const CONNECTOR_STATES = ["healthy", "degraded", "offline"] as const;
export type ConnectorState = (typeof CONNECTOR_STATES)[number];

export const STATUS_TONES = ["neutral", "healthy", "warning", "critical", "info"] as const;
export type StatusTone = (typeof STATUS_TONES)[number];

export const AGENT_TASK_STATES = ["running", "queued", "completed"] as const;
export type AgentTaskState = (typeof AGENT_TASK_STATES)[number];

export const TOAST_TONES = ["info", "warning", "critical", "success"] as const;
export type ToastTone = (typeof TOAST_TONES)[number];

export const OPS_EVENT_TYPES = [
  "alert_update",
  "incident_status",
  "investigation_step",
  "analyst_activity",
  "connector_status",
  "escalation",
  "containment_completed",
] as const;
export type OpsEventType = (typeof OPS_EVENT_TYPES)[number];

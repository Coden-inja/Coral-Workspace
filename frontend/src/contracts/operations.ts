import type { AgentTaskState, ConnectorState, InvestigationStatus, StatusTone, ToastTone } from "@/types/common";

export type ConnectorStatus = {
  id: string;
  status: ConnectorState;
  latencyMs: number;
  ingestionPerMin: number;
};

export type AgentRuntime = {
  id: string;
  model: string;
  progress: number;
  confidence: number;
  state: AgentTaskState;
};

export type ToastEvent = {
  title: string;
  message: string;
  tone: ToastTone;
};

export type WebsocketOpsEvent =
  | { type: "alert_update"; alertId: string; value: string; severity: "info" | "warning" | "critical" }
  | { type: "incident_status"; incidentId: string; status: InvestigationStatus }
  | { type: "investigation_step"; incidentId: string; stepId: string }
  | { type: "analyst_activity"; incidentId: string; actor: string; message: string; tone: StatusTone }
  | { type: "connector_status"; connector: string; status: ConnectorState; latencyMs: number; ingestionPerMin: number }
  | { type: "escalation"; incidentId: string; message: string }
  | { type: "containment_completed"; incidentId: string; message: string };

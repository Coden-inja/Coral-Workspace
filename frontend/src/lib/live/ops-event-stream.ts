export type OpsEvent =
  | { type: "alert_update"; alertId: string; value: string; severity: "info" | "warning" | "critical" }
  | { type: "incident_status"; incidentId: string; status: "Investigating" | "Contained" | "Awaiting Analyst" | "Resolved" }
  | { type: "investigation_step"; incidentId: string; stepId: string }
  | { type: "analyst_activity"; incidentId: string; actor: string; message: string; tone: "info" | "warning" | "critical" | "healthy" }
  | { type: "connector_status"; connector: string; status: "healthy" | "degraded" | "offline"; latencyMs: number; ingestionPerMin: number }
  | { type: "escalation"; incidentId: string; message: string }
  | { type: "containment_completed"; incidentId: string; message: string };

const incidentIds = ["INC-1042", "INC-1038", "INC-1032"];
const stepIds = ["step-1", "step-2", "step-3", "step-4", "step-5", "step-6"];
const connectors = ["okta-connector", "aws-cloudtrail-connector", "github-enterprise-connector", "slack-enterprise-connector"];
const actors = ["Analyst Lin", "Agent Sigma", "Agent Delta", "Automation Runtime"];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

function makeEvent(): OpsEvent {
  const roll = Math.random();
  if (roll < 0.2) {
    return {
      type: "alert_update",
      alertId: `a${1 + Math.floor(Math.random() * 4)}`,
      value: `${1 + Math.floor(Math.random() * 12)}`,
      severity: randomItem(["info", "warning", "critical"]),
    };
  }
  if (roll < 0.4) {
    return {
      type: "incident_status",
      incidentId: randomItem(incidentIds),
      status: randomItem(["Investigating", "Contained", "Awaiting Analyst", "Resolved"]),
    };
  }
  if (roll < 0.6) {
    return {
      type: "analyst_activity",
      incidentId: randomItem(incidentIds),
      actor: randomItem(actors),
      message: randomItem([
        "Correlated telemetry enrichment completed.",
        "Pivoted identity evidence into cloud escalation path.",
        "Containment package reviewed and staged.",
        "Connector lag detected and flagged.",
      ]),
      tone: randomItem(["info", "warning", "critical", "healthy"]),
    };
  }
  if (roll < 0.75) {
    return {
      type: "investigation_step",
      incidentId: randomItem(incidentIds),
      stepId: randomItem(stepIds),
    };
  }
  if (roll < 0.9) {
    return {
      type: "connector_status",
      connector: randomItem(connectors),
      status: randomItem(["healthy", "degraded", "offline"]),
      latencyMs: 30 + Math.floor(Math.random() * 260),
      ingestionPerMin: 600 + Math.floor(Math.random() * 12000),
    };
  }
  return Math.random() > 0.5
    ? { type: "escalation", incidentId: randomItem(incidentIds), message: "Privilege escalation risk increased." }
    : { type: "containment_completed", incidentId: randomItem(incidentIds), message: "Containment action completed." };
}

export function subscribeToMockOpsEvents(
  callback: (event: OpsEvent) => void,
  intervalMs = 3500,
): () => void {
  const interval = window.setInterval(() => {
    callback(makeEvent());
  }, intervalMs);
  return () => window.clearInterval(interval);
}


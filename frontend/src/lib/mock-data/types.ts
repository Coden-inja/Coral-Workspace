import type { StatusTone } from "@/components/shared/status-badge";

export type InvestigationSummary = {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  severityTone: StatusTone;
  status: "Investigating" | "Contained" | "Awaiting Analyst" | "Resolved";
  statusTone: StatusTone;
  shortDescription: string;
  updatedAt: string;
  assignedAnalyst: string;
};

export type RecentAlert = {
  id: string;
  label: string;
  value: string;
  tone: StatusTone;
  updatedAt: string;
};

export type EvidenceCardModel = {
  id: string;
  title: string;
  evidenceType: string;
  confidence: number;
  riskScore: number;
  summary: string;
  relatedSystems: string[];
  relatedEvents: string[];
  relatedEntities: string[];
  tags?: string[];
  timestamp: string;
  entityId: string;
  detectionSource: string;
  sourceConnector: string;
  analystNotes: string;
  aiReasoningSummary: string;
  rawTelemetry: Record<string, unknown>;
};

export type AiReasoningStepModel = {
  id: string;
  stepLabel: string;
  hypothesis: string;
  modelRationale: string;
  confidence: number;
  confidenceTone: StatusTone;
  sources: string[];
};

export type InvestigationTimelineStepModel = {
  id: string;
  index: number;
  timeLabel: string;
  title: string;
  narrative: string;
  severityTone: StatusTone;
  linkedSystems: string[];
  linkedEvents: string[];
  evidence: EvidenceCardModel[];
  aiReasoning: AiReasoningStepModel[];
};

export type ContainmentRecommendationModel = {
  id: string;
  title: string;
  action: string;
  owner: string;
  dueIn: string;
  impact: string;
  status: string;
  tone: StatusTone;
};

export type AnalystActivityModel = {
  id: string;
  actor: string;
  activity: string;
  timeLabel: string;
  tone: StatusTone;
};

export type AttackChainNodeModel = {
  id: string;
  label: string;
  tone: StatusTone;
  kind: "identity" | "endpoint" | "cloud-role" | "repository" | "slack-channel" | "connector";
  x: number;
  y: number;
  relatedStepIds: string[];
  relatedEvidenceId?: string;
};

export type AttackChainEdgeModel = {
  id: string;
  fromId: string;
  toId: string;
  label:
    | "login activity"
    | "escalation"
    | "token reuse"
    | "code push"
    | "communication linkage";
};

export type EvidenceDrawerItem = {
  id: string;
  title: string;
  timestamp: string;
  riskScore: number;
  sourceConnector: string;
  relatedEntities: string[];
  analystNotes: string;
  aiReasoningSummary: string;
  rawTelemetry: Record<string, unknown>;
  confidence: number;
  detectionSource: string;
  entityId: string;
  evidenceType: string;
  summary: string;
};

export type InvestigationDetail = {
  id: string;
  title: string;
  summary: string;
  overallStatus: string;
  overallTone: StatusTone;
  startedAt: string;
  updatedAt: string;
  timeline: InvestigationTimelineStepModel[];
  attackChain: {
    nodes: AttackChainNodeModel[];
    edges: AttackChainEdgeModel[];
  };
  containment: ContainmentRecommendationModel[];
  analystActivity: AnalystActivityModel[];
};


import type { InvestigationStatus, SeverityLevel, StatusTone } from "@/types/common";

export type InvestigationSummary = {
  id: string;
  title: string;
  severity: SeverityLevel;
  severityTone: StatusTone;
  status: InvestigationStatus;
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

export type Evidence = {
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

export type AiReasoningStep = {
  id: string;
  stepLabel: string;
  hypothesis: string;
  modelRationale: string;
  confidence: number;
  confidenceTone: StatusTone;
  sources: string[];
};

export type TimelineStep = {
  id: string;
  index: number;
  timeLabel: string;
  title: string;
  narrative: string;
  severityTone: StatusTone;
  linkedSystems: string[];
  linkedEvents: string[];
  evidence: Evidence[];
  aiReasoning: AiReasoningStep[];
};

export type GraphNode = {
  id: string;
  label: string;
  tone: StatusTone;
  kind: "identity" | "endpoint" | "cloud-role" | "repository" | "slack-channel" | "connector";
  x: number;
  y: number;
  relatedStepIds: string[];
  relatedEvidenceId?: string;
};

export type GraphEdge = {
  id: string;
  fromId: string;
  toId: string;
  label: "login activity" | "escalation" | "token reuse" | "code push" | "communication linkage";
};

export type ContainmentRecommendation = {
  id: string;
  title: string;
  action: string;
  owner: string;
  dueIn: string;
  impact: string;
  status: string;
  tone: StatusTone;
};

export type AnalystEvent = {
  id: string;
  actor: string;
  activity: string;
  timeLabel: string;
  tone: StatusTone;
};

export type Investigation = {
  id: string;
  title: string;
  summary: string;
  overallStatus: InvestigationStatus;
  overallTone: StatusTone;
  startedAt: string;
  updatedAt: string;
  timeline: TimelineStep[];
  attackChain: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  containment: ContainmentRecommendation[];
  analystActivity: AnalystEvent[];
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

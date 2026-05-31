import type { StatusTone } from "@/types/common";

export type AiExecutiveSummary = {
  incidentTitle: string;
  severity: string;
  severityTone: StatusTone;
  confidencePercent: number;
  status: string;
  statusTone: StatusTone;
  summary: string;
};

export type AiRootCauseCard = {
  id: string;
  title: string;
  lines: string[];
};

export type AiCorrelationEvent = {
  id: string;
  title: string;
  timestamp: string;
  confidencePercent: number;
  reasoningNote: string;
};

export type AiFindingCard = {
  id: string;
  title: string;
  description: string;
};

export type AiRecommendedAction = {
  id: string;
  label: string;
};

export type AiConfidenceMetric = {
  id: string;
  label: string;
  percent: number;
};

export type AiRelatedInvestigation = {
  id: string;
  title: string;
  severity: string;
  severityTone: StatusTone;
};

export type AiAnalysisSnapshot = {
  executiveSummary: AiExecutiveSummary;
  rootCauseAnalysis: AiRootCauseCard[];
  correlationTimeline: AiCorrelationEvent[];
  findings: AiFindingCard[];
  recommendedActions: AiRecommendedAction[];
  confidenceBreakdown: AiConfidenceMetric[];
  relatedInvestigations: AiRelatedInvestigation[];
};

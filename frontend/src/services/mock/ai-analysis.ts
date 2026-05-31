import type { AiAnalysisSnapshot } from "@/contracts/ai-analysis";
import type { StatusTone } from "@/types/common";

const tone = {
  neutral: "neutral",
  healthy: "healthy",
  warning: "warning",
  critical: "critical",
  info: "info",
} satisfies Record<string, StatusTone>;

export function getMockAiAnalysisSnapshot(): AiAnalysisSnapshot {
  return {
    executiveSummary: {
      incidentTitle: "Credential Misuse from Anomalous ASN",
      severity: "Critical",
      severityTone: tone.critical,
      confidencePercent: 92,
      status: "Investigating",
      statusTone: tone.warning,
      summary:
        "A suspicious login was followed by GitHub repository activity and privileged AWS role usage. Signal correlation suggests a likely credential compromise rather than isolated events.",
    },
    rootCauseAnalysis: [
      {
        id: "root-cause",
        title: "Root Cause",
        lines: ["Credential replay from anomalous ASN."],
      },
      {
        id: "impact-scope",
        title: "Impact Scope",
        lines: ["GitHub Enterprise", "AWS Production", "Slack Workspace"],
      },
      {
        id: "blast-radius",
        title: "Blast Radius",
        lines: ["3 systems", "2 repositories", "1 privileged role"],
      },
    ],
    correlationTimeline: [
      {
        id: "foreign-login",
        title: "Foreign Login",
        timestamp: "2026-05-27 08:14 UTC",
        confidencePercent: 91,
        reasoningNote: "Authentication telemetry matched anomalous ASN and impossible-travel heuristics.",
      },
      {
        id: "github-push",
        title: "GitHub Push",
        timestamp: "2026-05-27 08:17 UTC",
        confidencePercent: 88,
        reasoningNote: "Repository push activity correlated within three minutes of suspicious login.",
      },
      {
        id: "aws-role",
        title: "AWS Role Assumption",
        timestamp: "2026-05-27 08:19 UTC",
        confidencePercent: 90,
        reasoningNote: "Privileged role assumption followed identity compromise indicators.",
      },
      {
        id: "containment",
        title: "Containment Executed",
        timestamp: "2026-05-27 08:26 UTC",
        confidencePercent: 94,
        reasoningNote: "Session revocation and credential rotation actions completed by response workflow.",
      },
    ],
    findings: [
      {
        id: "high-risk-signal",
        title: "High Risk Signal",
        description: "AWS AssumeRole activity occurred within 2 minutes of suspicious authentication.",
      },
      {
        id: "deployment-risk",
        title: "Deployment Risk",
        description: "Production repository activity correlated with compromised identity.",
      },
      {
        id: "lateral-movement",
        title: "Lateral Movement Indicator",
        description: "Slack communication patterns aligned with escalation timeline.",
      },
      {
        id: "repository-exposure",
        title: "Repository Exposure",
        description: "Privileged repository activity detected during incident progression.",
      },
    ],
    recommendedActions: [
      { id: "rotate-credentials", label: "Rotate credentials" },
      { id: "revoke-sessions", label: "Revoke active sessions" },
      { id: "audit-repo", label: "Audit repository changes" },
      { id: "review-privileged", label: "Review privileged role usage" },
      { id: "validate-deployments", label: "Validate production deployments" },
      { id: "verify-containment", label: "Verify containment actions" },
    ],
    confidenceBreakdown: [
      { id: "identity", label: "Identity Correlation", percent: 92 },
      { id: "cloud", label: "Cloud Escalation", percent: 88 },
      { id: "repository", label: "Repository Correlation", percent: 86 },
      { id: "containment", label: "Containment Success", percent: 94 },
    ],
    relatedInvestigations: [
      {
        id: "INC-1042",
        title: "Credential misuse from anomalous ASN",
        severity: "Critical",
        severityTone: tone.critical,
      },
      {
        id: "INC-1038",
        title: "Privileged role escalation sequence",
        severity: "High",
        severityTone: tone.warning,
      },
      {
        id: "INC-1032",
        title: "Endpoint beaconing to suspicious domain",
        severity: "High",
        severityTone: tone.warning,
      },
    ],
  };
}

import type {
  EvidenceCardModel,
  InvestigationDetail,
  InvestigationSummary,
  RecentAlert,
} from "@/lib/mock-data/types";
import type { StatusTone } from "@/components/shared/status-badge";

const tone = {
  neutral: "neutral",
  healthy: "healthy",
  warning: "warning",
  critical: "critical",
  info: "info",
} satisfies Record<string, StatusTone>;

const investigationSummaries: InvestigationSummary[] = [
  {
    id: "INC-1042",
    title: "Credential misuse from anomalous ASN",
    severity: "Critical",
    severityTone: tone.critical,
    status: "Investigating",
    statusTone: tone.warning,
    shortDescription: "Foreign login correlation escalated into privileged cloud actions.",
    updatedAt: "Updated 4m ago",
    assignedAnalyst: "Analyst Lin",
  },
  {
    id: "INC-1038",
    title: "Privileged role escalation sequence",
    severity: "High",
    severityTone: tone.warning,
    status: "Contained",
    statusTone: tone.healthy,
    shortDescription: "CloudTrail role assumption pattern matched escalation playbook.",
    updatedAt: "Updated 9m ago",
    assignedAnalyst: "Agent Sigma",
  },
  {
    id: "INC-1032",
    title: "Endpoint beaconing to suspicious domain",
    severity: "High",
    severityTone: tone.warning,
    status: "Awaiting Analyst",
    statusTone: tone.info,
    shortDescription: "Endpoint communications mapped to known malicious infrastructure.",
    updatedAt: "Updated 13m ago",
    assignedAnalyst: "Unassigned",
  },
];

const recentAlerts: RecentAlert[] = [
  { id: "a1", label: "Critical Alerts", value: "7", tone: tone.critical, updatedAt: "2m ago" },
  { id: "a2", label: "Open Incidents", value: "3", tone: tone.warning, updatedAt: "2m ago" },
  { id: "a3", label: "Containment SLA", value: "96.2%", tone: tone.healthy, updatedAt: "5m ago" },
  { id: "a4", label: "p95 Query", value: "228ms", tone: tone.info, updatedAt: "1m ago" },
];

function buildEvidence(input: EvidenceCardModel): EvidenceCardModel {
  return input;
}

const baseTimeline = [
  {
    id: "step-1",
    index: 1,
    timeLabel: "19:10:18",
    title: "Foreign login detected",
    narrative:
      "Authentication request arrived from an anomalous ASN/geolocation pairing and crossed escalation threshold.",
    severityTone: tone.critical,
    linkedSystems: ["Okta Identity Cloud", "Auth Gateway"],
    linkedEvents: ["Login risk score=0.91", "geo=non-us asn=unknown"],
    evidence: [
      buildEvidence({
        id: "ev-1",
        title: "Foreign login anomaly",
        evidenceType: "SIEM Correlation",
        confidence: 92,
        riskScore: 91,
        summary: "Login originates from atypical geolocation and ASN with critical risk score.",
        relatedSystems: ["Okta Identity Cloud", "Auth Gateway"],
        relatedEvents: ["Login: geo=non-us", "Risk: score=0.91"],
        relatedEntities: ["user:okta:1a994f", "ip:91.214.88.14"],
        tags: ["geo-anomaly", "asn-mismatch"],
        timestamp: "2026-05-27T19:10:18Z",
        entityId: "user:okta:1a994f",
        detectionSource: "coral-siem-rule-engine",
        sourceConnector: "okta-connector",
        analystNotes: "Geo and ASN mismatch confirmed against user travel baseline.",
        aiReasoningSummary: "High-confidence identity anomaly with replay characteristics.",
        rawTelemetry: {
          sourceIp: "91.214.88.14",
          geoCountry: "Unknown",
          asn: "AS49392",
          deviceFingerprint: "fp-c9a2-7bc1",
          riskScore: 0.91,
        },
      }),
    ],
    aiReasoning: [
      {
        id: "r-1",
        stepLabel: "Hypothesis",
        hypothesis: "Potential credential replay attempt in progress.",
        modelRationale: "Impossible-travel and ASN mismatch strongly diverge from baseline identity behavior.",
        confidence: 90,
        confidenceTone: tone.warning,
        sources: ["SIEM rules", "Okta login telemetry"],
      },
    ],
  },
  {
    id: "step-2",
    index: 2,
    timeLabel: "19:12:02",
    title: "GitHub push correlated",
    narrative: "Privileged repository push mapped to suspicious identity timeline.",
    severityTone: tone.critical,
    linkedSystems: ["GitHub Enterprise", "Okta Identity Cloud"],
    linkedEvents: ["Push: repo=security-tools", "Actor matched to subject"],
    evidence: [
      buildEvidence({
        id: "ev-2",
        title: "GitHub push correlation",
        evidenceType: "Code Hosting Correlation",
        confidence: 88,
        riskScore: 84,
        summary: "Commit actor and session timing align with suspicious identity activity.",
        relatedSystems: ["GitHub Enterprise"],
        relatedEvents: ["Push event hash=4d39a1", "Actor map=okta subject"],
        relatedEntities: ["repo:security-tools", "actor:svc-prod-ops"],
        timestamp: "2026-05-27T19:12:02Z",
        entityId: "repo:security-tools",
        detectionSource: "coral-graph-correlation",
        sourceConnector: "github-enterprise-connector",
        analystNotes: "Repository is privileged; push pattern unusual for actor schedule.",
        aiReasoningSummary: "Code activity likely linked to identity compromise chain.",
        rawTelemetry: {
          repository: "security-tools",
          actor: "svc-prod-ops",
          commitHash: "4d39a1f",
          branch: "main",
        },
      }),
    ],
    aiReasoning: [
      {
        id: "r-2",
        stepLabel: "Model decision",
        hypothesis: "Identity compromise progressed into code-path manipulation.",
        modelRationale: "Temporal alignment and actor identity mapping indicate coordinated behavior.",
        confidence: 84,
        confidenceTone: tone.warning,
        sources: ["Push event correlation", "Identity timeline constraints"],
      },
    ],
  },
  {
    id: "step-3",
    index: 3,
    timeLabel: "19:14:19",
    title: "AWS escalation discovered",
    narrative: "Privileged role assumption calls executed after identity and code activity.",
    severityTone: tone.critical,
    linkedSystems: ["AWS CloudTrail", "STS Provider"],
    linkedEvents: ["AssumeRole: prod-admin", "Event window=2m"],
    evidence: [
      buildEvidence({
        id: "ev-3",
        title: "Privileged role escalation",
        evidenceType: "Cloud Audit Trail",
        confidence: 91,
        riskScore: 93,
        summary: "AssumeRole actions targeted sensitive production role sequence.",
        relatedSystems: ["AWS CloudTrail"],
        relatedEvents: ["AssumeRole target=prod-admin", "Session issuer mismatch"],
        relatedEntities: ["aws:role/prod-admin", "arn:aws:iam::111111:user/svc-prod-ops"],
        timestamp: "2026-05-27T19:14:19Z",
        entityId: "aws:role/prod-admin",
        detectionSource: "cloudtrail-priv-esc-detector",
        sourceConnector: "aws-cloudtrail-connector",
        analystNotes: "Role escalation occurs within two minutes of suspicious login.",
        aiReasoningSummary: "Privilege escalation stage confirms high-severity progression.",
        rawTelemetry: {
          eventName: "AssumeRole",
          targetRole: "prod-admin",
          callerArn: "arn:aws:iam::111111:user/svc-prod-ops",
          sourceIp: "91.214.88.14",
        },
      }),
    ],
    aiReasoning: [
      {
        id: "r-3",
        stepLabel: "Hypothesis",
        hypothesis: "Attacker is seeking elevated runtime permissions.",
        modelRationale: "Privilege escalation sequence follows common post-auth compromise pattern.",
        confidence: 92,
        confidenceTone: tone.critical,
        sources: ["CloudTrail privileged events", "Escalation playbook map"],
      },
    ],
  },
  {
    id: "step-4",
    index: 4,
    timeLabel: "19:18:41",
    title: "Slack conversation linked",
    narrative: "Message thread contained indicators associated with investigation context.",
    severityTone: tone.warning,
    linkedSystems: ["Slack Enterprise"],
    linkedEvents: ["Channel=sec-ops", "Indicator=containment-bypass"],
    evidence: [
      buildEvidence({
        id: "ev-4",
        title: "Slack intel linkage",
        evidenceType: "Collaboration Correlation",
        confidence: 76,
        riskScore: 72,
        summary: "Thread includes indicator strings and workflow references tied to incident.",
        relatedSystems: ["Slack Enterprise"],
        relatedEvents: ["thread id=1739.55", "keyword match=containment-bypass"],
        relatedEntities: ["slack:channel/sec-ops", "thread:1739.55"],
        timestamp: "2026-05-27T19:18:41Z",
        entityId: "slack:channel/sec-ops",
        detectionSource: "collab-intel-linker",
        sourceConnector: "slack-enterprise-connector",
        analystNotes: "Mentions contain operational terms tied to active escalation.",
        aiReasoningSummary: "Potential attacker coordination signal in collaboration tooling.",
        rawTelemetry: {
          channel: "sec-ops",
          keywordHits: ["containment-bypass", "role-override"],
          participantCount: 4,
        },
      }),
    ],
    aiReasoning: [
      {
        id: "r-4",
        stepLabel: "Hypothesis",
        hypothesis: "Human coordination may be supporting attack progression.",
        modelRationale: "Message indicators overlap with identity/cloud escalation phase timing.",
        confidence: 78,
        confidenceTone: tone.info,
        sources: ["Slack thread correlation", "Indicator overlap model"],
      },
    ],
  },
  {
    id: "step-5",
    index: 5,
    timeLabel: "19:20:07",
    title: "AI generated attack graph",
    narrative: "Coral generated an attack-chain graph over correlated evidence layers.",
    severityTone: tone.critical,
    linkedSystems: ["Coral Query Engine", "MCP Endpoint Gateway"],
    linkedEvents: ["Graph inference completed", "Likelihood=0.82"],
    evidence: [
      buildEvidence({
        id: "ev-5",
        title: "Attack graph inference",
        evidenceType: "AI Graph Inference",
        confidence: 81,
        riskScore: 80,
        summary: "Model infers multi-stage path from identity compromise to cloud escalation.",
        relatedSystems: ["Coral Query Engine"],
        relatedEvents: ["pathDepth=4", "likelihood=0.82"],
        relatedEntities: ["graph:attack-chain:inc-1042", "node:cloud-escalation"],
        timestamp: "2026-05-27T19:20:07Z",
        entityId: "graph:attack-chain:inc-1042",
        detectionSource: "coral-graph-inference-engine",
        sourceConnector: "coral-query-engine",
        analystNotes: "Inference aligns with observed event ordering and system touchpoints.",
        aiReasoningSummary: "Graph model highlights critical escalation path with high confidence.",
        rawTelemetry: {
          pathDepth: 4,
          confidence: 0.82,
          nodes: 6,
          edges: 5,
        },
      }),
    ],
    aiReasoning: [
      {
        id: "r-5",
        stepLabel: "Model rationale",
        hypothesis: "Likely sequence: credential replay -> code pivot -> cloud privilege abuse.",
        modelRationale: "Cross-layer event ordering and graph topology align with known attack pathways.",
        confidence: 86,
        confidenceTone: tone.warning,
        sources: ["Graph inference output", "Threat-pattern corpus"],
      },
    ],
  },
  {
    id: "step-6",
    index: 6,
    timeLabel: "19:23:33",
    title: "Containment recommended",
    narrative: "Containment plan generated with evidence-preserving sequence controls.",
    severityTone: tone.critical,
    linkedSystems: ["Auth Gateway", "AWS CloudTrail", "Endpoint Telemetry"],
    linkedEvents: ["Containment plan generated", "Evidence lock enabled"],
    evidence: [
      buildEvidence({
        id: "ev-6",
        title: "Containment orchestration package",
        evidenceType: "Response Orchestration",
        confidence: 89,
        riskScore: 87,
        summary: "Automated action package prepared for analyst approval and execution.",
        relatedSystems: ["Auth Gateway", "AWS CloudTrail"],
        relatedEvents: ["actionSet=staged", "evidenceLock=true"],
        relatedEntities: ["response:package:inc-1042", "policy:evidence-lock"],
        timestamp: "2026-05-27T19:23:33Z",
        entityId: "response:package:inc-1042",
        detectionSource: "coral-response-orchestrator",
        sourceConnector: "response-orchestration-engine",
        analystNotes: "Action sequence reviewed for blast-radius and forensic preservation.",
        aiReasoningSummary: "Containment package recommended as immediate mitigation sequence.",
        rawTelemetry: {
          sequence: ["revoke tokens", "constrain role assumptions", "lock evidence window"],
          requiresApproval: true,
          blastRadiusScore: 0.21,
        },
      }),
    ],
    aiReasoning: [
      {
        id: "r-6",
        stepLabel: "Recommendation basis",
        hypothesis: "Contain identity and privileged cloud pathways immediately.",
        modelRationale: "Evidence indicates active escalation; staged containment minimizes operational disruption.",
        confidence: 88,
        confidenceTone: tone.critical,
        sources: ["Containment ruleset", "Privilege escalation evidence"],
      },
    ],
  },
];

const detailsById: Record<string, InvestigationDetail> = {
  "INC-1042": {
    id: "INC-1042",
    title: "Credential misuse from anomalous ASN",
    summary:
      "A correlated identity anomaly progressed into code deployment preparation and privileged cloud role escalation.",
    overallStatus: "Investigating",
    overallTone: tone.critical,
    startedAt: "19:10:18",
    updatedAt: "19:23:33",
    timeline: baseTimeline,
    attackChain: {
      nodes: [
        {
          id: "n1",
          label: "Compromised Identity",
          tone: tone.critical,
          kind: "identity",
          x: 60,
          y: 60,
          relatedStepIds: ["step-1", "step-2"],
          relatedEvidenceId: "ev-1",
        },
        {
          id: "n2",
          label: "GitHub Repository",
          tone: tone.warning,
          kind: "repository",
          x: 220,
          y: 40,
          relatedStepIds: ["step-2"],
          relatedEvidenceId: "ev-2",
        },
        {
          id: "n3",
          label: "AWS Prod Role",
          tone: tone.critical,
          kind: "cloud-role",
          x: 390,
          y: 70,
          relatedStepIds: ["step-3"],
          relatedEvidenceId: "ev-3",
        },
        {
          id: "n4",
          label: "Slack SecOps",
          tone: tone.info,
          kind: "slack-channel",
          x: 520,
          y: 40,
          relatedStepIds: ["step-4"],
          relatedEvidenceId: "ev-4",
        },
        {
          id: "n5",
          label: "Coral Graph",
          tone: tone.warning,
          kind: "connector",
          x: 330,
          y: 170,
          relatedStepIds: ["step-5"],
          relatedEvidenceId: "ev-5",
        },
        {
          id: "n6",
          label: "Endpoint Host",
          tone: tone.warning,
          kind: "endpoint",
          x: 120,
          y: 180,
          relatedStepIds: ["step-1", "step-6"],
          relatedEvidenceId: "ev-6",
        },
      ],
      edges: [
        { id: "e1", fromId: "n1", toId: "n2", label: "code push" },
        { id: "e2", fromId: "n1", toId: "n3", label: "escalation" },
        { id: "e3", fromId: "n1", toId: "n6", label: "token reuse" },
        { id: "e4", fromId: "n3", toId: "n4", label: "communication linkage" },
        { id: "e5", fromId: "n6", toId: "n5", label: "login activity" },
      ],
    },
    containment: [
      {
        id: "c1",
        title: "Quarantine elevated sessions",
        action: "Revoke active tokens and enforce step-up authentication for affected subjects.",
        owner: "SOC Automation",
        dueIn: "15m",
        impact: "Blocks privileged pathway continuation",
        status: "Queued",
        tone: tone.critical,
      },
      {
        id: "c2",
        title: "Isolate cloud role usage",
        action: "Constrain STS role assumptions to allowlist and enable additional auditing.",
        owner: "CloudSecOps",
        dueIn: "30m",
        impact: "Limits blast radius while preserving audit trail",
        status: "Planned",
        tone: tone.warning,
      },
      {
        id: "c3",
        title: "Preserve evidence telemetry",
        action: "Lock auth and endpoint telemetry windows for replay analysis.",
        owner: "Threat Intel",
        dueIn: "45m",
        impact: "Maintains forensic integrity",
        status: "In Progress",
        tone: tone.healthy,
      },
    ],
    analystActivity: [
      {
        id: "a1",
        actor: "Analyst Lin",
        activity: "Reviewed correlated login and token reuse signals.",
        timeLabel: "19:22:10",
        tone: tone.info,
      },
      {
        id: "a2",
        actor: "Agent Sigma",
        activity: "Generated attack chain graph and attached cross-layer evidence.",
        timeLabel: "19:20:07",
        tone: tone.warning,
      },
      {
        id: "a3",
        actor: "Automations",
        activity: "Prepared staged containment package and evidence lock windows.",
        timeLabel: "19:23:33",
        tone: tone.critical,
      },
    ],
  },
};

function normalizeInvestigationId(incidentId?: string | null): string {
  const candidate = typeof incidentId === "string" ? incidentId.trim().toUpperCase() : "";
  return candidate.length > 0 ? candidate : "INC-1042";
}

export function getAllInvestigations(): InvestigationSummary[] {
  return investigationSummaries;
}

export function getInvestigationById(incidentId?: string | null): InvestigationDetail {
  const normalized = normalizeInvestigationId(incidentId);
  return detailsById[normalized] ?? detailsById["INC-1042"];
}

export function getRecentAlerts(): RecentAlert[] {
  return recentAlerts;
}

export function getTimelineSteps(incidentId?: string | null) {
  return getInvestigationById(incidentId).timeline;
}


import type { GraphEdge, GraphNode } from "@/contracts";
import type { StatusTone } from "@/types/common";

type ToneMap = {
  critical: StatusTone;
  warning: StatusTone;
  info: StatusTone;
};

export function getMockAttackChain(tone: ToneMap): { nodes: GraphNode[]; edges: GraphEdge[] } {
  return {
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
  };
}

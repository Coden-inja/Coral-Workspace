export function getEvidenceTelemetry(evidenceId: string): Record<string, unknown> {
  switch (evidenceId) {
    case "ev-1":
      return {
        sourceIp: "91.214.88.14",
        geoCountry: "Unknown",
        asn: "AS49392",
        deviceFingerprint: "fp-c9a2-7bc1",
        riskScore: 0.91,
      };
    case "ev-2":
      return {
        repository: "security-tools",
        actor: "svc-prod-ops",
        commitHash: "4d39a1f",
        branch: "main",
      };
    case "ev-3":
      return {
        eventName: "AssumeRole",
        targetRole: "prod-admin",
        callerArn: "arn:aws:iam::111111:user/svc-prod-ops",
        sourceIp: "91.214.88.14",
      };
    case "ev-4":
      return {
        channel: "sec-ops",
        keywordHits: ["containment-bypass", "role-override"],
        participantCount: 4,
      };
    case "ev-5":
      return {
        pathDepth: 4,
        confidence: 0.82,
        nodes: 6,
        edges: 5,
      };
    case "ev-6":
      return {
        sequence: ["revoke tokens", "constrain role assumptions", "lock evidence window"],
        requiresApproval: true,
        blastRadiusScore: 0.21,
      };
    default:
      return {};
  }
}

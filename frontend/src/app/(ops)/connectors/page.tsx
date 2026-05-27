"use client";

import { useEffect, useState } from "react";

import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { subscribeToMockOpsEvents } from "@/lib/live/ops-event-stream";

type ConnectorState = {
  id: string;
  status: "healthy" | "degraded" | "offline";
  latencyMs: number;
  ingestionPerMin: number;
};

const initialConnectors: ConnectorState[] = [
  { id: "okta-connector", status: "healthy", latencyMs: 54, ingestionPerMin: 3200 },
  { id: "aws-cloudtrail-connector", status: "healthy", latencyMs: 38, ingestionPerMin: 9400 },
  { id: "github-enterprise-connector", status: "degraded", latencyMs: 120, ingestionPerMin: 1800 },
  { id: "slack-enterprise-connector", status: "healthy", latencyMs: 70, ingestionPerMin: 2400 },
];

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState(initialConnectors);

  useEffect(() => {
    return subscribeToMockOpsEvents((event) => {
      if (event.type !== "connector_status") return;
      setConnectors((prev) =>
        prev.map((connector) =>
          connector.id === event.connector
            ? {
                ...connector,
                status: event.status,
                latencyMs: event.latencyMs,
                ingestionPerMin: event.ingestionPerMin,
              }
            : connector,
        ),
      );
    }, 5000);
  }, []);

  return (
    <div className="space-y-3">
      <SectionHeader
        eyebrow="Connector Fleet"
        title="Connectors"
        description="Data-source ingestion connectors used by investigation workflows."
      />
      <Panel title="Connector Status" description="Operational connector state." padding="md">
        <div className="space-y-2">
          {connectors.map((connector) => (
            <div key={connector.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-100">{connector.id}</p>
                <StatusBadge
                  label={connector.status}
                  tone={connector.status === "healthy" ? "healthy" : connector.status === "degraded" ? "warning" : "critical"}
                  size="sm"
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <p>Latency: {connector.latencyMs}ms</p>
                <p>Ingestion: {connector.ingestionPerMin.toLocaleString()}/min</p>
              </div>
              {connector.status === "offline" ? (
                <p className="mt-2 text-xs text-red-300">Connector offline state: retrying stream ingestion.</p>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}


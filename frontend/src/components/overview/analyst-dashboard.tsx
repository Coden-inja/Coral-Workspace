"use client";

import { useMemo } from "react";

import { AiHighlightsSection } from "@/components/overview/command-center/ai-highlights-section";
import { CommandCenterMetrics } from "@/components/overview/command-center/command-center-metrics";
import { IncidentQueueSection } from "@/components/overview/command-center/incident-queue-section";
import { LiveActivityFeed } from "@/components/overview/command-center/live-activity-feed";
import { SectionHeader } from "@/components/shared/section-header";
import type { CommandCenterSnapshot, InvestigationSummary } from "@/contracts";
import type { CommandCenterMetric } from "@/contracts/command-center";

type AnalystDashboardProps = {
  snapshot: CommandCenterSnapshot;
  incidents: InvestigationSummary[];
};

export function AnalystDashboard({ snapshot, incidents }: AnalystDashboardProps) {
  const metrics = useMemo<CommandCenterMetric[]>(() => {
    const activeIncidents = snapshot.metrics.find((metric) => metric.id === "active-incidents");
    const criticalAlerts = snapshot.metrics.find((metric) => metric.id === "critical-alerts");

    const assignedInvestigations: CommandCenterMetric = {
      id: "assigned-investigations",
      label: "Assigned Investigations",
      value: String(incidents.filter((item) => item.assignedAnalyst !== "Unassigned").length),
      trend: "flat",
      delta: "Owned by analysts",
      statusLabel: "In progress",
      statusTone: "info",
      hint: "Investigations with assigned ownership",
    };

    return [activeIncidents, criticalAlerts, assignedInvestigations].filter(
      (metric): metric is CommandCenterMetric => Boolean(metric),
    );
  }, [incidents, snapshot.metrics]);

  const assignedIncidents = useMemo(
    () => incidents.filter((item) => item.assignedAnalyst !== "Unassigned"),
    [incidents],
  );

  return (
    <div className="space-y-4">
      <SectionHeader
        variant="page"
        eyebrow="Operations"
        title="Analyst Dashboard"
        description="Assigned investigations, alerts, and AI-assisted operational signals."
      />

      <CommandCenterMetrics metrics={metrics} />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <IncidentQueueSection
            incidents={assignedIncidents}
            title="Assigned Investigations"
            description="Incidents currently owned by analysts or agents."
          />
        </div>
        <div className="xl:col-span-5">
          <LiveActivityFeed activities={snapshot.activities} />
        </div>
      </div>

      <AiHighlightsSection highlights={snapshot.aiHighlights} />
    </div>
  );
}

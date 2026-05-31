"use client";

import { useEffect, useState } from "react";

import { AiHighlightsSection } from "@/components/overview/command-center/ai-highlights-section";
import { CommandCenterMetrics } from "@/components/overview/command-center/command-center-metrics";
import { IncidentQueueSection } from "@/components/overview/command-center/incident-queue-section";
import { IntegrationHealthSection } from "@/components/overview/command-center/integration-health-section";
import { LiveActivityFeed } from "@/components/overview/command-center/live-activity-feed";
import { SectionHeader } from "@/components/shared/section-header";
import type { CommandCenterSnapshot, LiveActivityEvent } from "@/contracts";
import type { InvestigationSummary } from "@/contracts";
import { subscribeToOpsEvents } from "@/services/realtime";

type CommandCenterDashboardProps = {
  snapshot: CommandCenterSnapshot;
  incidents: InvestigationSummary[];
};

function createLiveActivity(event: LiveActivityEvent): LiveActivityEvent {
  return event;
}

export function CommandCenterDashboard({ snapshot, incidents }: CommandCenterDashboardProps) {
  const [metrics, setMetrics] = useState(snapshot.metrics);
  const [activities, setActivities] = useState(snapshot.activities);
  const [liveIncidents, setLiveIncidents] = useState(incidents);
  const [animatedActivityIds, setAnimatedActivityIds] = useState<string[]>([]);

  useEffect(() => {
    return subscribeToOpsEvents((event) => {
      if (event.type === "alert_update") {
        setMetrics((prev) =>
          prev.map((metric) =>
            metric.id === "critical-alerts"
              ? { ...metric, value: event.value, delta: "Updated live", trend: event.severity === "critical" ? "up" : "flat" }
              : metric,
          ),
        );
      }

      if (event.type === "incident_status") {
        setLiveIncidents((prev) =>
          prev.map((item) =>
            item.id === event.incidentId
              ? {
                  ...item,
                  status: event.status,
                  statusTone:
                    event.status === "Contained" || event.status === "Resolved"
                      ? "healthy"
                      : event.status === "Investigating"
                        ? "warning"
                        : "info",
                  updatedAt: "Updated just now",
                }
              : item,
          ),
        );

        const activityId = `live-${Date.now()}`;
        setActivities((prev) =>
          [
            createLiveActivity({
              id: activityId,
              source: "investigation",
              message: `${event.incidentId} status changed to ${event.status}`,
              timeLabel: "now",
              tone: event.status === "Contained" ? "healthy" : "warning",
            }),
            ...prev,
          ].slice(0, 10),
        );
        setAnimatedActivityIds((prev) => [activityId, ...prev].slice(0, 4));
        window.setTimeout(() => {
          setAnimatedActivityIds((prev) => prev.filter((id) => id !== activityId));
        }, 1200);
      }

      if (event.type === "analyst_activity") {
        const activityId = `live-${Date.now()}`;
        setActivities((prev) =>
          [
            createLiveActivity({
              id: activityId,
              source: "investigation",
              message: event.message,
              timeLabel: "now",
              tone: event.tone,
            }),
            ...prev,
          ].slice(0, 10),
        );
        setAnimatedActivityIds((prev) => [activityId, ...prev].slice(0, 4));
        window.setTimeout(() => {
          setAnimatedActivityIds((prev) => prev.filter((id) => id !== activityId));
        }, 1200);
      }
    }, 5000);
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader
        variant="page"
        eyebrow="Command Center"
        title="Operations Command Center"
        description="Monitor GitHub, Slack, Sentry, and incident operations from one operational surface."
      />

      <section className="space-y-3">
        <CommandCenterMetrics metrics={metrics} />
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <LiveActivityFeed activities={activities} animatedIds={animatedActivityIds} />
        </div>
        <div className="xl:col-span-5">
          <IncidentQueueSection incidents={liveIncidents} />
        </div>
      </section>

      <section className="space-y-3">
        <AiHighlightsSection highlights={snapshot.aiHighlights} />
      </section>

      <section>
        <IntegrationHealthSection integrations={snapshot.integrations} />
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MetricCard } from "@/components/shared/metric-card";
import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import type { InvestigationSummary, RecentAlert } from "@/lib/mock-data";
import { subscribeToMockOpsEvents } from "@/lib/live/ops-event-stream";

type OverviewDashboardProps = {
  alerts: RecentAlert[];
  incidents: InvestigationSummary[];
};

export function OverviewDashboard({ alerts, incidents }: OverviewDashboardProps) {
  const [liveAlerts, setLiveAlerts] = useState(alerts);
  const [liveIncidents, setLiveIncidents] = useState(incidents);

  useEffect(() => {
    return subscribeToMockOpsEvents((event) => {
      if (event.type === "alert_update") {
        setLiveAlerts((prev) =>
          prev.map((alert) => (alert.id === event.alertId ? { ...alert, value: event.value, updatedAt: "moments ago" } : alert)),
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
                    event.status === "Contained"
                      ? "healthy"
                      : event.status === "Resolved"
                        ? "healthy"
                        : event.status === "Investigating"
                          ? "warning"
                          : "info",
                  updatedAt: "Updated just now",
                }
              : item,
          ),
        );
      }
    }, 5000);
  }, []);

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Threat Metrics Grid"
          title="Security Operations Overview"
          description="Real-time infrastructure security posture and investigation pressure."
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {liveAlerts.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              hint={`Updated ${metric.updatedAt}`}
              statusLabel={metric.label}
              statusTone={metric.tone}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <Panel
          title="Active Incidents Panel"
          description="Incidents requiring immediate triage and ownership."
          className="xl:col-span-8"
        >
          <div className="space-y-2">
            {liveIncidents.map((incident) => (
              <Link
                key={incident.id}
                href={`/investigations/${incident.id}/timeline`}
                className="group block cursor-pointer rounded-lg border border-zinc-800/90 bg-zinc-950/70 px-3.5 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset] transition-colors hover:border-zinc-700 hover:bg-zinc-900/70 active:border-blue-700/70 active:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium tracking-tight text-zinc-100 group-hover:text-zinc-50">
                      {incident.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {incident.id} - {incident.shortDescription}
                    </p>
                    <p className="text-xs text-zinc-500">{incident.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge label={incident.severity} tone={incident.severityTone} size="sm" />
                    <StatusBadge label={incident.status} tone={incident.statusTone} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel
          title="Investigation Queue Snapshot"
          description="Assigned analysts and current queue pressure."
          className="xl:col-span-4"
        >
          <div className="space-y-2">
            {liveIncidents.map((incident) => (
              <div
                key={`${incident.id}-queue`}
                className="flex items-center justify-between rounded-lg border border-zinc-800/90 bg-zinc-950/70 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{incident.id}</p>
                  <p className="text-xs text-zinc-500">{incident.assignedAnalyst}</p>
                </div>
                <StatusBadge label={incident.status} tone={incident.statusTone} size="sm" />
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}


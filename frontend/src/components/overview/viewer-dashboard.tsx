"use client";

import { useMemo } from "react";

import { IncidentQueueSection } from "@/components/overview/command-center/incident-queue-section";
import { LiveActivityFeed } from "@/components/overview/command-center/live-activity-feed";
import { CommandCenterMetrics } from "@/components/overview/command-center/command-center-metrics";
import { SectionHeader } from "@/components/shared/section-header";
import type { CommandCenterSnapshot, InvestigationSummary } from "@/contracts";

type ViewerDashboardProps = {
  snapshot: CommandCenterSnapshot;
  incidents: InvestigationSummary[];
};

export function ViewerDashboard({ snapshot, incidents }: ViewerDashboardProps) {
  const metrics = useMemo(
    () => snapshot.metrics.filter((metric) => metric.id === "active-incidents"),
    [snapshot.metrics],
  );

  const activities = useMemo(() => snapshot.activities.slice(0, 5), [snapshot.activities]);

  return (
    <div className="space-y-4">
      <SectionHeader
        variant="page"
        eyebrow="Operations"
        title="Operations Dashboard"
        description="Read-only incident visibility and activity monitoring."
      />

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500">
        Read-only dashboard view. Management controls and AI analysis are not available for your role.
      </div>

      <CommandCenterMetrics metrics={metrics} />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <IncidentQueueSection incidents={incidents} />
        </div>
        <div className="xl:col-span-5">
          <LiveActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

import type { AdminDashboardSnapshot } from "@/contracts/admin-dashboard";

import { AdminActivityFeed } from "@/components/admin-dashboard/admin-activity-feed";
import { AdminDashboardMetrics } from "@/components/admin-dashboard/admin-dashboard-metrics";
import { AdminIntegrationHealthPanel } from "@/components/admin-dashboard/admin-integration-health-panel";
import { AdminRecentIncidentsTable } from "@/components/admin-dashboard/admin-recent-incidents-table";
import { AdminUserManagementPreview } from "@/components/admin-dashboard/admin-user-management-preview";
import { adminCardSurfaceClass } from "@/components/admin-dashboard/styles";
import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";

type AdminDashboardProps = {
  snapshot: AdminDashboardSnapshot;
};

export function AdminDashboard({ snapshot }: AdminDashboardProps) {
  return (
    <div className="space-y-4">
      <SectionHeader
        variant="page"
        eyebrow="Administration"
        title="Admin Dashboard"
        description="Organization-wide operations, integrations, users, and incident posture."
      />

      <AdminDashboardMetrics metrics={snapshot.metrics} />

      <section className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">Operations Overview</h2>
        <div className="grid gap-3 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Panel
              title="Recent Incidents"
              description="Latest incidents across connected sources."
              padding="sm"
              className={adminCardSurfaceClass}
            >
              <AdminRecentIncidentsTable incidents={snapshot.recentIncidents} />
            </Panel>
          </div>
          <div className="xl:col-span-4">
            <Panel
              title="Integration Health"
              description="Connector status and sync latency."
              padding="sm"
              className={adminCardSurfaceClass}
            >
              <AdminIntegrationHealthPanel integrations={snapshot.integrations} />
            </Panel>
          </div>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-2">
        <Panel
          title="User Management Preview"
          description="Active workspace users and role distribution."
          padding="sm"
          className={adminCardSurfaceClass}
        >
          <AdminUserManagementPreview users={snapshot.users} />
        </Panel>
        <AdminActivityFeed activities={snapshot.activities} />
      </div>
    </div>
  );
}

"use client";

import type { UsersPageSnapshot } from "@/contracts/users";

import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";

type UsersPageViewProps = {
  snapshot: UsersPageSnapshot;
};

export function UsersPageView({ snapshot }: UsersPageViewProps) {
  return (
    <div className="space-y-4">
      <SectionHeader
        variant="page"
        title="Users"
        description="Manage platform users and roles."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.id} label={metric.label} value={metric.value} />
        ))}
      </div>

      <DataTable
        rows={snapshot.users}
        getRowKey={(row) => row.id}
        columns={[
          {
            id: "name",
            header: "Name",
            cell: (row) => <span className="font-medium text-zinc-200">{row.name}</span>,
          },
          {
            id: "email",
            header: "Email",
            cell: (row) => <span className="text-zinc-400">{row.email}</span>,
          },
          {
            id: "role",
            header: "Role",
            cell: (row) => <StatusBadge label={row.roleLabel} tone="neutral" size="sm" />,
          },
          {
            id: "status",
            header: "Status",
            cell: (row) => <StatusBadge label={row.status} tone={row.statusTone} size="sm" />,
          },
        ]}
      />
    </div>
  );
}

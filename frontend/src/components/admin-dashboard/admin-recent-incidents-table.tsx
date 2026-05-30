import Link from "next/link";

import type { AdminRecentIncident } from "@/contracts/admin-dashboard";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";

type AdminRecentIncidentsTableProps = {
  incidents: AdminRecentIncident[];
};

export function AdminRecentIncidentsTable({ incidents }: AdminRecentIncidentsTableProps) {
  return (
    <DataTable
      rows={incidents}
      getRowKey={(row) => row.id}
      columns={[
        {
          id: "id",
          header: "Incident ID",
          cell: (row) => (
            <Link
              href={`/investigations/${row.id}/timeline`}
              className="font-mono text-sm font-medium text-zinc-200 hover:text-zinc-50"
            >
              {row.id}
            </Link>
          ),
        },
        {
          id: "severity",
          header: "Severity",
          cell: (row) => <StatusBadge label={row.severity} tone={row.severityTone} size="sm" />,
        },
        {
          id: "source",
          header: "Source",
          cell: (row) => <span className="text-zinc-300">{row.source}</span>,
        },
        {
          id: "status",
          header: "Status",
          cell: (row) => <StatusBadge label={row.status} tone={row.statusTone} size="sm" />,
        },
        {
          id: "analyst",
          header: "Assigned Analyst",
          cell: (row) => <span className="text-zinc-400">{row.assignedAnalyst}</span>,
        },
      ]}
    />
  );
}

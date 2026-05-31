import type { AdminUserPreview } from "@/contracts/admin-dashboard";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";

type AdminUserManagementPreviewProps = {
  users: AdminUserPreview[];
};

export function AdminUserManagementPreview({ users }: AdminUserManagementPreviewProps) {
  return (
    <DataTable
      rows={users}
      getRowKey={(row) => row.id}
      columns={[
        {
          id: "name",
          header: "Name",
          cell: (row) => <span className="font-medium text-zinc-200">{row.name}</span>,
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
  );
}

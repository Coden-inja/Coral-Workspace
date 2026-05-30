import type { AdminIntegrationHealth } from "@/contracts/admin-dashboard";

import { adminInnerCardClass } from "@/components/admin-dashboard/styles";
import { StatusBadge } from "@/components/shared/status-badge";

type AdminIntegrationHealthPanelProps = {
  integrations: AdminIntegrationHealth[];
};

export function AdminIntegrationHealthPanel({ integrations }: AdminIntegrationHealthPanelProps) {
  return (
    <div className="space-y-2">
      {integrations.map((integration) => (
        <div key={integration.id} className={[adminInnerCardClass, "p-3.5"].join(" ")}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100">{integration.name}</p>
            <StatusBadge label={integration.healthStatus} tone={integration.healthTone} size="sm" />
          </div>
          <div className="mt-2.5 space-y-0.5 text-sm">
            <p className="text-zinc-400">
              <span className="text-zinc-500">Connected:</span> {integration.connectionStatus}
            </p>
            <p className="text-zinc-400">
              <span className="text-zinc-500">Last Sync:</span> {integration.lastSync}
            </p>
            <p className="text-zinc-400">
              <span className="text-zinc-500">Status:</span> {integration.healthStatus}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

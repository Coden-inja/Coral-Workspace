import type { IntegrationHealthItem } from "@/contracts/command-center";

import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { innerCardSurfaceClass } from "@/components/shared/surfaces";

type IntegrationHealthSectionProps = {
  integrations: IntegrationHealthItem[];
};

export function IntegrationHealthSection({ integrations }: IntegrationHealthSectionProps) {
  return (
    <Panel title="Integration Health" description="GitHub, Slack, and Sentry connector posture." padding="sm">
      <div className="grid gap-2 sm:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={[innerCardSurfaceClass, "p-4 transition-colors hover:border-zinc-700"].join(" ")}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-zinc-100">{integration.name}</p>
              <StatusBadge label={integration.healthStatus} tone={integration.healthTone} size="sm" />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {integration.connectionStatus} · Last sync {integration.lastSync}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

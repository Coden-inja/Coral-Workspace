import type { SettingsPageSnapshot } from "@/contracts/settings";

import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { innerCardSurfaceClass } from "@/components/shared/surfaces";

type SettingsPageViewProps = {
  snapshot: SettingsPageSnapshot;
};

export function SettingsPageView({ snapshot }: SettingsPageViewProps) {
  return (
    <div className="space-y-4">
      <SectionHeader
        variant="page"
        title="Settings"
        description="Platform settings and integrations."
      />

      <Panel title="Connected Integrations" description="Connector health and synchronization status." padding="sm">
        <div className="grid gap-3 sm:grid-cols-2">
          {snapshot.integrations.map((integration) => (
            <div key={integration.id} className={[innerCardSurfaceClass, "p-4"].join(" ")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold text-zinc-100">{integration.name}</p>
                <StatusBadge label={integration.healthStatus} tone={integration.healthTone} size="sm" />
              </div>
              <div className="mt-3 space-y-1 text-sm text-zinc-400">
                <p>
                  <span className="text-zinc-500">Connected:</span> {integration.connectionStatus}
                </p>
                <p>
                  <span className="text-zinc-500">Health:</span> {integration.healthStatus}
                </p>
                <p>
                  <span className="text-zinc-500">Last Sync:</span> {integration.lastSync}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="System Health" description="Core platform service availability." padding="sm">
        <div className="grid gap-3 sm:grid-cols-2">
          {snapshot.systemHealth.map((item) => (
            <div key={item.id} className={[innerCardSurfaceClass, "flex items-center justify-between p-4"].join(" ")}>
              <p className="text-sm font-medium text-zinc-200">{item.label}</p>
              <StatusBadge label={item.status} tone={item.statusTone} size="sm" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Platform Information" description="Deployment metadata for this workspace." padding="sm">
        <dl className="grid gap-3 sm:grid-cols-3">
          <div className={[innerCardSurfaceClass, "p-4"].join(" ")}>
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Version</dt>
            <dd className="mt-1.5 text-sm font-semibold text-zinc-200">{snapshot.platform.version}</dd>
          </div>
          <div className={[innerCardSurfaceClass, "p-4"].join(" ")}>
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Environment</dt>
            <dd className="mt-1.5 text-sm font-semibold text-zinc-200">{snapshot.platform.environment}</dd>
          </div>
          <div className={[innerCardSurfaceClass, "p-4"].join(" ")}>
            <dt className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">Last Deployment</dt>
            <dd className="mt-1.5 text-sm font-semibold text-zinc-200">{snapshot.platform.lastDeployment}</dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

import Link from "next/link";

import type { InvestigationSummary } from "@/contracts";
import type { SeverityLevel } from "@/types/common";

import { Panel } from "@/components/shared/panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { innerCardSurfaceClass } from "@/components/shared/surfaces";

type IncidentQueueSectionProps = {
  incidents: InvestigationSummary[];
  title?: string;
  description?: string;
};

const SEVERITY_ORDER: SeverityLevel[] = ["Critical", "High", "Medium"];

export function IncidentQueueSection({
  incidents,
  title = "Incident Queue",
  description = "Recent incidents by severity. Select to open investigation timeline.",
}: IncidentQueueSectionProps) {
  const grouped = SEVERITY_ORDER.map((severity) => ({
    severity,
    items: incidents.filter((incident) => incident.severity === severity),
  })).filter((group) => group.items.length > 0);

  return (
    <Panel title={title} description={description} padding="sm">
      <div className="space-y-3">
        {grouped.length === 0 ? (
          <p className="text-sm text-zinc-400">No active incidents in queue.</p>
        ) : (
          grouped.map((group) => (
            <div key={group.severity} className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">{group.severity}</p>
              {group.items.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/investigations/${incident.id}/timeline`}
                  className={[
                    innerCardSurfaceClass,
                    "group flex items-center justify-between gap-3 p-3 transition-colors hover:border-zinc-700",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100 group-hover:text-zinc-50">{incident.title}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {incident.id} · {incident.updatedAt}
                    </p>
                  </div>
                  <StatusBadge label={incident.status} tone={incident.statusTone} size="sm" />
                </Link>
              ))}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}

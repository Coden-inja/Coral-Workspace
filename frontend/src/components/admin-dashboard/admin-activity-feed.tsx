import type { AdminActivityEvent, AdminActivitySource } from "@/contracts/admin-dashboard";

import { adminCardSurfaceClass } from "@/components/admin-dashboard/styles";
import { Panel } from "@/components/shared/panel";

type AdminActivityFeedProps = {
  activities: AdminActivityEvent[];
};

const SOURCE_LABELS: Record<AdminActivitySource, string> = {
  github: "GitHub",
  slack: "Slack",
  investigation: "Investigation",
  ai: "AI Recommendation",
};

const SOURCE_DOT: Record<AdminActivitySource, string> = {
  github: "bg-blue-500/60",
  slack: "bg-violet-500/60",
  investigation: "bg-cyan-500/60",
  ai: "bg-emerald-500/60",
};

export function AdminActivityFeed({ activities }: AdminActivityFeedProps) {
  return (
    <Panel
      title="Recent Activity Feed"
      description="Unified stream across integrations, investigations, and AI."
      padding="sm"
      className={adminCardSurfaceClass}
    >
      <div className="divide-y divide-zinc-800/90">
        {activities.map((event) => (
          <div key={event.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
            <span
              className={["mt-1.5 h-2 w-2 shrink-0 rounded-full", SOURCE_DOT[event.source]].join(" ")}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs font-medium text-zinc-300">{SOURCE_LABELS[event.source]}</span>
                <span className="text-[11px] text-zinc-600">{event.timeLabel}</span>
              </div>
              <p className="mt-0.5 text-sm leading-snug text-zinc-400">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

import type { ActivitySource, LiveActivityEvent } from "@/contracts/command-center";

import { Panel } from "@/components/shared/panel";

type LiveActivityFeedProps = {
  activities: LiveActivityEvent[];
  animatedIds?: string[];
};

const SOURCE_LABELS: Record<ActivitySource, string> = {
  github: "GitHub",
  slack: "Slack",
  sentry: "Sentry",
  investigation: "Investigation",
};

const SOURCE_DOT: Record<ActivitySource, string> = {
  github: "bg-blue-500/70 shadow-[0_0_6px_rgba(59,130,246,0.35)]",
  slack: "bg-violet-500/70 shadow-[0_0_6px_rgba(139,92,246,0.3)]",
  sentry: "bg-amber-500/70 shadow-[0_0_6px_rgba(245,158,11,0.3)]",
  investigation: "bg-cyan-500/70 shadow-[0_0_6px_rgba(6,182,212,0.3)]",
};

export function LiveActivityFeed({ activities, animatedIds = [] }: LiveActivityFeedProps) {
  return (
    <Panel title="Live Activity Feed" description="Unified stream across GitHub, Slack, Sentry, and investigations." padding="sm">
      <div className="divide-y divide-zinc-800/80">
        {activities.map((event) => (
          <div
            key={event.id}
            className={[
              "flex gap-3 px-1 py-3 transition-colors",
              animatedIds.includes(event.id) ? "rounded-lg bg-zinc-800/40" : "",
            ].join(" ")}
          >
            <span
              className={["mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", SOURCE_DOT[event.source]].join(" ")}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs font-medium text-zinc-300">{SOURCE_LABELS[event.source]}</span>
                <span className="text-[11px] text-zinc-600">{event.timeLabel}</span>
              </div>
              <p className="mt-1 text-sm leading-snug text-zinc-300">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

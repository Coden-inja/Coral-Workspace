import type { AnalystActivityModel } from "@/components/investigations/timeline/types";

const toneDot: Record<AnalystActivityModel["tone"], string> = {
  neutral: "#71717a",
  healthy: "#34d399",
  warning: "#fbbf24",
  critical: "#f87171",
  info: "#60a5fa",
};

type AnalystActivityFeedProps = {
  items: AnalystActivityModel[];
  animatedIds?: string[];
};

export function AnalystActivityFeed({ items, animatedIds = [] }: AnalystActivityFeedProps) {
  return (
    <div className="rounded-lg border border-zinc-700/90 bg-zinc-950/70 p-3 shadow-[0_1px_0_rgba(255,255,255,0.02)_inset]">
      <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Analyst Activity Feed</p>
      <div className="mt-2 space-y-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={[
              "flex items-start justify-between gap-2 rounded-lg border border-zinc-800/70 bg-zinc-900/50 p-2.5 transition-all duration-300",
              animatedIds.includes(item.id) ? "border-blue-700/60 bg-blue-950/20" : "",
            ].join(" ")}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: toneDot[item.tone] }}
                  aria-hidden="true"
                />
                <p className="truncate text-xs font-medium text-zinc-200">{item.actor}</p>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-300">{item.activity}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-zinc-500">{item.timeLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


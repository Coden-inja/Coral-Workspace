"use client";

import { Panel } from "@/components/shared/panel";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAgentRuntime } from "@/hooks/use-agent-runtime";

export default function AgentsPage() {
  const tasks = useAgentRuntime();

  return (
    <div className="space-y-3">
      <SectionHeader
        eyebrow="Agent Control Plane"
        title="Investigation Agents"
        description="Operational queue for autonomous investigation agents."
      />
      <Panel title="Runtime Pool" description="Agent workloads and orchestration status." padding="md">
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-100">{task.model}</p>
                <StatusBadge
                  label={task.state}
                  tone={task.state === "completed" ? "healthy" : task.state === "running" ? "info" : "warning"}
                  size="sm"
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <p>Reasoning Progress: {task.progress}%</p>
                <p>Confidence: {task.confidence}%</p>
              </div>
              <div className="mt-2 h-1.5 rounded bg-zinc-800">
                <div className="h-1.5 rounded bg-blue-500/70 transition-all" style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          ))}
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
            Queue state: {tasks.filter((task) => task.state === "queued").length} queued,{" "}
            {tasks.filter((task) => task.state === "running").length} active.
          </div>
        </div>
      </Panel>
    </div>
  );
}


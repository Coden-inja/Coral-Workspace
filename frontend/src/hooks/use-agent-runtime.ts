"use client";

import { useEffect, useState } from "react";

import type { AgentRuntime } from "@/contracts";
import { getAgentRuntime } from "@/services/api";

export function useAgentRuntime() {
  const [tasks, setTasks] = useState<AgentRuntime[]>([]);

  useEffect(() => {
    void getAgentRuntime().then(setTasks);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.state !== "running") return task;
          const nextProgress = Math.min(100, task.progress + Math.floor(Math.random() * 8));
          return {
            ...task,
            progress: nextProgress,
            state: nextProgress >= 100 ? "completed" : "running",
            confidence: Math.min(99, task.confidence + (Math.random() > 0.7 ? 1 : 0)),
          };
        }),
      );
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  return tasks;
}

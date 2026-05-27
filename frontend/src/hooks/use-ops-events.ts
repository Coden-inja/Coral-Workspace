"use client";

import { useEffect } from "react";

import type { WebsocketOpsEvent } from "@/contracts";
import { subscribeToOpsEvents } from "@/services/realtime";

type UseOpsEventsOptions = {
  intervalMs?: number;
  onEvent: (event: WebsocketOpsEvent) => void;
};

export function useOpsEvents({ onEvent, intervalMs }: UseOpsEventsOptions) {
  useEffect(() => subscribeToOpsEvents(onEvent, intervalMs), [intervalMs, onEvent]);
}

"use client";

import { useEffect } from "react";

type InvestigationEvent = {
  type: "heartbeat" | "connector_warning";
  message: string;
};

type UseInvestigationEventsOptions = {
  investigationId: string;
  onConnectionChange?: (isConnected: boolean) => void;
  onEvent?: (event: InvestigationEvent) => void;
};

export function useInvestigationEvents({
  investigationId,
  onConnectionChange,
  onEvent,
}: UseInvestigationEventsOptions) {
  useEffect(() => {
    let active = true;

    const interval = window.setInterval(() => {
      if (!active) return;
      onEvent?.({
        type: "heartbeat",
        message: `Mock stream heartbeat for ${investigationId}`,
      });
    }, 5000);

    const disconnectTimer = window.setTimeout(() => {
      if (!active) return;
      onConnectionChange?.(false);
      onEvent?.({
        type: "connector_warning",
        message: "Connector websocket disconnected. Retrying mock stream.",
      });
    }, 12000);

    const reconnectTimer = window.setTimeout(() => {
      if (!active) return;
      onConnectionChange?.(true);
    }, 17000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.clearTimeout(disconnectTimer);
      window.clearTimeout(reconnectTimer);
    };
  }, [investigationId, onConnectionChange, onEvent]);
}


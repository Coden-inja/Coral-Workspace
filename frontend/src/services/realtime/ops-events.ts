import type { WebsocketOpsEvent } from "@/contracts";
import { generateMockOpsEvent } from "@/services/mock/events";

export type OpsEventHandler = (event: WebsocketOpsEvent) => void;

class MockOpsEventDispatcher {
  private listeners = new Set<OpsEventHandler>();
  private timer: number | null = null;
  private intervalMs = 3500;

  subscribe(handler: OpsEventHandler, intervalMs?: number): () => void {
    this.listeners.add(handler);
    if (intervalMs && intervalMs > 0) {
      this.intervalMs = intervalMs;
    }
    this.start();
    return () => this.unsubscribe(handler);
  }

  private unsubscribe(handler: OpsEventHandler) {
    this.listeners.delete(handler);
    if (this.listeners.size === 0) this.stop();
  }

  private emit(event: WebsocketOpsEvent) {
    this.listeners.forEach((handler) => handler(event));
  }

  private start() {
    if (this.timer !== null || typeof window === "undefined") return;
    this.timer = window.setInterval(() => this.emit(generateMockOpsEvent()), this.intervalMs);
  }

  private stop() {
    if (this.timer === null || typeof window === "undefined") return;
    window.clearInterval(this.timer);
    this.timer = null;
  }
}

const dispatcher = new MockOpsEventDispatcher();

export function subscribeToOpsEvents(callback: OpsEventHandler, intervalMs?: number): () => void {
  return dispatcher.subscribe(callback, intervalMs);
}

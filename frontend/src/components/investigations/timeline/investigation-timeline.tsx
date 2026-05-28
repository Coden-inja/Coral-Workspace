"use client";

import { useCallback, useMemo, useState } from "react";

import type { EvidenceCardModel, EvidenceDrawerItem, InvestigationModel } from "@/components/investigations/timeline/types";
import { TimelineStep } from "@/components/investigations/timeline/timeline-step";
import { ContainmentRecommendations } from "@/components/investigations/timeline/containment-recommendations";
import { AnalystActivityFeed } from "@/components/investigations/timeline/analyst-activity-feed";
import { EvidenceDrawer } from "@/components/investigations/timeline/evidence-drawer";
import { InvestigationGraph } from "@/components/investigations/timeline/investigation-graph";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useInvestigationStore } from "@/components/investigations/state/investigation-store";
import { useInvestigationEvents } from "@/hooks/use-investigation-events";
import { useOpsEvents } from "@/hooks/use-ops-events";

type InvestigationTimelineProps = {
  investigation: InvestigationModel;
};

function asDrawerItemFromLink(type: "system" | "event", label: string, step: InvestigationModel["timeline"][number]): EvidenceDrawerItem {
  return {
    id: `${type}-${step.id}-${label}`,
    title: `${type === "system" ? "Linked system" : "Linked event"}: ${label}`,
    timestamp: step.timeLabel,
    riskScore: 68,
    sourceConnector: type === "system" ? label : "timeline-event-correlation",
    relatedEntities: step.linkedSystems,
    analystNotes: "Opened from linked context item for expanded investigation review.",
    aiReasoningSummary: "Context item selected to pivot correlated evidence and telemetry.",
    rawTelemetry: { type, label, stepId: step.id, relatedEvents: step.linkedEvents },
    confidence: 72,
    detectionSource: "timeline-linkage-layer",
    entityId: label,
    evidenceType: "Linked Context",
    summary: step.narrative,
  };
}

export function InvestigationTimeline({ investigation }: InvestigationTimelineProps) {
  const { state, selectStep, toggleStep, selectGraphNode, hoverGraphNode, openEvidenceDrawer, closeEvidenceDrawer, setWebsocketConnected } =
    useInvestigationStore();
  const [liveActivities, setLiveActivities] = useState(investigation.analystActivity);
  const [animatedActivityIds, setAnimatedActivityIds] = useState<string[]>([]);
  const [liveStepPulseIds, setLiveStepPulseIds] = useState<string[]>([]);

  useInvestigationEvents({
    investigationId: investigation.id,
    onConnectionChange: setWebsocketConnected,
  });

  useOpsEvents({
    intervalMs: 4200,
    onEvent: (event) => {
      if (event.type === "analyst_activity" && event.incidentId === investigation.id) {
        const id = `live-${Date.now()}`;
        setLiveActivities((prev) => [{ id, actor: event.actor, activity: event.message, timeLabel: "now", tone: event.tone }, ...prev].slice(0, 8));
        setAnimatedActivityIds((prev) => [id, ...prev].slice(0, 6));
        window.setTimeout(() => {
          setAnimatedActivityIds((prev) => prev.filter((item) => item !== id));
        }, 1000);
      }
      if (event.type === "investigation_step" && event.incidentId === investigation.id) {
        setLiveStepPulseIds((prev) => [event.stepId, ...prev].slice(0, 4));
        window.setTimeout(() => {
          setLiveStepPulseIds((prev) => prev.filter((stepId) => stepId !== event.stepId));
        }, 1400);
      }
    },
  });

  const timeline = useMemo(
    () =>
      state.activeFilters.relatedStepIds.length
        ? investigation.timeline.filter((step) => state.activeFilters.relatedStepIds.includes(step.id))
        : investigation.timeline,
    [investigation.timeline, state.activeFilters.relatedStepIds],
  );

  const evidenceById = useMemo(() => {
    return new Map(investigation.timeline.flatMap((step) => step.evidence).map((evidence) => [evidence.id, evidence]));
  }, [investigation.timeline]);

  const handleSelectNode = useCallback(
    (node: InvestigationModel["attackChain"]["nodes"][number]) => {
      selectGraphNode(node.id, node.relatedStepIds, node.kind === "connector" ? node.label : undefined);
      if (!node.relatedEvidenceId) return;
      const evidence = evidenceById.get(node.relatedEvidenceId);
      if (evidence) openEvidenceDrawer(evidence as EvidenceCardModel);
    },
    [evidenceById, openEvidenceDrawer, selectGraphNode],
  );

  return (
    <div className="space-y-3">
      {!state.websocketConnected ? (
        <div className="rounded-md border border-amber-800/70 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
          Websocket disconnected banner: live connector stream temporarily unavailable.
        </div>
      ) : null}

      <header className="space-y-2">
        <SectionHeader
          eyebrow="Incident Investigation Timeline"
          title={investigation.title}
          description={investigation.summary}
          className="items-start"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge label={investigation.overallStatus} tone={investigation.overallTone} size="md" />
          <StatusBadge label={`Start ${investigation.startedAt}`} tone="neutral" size="sm" />
          <StatusBadge label={`Updated ${investigation.updatedAt}`} tone="neutral" size="sm" />
          <span className="ml-1 text-[11px] uppercase tracking-[0.08em] text-zinc-500">Incident {investigation.id}</span>
        </div>
      </header>

      <div className="grid gap-3 xl:grid-cols-12">
        <div className="space-y-3 xl:col-span-8">
          <InvestigationGraph
            nodes={investigation.attackChain.nodes}
            edges={investigation.attackChain.edges}
            selectedNodeId={state.selectedGraphNodeId}
            hoveredNodeId={state.hoveredGraphNodeId}
            onHoverNode={hoverGraphNode}
            onSelectNode={handleSelectNode}
          />

          <div className="space-y-2.5">
            {timeline.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs text-zinc-400">
                Empty investigation state: no timeline steps match current graph filter.
              </div>
            ) : (
              timeline.map((step, index) => (
                <TimelineStep
                  key={step.id}
                  step={step}
                  isSelected={step.id === state.selectedTimelineStepId}
                  isExpanded={state.expandedTimelineStepIds.includes(step.id) || step.id === state.selectedTimelineStepId}
                  onSelect={() => selectStep(step.id)}
                  onToggleExpanded={() => toggleStep(step.id)}
                  onEvidenceOpen={(evidence) => openEvidenceDrawer(evidence)}
                  onLinkedSystemOpen={(system) => openEvidenceDrawer(asDrawerItemFromLink("system", system, step))}
                  onLinkedEventOpen={(eventLabel) => openEvidenceDrawer(asDrawerItemFromLink("event", eventLabel, step))}
                  isGraphHighlighted={state.activeFilters.relatedStepIds.includes(step.id)}
                  isGraphHovered={!!state.hoveredGraphNodeId && investigation.attackChain.nodes.some((n) => n.id === state.hoveredGraphNodeId && n.relatedStepIds.includes(step.id))}
                  isActive={index === timeline.length - 1 || liveStepPulseIds.includes(step.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 xl:col-span-4 xl:sticky xl:top-20 xl:self-start">
          <ContainmentRecommendations items={investigation.containment} />
          <AnalystActivityFeed items={liveActivities} animatedIds={animatedActivityIds} />
        </div>
      </div>

      <EvidenceDrawer evidence={state.evidenceDrawerItem} onClose={closeEvidenceDrawer} />
    </div>
  );
}


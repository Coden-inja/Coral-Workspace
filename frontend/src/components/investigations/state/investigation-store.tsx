"use client";

import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from "react";

import type { EvidenceCardModel, EvidenceDrawerItem, InvestigationDetail } from "@/lib/mock-data";

type InvestigationState = {
  selectedInvestigationId: string;
  selectedTimelineStepId: string | null;
  expandedTimelineStepIds: string[];
  selectedGraphNodeId: string | null;
  hoveredGraphNodeId: string | null;
  evidenceDrawerItem: EvidenceDrawerItem | null;
  activeFilters: {
    search: string;
    connector: string | null;
    relatedStepIds: string[];
  };
  analystContext: {
    notesByEvidenceId: Record<string, string>;
  };
  loading: boolean;
  error: string | null;
  websocketConnected: boolean;
};

type InvestigationAction =
  | { type: "set_loading"; payload: boolean }
  | { type: "set_error"; payload: string | null }
  | { type: "select_step"; payload: string }
  | { type: "toggle_step"; payload: string }
  | { type: "select_graph_node"; payload: { nodeId: string | null; relatedStepIds: string[]; connector?: string } }
  | { type: "hover_graph_node"; payload: string | null }
  | { type: "open_drawer"; payload: EvidenceDrawerItem }
  | { type: "close_drawer" }
  | { type: "set_search_filter"; payload: string }
  | { type: "set_websocket_connected"; payload: boolean }
  | { type: "set_analyst_note"; payload: { evidenceId: string; note: string } };

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function createDrawerItemFromEvidence(evidence: EvidenceCardModel): EvidenceDrawerItem {
  return {
    id: evidence.id,
    title: evidence.title,
    timestamp: evidence.timestamp,
    riskScore: evidence.riskScore,
    sourceConnector: evidence.sourceConnector,
    relatedEntities: evidence.relatedEntities,
    analystNotes: evidence.analystNotes,
    aiReasoningSummary: evidence.aiReasoningSummary,
    rawTelemetry: evidence.rawTelemetry,
    confidence: evidence.confidence,
    detectionSource: evidence.detectionSource,
    entityId: evidence.entityId,
    evidenceType: evidence.evidenceType,
    summary: evidence.summary,
  };
}

function reducer(state: InvestigationState, action: InvestigationAction): InvestigationState {
  switch (action.type) {
    case "set_loading":
      return state.loading === action.payload ? state : { ...state, loading: action.payload };
    case "set_error":
      return state.error === action.payload ? state : { ...state, error: action.payload };
    case "select_step":
      if (state.selectedTimelineStepId === action.payload && state.expandedTimelineStepIds.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        selectedTimelineStepId: action.payload,
        expandedTimelineStepIds: state.expandedTimelineStepIds.includes(action.payload)
          ? state.expandedTimelineStepIds
          : [...state.expandedTimelineStepIds, action.payload],
      };
    case "toggle_step":
      return {
        ...state,
        expandedTimelineStepIds: state.expandedTimelineStepIds.includes(action.payload)
          ? state.expandedTimelineStepIds.filter((id) => id !== action.payload)
          : [...state.expandedTimelineStepIds, action.payload],
      };
    case "select_graph_node":
      if (
        state.selectedGraphNodeId === action.payload.nodeId &&
        state.activeFilters.connector === (action.payload.connector ?? null) &&
        arraysEqual(state.activeFilters.relatedStepIds, action.payload.relatedStepIds)
      ) {
        return state;
      }
      return {
        ...state,
        selectedGraphNodeId: action.payload.nodeId,
        activeFilters: {
          ...state.activeFilters,
          connector: action.payload.connector ?? null,
          relatedStepIds: action.payload.relatedStepIds,
        },
      };
    case "hover_graph_node":
      return state.hoveredGraphNodeId === action.payload ? state : { ...state, hoveredGraphNodeId: action.payload };
    case "open_drawer":
      return state.evidenceDrawerItem?.id === action.payload.id ? state : { ...state, evidenceDrawerItem: action.payload };
    case "close_drawer":
      return state.evidenceDrawerItem === null ? state : { ...state, evidenceDrawerItem: null };
    case "set_search_filter":
      return state.activeFilters.search === action.payload
        ? state
        : { ...state, activeFilters: { ...state.activeFilters, search: action.payload } };
    case "set_websocket_connected":
      return state.websocketConnected === action.payload
        ? state
        : { ...state, websocketConnected: action.payload };
    case "set_analyst_note":
      if (state.analystContext.notesByEvidenceId[action.payload.evidenceId] === action.payload.note) {
        return state;
      }
      return {
        ...state,
        analystContext: {
          ...state.analystContext,
          notesByEvidenceId: {
            ...state.analystContext.notesByEvidenceId,
            [action.payload.evidenceId]: action.payload.note,
          },
        },
      };
    default:
      return state;
  }
}

type InvestigationStoreValue = {
  state: InvestigationState;
  selectStep: (stepId: string) => void;
  toggleStep: (stepId: string) => void;
  selectGraphNode: (nodeId: string | null, relatedStepIds: string[], connector?: string) => void;
  hoverGraphNode: (nodeId: string | null) => void;
  openEvidenceDrawer: (evidence: EvidenceCardModel | EvidenceDrawerItem) => void;
  closeEvidenceDrawer: () => void;
  setSearchFilter: (value: string) => void;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setWebsocketConnected: (value: boolean) => void;
  setAnalystNote: (evidenceId: string, note: string) => void;
};

const InvestigationStoreContext = createContext<InvestigationStoreValue | null>(null);

type InvestigationStoreProviderProps = {
  investigation: InvestigationDetail;
  children: ReactNode;
};

export function InvestigationStoreProvider({ investigation, children }: InvestigationStoreProviderProps) {
  const initialStep = investigation.timeline[0]?.id ?? null;
  const [state, dispatch] = useReducer(reducer, {
    selectedInvestigationId: investigation.id,
    selectedTimelineStepId: initialStep,
    expandedTimelineStepIds: initialStep ? [initialStep] : [],
    selectedGraphNodeId: null,
    hoveredGraphNodeId: null,
    evidenceDrawerItem: null,
    activeFilters: { search: "", connector: null, relatedStepIds: [] },
    analystContext: { notesByEvidenceId: {} },
    loading: false,
    error: null,
    websocketConnected: true,
  } satisfies InvestigationState);

  const selectStep = useCallback((stepId: string) => dispatch({ type: "select_step", payload: stepId }), []);
  const toggleStep = useCallback((stepId: string) => dispatch({ type: "toggle_step", payload: stepId }), []);
  const selectGraphNode = useCallback(
    (nodeId: string | null, relatedStepIds: string[], connector?: string) =>
      dispatch({ type: "select_graph_node", payload: { nodeId, relatedStepIds, connector } }),
    [],
  );
  const hoverGraphNode = useCallback((nodeId: string | null) => dispatch({ type: "hover_graph_node", payload: nodeId }), []);
  const openEvidenceDrawer = useCallback(
    (evidence: EvidenceCardModel | EvidenceDrawerItem) =>
      dispatch({
        type: "open_drawer",
        payload: "relatedSystems" in evidence ? createDrawerItemFromEvidence(evidence) : evidence,
      }),
    [],
  );
  const closeEvidenceDrawer = useCallback(() => dispatch({ type: "close_drawer" }), []);
  const setSearchFilter = useCallback((value: string) => dispatch({ type: "set_search_filter", payload: value }), []);
  const setLoading = useCallback((value: boolean) => dispatch({ type: "set_loading", payload: value }), []);
  const setError = useCallback((value: string | null) => dispatch({ type: "set_error", payload: value }), []);
  const setWebsocketConnected = useCallback(
    (value: boolean) => dispatch({ type: "set_websocket_connected", payload: value }),
    [],
  );
  const setAnalystNote = useCallback(
    (evidenceId: string, note: string) => dispatch({ type: "set_analyst_note", payload: { evidenceId, note } }),
    [],
  );

  const value = useMemo<InvestigationStoreValue>(
    () => ({
      state,
      selectStep,
      toggleStep,
      selectGraphNode,
      hoverGraphNode,
      openEvidenceDrawer,
      closeEvidenceDrawer,
      setSearchFilter,
      setLoading,
      setError,
      setWebsocketConnected,
      setAnalystNote,
    }),
    [
      closeEvidenceDrawer,
      hoverGraphNode,
      openEvidenceDrawer,
      selectGraphNode,
      selectStep,
      setAnalystNote,
      setError,
      setLoading,
      setSearchFilter,
      setWebsocketConnected,
      state,
      toggleStep,
    ],
  );

  return <InvestigationStoreContext.Provider value={value}>{children}</InvestigationStoreContext.Provider>;
}

export function useInvestigationStore() {
  const context = useContext(InvestigationStoreContext);
  if (!context) {
    throw new Error("useInvestigationStore must be used within InvestigationStoreProvider");
  }
  return context;
}


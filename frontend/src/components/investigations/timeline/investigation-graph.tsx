"use client";

import { memo, useMemo, useState } from "react";

import type { AttackChainEdgeModel, AttackChainNodeModel } from "@/components/investigations/timeline/types";

const toneStroke: Record<AttackChainNodeModel["tone"], string> = {
  neutral: "#3f3f46",
  healthy: "#34d399",
  warning: "#fbbf24",
  critical: "#f87171",
  info: "#60a5fa",
};

type InvestigationGraphProps = {
  nodes: AttackChainNodeModel[];
  edges: AttackChainEdgeModel[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (node: AttackChainNodeModel) => void;
  onHoverNode: (nodeId: string | null) => void;
};

function InvestigationGraphImpl({
  nodes,
  edges,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
}: InvestigationGraphProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const width = 640;
  const height = 240;
  const minScale = 0.75;
  const maxScale = 1.8;

  const edgeLines = useMemo(() => {
    return edges
      .map((edge) => {
        const from = nodes.find((node) => node.id === edge.fromId);
        const to = nodes.find((node) => node.id === edge.toId);
        if (!from || !to) return null;
        return { edge, from, to };
      })
      .filter(Boolean) as { edge: AttackChainEdgeModel; from: AttackChainNodeModel; to: AttackChainNodeModel }[];
  }, [edges, nodes]);

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const set = new Set<string>([selectedNodeId]);
    edgeLines.forEach(({ from, to }) => {
      if (from.id === selectedNodeId || to.id === selectedNodeId) {
        set.add(from.id);
        set.add(to.id);
      }
    });
    return set;
  }, [edgeLines, selectedNodeId]);

  if (nodes.length === 0 || edges.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
        <p className="text-sm text-zinc-300">Graph query failure state: no relationship data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-700/90 bg-zinc-950/70 p-3 shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">Investigation Graph</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(minScale, prev - 0.1))}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300"
          >
            -
          </button>
          <span className="font-mono text-[11px] text-zinc-400">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(maxScale, prev + 0.1))}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-2 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950/60">
        <div
          className="relative h-[260px] w-full cursor-grab active:cursor-grabbing"
          onMouseMove={(event) => {
            if (event.buttons !== 1) return;
            setOffset((prev) => ({ x: prev.x + event.movementX, y: prev.y + event.movementY }));
          }}
          onWheel={(event) => {
            event.preventDefault();
            const direction = event.deltaY > 0 ? -0.08 : 0.08;
            setScale((prev) => Math.min(maxScale, Math.max(minScale, prev + direction)));
          }}
        >
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
            <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
              {edgeLines.map(({ edge, from, to }) => (
                <g key={edge.id}>
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={
                      selectedNodeId && (from.id === selectedNodeId || to.id === selectedNodeId)
                        ? "rgba(96,165,250,0.85)"
                        : "rgba(148,163,184,0.35)"
                    }
                    opacity={!selectedNodeId || from.id === selectedNodeId || to.id === selectedNodeId ? 1 : 0.25}
                    strokeWidth={selectedNodeId && (from.id === selectedNodeId || to.id === selectedNodeId) ? 2.4 : 1.8}
                  />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 6} fontSize="10" fill="#94a3b8">
                    {edge.label}
                  </text>
                </g>
              ))}

              {nodes.map((node) => {
                const selected = selectedNodeId === node.id;
                const hovered = hoveredNodeId === node.id;
                const stroke = toneStroke[node.tone];
                const fill = selected ? "rgba(30,58,138,0.55)" : "rgba(24,24,27,0.95)";
                const dimmed = selectedNodeId ? !connectedNodeIds.has(node.id) : false;
                return (
                  <g
                    key={node.id}
                    onClick={() => onSelectNode(node)}
                    onMouseEnter={() => onHoverNode(node.id)}
                    onMouseLeave={() => onHoverNode(null)}
                    style={{ cursor: "pointer" }}
                    opacity={dimmed ? 0.25 : 1}
                  >
                    <circle cx={node.x} cy={node.y} r={hovered ? 18 : 15} fill={fill} stroke={stroke} strokeWidth={2} />
                    <text x={node.x} y={node.y + 28} textAnchor="middle" fill="#e4e4e7" fontSize="10">
                      {node.label}
                    </text>
                    <text x={node.x} y={node.y + 40} textAnchor="middle" fill="#71717a" fontSize="9">
                      {node.kind}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="absolute bottom-2 right-2 rounded border border-zinc-800 bg-zinc-950/90 p-1">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[60px] w-[120px]">
              {edgeLines.map(({ edge, from, to }) => (
                <line
                  key={edge.id}
                  x1={from.x / 6}
                  y1={from.y / 4}
                  x2={to.x / 6}
                  y2={to.y / 4}
                  stroke="rgba(113,113,122,0.6)"
                  strokeWidth={1}
                />
              ))}
              {nodes.map((node) => (
                <circle key={node.id} cx={node.x / 6} cy={node.y / 4} r={2.2} fill={toneStroke[node.tone]} />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export const InvestigationGraph = memo(InvestigationGraphImpl);


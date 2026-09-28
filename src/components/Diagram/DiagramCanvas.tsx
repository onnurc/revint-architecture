import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Background, BackgroundVariant, Controls, MiniMap,
  ReactFlow, ReactFlowProvider,
  type Edge, type Node,
} from '@xyflow/react';
import { architecture } from '../../data/architecture';
import { useAppStore } from '../../store/useAppStore';
import { useVisibleSteps } from '../../hooks/useVisibleSteps';
import { ArchEdge } from './edges';
import { ServiceNode, type ServiceNodeData } from './ServiceNode';
import { ZoneGroupNode } from './ZoneGroupNode';
import type { EdgeMeta, NodeMeta, Zone } from '../../types';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 64;

const nodeTypes = { zone: ZoneGroupNode, service: ServiceNode };
const edgeTypes = { arch: ArchEdge };

interface AbsRect { x: number; y: number; cx: number; cy: number; }

function computeAbsRects(nodes: NodeMeta[], zones: Zone[]): Record<string, AbsRect> {
  const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));
  const out: Record<string, AbsRect> = {};
  for (const n of nodes) {
    const z = zoneById[n.zoneId];
    const x = z.x + n.x;
    const y = z.y + n.y;
    out[n.id] = { x, y, cx: x + NODE_WIDTH / 2, cy: y + NODE_HEIGHT / 2 };
  }
  return out;
}

function faceSide(from: AbsRect, to: AbsRect): 'right' | 'left' | 'top' | 'bottom' {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left';
  return dy >= 0 ? 'bottom' : 'top';
}

function DiagramInner({ wrapperRef }: { wrapperRef?: React.RefObject<HTMLDivElement | null> }) {
  const activeFlow = useAppStore((s) => s.activeFlow);
  const stepIndex = useAppStore((s) => s.stepIndex);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId);
  const visible = useVisibleSteps();

  const absRects = useMemo(() => computeAbsRects(architecture.nodes, architecture.zones), []);

  const derived = useMemo(() => {
    const flowNodeIds = new Set<string>();
    const flowEdgeIds = new Set<string>();
    const activeNow: Array<{ edgeId: string; from: string; to: string }> = [];

    if (activeFlow !== 'all' && visible) {
      for (const st of visible.steps) {
        for (const seg of st.segments) {
          flowEdgeIds.add(seg.edgeId);
          flowNodeIds.add(seg.from);
          flowNodeIds.add(seg.to);
        }
      }
      const cur = visible.steps[stepIndex];
      if (cur) activeNow.push(...cur.segments);

      // also highlight parallel group
      const pg = cur?.parallelGroup;
      if (pg != null) {
        for (const st of visible.steps) {
          if (st.parallelGroup === pg) activeNow.push(...st.segments);
        }
      }
    }

    const highlightedNodeIds = new Set<string>();
    for (const s of activeNow) {
      highlightedNodeIds.add(s.from);
      highlightedNodeIds.add(s.to);
    }

    return { flowNodeIds, flowEdgeIds, activeNow, highlightedNodeIds };
  }, [activeFlow, stepIndex, visible]);

  const rfNodes = useMemo<Node[]>(() => {
    const nodes: Node[] = [];
    for (const z of architecture.zones) {
      nodes.push({
        id: z.id, type: 'zone',
        position: { x: z.x, y: z.y },
        style: { width: z.width, height: z.height, zIndex: 0 },
        selectable: false, draggable: false, connectable: false,
        data: { zone: z },
      });
    }
    for (const n of architecture.nodes) {
      const zone = architecture.zones.find((z) => z.id === n.zoneId)!;
      const dimmed = activeFlow !== 'all' && derived.flowNodeIds.size > 0 && !derived.flowNodeIds.has(n.id);
      const highlighted = derived.highlightedNodeIds.has(n.id);
      const nodeData: ServiceNodeData = { node: n, zone, dimmed, highlighted, selected: selectedNodeId === n.id };
      nodes.push({
        id: n.id, type: 'service',
        parentId: n.zoneId, extent: 'parent',
        position: { x: n.x, y: n.y },
        width: NODE_WIDTH, height: NODE_HEIGHT,
        draggable: false, connectable: false, selectable: true,
        data: nodeData as unknown as Record<string, unknown>,
      });
    }
    return nodes;
  }, [activeFlow, derived, selectedNodeId]);

  const rfEdges = useMemo<Edge[]>(() => {
    const packetKey = activeFlow === 'all' ? 0 : stepIndex + 1 + (visible?.steps[stepIndex]?.id?.length ?? 0);
    const activeEdgeIds = new Set(derived.activeNow.map((s) => s.edgeId));
    const activeDirMap = new Map<string, 'fwd' | 'rev'>();
    for (const seg of derived.activeNow) {
      const meta = architecture.edges.find((e) => e.id === seg.edgeId);
      if (!meta) continue;
      activeDirMap.set(seg.edgeId, meta.source === seg.from ? 'fwd' : 'rev');
    }

    return architecture.edges.map((e: EdgeMeta) => {
      const src = absRects[e.source];
      const tgt = absRects[e.target];
      if (!src || !tgt) return null;
      const sourceSide = faceSide(src, tgt);
      const targetSide = faceSide(tgt, src);
      const dimmed = activeFlow !== 'all' && derived.flowEdgeIds.size > 0 && !derived.flowEdgeIds.has(e.id);
      const isActive = activeEdgeIds.has(e.id);
      const flow = architecture.flows.find((f) => f.id === activeFlow);
      return {
        id: e.id, source: e.source, target: e.target,
        sourceHandle: `s-${sourceSide}`, targetHandle: `t-${targetSide}`,
        type: 'arch',
        data: { kind: e.kind, label: e.label, dimmed, activeColor: isActive ? flow?.color : undefined, packetDir: isActive ? (activeDirMap.get(e.id) ?? 'fwd') : null, packetKey },
        zIndex: isActive ? 10 : 1,
      } satisfies Edge;
    }).filter(Boolean) as Edge[];
  }, [absRects, activeFlow, stepIndex, visible, derived]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.type === 'service') setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
  }, [selectedNodeId, setSelectedNodeId]);

  return (
    <div ref={wrapperRef} className="diagram-bg relative h-full w-full overflow-hidden rounded-2xl border border-line">
      <ReactFlow
        nodes={rfNodes} edges={rfEdges}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView fitViewOptions={{ padding: 0.08 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2} maxZoom={1.8}
        panOnScroll selectionOnDrag={false}
        nodesDraggable={false} nodesConnectable={false}
        defaultEdgeOptions={{ type: 'arch' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgb(var(--line))" />
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap position="bottom-right" pannable zoomable
          nodeColor={(n) => n.type === 'zone' ? 'rgba(255,255,255,0.04)' : 'rgb(var(--surface-3))'}
          maskColor="rgb(var(--surface-0) / 0.6)"
        />
      </ReactFlow>
    </div>
  );
}

export function DiagramCanvas(props: { wrapperRef?: React.RefObject<HTMLDivElement | null> }) {
  const theme = useAppStore((s) => s.theme);
  const key = useRef(0);
  useEffect(() => { key.current += 1; }, [theme]);
  return (
    <ReactFlowProvider>
      <DiagramInner {...props} />
    </ReactFlowProvider>
  );
}

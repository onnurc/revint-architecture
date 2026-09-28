import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, Position } from '@xyflow/react';
import type { EdgeKind } from '../../types';

export interface ArchEdgeData extends Record<string, unknown> {
  kind: EdgeKind;
  label?: string;
  dimmed?: boolean;
  activeColor?: string;
  packetDir?: 'fwd' | 'rev' | null;
  packetKey?: number;
}

function ArchEdgeBase({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps) {
  const d = (data ?? {}) as ArchEdgeData;
  const [path, labelX, labelY] = getBezierPath({
    sourceX, sourceY,
    sourcePosition: sourcePosition ?? Position.Right,
    targetX, targetY,
    targetPosition: targetPosition ?? Position.Left,
  });

  const dashed = d.kind === 'async' || d.kind === 'response' || d.kind === 'webhook';
  const activeColor = d.activeColor;
  const isActive = !!activeColor && !!d.packetDir;

  const stroke = isActive ? activeColor : d.dimmed ? 'rgb(var(--line) / 0.9)' : 'rgb(var(--ink-faint))';
  const strokeWidth = isActive ? 2.5 : 1.6;
  const opacity = d.dimmed ? 0.15 : 1;
  const pathId = `re-${id}`;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray: dashed ? '6 5' : undefined,
          opacity,
          transition: 'stroke 200ms ease, opacity 200ms ease',
        }}
        markerEnd={undefined}
      />
      <path id={pathId} d={path} fill="none" stroke="none" pointerEvents="none" />

      {isActive && (
        <g key={d.packetKey ?? 0} style={{ pointerEvents: 'none' }}>
          <circle
            r={7}
            fill={activeColor}
            style={{ filter: `drop-shadow(0 0 6px ${activeColor}) drop-shadow(0 0 14px ${activeColor})` }}
          >
            <animateMotion
              dur="1.6s"
              repeatCount="indefinite"
              rotate="auto"
              keyPoints={d.packetDir === 'rev' ? '1;0' : '0;1'}
              keyTimes="0;1"
              calcMode="linear"
            >
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        </g>
      )}

      {d.label && !d.dimmed && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded-md border border-line bg-surface-1/95 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink-soft"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color: isActive ? activeColor : undefined,
              borderColor: isActive ? activeColor : undefined,
            }}
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const ArchEdge = memo(ArchEdgeBase);

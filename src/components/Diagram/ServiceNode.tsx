import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import clsx from 'clsx';
import type { NodeMeta, Zone } from '../../types';

export interface ServiceNodeData extends Record<string, unknown> {
  node: NodeMeta;
  zone: Zone;
  dimmed?: boolean;
  highlighted?: boolean;
  selected?: boolean;
}

const HIDDEN_HANDLE = {
  opacity: 0,
  width: 8,
  height: 8,
  background: 'transparent',
  border: 'none',
  pointerEvents: 'none' as const,
};

const SIDES = [
  { pos: Position.Top, key: 'top' },
  { pos: Position.Right, key: 'right' },
  { pos: Position.Bottom, key: 'bottom' },
  { pos: Position.Left, key: 'left' },
];

function ServiceNodeBase({ data }: NodeProps) {
  const { node, zone, dimmed, highlighted, selected } = data as unknown as ServiceNodeData;
  const Icon = node.icon;

  return (
    <div
      className={clsx(
        'group relative flex w-[240px] items-center gap-3 rounded-xl border border-line bg-surface-2/95 px-3 py-2.5 shadow-card transition-all duration-300',
        'hover:border-accent hover:-translate-y-0.5',
        dimmed && 'opacity-20',
        (highlighted || selected) && 'node-highlighted',
      )}
    >
      {SIDES.map(({ pos, key }) => (
        <span key={key}>
          <Handle type="source" position={pos} id={`s-${key}`} isConnectable={false} style={HIDDEN_HANDLE} />
          <Handle type="target" position={pos} id={`t-${key}`} isConnectable={false} style={HIDDEN_HANDLE} />
        </span>
      ))}
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ background: `${zone.color}1a`, color: zone.color }}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-semibold leading-tight text-ink">{node.title}</div>
        <div className="mt-0.5 truncate font-mono text-[10px] text-ink-faint">{node.tech}</div>
      </div>
    </div>
  );
}

export const ServiceNode = memo(ServiceNodeBase);

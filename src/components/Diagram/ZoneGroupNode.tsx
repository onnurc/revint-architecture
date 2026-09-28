import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { Zone } from '../../types';

interface ZoneNodeData extends Record<string, unknown> {
  zone: Zone;
}

function ZoneGroupNodeBase({ data }: NodeProps) {
  const { zone } = data as unknown as ZoneNodeData;
  return (
    <div
      className="h-full w-full rounded-2xl border relative overflow-visible"
      style={{
        borderColor: `${zone.color}44`,
        background: `linear-gradient(135deg, ${zone.color}0e, transparent 60%), rgb(var(--surface-1) / 0.50)`,
        backdropFilter: 'blur(4px)',
        boxShadow: `0 0 0 1px ${zone.color}22 inset`,
      }}
    >
      <div
        className="absolute -top-3 left-4 px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold tracking-wide uppercase"
        style={{
          background: 'rgb(var(--surface-0))',
          color: zone.color,
          border: `1px solid ${zone.color}55`,
        }}
      >
        {zone.label}
      </div>
    </div>
  );
}

export const ZoneGroupNode = memo(ZoneGroupNodeBase);

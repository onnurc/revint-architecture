import { useRef } from 'react';
import { DiagramCanvas } from '../Diagram/DiagramCanvas';
import { FlowSelector } from '../FlowPlayer/FlowSelector';
import { PlayerControls } from '../FlowPlayer/PlayerControls';
import { StepPanel } from '../FlowPlayer/StepPanel';
import { NodePanel } from '../NodePanel';
import { useAppStore } from '../../store/useAppStore';
import { architecture } from '../../data/architecture';

function ZoneLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-1 px-4 py-2.5">
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">Zones</span>
      {architecture.zones.map((z) => (
        <div key={z.id} className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: z.color }} />
          <span className="font-mono text-[10px] text-ink-soft">{z.label}</span>
        </div>
      ))}
    </div>
  );
}

function EdgeLegend() {
  const items = [
    { label: 'sync', style: 'solid', color: 'rgb(var(--ink))' },
    { label: 'async', style: 'dashed', color: 'rgb(var(--ink))' },
    { label: 'webhook', style: 'dashed', color: 'rgb(var(--ink))' },
    { label: 'response', style: 'dashed', color: 'rgb(var(--ink))' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface-1 px-4 py-2.5">
      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">Edge types</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <svg width="24" height="8" className="shrink-0">
            <line
              x1="0" y1="4" x2="24" y2="4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray={item.style === 'dashed' ? '4 3' : undefined}
              className="text-ink-soft"
            />
          </svg>
          <span className="font-mono text-[10px] text-ink-soft">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Architecture() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-6">
      {/* Title + hints */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Architecture Diagram</h2>
        <span className="font-mono text-xs text-ink-faint">
          Click a node for details · select a flow to animate packet movement · <kbd className="rounded bg-surface-2 px-1 text-[10px]">Space</kbd> to play
        </span>
      </div>

      {/* Legends */}
      <div className="flex flex-wrap gap-2">
        <ZoneLegend />
        <EdgeLegend />
      </div>

      {/* Flow selector */}
      <FlowSelector />

      {/* Main content: diagram + sidebar */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div style={{ height: 640 }}>
          <DiagramCanvas wrapperRef={wrapperRef} />
        </div>

        <div className="flex flex-col gap-3">
          {selectedNodeId && <NodePanel />}
          <PlayerControls />
          <StepPanel />
        </div>
      </div>
    </div>
  );
}

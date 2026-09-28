import { X, ExternalLink } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { architecture } from '../data/architecture';
import { boundedContexts } from '../data/boundedContexts';
import type { Maturity } from '../types';

const maturityStyle: Record<Maturity, { label: string; color: string }> = {
  live:    { label: 'Live',    color: '#22c55e' },
  partial: { label: 'Partial', color: '#f59e0b' },
  planned: { label: 'Planned', color: '#6366f1' },
  vision:  { label: 'Vision',  color: '#ec4899' },
};

function getMaturityForNode(nodeId: string): { maturity: Maturity; bcName: string; contextLabel: string } | null {
  for (const ctx of boundedContexts) {
    for (const comp of ctx.components) {
      const fileMatches = comp.files.some((f) => {
        const node = architecture.nodes.find((n) => n.id === nodeId);
        return node?.files.some((nf) => nf.startsWith(f) || f.startsWith(nf));
      });
      if (fileMatches) {
        return { maturity: comp.maturity, bcName: comp.name, contextLabel: ctx.label };
      }
    }
  }
  return null;
}

function Pill({ label, color, subtle }: { label: string; color: string; subtle?: boolean }) {
  if (subtle) {
    return (
      <span
        className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
        style={{ borderColor: `${color}44`, background: `${color}12`, color }}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
      style={{ background: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

export function NodePanel() {
  const selectedNodeId = useAppStore((s) => s.selectedNodeId);
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId);
  const setTab = useAppStore((s) => s.setTab);

  if (!selectedNodeId) return null;

  const node = architecture.nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const zone = architecture.zones.find((z) => z.id === node.zoneId)!;
  const Icon = node.icon;
  const maturityInfo = getMaturityForNode(selectedNodeId);

  // edges going out of and into this node
  const outEdges = architecture.edges.filter((e) => e.source === selectedNodeId);
  const inEdges = architecture.edges.filter((e) => e.target === selectedNodeId);

  const getNodeTitle = (id: string) => architecture.nodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-line bg-surface-1 shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3" style={{ borderBottom: `2px solid ${zone.color}33` }}>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ background: `${zone.color}1a`, color: zone.color }}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-ink leading-tight">{node.title}</div>
          <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{node.tech}</div>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="rounded p-1 text-ink-soft hover:bg-surface-2 hover:text-ink transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto p-4" style={{ maxHeight: 420 }}>
        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5">
          <Pill label={zone.label.replace(/①②③④⑤⑥ /, '')} color={zone.color} />
          {maturityInfo && (
            <Pill label={maturityStyle[maturityInfo.maturity].label} color={maturityStyle[maturityInfo.maturity].color} subtle />
          )}
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-ink-soft">{node.description}</p>

        {/* Responsibility */}
        <div className="rounded-lg bg-surface-2 px-3 py-2.5 text-sm">
          <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-ink-faint">Responsibility</div>
          <p className="text-xs leading-relaxed text-ink-soft">{node.responsibility}</p>
        </div>

        {/* Files */}
        {node.files.length > 0 && (
          <div>
            <div className="mb-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-faint">Source files</div>
            <div className="flex flex-wrap gap-1">
              {node.files.map((f) => (
                <span
                  key={f}
                  className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ background: `${zone.color}12`, color: zone.color }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bounded context cross-reference */}
        {maturityInfo && (
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: '#6366f133', background: '#6366f108' }}
          >
            <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-[#6366f1]">Bounded Context</div>
            <div className="text-xs font-medium text-ink">{maturityInfo.bcName}</div>
            <div className="mt-0.5 text-[11px] text-ink-faint">{maturityInfo.contextLabel}</div>
            <button
              onClick={() => setTab('components')}
              className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-[#6366f1] hover:underline"
            >
              View in Bounded Contexts <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Connections */}
        {(outEdges.length > 0 || inEdges.length > 0) && (
          <div className="flex flex-col gap-2">
            {outEdges.length > 0 && (
              <div>
                <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-ink-faint">Calls →</div>
                <div className="flex flex-wrap gap-1">
                  {outEdges.map((e) => (
                    <span key={e.id} className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                      {getNodeTitle(e.target)}{e.label ? ` · ${e.label}` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {inEdges.length > 0 && (
              <div>
                <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-ink-faint">← Called by</div>
                <div className="flex flex-wrap gap-1">
                  {inEdges.map((e) => (
                    <span key={e.id} className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                      {getNodeTitle(e.source)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

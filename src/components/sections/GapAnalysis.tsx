import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { gaps } from '../../data/gaps';
import type { GapStatus, ContextId } from '../../types';

const statusMeta: Record<GapStatus, { label: string; color: string; desc: string }> = {
  live:    { label: 'Live',    color: '#22c55e', desc: 'In production, functioning correctly' },
  partial: { label: 'Partial', color: '#f59e0b', desc: 'Deployed but with known gaps or bugs' },
  planned: { label: 'Planned', color: '#6366f1', desc: 'Designed, not yet implemented' },
  vision:  { label: 'Vision',  color: '#ec4899', desc: 'Architecture design only, no code yet' },
};

const contextColors: Record<string, string> = {
  SI: '#8b5cf6',
  CH: '#f97316',
  OI: '#22c55e',
  AI: '#6366f1',
  Platform: '#0ea5e9',
};

type FilterStatus = GapStatus | 'all';
type FilterContext = ContextId | 'Platform' | 'all';

function StatusDot({ status }: { status: GapStatus }) {
  const m = statusMeta[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
      style={{ borderColor: `${m.color}44`, background: `${m.color}15`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  );
}

export function GapAnalysis() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterContext, setFilterContext] = useState<FilterContext>('all');

  const statuses: FilterStatus[] = ['all', 'live', 'partial', 'planned', 'vision'];
  const contexts: FilterContext[] = ['all', 'SI', 'CH', 'OI', 'AI', 'Platform'];

  const counts = {
    live:    gaps.filter((g) => g.status === 'live').length,
    partial: gaps.filter((g) => g.status === 'partial').length,
    planned: gaps.filter((g) => g.status === 'planned').length,
    vision:  gaps.filter((g) => g.status === 'vision').length,
  };

  const filtered = gaps.filter((g) => {
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchContext = filterContext === 'all' || g.context === filterContext;
    return matchStatus && matchContext;
  });

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Gap Analysis & Reality Dashboard</h2>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          {gaps.length} tracked items
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.entries(counts) as [GapStatus, number][]).map(([status, count]) => {
          const m = statusMeta[status];
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={clsx(
                'flex flex-col gap-1 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5',
                filterStatus === status ? 'shadow-card' : 'border-line bg-surface-1',
              )}
              style={filterStatus === status ? { borderColor: `${m.color}66`, background: `${m.color}10` } : undefined}
            >
              <div className="text-3xl font-semibold" style={{ color: m.color }}>{count}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: m.color }}>{m.label}</div>
              <div className="text-[11px] text-ink-faint">{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-1">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx(
                'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                filterStatus === s
                  ? 'bg-surface-3 text-ink'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
              )}
            >
              {s === 'all' ? 'All status' : statusMeta[s].label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {contexts.map((c) => (
            <button
              key={c}
              onClick={() => setFilterContext(c)}
              className={clsx(
                'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                filterContext === c
                  ? 'bg-surface-3 text-ink'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
              )}
            >
              {c === 'all' ? 'All contexts' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Gap list */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((gap, i) => {
          const m = statusMeta[gap.status];
          const ctxColor = contextColors[gap.context] ?? '#6366f1';
          return (
            <motion.div
              key={gap.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.2 }}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-4"
              style={{ borderLeft: `3px solid ${m.color}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-ink-faint">{gap.id}</span>
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                    style={{ background: `${ctxColor}15`, color: ctxColor }}
                  >
                    {gap.context}
                  </span>
                </div>
                <StatusDot status={gap.status} />
              </div>

              <div className="font-semibold text-ink">{gap.title}</div>
              <p className="text-sm leading-relaxed text-ink-soft">{gap.description}</p>

              {gap.fix && (
                <div className="rounded-lg border p-3 text-sm" style={{ borderColor: `${m.color}33`, background: `${m.color}08` }}>
                  <span className="font-semibold" style={{ color: m.color }}>Fix: </span>
                  <span className="text-ink-soft">{gap.fix}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {gap.phase && (
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-ink-faint">
                    {gap.phase}
                  </span>
                )}
                <span className="font-mono text-[9px] text-ink-faint">{gap.codeRef}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

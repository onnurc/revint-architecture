import { useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { boundedContexts } from '../../data/boundedContexts';
import type { ContextId, Maturity } from '../../types';

const maturityStyle: Record<Maturity, { label: string; cls: string }> = {
  live:     { label: 'Live',    cls: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30' },
  partial:  { label: 'Partial', cls: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30' },
  planned:  { label: 'Planned', cls: 'bg-[#6366f1]/15 text-[#6366f1] border-[#6366f1]/30' },
  vision:   { label: 'Vision',  cls: 'bg-[#ec4899]/15 text-[#ec4899] border-[#ec4899]/30' },
};

function MaturityBadge({ m }: { m: Maturity }) {
  const s = maturityStyle[m];
  return (
    <span className={clsx('rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider', s.cls)}>
      {s.label}
    </span>
  );
}

export function Components() {
  const [active, setActive] = useState<ContextId>('SI');
  const ctx = boundedContexts.find((c) => c.id === active)!;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 py-8">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bounded Context Matrix</h2>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          SI · CH · OI · AI mapped to files and Prisma tables
        </span>
      </div>

      {/* Context selector */}
      <div className="flex flex-wrap gap-2">
        {boundedContexts.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={clsx(
              'rounded-lg border px-4 py-2 text-sm font-medium transition-all',
              active === c.id
                ? 'shadow-sm'
                : 'border-line bg-surface-1 text-ink-soft hover:bg-surface-2 hover:text-ink',
            )}
            style={active === c.id ? { background: `${c.color}22`, color: c.color, borderColor: `${c.color}66` } : undefined}
          >
            {c.id}
          </button>
        ))}
      </div>

      {/* Context header */}
      <div className="rounded-xl border p-5" style={{ borderColor: `${ctx.color}44`, background: `${ctx.color}0a` }}>
        <div className="text-lg font-semibold" style={{ color: ctx.color }}>{ctx.label}</div>
        <p className="mt-1 text-sm text-ink-soft">{ctx.shortDesc}</p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-line bg-surface-1 px-2.5 py-1 font-mono text-[11px] text-ink-soft">
          <span className="text-ink-faint">Contract:</span> {ctx.contract}
        </div>
      </div>

      {/* Components grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {ctx.components.map((comp, i) => (
          <motion.div
            key={comp.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className="flex flex-col gap-3 rounded-xl border border-line bg-surface-1 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-ink">{comp.name}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  {comp.type}
                </div>
              </div>
              <MaturityBadge m={comp.maturity} />
            </div>

            <p className="text-sm leading-relaxed text-ink-soft">{comp.description}</p>

            {comp.files.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">Files</div>
                <div className="flex flex-wrap gap-1">
                  {comp.files.map((f) => (
                    <span key={f} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {comp.tables.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">Prisma tables</div>
                <div className="flex flex-wrap gap-1">
                  {comp.tables.map((t) => (
                    <span
                      key={t}
                      className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
                      style={{ borderColor: `${ctx.color}44`, color: ctx.color, background: `${ctx.color}0d` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

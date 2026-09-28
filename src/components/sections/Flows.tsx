import { useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { architecture } from '../../data/architecture';
import type { Flow, FlowStep } from '../../types';

function StepCard({ step, color, index }: { step: FlowStep; color: string; index: number }) {
  const [open, setOpen] = useState(false);
  const nodeIds = new Set<string>();
  for (const s of step.segments) { nodeIds.add(s.from); nodeIds.add(s.to); }
  const nodes = architecture.nodes.filter((n) => nodeIds.has(n.id));

  return (
    <div className="rounded-xl border border-line bg-surface-1 overflow-hidden">
      <button
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-2 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-semibold"
          style={{ background: `${color}22`, color }}
        >
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">{step.id}</div>
          <div className="font-semibold text-ink truncate">{step.title}</div>
        </div>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-4 pb-4 pt-3 flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-ink-soft">{step.explanation}</p>

              {step.payload && (
                <pre className="overflow-x-auto rounded-md bg-surface-0 p-3 font-mono text-[11px] text-ink-soft">
                  {step.payload}
                </pre>
              )}

              {nodes.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">Touches</span>
                  {nodes.map((n) => (
                    <span
                      key={n.id}
                      className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink"
                    >
                      {n.title}
                    </span>
                  ))}
                </div>
              )}

              {step.parallelGroup != null && (
                <div className="text-[11px] italic text-ink-faint">
                  Parallel group {step.parallelGroup}.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlowSection({ flow }: { flow: Flow }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: flow.color, boxShadow: `0 0 10px ${flow.color}` }}
        />
        <h3 className="text-xl font-semibold text-ink">{flow.label}</h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
          {flow.steps.length} steps
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {flow.steps.map((step, i) => (
          <StepCard key={step.id} step={step} color={flow.color} index={i} />
        ))}
      </div>
    </div>
  );
}

export function Flows() {
  const [activeFlowId, setActiveFlowId] = useState<string>(architecture.flows[0]?.id ?? '');

  const activeFlow = architecture.flows.find((f) => f.id === activeFlowId);

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-6 py-8">
      <div className="flex items-baseline gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Step-by-Step Flows</h2>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-faint">
          Expandable cards for each step
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {architecture.flows.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFlowId(f.id)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all',
              activeFlowId === f.id
                ? 'shadow-sm'
                : 'border-line bg-surface-1 text-ink-soft hover:bg-surface-2 hover:text-ink',
            )}
            style={activeFlowId === f.id ? { background: `${f.color}22`, color: f.color, borderColor: `${f.color}66` } : undefined}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: f.color }}
            />
            {f.label}
          </button>
        ))}
      </div>

      {activeFlow && <FlowSection flow={activeFlow} />}
    </div>
  );
}

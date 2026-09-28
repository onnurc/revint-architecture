import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useVisibleSteps } from '../../hooks/useVisibleSteps';
import { architecture } from '../../data/architecture';

export function StepPanel() {
  const stepIndex = useAppStore((s) => s.stepIndex);
  const activeFlow = useAppStore((s) => s.activeFlow);
  const visible = useVisibleSteps();

  if (!visible) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface-1 p-4 text-sm text-ink-faint">
        No flow selected. Click a flow above to see how it moves through the architecture.
      </div>
    );
  }

  const step = visible.steps[stepIndex];
  if (!step) return null;

  const nodesTouched = new Set<string>();
  for (const s of step.segments) {
    nodesTouched.add(s.from);
    nodesTouched.add(s.to);
  }
  const touchedNodes = architecture.nodes.filter((n) => nodesTouched.has(n.id));
  const flow = architecture.flows.find((f) => f.id === activeFlow);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
        className="flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-4"
        style={{ borderTop: `3px solid ${visible.color}` }}
      >
        <div className="flex items-center gap-2">
          <span
            className="rounded-md px-2 py-0.5 font-mono text-xs font-semibold"
            style={{ background: `${visible.color}22`, color: visible.color }}
          >
            {step.id}
          </span>
          <span className="text-xs text-ink-faint">
            {flow?.label} · step {stepIndex + 1} of {visible.steps.length}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
        <p className="text-sm leading-relaxed text-ink-soft">{step.explanation}</p>
        {step.payload && (
          <pre className="overflow-x-auto rounded-md bg-surface-0 p-3 font-mono text-[11px] text-ink-soft">
            {step.payload}
          </pre>
        )}
        {touchedNodes.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
              Touches
            </span>
            {touchedNodes.map((n) => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-ink"
              >
                {n.title}
              </span>
            ))}
          </div>
        )}
        {step.parallelGroup != null && (
          <div className="text-[11px] italic text-ink-faint">
            Runs in parallel with other steps in group {step.parallelGroup}.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

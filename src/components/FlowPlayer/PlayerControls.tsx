import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useVisibleSteps } from '../../hooks/useVisibleSteps';

export function PlayerControls() {
  const visible = useVisibleSteps();
  const stepIndex = useAppStore((s) => s.stepIndex);
  const setStepIndex = useAppStore((s) => s.setStepIndex);
  const playing = useAppStore((s) => s.playing);
  const togglePlaying = useAppStore((s) => s.togglePlaying);

  if (!visible) {
    return (
      <div className="rounded-lg border border-line bg-surface-1 px-4 py-3 text-sm text-ink-faint">
        Pick a flow above to step through it. Use&nbsp;
        <kbd className="rounded bg-surface-3 px-1 font-mono text-[10px]">←</kbd>{' '}
        <kbd className="rounded bg-surface-3 px-1 font-mono text-[10px]">→</kbd> to move,{' '}
        <kbd className="rounded bg-surface-3 px-1 font-mono text-[10px]">Space</kbd> to play.
      </div>
    );
  }

  const total = visible.steps.length;
  const cur = visible.steps[stepIndex];
  const canPrev = stepIndex > 0;
  const canNext = stepIndex < total - 1;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-surface-1 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStepIndex(0)}
            className="rounded p-1.5 text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-40"
            disabled={stepIndex === 0}
            title="Restart"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setStepIndex(stepIndex - 1)}
            disabled={!canPrev}
            className="rounded p-1.5 text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-40"
            title="Previous step (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={togglePlaying}
            className="rounded-md px-3 py-1.5 text-sm font-medium"
            style={{ background: `${visible.color}22`, color: visible.color }}
            title={playing ? 'Pause (Space)' : 'Play (Space)'}
          >
            {playing ? (
              <span className="inline-flex items-center gap-1.5">
                <Pause className="h-3.5 w-3.5" /> Pause
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5" /> Play
              </span>
            )}
          </button>
          <button
            onClick={() => setStepIndex(stepIndex + 1)}
            disabled={!canNext}
            className="rounded p-1.5 text-ink-soft hover:bg-surface-2 hover:text-ink disabled:opacity-40"
            title="Next step (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="font-mono text-xs text-ink-soft">
          {stepIndex + 1} / {total}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {visible.steps.map((step, i) => {
          const done = i < stepIndex;
          const now = i === stepIndex;
          return (
            <button
              key={step.id}
              onClick={() => setStepIndex(i)}
              className="h-1.5 flex-1 rounded-full transition-all"
              style={
                done || now
                  ? { backgroundColor: visible.color, color: visible.color, opacity: now ? 1 : 0.9, boxShadow: now ? `0 0 8px ${visible.color}` : undefined }
                  : { backgroundColor: 'rgb(var(--surface-3))', opacity: 1 }
              }
              title={`${step.id}: ${step.title}`}
              aria-label={`Step ${i + 1}`}
            />
          );
        })}
      </div>

      {cur && (
        <div className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          <span
            className="rounded px-1.5 py-0.5"
            style={{ background: `${visible.color}22`, color: visible.color }}
          >
            {cur.id}
          </span>
          <span className="truncate text-ink">{cur.title}</span>
        </div>
      )}
    </div>
  );
}

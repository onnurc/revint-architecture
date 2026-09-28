import clsx from 'clsx';
import { architecture } from '../../data/architecture';
import { useAppStore } from '../../store/useAppStore';
import type { FlowId } from '../../types';

const options: Array<{ id: FlowId | 'all'; label: string; color?: string }> = [
  { id: 'all', label: 'Show all' },
  ...architecture.flows.map((f) => ({ id: f.id, label: f.label, color: f.color })),
];

export function FlowSelector() {
  const activeFlow = useAppStore((s) => s.activeFlow);
  const setActiveFlow = useAppStore((s) => s.setActiveFlow);

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface-1 p-1">
      {options.map((opt) => {
        const active = activeFlow === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setActiveFlow(opt.id)}
            className={clsx(
              'inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-surface-3 text-ink shadow-sm'
                : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
            )}
          >
            {opt.color && (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: opt.color, boxShadow: `0 0 8px ${opt.color}` }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

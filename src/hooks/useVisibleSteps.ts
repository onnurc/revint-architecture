import { useMemo } from 'react';
import { architecture } from '../data/architecture';
import { useAppStore } from '../store/useAppStore';
import type { FlowStep } from '../types';

export function useVisibleSteps(): { flowLabel: string; color: string; steps: FlowStep[] } | null {
  const activeFlow = useAppStore((s) => s.activeFlow);

  return useMemo(() => {
    if (activeFlow === 'all') return null;
    const flow = architecture.flows.find((f) => f.id === activeFlow);
    if (!flow) return null;
    return { flowLabel: flow.label, color: flow.color, steps: flow.steps };
  }, [activeFlow]);
}
